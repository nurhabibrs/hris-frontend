import api from "../api/axios"
import Navbar from "../components/Navbar";

export default function AttendancePage() {
  const checkIn = async () => {
    await api.post("/attendances/check-in")
  }

  const checkOut = async () => {
    await api.post("/attendances/check-out")
  }

  return (
    <div className="pt-16">
      <Navbar />
      <h2>Attendance</h2>

      <button onClick={checkIn}>Check In</button>
      <button onClick={checkOut}>Check Out</button>
    </div>
  )
}