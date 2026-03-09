import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import LoginPage from "../pages/LoginPage"
import AttendancePage from "../pages/AttendancePage"
import { useAuthStore } from "../store/authStore"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token)
  return token ? <>{children}</> : <Navigate to="/" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token)
  return token ? <Navigate to="/attendance" replace /> : <>{children}</>
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <AttendancePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}