import fs, { WriteFileOptions } from 'fs';
import {
  Model,
  QueryOptions,
  Schema,
  SchemaDefinition,
  SchemaDefinitionType,
  SchemaOptions,
  Types,
  Document,
  SchemaTimestampsConfig,
} from 'mongoose';

interface IHasObjectId {
  _id: Types.ObjectId;
}

type DumpDataOptions = {
  filename: string;
  filter?: object;
  projection?: unknown | null;
  options?: QueryOptions | null;
  encoding?: WriteFileOptions;
};

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
  ...args: unknown[]
) => unknown;
// eslint-disable-next-line max-len
type ObjectOfFunctions<DocType, ModelType> = {
  [key: string]: Function | StaticSchemaFunction<DocType, ModelType>;
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
    return schema;
  }
  const newSchema = schema;
  const names: string[] = Object.getOwnPropertyNames(functions);
  for (let index = 0; index < names.length; index += 1) {
    const funcName: string = names[index];
    const func: unknown = functions[funcName];
    let willPrintError = false;
    if (func instanceof Function) {
      if (category === 'method') {
        newSchema.methods[funcName] = func;
      }
      if (category === 'static') {
        // TODO au secours
        newSchema.statics[funcName] = func as (this: ModelType, ...args: unknown[]) => unknown;
      } else {
        willPrintError = true;
      }
      if (category === 'virtual') {
        const [accessor, virtual] = extractAccessorAndVirtual(funcName);
        if (accessor === 'get') {
          newSchema.virtual(virtual).get(func);
        } else if (accessor === 'set') {
          newSchema.virtual(virtual).set(func);
        } else {
          willPrintError = true;
        }
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

function generateCompleteSchema<DocType, ModelType>(
  definition?: SchemaDefinition<SchemaDefinitionType<DocType>>,
  options?: SchemaOptions,
  statics?: ObjectOfFunctions<DocType, ModelType>,
  methods?: ObjectOfFunctions<DocType, ModelType>,
  virtuals?: ObjectOfFunctions<DocType, ModelType>,
  schemaClass?: Function
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
  IHasObjectId,
  BaseSchemaClass,
  StaticSchemaFunction,
  ObjectOfFunctions,
  generateCompleteSchema,
  IGenericDocument,
  IGenericModel,
};
