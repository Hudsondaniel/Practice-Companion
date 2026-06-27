import { useEffect, useState } from 'react'
import { isGuidedFocusActive, subscribeGuidedFocus } from '@/lib/guided-fullscreen'

export function useGuidedFullscreen(): boolean {
  const [active, setActive] = useState(isGuidedFocusActive)

  useEffect(() => subscribeGuidedFocus(setActive), [])

  return active
}
