import main from './main.js';


let onShutdown: () => void;


(
  () => {
    try {
      const { port, shutdown } = main();
      onShutdown = shutdown;
      console.log(`[System] 🚀 Server ready at port ${port}.`);
    } catch (error) {
      console.error('❌ [System] Startup failed:', error);
      process.exit(1);
    }
  }
)();


const handleShutdown = async (signal: string): Promise<void> => {
  console.log(`[System] 🛑 ${signal} received.`);
  if (onShutdown) await onShutdown();
  process.exit(0);
};


process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));