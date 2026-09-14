/**
 * Development switch. Ships as `false`.
 *
 * When true:
 *  · ScrollTrigger markers are drawn
 *  · every <section> gets a dashed outline + its id printed in the corner
 *  · timeline construction is logged
 *
 * Can also be flipped at runtime without editing code:  ?debug=1
 */
export const DEBUG_ANIMATIONS =
  false ||
  (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug'))

/**
 * Bean-system diagnostics: origin marker, path guide, live particle counts,
 * scroll velocity and the current phase mix. Ships as `false`; enable at
 * runtime with ?debug (alongside the animation markers) or ?beans.
 */
export const DEBUG_BEANS =
  false ||
  (typeof window !== 'undefined' &&
    (new URLSearchParams(window.location.search).has('beans') ||
      new URLSearchParams(window.location.search).has('debug')))

export function initDebug(): void {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.debug = String(DEBUG_ANIMATIONS)
  document.documentElement.dataset.debugBeans = String(DEBUG_BEANS)
}

export function logAnim(label: string, detail?: unknown): void {
  if (!DEBUG_ANIMATIONS) return
   
  console.info(`%c◈ ${label}`, 'color:#073C9D;font-weight:600', detail ?? '')
}
