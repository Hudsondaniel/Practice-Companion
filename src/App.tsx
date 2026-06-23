import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Dashboard } from '@/pages/Dashboard'
import { TodaysPractice } from '@/pages/TodaysPractice'
import { PracticeLibrary } from '@/pages/PracticeLibrary'
import { Transcriptions } from '@/pages/Transcriptions'
import { Recordings } from '@/pages/Recordings'
import { Analytics } from '@/pages/Analytics'
import { Settings } from '@/pages/Settings'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="practice" element={<TodaysPractice />} />
          <Route path="library" element={<PracticeLibrary />} />
          <Route path="transcriptions" element={<Transcriptions />} />
          <Route path="recordings" element={<Recordings />} />
          <Route path="calendar" element={<Navigate to="/" replace />} />
          <Route path="vocabulary" element={<Navigate to="/library" replace />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
