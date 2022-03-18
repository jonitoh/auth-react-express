import express, { Response, Request, Application } from 'express'; // Import express framework
import { Server } from 'http';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import corsOptions from './config/cors-options.config';
import db from './models';
import { InitDatabaseOptions, AddSuperAdminUserOptions, DumpDatabaseOptions } from './models/types';
import middlewares from './middlewares';
import { getRoutes } from './routes';
import { resolveInput } from './utils/main';

const { verifyCredentials, handleLog, handleError } = middlewares;

// thx https://github.com/kentcdodds/express-app-example
function setupCloseOnExit(server: Server): void {
  // thank you stack overflow
  // https://stackoverflow.com/a/14032965/971592
  function exitHandler(options: { exit?: boolean } = {}): void {
    try {
      server.close();
      console.info('Server successfully closed');
    } catch (e: unknown) {
      console.warn(
        `Something went wrong closing the server${
          e instanceof Error && e.stack ? `: ${e.stack}` : ''
        }`
      );
    }
    // eslint-disable-next-line no-process-exit
    if (options.exit) process.exit();
  }

  // do something when app is closing
  process.on('exit', exitHandler);

  // catches ctrl+c event
  process.on('SIGINT', exitHandler.bind(null, { exit: true }));

  // catches "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
  process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));

  // catches uncaught exceptions
  process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
}

export async function startServer(
  port: number = parseFloat(process.env.PORT || '4000')
): Promise<Server> {
  // Initiate express app
  const app: Application = express();

  // Implement middleware;
  // custom logs
  app.use(handleLog.logHandler);

  // credentials
  app.use(verifyCredentials.checkHeader);
  // CORS
  app.use(cors(corsOptions));
  // parse requests of content-type - application/json
  app.use(express.json());
  // parse requests of content-type - application/x-www-form-urlencoded
  app.use(express.urlencoded({ extended: true }));

  // parse cookies from request
  app.use(cookieParser(process.env.COOKIE_SECRET));

  // being able to serve static files
  app.use('/public', express.static('public'));

  // Implement routes
  app.use('/api', getRoutes());

  // Import database and check it's working
  // app.locals.db = db;
  console.info('check readyState', db.conn.readyState);

  // Populate database if necessary
  const shouldPopulateDatabase: boolean =
    !!process.env.DB_POPULATE_DATABASE && process.env.DB_POPULATE_DATABASE === 'true';
  if (shouldPopulateDatabase) {
    console.info("let's populate database");
    const method: string = process.env.DATA_GENERATION_METHOD || 'json';
    type PopulateDbOptionsType = {
      roleInput: string | undefined;
      productKeyInput: string | undefined;
      userInput: string | undefined;
      mustCoerceRole?: boolean | undefined;
    };
    let populateDbOptions: PopulateDbOptionsType = {
      roleInput: process.env.DB_GENERATION_OPTIONS_ROLE,
      productKeyInput: process.env.DB_GENERATION_OPTIONS_PRODUCTKEY,
      userInput: process.env.DB_GENERATION_OPTIONS_USER,
      mustCoerceRole: method === 'raw' ? undefined : true,
    };

    // For test purpose
    // eslint-disable-next-line max-len
    if (
      !populateDbOptions.roleInput ||
      !populateDbOptions.productKeyInput ||
      !populateDbOptions.userInput
    ) {
      switch (method) {
        case 'raw':
          populateDbOptions = {
            roleInput: './data/raw/role.json',
            productKeyInput: './data/raw/productkey.json',
            userInput: './data/raw/user.json',
          };
          break;
        case 'json':
          populateDbOptions = {
            roleInput: './data/json/role.json',
            productKeyInput: './data/json/productkey.json',
            userInput: './data/json/user.json',
            mustCoerceRole: true,
          };
          break;
        case 'random':
          populateDbOptions = {
            roleInput: './data/random/role.json',
            productKeyInput: './data/random/product-key.json',
            userInput: './data/random/user.json',
            mustCoerceRole: true, // false,
          };
          break;
        default:
          console.warn('unknown method. It might break.');
          break;
      }
    }

    console.info('chosen method:', method);
    console.info('chosen options:', populateDbOptions);
    await db.initDatabase(method, populateDbOptions as InitDatabaseOptions);
  }

  // Add super admin product key
  if (process.env.SUPER_ADMIN_INFO) {
    const adminOptions = resolveInput(process.env.SUPER_ADMIN_INFO);
    await db.addSuperAdminUser(adminOptions as AddSuperAdminUserOptions);
  }

  // Make a dump of the database at the start of the app if necessary
  const shouldDumpDatabaseAtOpen: boolean =
    !!process.env.DB_DUMP_AT_OPEN && process.env.DB_DUMP_AT_OPEN === 'true';
  if (shouldDumpDatabaseAtOpen) {
    console.info('dump database at open -- start');
    const dumpDbOptions: DumpDatabaseOptions = {
      parentDir: './temp',
      // outputDirName: "my-little-dump",
    };
    await db.dumpDatabase(dumpDbOptions);
    console.info('populate database -- end');
  }

  if (process.env.NODE_ENV && process.env.NODE_ENV === 'development') {
    console.info('measures for development purpose');
    // HELLO WORLD ROUTE
    app.get('/hello-world', (req: Request, res: Response) => {
      res.send({ message: 'YOUR EXPRESS BACKEND IS ALIVE' });
    });
  }

  // error Handlers
  // -- log into a file the errors
  app.use(handleLog.errorHandler);
  // handleError
  app.use(handleError.safelyHandleError());

  return new Promise((resolve) => {
    const server: Server = app.listen(port, () => {
      const usedServer = server?.address();
      console.info(
        `Listening on port ${
          usedServer && typeof usedServer !== 'string' ? usedServer.port : 'unknown'
        }`
      );
      console.info(
        `Listening on address ${
          usedServer && typeof usedServer !== 'string' ? usedServer.address : 'unknown'
        }`
      );
      console.info(`Mongo uri at ${db.config.URI || 'unknown'}`);
      const originalClose = server.close.bind(server);

      function closeServer(callback?: ((err?: Error | undefined) => void) | undefined) {
        console.info('Should we dump the database?', !!process.env.DB_DUMP_AT_CLOSE);
        return originalClose(callback);
      }
      server.close = closeServer;
      setupCloseOnExit(server);
      resolve(server);
    });
  });
}

export default { startServer };
