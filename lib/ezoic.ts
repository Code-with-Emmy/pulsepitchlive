/**
 * Safely pushes functions to the Ezoic command queue.
 * Prevents errors if the script hasn't initialized when a component mounts.
 */
export function runEzoic(fn: () => void) {
  if (typeof window === "undefined") return;
  
  // Initialize if not present
  if (!window.ezstandalone) {
    window.ezstandalone = { cmd: [] } as any;
  }
  
  // Ensure cmd array exists
  if (!window.ezstandalone!.cmd) {
    window.ezstandalone!.cmd = [];
  }
  
  window.ezstandalone!.cmd.push(fn);
}
