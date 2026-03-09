import api from "../api/axios"

export default function AttendancePage() {
  const checkIn = async () => {
    await api.post("/attendances/check-in")
  }

  const checkOut = async () => {
    await api.post("/attendances/check-out")
  }

  return (
    <div>
      <h2>Attendance</h2>

      <button onClick={checkIn}>Check In</button>
      <button onClick={checkOut}>Check Out</button>
    </div>
  )
}