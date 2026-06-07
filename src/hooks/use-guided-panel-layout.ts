import { useCallback, useEffect, useMemo, useState } from 'react'
import { COLLAPSED_WIDTH } from '@/components/practice/ResizablePanel'

const MIN_MAIN_WIDTH = 360
const PANEL_MIN = 180
const PANEL_MAX = 480

interface UseGuidedPanelLayoutOptions {
  leftOpen: boolean
  rightOpen: boolean
  leftWidth: number
  rightWidth: number
  setLeftWidth: (width: number) => void
  setRightWidth: (width: number) => void
}

function clampPanelWidth(width: number, maxAllowed: number) {
  return Math.min(PANEL_MAX, maxAllowed, Math.max(PANEL_MIN, width))
}

export function useGuidedPanelLayout({
  leftOpen,
  rightOpen,
  leftWidth,
  rightWidth,
  setLeftWidth,
  setRightWidth,
}: UseGuidedPanelLayoutOptions) {
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1280,
  )

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const leftMaxWidth = useMemo(() => {
    const rightReserved = rightOpen ? rightWidth : COLLAPSED_WIDTH
    return Math.max(PANEL_MIN, viewportWidth - MIN_MAIN_WIDTH - rightReserved)
  }, [viewportWidth, rightOpen, rightWidth])

  const rightMaxWidth = useMemo(() => {
    const leftReserved = leftOpen ? leftWidth : COLLAPSED_WIDTH
    return Math.max(PANEL_MIN, viewportWidth - MIN_MAIN_WIDTH - leftReserved)
  }, [viewportWidth, leftOpen, leftWidth])

  useEffect(() => {
    const clampedLeft = clampPanelWidth(leftWidth, leftMaxWidth)
    if (clampedLeft !== leftWidth) setLeftWidth(clampedLeft)
  }, [leftWidth, leftMaxWidth, setLeftWidth])

  useEffect(() => {
    const clampedRight = clampPanelWidth(rightWidth, rightMaxWidth)
    if (clampedRight !== rightWidth) setRightWidth(clampedRight)
  }, [rightWidth, rightMaxWidth, setRightWidth])

  const setLeftWidthClamped = useCallback(
    (width: number) => setLeftWidth(clampPanelWidth(width, leftMaxWidth)),
    [leftMaxWidth, setLeftWidth],
  )

  const setRightWidthClamped = useCallback(
    (width: number) => setRightWidth(clampPanelWidth(width, rightMaxWidth)),
    [rightMaxWidth, setRightWidth],
  )

  return {
    leftMaxWidth,
    rightMaxWidth,
    setLeftWidthClamped,
    setRightWidthClamped,
  }
}
