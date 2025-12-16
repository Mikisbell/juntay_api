import * as React from "react"

const MOBILE_BREAKPOINT = 768

/**
 * Hook to detect mobile viewport.
 * Returns undefined during SSR/initial render to prevent hydration mismatch.
 * Consuming components should handle the undefined case (show skeleton or default state).
 */
export function useIsMobile(): boolean | undefined {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Return undefined during SSR, actual value after mount
  return isMobile
}

