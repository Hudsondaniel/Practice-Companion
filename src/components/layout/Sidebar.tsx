import { NavLink } from 'react-router-dom'
import {
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileMusic,
  Home,
  Languages,
  Mic,
  Piano,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/ui-store'
import { Button } from '@/components/ui/button'
import { APP_NAME } from '@/lib/app-config'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/practice', label: "Today's Practice", icon: Piano },
  { to: '/vocabulary', label: 'Vocabulary Lab', icon: Languages },
  { to: '/library', label: 'Practice Library', icon: BookOpen },
  { to: '/transcriptions', label: 'Transcriptions', icon: FileMusic },
  { to: '/recordings', label: 'Recordings', icon: Mic },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const

export function Sidebar({ className }: { className?: string }) {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  return (
    <aside
      className={cn(
        'flex h-full shrink-0 flex-col border-r border-border bg-sidebar transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-56',
        className,
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-border px-3">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <span className="font-display text-sm font-semibold text-primary">{APP_NAME}</span>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="shrink-0">
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2 scrollbar-thin">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-muted hover:text-foreground',
                sidebarCollapsed && 'justify-center px-2',
              )
            }
            title={sidebarCollapsed ? label : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
