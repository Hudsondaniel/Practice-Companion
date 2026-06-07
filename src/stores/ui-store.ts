import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'dark' | 'light' | 'system'

interface UIState {
  sidebarCollapsed: boolean
  guidedLeftPanelOpen: boolean
  guidedRightPanelOpen: boolean
  guidedLeftPanelWidth: number
  guidedRightPanelWidth: number
  theme: Theme

  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleGuidedLeftPanel: () => void
  toggleGuidedRightPanel: () => void
  setGuidedLeftPanelWidth: (width: number) => void
  setGuidedRightPanelWidth: (width: number) => void
  setTheme: (theme: Theme) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      guidedLeftPanelOpen: true,
      guidedRightPanelOpen: true,
      guidedLeftPanelWidth: 220,
      guidedRightPanelWidth: 300,
      theme: 'dark',

      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleGuidedLeftPanel: () => set((s) => ({ guidedLeftPanelOpen: !s.guidedLeftPanelOpen })),
      toggleGuidedRightPanel: () => set((s) => ({ guidedRightPanelOpen: !s.guidedRightPanelOpen })),
      setGuidedLeftPanelWidth: (width) => set({ guidedLeftPanelWidth: width }),
      setGuidedRightPanelWidth: (width) => set({ guidedRightPanelWidth: width }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'piano-mastery-ui' },
  ),
)

export function resolveTheme(theme: Theme): 'dark' | 'light' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
}
