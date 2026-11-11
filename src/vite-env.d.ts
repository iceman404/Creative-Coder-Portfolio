/// <reference types="vite/client" />

// LayoutShift is not yet in TypeScript's DOM lib; declare the minimal
// surface used by src/utils/performance.ts for CLS measurement.
interface LayoutShift extends PerformanceEntry {
  /** Impact fraction of the layout shift. */
  readonly value: number;
  /** True when user input occurred within 500ms before the shift. */
  readonly hadRecentInput: boolean;
}
