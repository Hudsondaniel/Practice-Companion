import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'dark' | 'light' | 'system'

interface UIState {
  sidebarCollapsed: boolean
  mobileNavOpen: boolean
  practiceToolsOpen: boolean
  guidedLeftPanelOpen: boolean
  guidedRightPanelOpen: boolean
  guidedLeftPanelWidth: number
  guidedRightPanelWidth: number
  theme: Theme

  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleMobileNav: () => void
  setMobileNavOpen: (open: boolean) => void
  togglePracticeTools: () => void
  setPracticeToolsOpen: (open: boolean) => void
  toggleGuidedLeftPanel: () => void
  toggleGuidedRightPanel: () => void
  setGuidedLeftPanelOpen: (open: boolean) => void
  setGuidedRightPanelOpen: (open: boolean) => void
  setGuidedLeftPanelWidth: (width: number) => void
  setGuidedRightPanelWidth: (width: number) => void
  setTheme: (theme: Theme) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileNavOpen: false,
      practiceToolsOpen: false,
      guidedLeftPanelOpen: true,
      guidedRightPanelOpen: true,
      guidedLeftPanelWidth: 220,
      guidedRightPanelWidth: 360,
      theme: 'dark',

      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleMobileNav: () => set((s) => ({ mobileNavOpen: !s.mobileNavOpen })),
      setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
      togglePracticeTools: () => set((s) => ({ practiceToolsOpen: !s.practiceToolsOpen })),
      setPracticeToolsOpen: (open) => set({ practiceToolsOpen: open }),
      toggleGuidedLeftPanel: () => set((s) => ({ guidedLeftPanelOpen: !s.guidedLeftPanelOpen })),
      toggleGuidedRightPanel: () => set((s) => ({ guidedRightPanelOpen: !s.guidedRightPanelOpen })),
      setGuidedLeftPanelOpen: (open) => set({ guidedLeftPanelOpen: open }),
      setGuidedRightPanelOpen: (open) => set({ guidedRightPanelOpen: open }),
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
