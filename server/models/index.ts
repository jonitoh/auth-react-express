/* eslint-disable no-await-in-loop */
import mongoose, { Connection, ObjectId } from 'mongoose';
import path from 'path';
import fs from 'fs';
import dbConfig from 'config/db.config';
import { resolveInput, randomNumber, randomDate, resolvePath, formatDate } from 'utils/main';
import { IGenericModel } from 'utils/model';
import roleSchema from 'schemas/role/role.schema';
import { IRoleDocument, IRoleModel } from 'schemas/role/role.types';
import userSchema from 'schemas/user/user.schema';
import { IUserDocument, IUserModel } from 'schemas/user/user.types';
import productKeySchema from 'schemas/product-key/product-key.schema';
import { IProductKeyDocument, IProductKeyModel } from 'schemas/product-key/product-key.types';

import { ArrayHTTPError } from 'utils/error/array-http-error';
import {
  CheckProductKeyType,
  IDatabaseConnectionHelper,
  InitDatabaseWithRawMethodOptions,
  RawMethodResolvedData,
  RoleAsJson,
  UserAsJson,
  JsonMethodResolvedData,
  RequiredRoleAsJson,
  RequiredUserAsJson,
  JsonMethodData,
  InitDatabaseWithJsonMethodOptions,
  RoleAsRandom,
  FormatRolesFromRandomOptions,
  FormatProductKeysFromRandomOptions,
  FormatUsersFromRandomOptions,
  RandomMethodResolvedData,
  RequiredRoleAsRandom,
  RequiredProductKeyAsRandom,
  RequiredUserAsRandom,
  RandomMethodData,
  InitDatabaseWithRandomMethodOptions,
  InitDatabaseOptions,
  DumpDatabaseOptions,
  AddSuperAdminUserOptions,
  DatabaseConnectionType,
} from './types';

function getDatabaseConnection(): DatabaseConnectionType {
  // create connection
  const connection: Connection = mongoose.createConnection(dbConfig.URI, {
    // useFindAndModify: true,
    family: 4, // Use IPv4, skip trying IPv6
    maxPoolSize: 5,
  });
  console.info('main model -- readyState', connection.readyState);

  // add listeners to the connection
  connection.on('open', () => {
    console.info('Database opened');
  });

  connection.on('close', () => {
    console.info('Database closed');
  });

  // create models
  const User: IUserModel = connection.model<IUserDocument, IUserModel>('user', userSchema);
  const ProductKey: IProductKeyModel = connection.model<IProductKeyDocument, IProductKeyModel>(
    'productkey',
    productKeySchema
  );
  const Role: IRoleModel = connection.model<IRoleDocument, IRoleModel>('role', roleSchema);

  // create helper function based on models
  const checkProductKey = async (productKey: string | undefined): Promise<CheckProductKeyType> => {
    // init variables
    let isKeyInvalid = false;
    let isStored = false;
    let storedProductKey: IProductKeyDocument | null = null;
    let isInUse = true;
    let isInUseMsg: string | null = null;
    const isLinkedToUser = false;
    let linkedUser: IUserDocument | null = null;
    const error = new ArrayHTTPError();

    try {
      // is productKey already stored ?
      const ifStoredProductKey = await ProductKey.checkIfStored(productKey);
      isStored = ifStoredProductKey.isStored;
      storedProductKey = ifStoredProductKey.storedProductKey as IProductKeyDocument;
      isKeyInvalid = ifStoredProductKey.isKeyInvalid;
      error.add(ifStoredProductKey.errorMsg);

      if (isStored) {
        // check if the product key is in use: activated and still valid
        [isInUse, isInUseMsg] = storedProductKey.isInUse();

        // check if the productKey is used by a user
        linkedUser = await User.findOne({ productKey: storedProductKey._id });
      }
    } catch (err: unknown) {
      error.add(err);
    }

    return {
      isKeyInvalid,
      isStored,
      storedProductKey,
      isInUse,
      isInUseMsg,
      isLinkedToUser,
      linkedUser,
      error: error.fullMessage,
    };
  };

  const helpers: IDatabaseConnectionHelper = {
    checkProductKey,
  };

  // functions for init database
  function formatRolesFromJson(data: Array<RoleAsJson>): Array<RequiredRoleAsJson> {
    // role should look like this [{ name: ... }, ..., { name: ..., isDefault: true }]
    // check for default role
    // eslint-disable-next-line max-len
    const defaultRole: RoleAsJson | undefined = data.find(
      ({ isDefault }): boolean => isDefault === true
    );
    if (!defaultRole) {
      throw new Error('No default role found.');
    }
    // set default role name
    Role.defaultRoleName = defaultRole.name;

    return data.map(
      ({ name, isDefault }): RequiredRoleAsJson => ({
        name,
        isDefault: !!isDefault,
      })
    );
  }

  // eslint-disable-next-line max-len
  async function formatUsersFromJson(
    data: Array<UserAsJson>,
    mustCoerceRole: boolean
  ): Promise<Array<RequiredUserAsJson>> {
    // helpers
    async function mapToProductKeyId(key: string): Promise<ObjectId | undefined> {
      const pk = await ProductKey.findOne({ key }).select('_id').lean();
      if (pk) {
        return pk._id as ObjectId;
      }
      return undefined;
    }

    async function mapToRoleId(name: string): Promise<ObjectId | undefined> {
      const role = await Role.findOne({ name }).select('_id').lean();
      if (role) {
        return role._id as ObjectId;
      }
      return undefined;
    }

    const formattedData: Array<RequiredUserAsJson> = [];

    for (let index = 0; index < data.length; index += 1) {
      // console.info("--------index", index);
      const { productKey, role, password } = data[index];

      // console.info("productKey", productKey);
      // console.info("role", role);
      const formattedProductKey: ObjectId | undefined = await mapToProductKeyId(productKey);
      let formattedRole: ObjectId | undefined = await mapToRoleId(role);

      // console.info("formattedProductKey", formattedProductKey);
      // console.info("formattedRole", formattedRole);

      const hasInconsistentProductKey = !formattedProductKey;
      let hasInconsistentRole = !formattedRole;

      // handle inconsistency
      if (hasInconsistentProductKey) {
        console.warn('inconsistency on the product key.');
      }
      if (hasInconsistentRole) {
        if (mustCoerceRole) {
          formattedRole = Role.defaultRole._id as ObjectId;
          hasInconsistentRole = false;
          console.warn('inconsistency on the role being corrected with the default value.');
        } else {
          console.warn('inconsistency on the role.');
        }
      }

      // add if possible the data
      if (!hasInconsistentProductKey && !hasInconsistentRole) {
        formattedData.push({
          ...data[index],
          productKey: formattedProductKey,
          role: formattedRole,
          password: await User.hashPassword(password),
        } as RequiredUserAsJson);
      }
    }
    console.info(`${data.length - formattedData.length} users removed from inconsitency`);
    return formattedData;
  }

  function formatRolesFromRandom({
    roles,
    defaultRoleName,
  }: FormatRolesFromRandomOptions): Array<RequiredRoleAsRandom> {
    // import roles
    const data = roles.map(
      (role: RoleAsRandom): RequiredRoleAsRandom => ({
        ...role,
        isDefault: role.name === defaultRoleName,
      })
    );

    // set default role name
    Role.defaultRoleName = defaultRoleName;

    return data;
  }

  function formatProductKeysFromRandom({
    productKeys = [],
    numberOfProductKeys = 10,
  }: FormatProductKeysFromRandomOptions): [Array<RequiredProductKeyAsRandom>, Array<string>] {
    // create product keys
    const data =
      productKeys.length > 0
        ? productKeys
        : Array.from(Array(numberOfProductKeys), () => ProductKey.generateKey());

    // create pseudo-documents
    const formattedData = data.map((key: string) => ({
      key,
      activationDate: randomDate(new Date(2022, 1, 1), new Date()),
      activated: Math.random() > 0.5,
      validityPeriod: randomNumber(1, 100) * 60, // in seconds
    }));
    return [formattedData, data];
  }

  function formatUsersFromRandom(
    roles: Array<RoleAsRandom>,
    productKeys: Array<string>,
    { numberOfKeysUnused = 2 }: FormatUsersFromRandomOptions
  ): Array<RequiredUserAsRandom> {
    if (numberOfKeysUnused < productKeys.length) {
      for (let i = 0; i < numberOfKeysUnused; i += 1) {
        const index: number = randomNumber(0, productKeys.length);
        productKeys.splice(index, 1);
      }
    }

    // create pseudo-documents
    const formattedData = productKeys.map(
      (key: string, idx: number): RequiredUserAsRandom => ({
        username: `user ${idx}`,
        email: `user${idx}@test.com`,
        password: `passwordOfUser${idx}`,
        productKey: key,
        role: roles[randomNumber(0, roles.length - 1)].name,
      })
    );
    return formattedData;
  }

  async function initDatabaseWithRawMethod({
    roleInput,
    productKeyInput,
    userInput,
  }: InitDatabaseWithRawMethodOptions): Promise<void> {
    // prepare data to insert
    const resolvedData: RawMethodResolvedData = {
      roles: resolveInput(roleInput) as RawMethodResolvedData['roles'],
      productKeys: resolveInput(productKeyInput) as RawMethodResolvedData['productKeys'],
      users: resolveInput(userInput) as RawMethodResolvedData['users'],
    };

    try {
      console.info('insertion in the database');
      const roles = (await Role.insertFromData(resolvedData.roles)) as Array<IRoleDocument>;
      await Role.updateDefaultValues();
      const productKeys = (await ProductKey.insertFromData(
        resolvedData.productKeys
      )) as Array<IProductKeyDocument>;
      const users = (await User.insertFromData(resolvedData.users)) as Array<IUserDocument>;
      console.info('number of inserted documents', {
        roles: roles?.length ? roles.length : 0,
        productKeys: productKeys?.length ? productKeys.length : 0,
        users: users?.length ? users.length : 0,
      });
    } catch (error) {
      console.error(`error during the ingestion phase:\n`);
      throw error;
    }
    console.info('initDatabase -- end');
  }

  async function initDatabaseWithJsonMethod({
    roleInput,
    productKeyInput,
    userInput,
    mustCoerceRole = true, // false,
  }: InitDatabaseWithJsonMethodOptions): Promise<void> {
    // prepare data to insert

    const resolvedData: JsonMethodResolvedData = {
      roles: resolveInput(roleInput) as JsonMethodResolvedData['roles'],
      productKeys: resolveInput(productKeyInput) as JsonMethodResolvedData['productKeys'],
      users: resolveInput(userInput) as JsonMethodResolvedData['users'],
    };

    const data: JsonMethodData = {
      roles: formatRolesFromJson(resolvedData.roles),
      productKeys: resolvedData.productKeys,
      users: resolvedData.users,
    };

    try {
      console.info('insertion in the database');
      const roles = (await Role.insertFromData(data.roles)) as Array<IRoleDocument>;
      await Role.updateDefaultValues();
      const productKeys = (await ProductKey.insertFromData(
        data.productKeys
      )) as Array<IProductKeyDocument>;
      const userData = await formatUsersFromJson(data.users, mustCoerceRole);
      const users = (await User.insertFromData(userData)) as Array<IUserDocument>;
      console.info('number of inserted documents', {
        roles: roles?.length ? roles.length : 0,
        productKeys: productKeys?.length ? productKeys.length : 0,
        users: users?.length ? users.length : 0,
      });
    } catch (error) {
      console.error(`error during the ingestion phase:\n`);
      throw error;
    }
    console.info('initDatabase -- end');
  }

  async function initDatabaseWithRandomMethod({
    roleInput,
    productKeyInput,
    userInput,
    mustCoerceRole = true, // false,
  }: InitDatabaseWithRandomMethodOptions): Promise<void> {
    // prepare data to insert
    const resolvedData: RandomMethodResolvedData = {
      roles: resolveInput(roleInput) as RandomMethodResolvedData['roles'],
      productKeys: resolveInput(productKeyInput) as RandomMethodResolvedData['productKeys'],
      users: resolveInput(userInput) as RandomMethodResolvedData['users'],
    };

    // random roles
    const formattedRoles: RandomMethodData['roles'] = formatRolesFromRandom(resolvedData.roles);

    // random product keys
    const [formattedProductKeys, finalProductKeys] = formatProductKeysFromRandom(
      resolvedData.productKeys
    );

    // random users
    const formattedUsers: RandomMethodData['users'] = formatUsersFromRandom(
      resolvedData.roles.roles,
      finalProductKeys,
      resolvedData.users
    );

    const data: RandomMethodData = {
      roles: formattedRoles,
      productKeys: formattedProductKeys,
      users: formattedUsers,
    };

    try {
      console.info('insertion in the database');
      const roles = (await Role.insertFromData(data.roles)) as Array<IRoleDocument>;
      await Role.updateDefaultValues();
      const productKeys = (await ProductKey.insertFromData(
        data.productKeys
      )) as Array<IProductKeyDocument>;
      const userData = await formatUsersFromJson(data.users, mustCoerceRole);
      const users = (await User.insertFromData(userData)) as Array<IUserDocument>;
      console.info('number of inserted documents', {
        roles: roles?.length ? roles.length : 0,
        productKeys: productKeys?.length ? productKeys.length : 0,
        users: users?.length ? users.length : 0,
      });
    } catch (error) {
      console.error(`error during the ingestion phase:\n`);
      throw error;
    }
    console.info('initDatabase -- end');
  }

  async function initDatabase(method: string = 'raw', options: InitDatabaseOptions): Promise<void> {
    // prepare data to insert
    console.info(`Chosen method ${method}.`);
    switch (method) {
      case 'raw':
        await initDatabaseWithRawMethod(options as InitDatabaseWithRawMethodOptions);
        break;
      case 'json':
        await initDatabaseWithJsonMethod(options as InitDatabaseWithJsonMethodOptions);
        break;
      case 'random':
        await initDatabaseWithRandomMethod(options as InitDatabaseWithRandomMethodOptions);
        break;
      default:
        throw new Error('Unknow method. Unable to continue.');
    }
  }

  async function dumpDatabase({
    parentDir = './tmp',
    outputDirName = undefined,
    ignoreModels = [],
    keepModels = [],
  }: DumpDatabaseOptions): Promise<void> {
    console.info('dumpDatabase -- init ');
    // find list of models to dump
    let availableModels: Array<string> = Object.keys(connection.models);
    if (keepModels.length > 0) {
      availableModels = availableModels.filter((model: string): boolean =>
        keepModels.includes(model)
      );
    }
    if (ignoreModels.length > 0) {
      availableModels = availableModels.filter(
        (model: string): boolean => !ignoreModels.includes(model)
      );
    }
    if (availableModels.length === 0) {
      throw new Error(
        'No more available models after filtering with keepModels and ignoreModels options!'
      );
    }

    // find absolute directory path
    const absoluteOutputDir: string = path.join(
      resolvePath(parentDir),
      outputDirName || `dump-${formatDate(new Date())}`
    );

    // create directory if necessary
    fs.mkdir(
      absoluteOutputDir,
      { recursive: true },
      async (err: NodeJS.ErrnoException | null, pth: string | undefined) => {
        if (err) console.error(err);
        console.info(`folder already exists ? ${pth ? `true at ${pth}` : 'false'}`);
      }
    );

    // create dump files
    for (let index = 0; index < availableModels.length; index += 1) {
      const modelName: string = availableModels[index];
      const filename = path.join(absoluteOutputDir, `${modelName}.json`);

      try {
        const model = connection.models[modelName] as IGenericModel;
        await model.dumpData({ filename });
        console.info(`Dump file at ${filename} from model ${modelName}`);
      } catch (error) {
        console.error(error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Unknown error');
      }
    }
  }

  async function addSuperAdminUser({
    username = undefined,
    email,
    password,
    productKey = undefined,
    activationDate = undefined,
    activated = true,
    validityPeriod = 24 * 30 * 24 * 60 * 60, // in seconds aka 2 years
  }: AddSuperAdminUserOptions): Promise<void> {
    try {
      let productKeyDoc: IProductKeyDocument | null = null;
      let roleDoc: IRoleDocument | null = null;

      // -- retrieve productKeyDoc
      const {
        isKeyInvalid,
        isStored,
        storedProductKey,
        isInUse,
        isLinkedToUser,
        linkedUser,
        error,
      } = await checkProductKey(productKey);

      // we need a new key
      if (isKeyInvalid || !productKey || !isStored) {
        console.info('A new Product Key has been added.');
        // new key to add
        const newProductKey = new ProductKey({
          key: isKeyInvalid ? undefined : productKey,
          activationDate,
          activated,
          validityPeriod,
        });
        productKeyDoc = await newProductKey.save();
      }
      // we have a key attached to no one
      if (isStored) {
        console.info('The key is stored but is it attached to a user ?');
        if (error) {
          console.error(error);
        }

        if (isLinkedToUser && linkedUser) {
          const isSamePassword = await linkedUser.checkPassword(password);
          // CHECK IF SAME USER
          if (isSamePassword && linkedUser.email === email) {
            console.info('Super admin already registered');
            if (!isInUse && storedProductKey) {
              storedProductKey.activate(activationDate);
              await storedProductKey.save();
            }
          }
          console.error('It seems like this product key is registered to another user.');
          throw new Error('REGISTERED_PRODUCT_KEY_TO_ANOTHER_USER');
        }
        productKeyDoc = storedProductKey;
      }

      if (!productKeyDoc) {
        console.error("We couldn't generate the wanted product key.");
        throw new Error('UNFOUND_PRODUCT_KEY');
      }

      // -- retrieve roleDoc
      [roleDoc] = await Role.find(
        {},
        { _id: 1, name: 1 },
        { limit: 1, sort: { level: -1 } }
      ).lean();

      if (!roleDoc) {
        console.error("We couldn't find the highest role.");
        throw new Error('UNFOUND_HIGHEST_ROLE');
      }

      // -- create user
      const user = new User({
        username,
        email,
        password: await User.hashPassword(password),
        productKey: productKeyDoc._id,
        role: roleDoc._id,
      });

      const userDoc = await user.save();

      if (!userDoc) {
        console.error("We couldn't create/save a user instance.");
        throw new Error('NEW_USER_NOT_CREATED');
      }
    } catch (error) {
      console.error('Something unknown happened.');
      throw error;
    }
  }

  // create output
  const db: DatabaseConnectionType = {
    config: dbConfig,
    conn: connection,
    User,
    ProductKey,
    Role,
    helpers,
    initDatabase,
    dumpDatabase,
    addSuperAdminUser,
  };
  return db;
}

function getSafelyDatabaseConnection(): DatabaseConnectionType {
  try {
    return getDatabaseConnection();
  } catch (error) {
    console.error('Database connection error');
    throw error;
  }
}

export default getSafelyDatabaseConnection();
