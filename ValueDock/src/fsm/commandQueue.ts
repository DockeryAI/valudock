/**
 * ValuDock Command Queue
 * 
 * Serializes side-effects (API calls, ROI calculations) to prevent race conditions.
 * Commands are executed one at a time in FIFO order.
 */

type Command = () => Promise<void> | void;

const queue: Command[] = [];
let busy = false;

/**
 * Enqueue a command to be executed serially
 * Commands will execute in the order they are enqueued
 */
export async function enqueue(cmd: Command): Promise<void> {
  queue.push(cmd);
  
  // If already processing, just add to queue and return
  if (busy) {
    console.log(`[CommandQueue] Added to queue (${queue.length} pending)`);
    return;
  }

  busy = true;
  
  try {
    while (queue.length > 0) {
      const command = queue.shift()!;
      console.log(`[CommandQueue] Executing command (${queue.length} remaining)`);
      await command();
    }
  } catch (error) {
    console.error('[CommandQueue] Command execution error:', error);
  } finally {
    busy = false;
    console.log('[CommandQueue] Queue cleared');
  }
}

/**
 * Get the current queue length (for debugging)
 */
export function getQueueLength(): number {
  return queue.length;
}

/**
 * Check if the queue is currently processing
 */
export function isProcessing(): boolean {
  return busy;
}
