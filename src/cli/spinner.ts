const FRAMES = ['|', '/', '-', '\\'];
const INTERVAL = 80;

export function createSpinner(message: string) {
  let frameIndex = 0;
  let timer: ReturnType<typeof setInterval> | null = null;

  return {
    start() {
      process.stdout.write(`\r  ${FRAMES[0]} ${message}`);
      timer = setInterval(() => {
        frameIndex = (frameIndex + 1) % FRAMES.length;
        process.stdout.write(`\r  ${FRAMES[frameIndex]} ${message}`);
      }, INTERVAL);
    },

    stop(finalMessage?: string) {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      // Clear the spinner line and optionally print a final message
      process.stdout.write('\r' + ' '.repeat(message.length + 10) + '\r');
      if (finalMessage) {
        process.stdout.write(`  ${finalMessage}\n`);
      }
    },
  };
}
