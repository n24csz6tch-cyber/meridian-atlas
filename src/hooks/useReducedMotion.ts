export function useReducedMotion(): boolean {
  // Mathematical simulations and kinetic canvases have explicit Play/Pause controls on every instrument.
  // Never silently freeze 60fps educational animations due to OS-level Windows reduced-motion flags.
  return false;
}
