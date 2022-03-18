import { SchemaDefinition, SchemaDefinitionType, SchemaOptions } from 'mongoose';
import { BaseSchemaClass, generateCompleteSchema } from '../../utils/model';
import { IRoleDocument, IRoleModel } from './role.types';

import statics from './role.statics';
import methods from './role.methods';
import virtuals from './role.virtuals';

const roleDefinition: SchemaDefinition<SchemaDefinitionType<IRoleDocument>> = {
  name: {
    type: String,
    required: true,
    unique: true,
  },
  isDefault: {
    type: Boolean,
    required: true,
    default: false,
  },
  readOwn: {
    type: Boolean,
    required: true,
    default: false,
  },
  readOther: {
    type: Boolean,
    required: true,
    default: false,
  },
  modifyOwn: {
    type: Boolean,
    required: true,
    default: false,
  },
  modifyOther: {
    type: Boolean,
    required: true,
    default: false,
  },
  deleteOwn: {
    type: Boolean,
    required: true,
    default: false,
  },
  deleteOther: {
    type: Boolean,
    required: true,
    default: false,
  },
  level: {
    type: Number,
    required: true,
    default: 0,
  },
};

const roleOptions: SchemaOptions = {
  collection: 'role',
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
};

const roleSchema = generateCompleteSchema<IRoleDocument, IRoleModel, BaseSchemaClass>(
  roleDefinition,
  roleOptions,
  statics,
  methods,
  virtuals,
  BaseSchemaClass
);

export default roleSchema;
