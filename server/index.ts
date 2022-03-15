// Configuration better for testing purpose
import { startServer } from './start';

startServer().catch((reason) => console.error('Error when starting the server', reason));
