import fs, { WriteFileOptions } from "fs";
import { Model, QueryOptions, Schema, SchemaDefinition, SchemaDefinitionType, SchemaOptions, Types, Document, SchemaTimestampsConfig } from "mongoose";

interface IHasObjectId { _id: Types.ObjectId};

type DumpDataOptions = {
  filename: string,
  filter?: object,
  projection?: any | null,
  options?: QueryOptions | null,
  encoding?: WriteFileOptions,
}

class BaseSchemaClass extends Model {
  // `insertFromData` becomes a static
  static insertFromData(data: Array<Object>): Promise<Array<Object>> {
      return this.insertMany(data);
  }

  // `dumpData` becomes a static
  static async dumpData(this: BaseSchemaClass,{    
    filename,
    filter = {},
    projection = null,
    options = null,
    encoding = "utf-8",
  }: DumpDataOptions) {
      const data = await this.find(filter, projection, options);
      const jsonData = JSON.stringify(data);
      fs.writeFile(filename, jsonData, encoding, (err) => {
        if (err) console.error(err);
      });
  }
}

// GenericModel
interface IGenericDocument extends Document, SchemaTimestampsConfig {}  
interface IGenericModel extends Model<IGenericDocument>, BaseSchemaClass {}

type StaticSchemaFunction<DocType, ModelType> = (this: ModelType extends Model<DocType>? ModelType: never, ...args: any[]) => any;
type ObjectOfFunctions<DocType, ModelType> = { [key: string]: Function | StaticSchemaFunction<DocType, ModelType> };

function extractAccessorAndVirtual(name:string):["get"|"set"|"", string ] {
  let accessor = name.slice(0,3);
  if (!["get", "set"].includes(accessor)) {
    accessor = "";
  }
  const virtual = name.slice(3,4).toLowerCase() + name.slice(4);
  return [accessor as "get"|"set"|"", virtual]
} 

function addMethodsOrStaticsOrVirtualsToSchema<DocType, ModelType>(
  schema: Schema<DocType, ModelType>,
  category: "method"| "static"|"virtual" ,
  functions?: ObjectOfFunctions<DocType, ModelType>): Schema<DocType, ModelType> {
    if (!functions) {
      return schema;
    }
    for (const name in functions) {
      let mustPrintError: boolean = false;
      if (functions[name] instanceof Function) {
        if (category === "method") {
          schema.methods[name] = functions[name];
        }
        if (category === "static") {
          // TODO au secours
          //schema.statics[name] = functions[name] as (this: Model<any, any, any, any>, ...args: any[]) => any;
        } else {
            mustPrintError = true;
        }
        if (category === "virtual") {
          const [accessor, virtual] = extractAccessorAndVirtual(name)
          if (accessor === 'get') {
            schema.virtual(virtual).get(functions[name])
          } else if (accessor === 'set') {
            schema.virtual(virtual).set(functions[name])
          } else {
            mustPrintError = true;
          }
        }
      } else {
        mustPrintError = true;
      }
      if (mustPrintError) {
        console.error(`We couldn't add the function ${name} as a ${category}.`)
      }
      
    }
    return schema;
}

function generateCompleteSchema<DocType, ModelType>(
  definition?: SchemaDefinition<SchemaDefinitionType<DocType>>,
  options?: SchemaOptions,
  statics?: ObjectOfFunctions<DocType, ModelType>,
  methods?: ObjectOfFunctions<DocType, ModelType>,
  virtuals?: ObjectOfFunctions<DocType, ModelType>,
  schemaClass?: Function): Schema<DocType, ModelType> {
  // create a schema as usual
  let schema = new Schema(definition, options) as Schema<DocType, ModelType>;

  // add methods
  schema = addMethodsOrStaticsOrVirtualsToSchema(
    schema,
    "method",
    methods);
  
  // add statics
  schema = addMethodsOrStaticsOrVirtualsToSchema(
    schema,
    "static",
    statics);

  // add virtuals
  schema = addMethodsOrStaticsOrVirtualsToSchema(
    schema,
    "virtual",
    virtuals);
  
  if (schemaClass) {
    // `schema` will now have a getter ans setter as virtuals,  methods as methods and statics as statics inherited from schemaClass
    schema.loadClass(schemaClass);
  }

  return schema;

  //
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
