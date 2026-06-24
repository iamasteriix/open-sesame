import { logger } from './config/logger.js';
import createApp from './app.js';


let onShutdown: () => Promise<void>;


const handleShutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} received.`);
  await onShutdown?.();
  process.exit(0);
};


const handleUnhandledRejection = async (reason: unknown) => {
  // `pino` has special handling for the `err` keyword specifically
  logger.fatal({ err: reason }, 'Unhandled promise rejection');
  await onShutdown?.();
  process.exit(1);
}


const handleUncaughtException = async (error: unknown) => {
  logger.fatal({ err: error, }, 'Uncaught exception');
  await onShutdown?.();
  process.exit(1);  // (You must exit after an uncaught exception)[https://node.readthedocs.io/en/latest/api/process/#event-uncaughtexception]
}


// vroom, vroom, babyyy!
const main = async () => {
  const { port, shutdown } = await createApp();

  onShutdown = shutdown;
  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('unhandledRejection', handleUnhandledRejection);
  process.on('uncaughtException', handleUncaughtException);

  logger.info(`Server ready at port ${port}.`);
}


main();