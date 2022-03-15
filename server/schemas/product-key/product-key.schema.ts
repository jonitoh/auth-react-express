import { SchemaDefinition, SchemaDefinitionType, SchemaOptions } from 'mongoose';
import { BaseSchemaClass, generateCompleteSchema } from 'utils/model';
import { IProductKeyDocument, IProductKeyModel } from './product-key.types';

import statics from './product-key.statics';
import methods from './product-key.methods';
import virtuals from './product-key.virtuals';

const productKeyDefinition: SchemaDefinition<SchemaDefinitionType<IProductKeyDocument>> = {
  key: {
    type: String,
    required: true,
    unique: true,
    default(this: IProductKeyModel): string {
      return this.generateKey();
    },
    immutable: true,
  },
  activationDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  activated: {
    type: Boolean,
    required: true,
    default: true,
  },
  validityPeriod: {
    type: Number,
    required: true,
    default: 60 * 60, // in seconds
  },
};

const productKeyOptions: SchemaOptions = {
  collection: 'productkey',
  timestamps: true, // createdAt & updatedAt
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
};

const productKeySchema = generateCompleteSchema<IProductKeyDocument, IProductKeyModel>(
  productKeyDefinition,
  productKeyOptions,
  statics,
  methods,
  virtuals,
  BaseSchemaClass
);

export default productKeySchema;
