import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AppSettings } from './components/AppSettings'
import { EntryPage } from './pages/EntryPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { MapPage } from './pages/MapPage'
import { DashPage } from './pages/DashPage'
import { StagePage } from './pages/StagePage'
import { ProfilePage } from './pages/ProfilePage'
import { BadgesPage } from './pages/BadgesPage'
import { SettingsPage } from './pages/SettingsPage'
import { TeacherPage } from './pages/TeacherPage'
import { useGameStore } from './store/gameStore'

function OnboardingGate() {
  const hasProfile = useGameStore((state) => state.learnerName.trim().length > 0)
  return hasProfile ? <Outlet /> : <Navigate to="/start" replace />
}

function DashGate() {
  const unlocked = useGameStore((state) => state.stages[2]?.cleared || state.stages[2]?.stars > 0)
  return unlocked ? <DashPage /> : <Navigate to="/map" replace />
}

function App() {
  return (
    <BrowserRouter>
      <AppSettings>
        <Routes>
          <Route path="/" element={<EntryPage />} />
          <Route path="/start" element={<OnboardingPage />} />
          <Route element={<OnboardingGate />}>
            <Route path="/map" element={<MapPage />} />
            <Route path="/dash" element={<DashGate />} />
            <Route path="/stage/:id" element={<StagePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/badges" element={<BadgesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="/teacher" element={<TeacherPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppSettings>
    </BrowserRouter>
  )
}

export default App
