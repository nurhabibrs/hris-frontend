import { useNavigate } from "react-router-dom"
import api from "../api/axios"
import { useAuthStore } from "../store/authStore"

export default function AttendancePage() {
  const navigate = useNavigate()

  const checkIn = async () => {
    await api.post("/attendances/check-in")
  }

  const checkOut = async () => {
    await api.post("/attendances/check-out")
  }

  const logout = async () => {
    useAuthStore.getState().logout()
    navigate("/")
  }

  return (
    <div>
      <h2>Attendance</h2>

      <button onClick={checkIn}>Check In</button>
      <button onClick={checkOut}>Check Out</button>

      <button onClick={logout}>Logout</button>
    </div>
  )
}