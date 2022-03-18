import fs, { WriteFileOptions } from 'fs';
import {
  Model,
  QueryOptions,
  Schema,
  SchemaDefinition,
  SchemaDefinitionType,
  SchemaOptions,
  Document,
  SchemaTimestampsConfig,
} from 'mongoose';

type DumpDataOptions = {
  filename: string;
  filter?: object;
  projection?: unknown | null;
  options?: QueryOptions | null;
  encoding?: WriteFileOptions;
};

// cf. https://2ality.com/2020/04/classes-as-values-typescript.html
interface Class<T = unknown> {
  new (...args: unknown[]): T;
}

class BaseSchemaClass extends Model {
  // `insertFromData` becomes a static
  // eslint-disable-next-line max-len
  public static async insertFromData(data: Array<unknown>): Promise<Array<unknown>> {
    return this.insertMany(data) as Promise<Array<unknown>>;
  }

  // `dumpData` becomes a static
  public static async dumpData(
    this: BaseSchemaClass,
    {
      filename,
      filter = {},
      projection = null,
      options = null,
      encoding = 'utf-8',
    }: DumpDataOptions
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const data = (await this.find(filter, projection, options)) as Array<unknown>;
    const jsonData = JSON.stringify(data);
    fs.writeFile(filename, jsonData, encoding, (err) => {
      if (err) console.error(err);
    });
  }
}

// GenericModel
interface IGenericDocument extends Document, SchemaTimestampsConfig {}
interface IGenericModel extends Model<IGenericDocument>, BaseSchemaClass {}

// eslint-disable-next-line max-len
type StaticSchemaFunction<DocType, ModelType> = (
  this: ModelType extends Model<DocType> ? ModelType : never,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
) => unknown;
type MethodSchemaFunction<ModelOrDocumentType> = (
  this: ModelOrDocumentType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
) => unknown;
type BasicFunction = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
) => unknown;

// eslint-disable-next-line max-len
type ObjectOfFunctions<DocType, ModelType> = {
  [key: string]:
    | BasicFunction
    | MethodSchemaFunction<ModelType>
    | MethodSchemaFunction<DocType>
    | StaticSchemaFunction<DocType, ModelType>;
};

function extractAccessorAndVirtual(name: string): ['get' | 'set' | '', string] {
  let accessor = name.slice(0, 3);
  if (!['get', 'set'].includes(accessor)) {
    accessor = '';
  }
  const virtual = name.slice(3, 4).toLowerCase() + name.slice(4);
  return [accessor as 'get' | 'set' | '', virtual];
}

function addMethodsOrStaticsOrVirtualsToSchema<DocType, ModelType>(
  schema: Schema<DocType, ModelType>,
  category: 'method' | 'static' | 'virtual',
  functions?: ObjectOfFunctions<DocType, ModelType>
): Schema<DocType, ModelType> {
  if (!functions) {
    console.info(`No functions to add`);
    return schema;
  }
  if (!['method', 'static', 'virtual'].includes(category)) {
    console.error(`Unknown category: ${category}`);
    return schema;
  }
  const newSchema = schema;
  const names: string[] = Object.getOwnPropertyNames(functions);
  for (let index = 0; index < names.length; index += 1) {
    const funcName: string = names[index];
    const func: unknown = functions[funcName];
    let willPrintError = false;
    if (func instanceof Function) {
      switch (category) {
        case 'method': {
          newSchema.methods[funcName] = func;
          break;
        }
        case 'static': {
          newSchema.statics[funcName] = func as MethodSchemaFunction<ModelType>;
          break;
        }
        case 'virtual': {
          const [accessor, virtual] = extractAccessorAndVirtual(funcName);
          if (accessor === 'get') {
            newSchema.virtual(virtual).get(func);
          } else if (accessor === 'set') {
            newSchema.virtual(virtual).set(func);
          } else {
            willPrintError = true;
          }
          break;
        }
        default:
          willPrintError = true;
          console.error('unknown category:', category);
          break;
      }
    } else {
      willPrintError = true;
    }
    if (willPrintError) {
      console.error(`We couldn't add the function ${funcName} as a ${category}.`);
    }
  }
  return newSchema;
}

function generateCompleteSchema<DocType, ModelType, SchemaClassType>(
  definition?: SchemaDefinition<SchemaDefinitionType<DocType>>,
  options?: SchemaOptions,
  statics?: ObjectOfFunctions<DocType, ModelType>,
  methods?: ObjectOfFunctions<DocType, ModelType>,
  virtuals?: ObjectOfFunctions<DocType, ModelType>,
  schemaClass?: SchemaClassType extends Class<SchemaClassType> ? SchemaClassType : never
): Schema<DocType, ModelType> {
  // create a schema as usual
  let schema = new Schema(definition, options);

  // add methods
  schema = addMethodsOrStaticsOrVirtualsToSchema(schema, 'method', methods);

  // add statics
  schema = addMethodsOrStaticsOrVirtualsToSchema(schema, 'static', statics);

  // add virtuals
  schema = addMethodsOrStaticsOrVirtualsToSchema(schema, 'virtual', virtuals);

  if (schemaClass) {
    // `schema` will now have a getter ans setter as virtuals,  methods as methods and statics as statics inherited from schemaClass
    schema.loadClass(schemaClass);
  }

  return schema as unknown as Schema<DocType, ModelType>;
}

export {
  BaseSchemaClass,
  StaticSchemaFunction,
  ObjectOfFunctions,
  generateCompleteSchema,
  IGenericDocument,
  IGenericModel,
};
