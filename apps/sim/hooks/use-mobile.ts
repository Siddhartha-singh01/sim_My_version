import { useEffect, useState } from 'react'

/**
 * Hook to detect if the current viewport matches a mobile breakpoint
 * @param breakpoint - The breakpoint to check (default: 768px for tablet and below)
 * @returns boolean indicating if viewport is at or below the breakpoint
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Create media query
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`)

    // Set initial value
    setIsMobile(mediaQuery.matches)

    // Create event listener
    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }

    // Add listener (use addEventListener for better browser support)
    mediaQuery.addEventListener('change', handleChange)

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [breakpoint])

  return isMobile
}

/**
 * Hook to get the current breakpoint name
 * @returns The current breakpoint name (xs, sm, md, lg, xl, 2xl)
 */
export function useBreakpoint(): 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' {
  const [breakpoint, setBreakpoint] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>('lg')

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      if (width < 640) setBreakpoint('xs')
      else if (width < 768) setBreakpoint('sm')
      else if (width < 1024) setBreakpoint('md')
      else if (width < 1280) setBreakpoint('lg')
      else if (width < 1536) setBreakpoint('xl')
      else setBreakpoint('2xl')
    }

    // Set initial value
    updateBreakpoint()

    // Add resize listener
    window.addEventListener('resize', updateBreakpoint)

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateBreakpoint)
    }
  }, [])

  return breakpoint
}
