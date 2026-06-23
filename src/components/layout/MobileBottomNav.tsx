import { NavLink, useLocation } from 'react-router-dom'
import { BookOpen, FileMusic, Home, Menu, Piano } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/ui-store'

const PRIMARY_NAV = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/practice', label: 'Practice', icon: Piano, end: false },
  { to: '/library', label: 'Library', icon: BookOpen, end: false },
  { to: '/transcriptions', label: 'Transcribe', icon: FileMusic, end: false },
] as const

export function MobileBottomNav() {
  const location = useLocation()
  const toggleMobileNav = useUIStore((s) => s.toggleMobileNav)
  const mobileNavOpen = useUIStore((s) => s.mobileNavOpen)

  const moreActive = ['/recordings', '/analytics', '/settings'].some((path) =>
    location.pathname.startsWith(path),
  )

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar/90 lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-14 max-w-lg items-stretch justify-around px-1">
        {PRIMARY_NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
        <button
          type="button"
          onClick={toggleMobileNav}
          className={cn(
            'flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium transition-colors',
            mobileNavOpen || moreActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
          )}
          aria-expanded={mobileNavOpen}
          aria-label="More pages"
        >
          <Menu className="h-5 w-5 shrink-0" aria-hidden />
          <span>More</span>
        </button>
      </div>
    </nav>
  )
}
