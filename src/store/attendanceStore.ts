import { create } from "zustand"
import { useAuthStore } from "./authStore"
import api from "../api/axios"

interface AttendanceFilters {
    startDate?: string  // format: YYYY-MM-DD
    endDate?: string    // format: YYYY-MM-DD
    isLate?: boolean
    page?: number
    limit?: number
    order?: "asc" | "desc"
}

interface AttendanceMeta {
    total: number
    page: number
    limit: number
    total_pages: number
}

interface AttendanceState {
    attendances: Record<string, unknown>[]
    meta: AttendanceMeta | null
    fetchAttendanceSummary: (filters?: AttendanceFilters) => Promise<void>
}

export const useAttendanceStore = create<AttendanceState>((set) => ({
    attendances: [],
    meta: null,

    fetchAttendanceSummary: async (filters) => {
        const userId = useAuthStore.getState().user?.userId
        if (!userId) return

        const params: Record<string, string> = {}
        if (filters?.startDate) params.startDate = filters.startDate
        if (filters?.endDate) params.endDate = filters.endDate
        if (filters?.isLate !== undefined) params.isLate = String(filters.isLate)
        if (filters?.page) params.page = String(filters.page)
        if (filters?.limit) params.limit = String(filters.limit)
        if (filters?.order) params.order = filters.order

        const res = await api.get(`/attendances/${userId}`, { params })

        const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? [])
        const meta = res.data?.meta ?? null

        set({ attendances: data, meta })
    },
}))