import { useEffect, useState } from 'react'

/** SSR-safe media query hook. Re-renders only when the match actually flips. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  )

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches)
    setMatches(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)')
export const useIsMobile = () => useMediaQuery('(max-width: 639px)')
export const useHasHover = () => useMediaQuery('(hover: hover) and (pointer: fine)')
export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')
