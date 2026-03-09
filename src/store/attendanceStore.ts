import { create } from "zustand"
import api from "../api/axios"

interface AttendanceState {
  attendances: Record<string, unknown>[]
  fetchSummary: () => Promise<void>
}

export const useAttendanceStore = create<AttendanceState>((set) => ({
  attendances: [],

  fetchSummary: async () => {
    const res = await api.get("/attendance/summary")

    set({
      attendances: res.data,
    })
  },
}))