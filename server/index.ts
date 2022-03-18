// Configuration better for testing purpose
import { startServer } from './start';

startServer().catch((reason: unknown) => console.error('Error when starting the server', reason));
