import { useEffect, useRef } from 'react'

/**
 * Custom hook to add touch gesture support for pan and zoom
 * @param elementRef - Reference to the element to add gestures to
 * @param options - Configuration options
 */
export function useTouchGestures(
  elementRef: React.RefObject<HTMLElement>,
  options: {
    onPan?: (deltaX: number, deltaY: number) => void
    onPinch?: (scale: number) => void
    onDoubleTap?: () => void
    enabled?: boolean
  } = {}
) {
  const { onPan, onPinch, onDoubleTap, enabled = true } = options

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null)
  const pinchStartDistanceRef = useRef<number | null>(null)
  const lastTapTimeRef = useRef<number>(0)

  useEffect(() => {
    if (!enabled || !elementRef.current) return

    const element = elementRef.current

    const getTouchDistance = (touch1: Touch, touch2: Touch): number => {
      const dx = touch1.clientX - touch2.clientX
      const dy = touch1.clientY - touch2.clientY
      return Math.sqrt(dx * dx + dy * dy)
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        // Single touch - potential pan or tap
        const touch = e.touches[0]
        touchStartRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now(),
        }
        lastTouchRef.current = { x: touch.clientX, y: touch.clientY }
      } else if (e.touches.length === 2 && onPinch) {
        // Two touches - pinch gesture
        pinchStartDistanceRef.current = getTouchDistance(e.touches[0], e.touches[1])
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && onPan && lastTouchRef.current) {
        // Pan gesture
        const touch = e.touches[0]
        const deltaX = touch.clientX - lastTouchRef.current.x
        const deltaY = touch.clientY - lastTouchRef.current.y

        onPan(deltaX, deltaY)

        lastTouchRef.current = { x: touch.clientX, y: touch.clientY }
      } else if (e.touches.length === 2 && onPinch && pinchStartDistanceRef.current) {
        // Pinch gesture
        e.preventDefault() // Prevent default zoom
        const currentDistance = getTouchDistance(e.touches[0], e.touches[1])
        const scale = currentDistance / pinchStartDistanceRef.current

        onPinch(scale)
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        // Check for double tap
        if (onDoubleTap && touchStartRef.current) {
          const timeSinceLastTap = Date.now() - lastTapTimeRef.current
          const timeSinceTouchStart = Date.now() - touchStartRef.current.time

          // Double tap if: less than 300ms since last tap, and touch was quick (< 200ms)
          if (timeSinceLastTap < 300 && timeSinceTouchStart < 200) {
            onDoubleTap()
            lastTapTimeRef.current = 0 // Reset to prevent triple tap
          } else {
            lastTapTimeRef.current = Date.now()
          }
        }

        // Reset refs
        touchStartRef.current = null
        lastTouchRef.current = null
        pinchStartDistanceRef.current = null
      }
    }

    // Add event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    // Cleanup
    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [enabled, onPan, onPinch, onDoubleTap, elementRef])
}

/**
 * Hook to prevent default browser touch behaviors
 * Prevents pull-to-refresh, double-tap zoom, etc.
 */
export function usePreventDefaultTouch(elementRef: React.RefObject<HTMLElement>, enabled = true) {
  useEffect(() => {
    if (!enabled || !elementRef.current) return

    const element = elementRef.current

    const preventDefault = (e: TouchEvent) => {
      // Prevent default for multi-touch (pinch zoom)
      if (e.touches.length > 1) {
        e.preventDefault()
      }
    }

    element.addEventListener('touchstart', preventDefault, { passive: false })
    element.addEventListener('touchmove', preventDefault, { passive: false })

    return () => {
      element.removeEventListener('touchstart', preventDefault)
      element.removeEventListener('touchmove', preventDefault)
    }
  }, [enabled, elementRef])
}
