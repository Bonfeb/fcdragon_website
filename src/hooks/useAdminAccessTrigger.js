import { useEffect, useRef } from 'react'

/**
 * Hidden ways to open the manager login modal, so it never clutters the public
 * navigation:
 *  - Desktop: keyboard shortcut Ctrl+Alt+L (or Cmd+Alt+L on Mac)
 *  - Mobile / touch: 5 quick taps on the club crest, OR a ~700ms long-press on it
 *
 * Returns a ref to attach to the trigger element (the crest/logo).
 */
export function useAdminAccessTrigger(onTrigger) {
  const tapCount = useRef(0)
  const tapTimer = useRef(null)
  const pressTimer = useRef(null)
  const elementRef = useRef(null)

  useEffect(() => {
    function handleKeyDown(e) {
      const modifier = e.ctrlKey || e.metaKey
      if (modifier && e.altKey && e.key.toLowerCase() === 'l') {
        e.preventDefault()
        onTrigger()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onTrigger])

  useEffect(() => {
    const el = elementRef.current
    if (!el) return

    function registerTap() {
      tapCount.current += 1
      clearTimeout(tapTimer.current)
      if (tapCount.current >= 5) {
        tapCount.current = 0
        onTrigger()
        return
      }
      tapTimer.current = setTimeout(() => { tapCount.current = 0 }, 1200)
    }

    function handleClick() {
      registerTap()
    }

    function handleTouchStart() {
      pressTimer.current = setTimeout(() => {
        onTrigger()
        tapCount.current = 0
      }, 700)
    }
    function clearPress() {
      clearTimeout(pressTimer.current)
    }

    el.addEventListener('click', handleClick)
    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchend', clearPress)
    el.addEventListener('touchmove', clearPress)

    return () => {
      el.removeEventListener('click', handleClick)
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchend', clearPress)
      el.removeEventListener('touchmove', clearPress)
      clearTimeout(tapTimer.current)
      clearTimeout(pressTimer.current)
    }
  }, [onTrigger])

  return elementRef
}
