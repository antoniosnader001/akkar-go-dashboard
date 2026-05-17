import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import DriversPage from './pages/DriversPage'
import RidersPage from './pages/RidersPage'
import TripsPage from './pages/TripsPage'
import OnlineDriversPage from './pages/OnlineDriversPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'
import { AppShell } from './components/layout/AppShell'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/drivers" element={<DriversPage />} />
        <Route path="/riders" element={<RidersPage />} />
        <Route path="/trips" element={<TripsPage />} />
        <Route
          path="/online-drivers"
          element={<OnlineDriversPage />}
        />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </AppShell>
  )
}
