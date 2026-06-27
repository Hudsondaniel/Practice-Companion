import { useEffect, useRef } from 'react'
import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { CloudGate } from '@/components/auth/CloudGate'
import { DatabaseStatusBanner } from '@/components/auth/DatabaseStatusBanner'
import { Sidebar } from './Sidebar'
import { MobileBottomNav } from './MobileBottomNav'
import { MobileNavDrawer } from './MobileNavDrawer'
import { PracticeToolsFab, PracticeToolsSheet } from './PracticeToolsSheet'
import { PracticeToolsPanel } from '@/components/practice-tools/PracticeToolsPanel'
import { GuidedSession } from '@/components/practice/GuidedSession'
import { SessionResumeBar } from '@/components/practice/SessionResumeBar'
import { useSessionLifecycle } from '@/hooks/use-session-lifecycle'
import { registerGuidedStage } from '@/lib/guided-fullscreen'
import { useGuidedSessionStore } from '@/stores/guided-session-store'
import { resolveTheme, useUIStore } from '@/stores/ui-store'
import { cn } from '@/lib/utils'

function toastStyle() {
  const isLight = resolveTheme(useUIStore.getState().theme) === 'light'
  return {
    background: isLight ? '#ffffff' : '#12121a',
    color: isLight ? '#1a1a1f' : '#f4f4f5',
    border: isLight ? '1px solid #d8d6d0' : '1px solid #2e2e3a',
  }
}

export function AppShell() {
  const isGuidedActive = useGuidedSessionStore((s) => s.isActive)
  const guidedImmersive = useUIStore((s) => s.guidedImmersive)
  const theme = useUIStore((s) => s.theme)
  const guidedStageRef = useRef<HTMLDivElement>(null)
  useSessionLifecycle()

  useEffect(() => {
    registerGuidedStage(guidedStageRef.current)
    return () => registerGuidedStage(null)
  })

  return (
    <CloudGate>
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
        {!guidedImmersive && <DatabaseStatusBanner />}
        {!isGuidedActive && <SessionResumeBar />}
        {isGuidedActive ? (
          <div className="flex min-h-0 flex-1 overflow-hidden">
            {!guidedImmersive && <Sidebar className="hidden lg:flex" />}
            <div
              ref={guidedStageRef}
              className={cn(
                'flex min-w-0 flex-1 flex-col overflow-hidden bg-background',
                guidedImmersive && 'fixed inset-0 z-50',
              )}
            >
              <GuidedSession onComplete={() => {}} />
            </div>
          </div>
        ) : (
          <>
            <div className="flex min-h-0 flex-1 overflow-hidden">
              <Sidebar className="hidden lg:flex" />
              <div className="flex min-w-0 flex-1 overflow-hidden">
                <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-4 pb-24 scrollbar-thin sm:p-6 lg:pb-6">
                    <Outlet />
                  </div>
                </main>
                <PracticeToolsPanel className="hidden xl:flex" />
              </div>
            </div>
            <MobileBottomNav />
            <MobileNavDrawer />
            <PracticeToolsFab />
            <PracticeToolsSheet />
          </>
        )}
        <Toaster
          key={theme}
          position={isGuidedActive ? 'top-center' : 'bottom-right'}
          toastOptions={{ style: toastStyle() }}
        />
      </div>
    </CloudGate>
  )
}
