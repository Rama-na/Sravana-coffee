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

export function initDebug(): void {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.debug = String(DEBUG_ANIMATIONS)
}

export function logAnim(label: string, detail?: unknown): void {
  if (!DEBUG_ANIMATIONS) return
   
  console.info(`%c◈ ${label}`, 'color:#073C9D;font-weight:600', detail ?? '')
}
