import { logger } from './config/logger.js';
import main from './main.js';


let onShutdown: () => Promise<void>;


(
  async () => {
    try {
      const { port, shutdown } = await main();
      onShutdown = shutdown;
      logger.info(`Server ready at port ${port}.`);
    } catch (error) {
      logger.fatal(
        { err: error }, // `pino` has special handling for the `err` keyword specifically
        'Startup failed',
      );
      process.exit(1);
    }
  }
)();


const handleShutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} received.`);
  if (onShutdown) await onShutdown();
  process.exit(0);
};


const handleUnhandledRejection = (reason: unknown) => {
  logger.fatal(
    { err: reason },
    'Unhandled promise rejection',
  );
  process.exit(1);
}


const handleUncaughtException = (error: unknown) => {
  logger.fatal(
    { err: error, },
    'Uncaught exception',
  );
  process.exit(1);  // (You must exit after an uncaught exception)[https://node.readthedocs.io/en/latest/api/process/#event-uncaughtexception]
}


process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('unhandledRejection', handleUnhandledRejection);
process.on('uncaughtException', handleUncaughtException);