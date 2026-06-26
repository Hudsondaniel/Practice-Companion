import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useGuidedSessionStore } from '@/stores/guided-session-store'

/** Pause guided-session timers when the tab sleeps so progress does not jump forward. */
export function useSessionLifecycle() {
  useEffect(() => {
    const onVisibility = () => {
      const state = useGuidedSessionStore.getState()
      if (document.visibilityState === 'hidden') {
        if (state.isActive && !state.isPaused) {
          state.freezeForBackground()
        }
        void useAuthStore.getState().flushPendingSave()
        return
      }
      if (document.visibilityState === 'visible') {
        state.reconcileAfterBackground()
      }
    }

    const onPageShow = () => {
      useGuidedSessionStore.getState().reconcileAfterBackground()
    }

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pageshow', onPageShow)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pageshow', onPageShow)
    }
  }, [])
}
