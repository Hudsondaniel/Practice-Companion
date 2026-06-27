import { flushSync } from 'react-dom'
import { useUIStore } from '@/stores/ui-store'

type StageElement = HTMLElement | null

let stageElement: StageElement = null
let panelsBeforeFocus: { left: boolean; right: boolean } | null = null
const listeners = new Set<(active: boolean) => void>()

function getFullscreenElement(): Element | null {
  const doc = document as Document & { webkitFullscreenElement?: Element | null }
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null
}

function notifyListeners(active: boolean): void {
  for (const listener of listeners) listener(active)
}

function isStageFullscreen(): boolean {
  return Boolean(stageElement && getFullscreenElement() === stageElement)
}

function restorePanelsIfNeeded(): void {
  if (!panelsBeforeFocus) return
  const { setGuidedLeftPanelOpen, setGuidedRightPanelOpen } = useUIStore.getState()
  setGuidedLeftPanelOpen(panelsBeforeFocus.left)
  setGuidedRightPanelOpen(panelsBeforeFocus.right)
  panelsBeforeFocus = null
}

function handleFullscreenChange(): void {
  if (isStageFullscreen()) {
    notifyListeners(true)
    return
  }
  if (useUIStore.getState().guidedImmersive) {
    useUIStore.getState().setGuidedImmersive(false)
    restorePanelsIfNeeded()
    notifyListeners(false)
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
}

export function registerGuidedStage(element: StageElement): void {
  stageElement = element
}

export function isGuidedFocusActive(): boolean {
  return useUIStore.getState().guidedImmersive
}

export function isGuidedBrowserFullscreen(): boolean {
  return isStageFullscreen()
}

async function waitForStage(maxFrames = 40): Promise<HTMLElement | null> {
  for (let i = 0; i < maxFrames; i += 1) {
    if (stageElement) return stageElement
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  }
  return stageElement
}

/** Focus mode: hide side panels (+ optional browser fullscreen). Always works even if FS API fails. */
export async function enterGuidedFocusMode(): Promise<void> {
  if (useUIStore.getState().guidedImmersive) {
    await waitForStage()
    if (stageElement && !isStageFullscreen()) {
      try {
        await stageElement.requestFullscreen()
      } catch {
        // CSS focus mode already active — fine.
      }
    }
    return
  }

  const { guidedLeftPanelOpen, guidedRightPanelOpen, setGuidedLeftPanelOpen, setGuidedRightPanelOpen, setGuidedImmersive } =
    useUIStore.getState()

  panelsBeforeFocus = {
    left: guidedLeftPanelOpen,
    right: guidedRightPanelOpen,
  }

  flushSync(() => {
    setGuidedImmersive(true)
    setGuidedLeftPanelOpen(false)
    setGuidedRightPanelOpen(false)
  })

  notifyListeners(true)

  const el = await waitForStage()
  if (!el) return

  try {
    if (el.requestFullscreen) {
      await el.requestFullscreen()
    } else {
      const legacy = el as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> }
      await legacy.webkitRequestFullscreen?.()
    }
  } catch {
    // Keep CSS focus mode — panels stay closed, sidebar hidden.
  }
}

export async function exitGuidedFocusMode(): Promise<void> {
  useUIStore.getState().setGuidedImmersive(false)
  restorePanelsIfNeeded()
  notifyListeners(false)

  if (!getFullscreenElement()) return

  try {
    if (document.exitFullscreen) {
      await document.exitFullscreen()
    } else {
      const legacy = document as Document & { webkitExitFullscreen?: () => Promise<void> }
      await legacy.webkitExitFullscreen?.()
    }
  } catch {
    // ignore
  }
}

export async function toggleGuidedFocusMode(): Promise<void> {
  if (useUIStore.getState().guidedImmersive) {
    await exitGuidedFocusMode()
  } else {
    await enterGuidedFocusMode()
  }
}

export function subscribeGuidedFocus(listener: (active: boolean) => void): () => void {
  listeners.add(listener)
  listener(useUIStore.getState().guidedImmersive)
  return () => listeners.delete(listener)
}

export function exitGuidedFocusModeIfActive(): void {
  if (useUIStore.getState().guidedImmersive || getFullscreenElement()) {
    void exitGuidedFocusMode()
  }
}

/** @deprecated use enterGuidedFocusMode */
export const enterGuidedFullscreen = enterGuidedFocusMode
/** @deprecated use exitGuidedFocusMode */
export const exitGuidedFullscreen = exitGuidedFocusMode
/** @deprecated use toggleGuidedFocusMode */
export const toggleGuidedFullscreen = toggleGuidedFocusMode
/** @deprecated use exitGuidedFocusModeIfActive */
export const exitGuidedFullscreenIfActive = exitGuidedFocusModeIfActive
/** @deprecated use isGuidedFocusActive */
export const isGuidedFullscreen = isGuidedFocusActive
/** @deprecated use subscribeGuidedFocus */
export const subscribeGuidedFullscreen = subscribeGuidedFocus
