import { SchemaDefinition, SchemaDefinitionType, SchemaOptions, Schema } from 'mongoose';
import { BaseSchemaClass, generateCompleteSchema } from '../../utils/model';
import { IUserDocument, IUserModel } from './user.types';

import statics from './user.statics';
import methods from './user.methods';
import virtuals from './user.virtuals';

const userDefinition: SchemaDefinition<SchemaDefinitionType<IUserDocument>> = {
  username: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  productKey: {
    type: Schema.Types.ObjectId,
    ref: 'ProductKey',
  },
  activated: {
    type: Boolean,
    required: true,
    default: true,
  },
  role: {
    type: Schema.Types.ObjectId,
    ref: 'Role',
  },
  refreshToken: { type: String },
};

const userOptions: SchemaOptions = {
  collection: 'user',
  timestamps: true, // createdAt & updatedAt
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
};

const userSchema = generateCompleteSchema<IUserDocument, IUserModel, BaseSchemaClass>(
  userDefinition,
  userOptions,
  statics,
  methods,
  virtuals,
  BaseSchemaClass
);

export default userSchema;
