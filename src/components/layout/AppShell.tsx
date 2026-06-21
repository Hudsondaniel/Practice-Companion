import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { CloudGate } from '@/components/auth/CloudGate'
import { DatabaseStatusBanner } from '@/components/auth/DatabaseStatusBanner'
import { Sidebar } from './Sidebar'
import { PracticeToolsPanel } from '@/components/practice-tools/PracticeToolsPanel'
import { useGuidedSessionStore } from '@/stores/guided-session-store'
import { resolveTheme, useUIStore } from '@/stores/ui-store'

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
  const theme = useUIStore((s) => s.theme)

  return (
    <CloudGate>
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
        <DatabaseStatusBanner />
        {isGuidedActive ? (
        <div className="flex flex-1 flex-col overflow-hidden">
          <Outlet />
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <div className="flex flex-1 overflow-hidden">
            <main className="flex w-[60%] flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                <Outlet />
              </div>
            </main>
            <PracticeToolsPanel />
          </div>
        </div>
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
