import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useAttendanceStore } from "../store/attendanceStore";

type SnackbarType = "error" | "success";

function Snackbar({ message, type, onClose }: { message: string; type: SnackbarType; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm text-white transition-all ${
      type === "error" ? "bg-red-600" : "bg-green-600"
    }`}>
      <span>{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 text-lg leading-none">&times;</button>
    </div>
  );
}

const TABS = [
  { id: "dashboard", label: "Beranda" },
  { id: "attendance", label: "Presensi" },
  { id: "summary", label: "Rekap Presensi" },
];

function DashboardTab() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
      <p className="text-lg font-medium">Selamat Datang</p>
      <p className="text-sm mt-1">Halaman beranda HRIS</p>
    </div>
  );
}

function AttendanceTab() {
  const [snackbar, setSnackbar] = useState<{ message: string; type: "error" | "success" } | null>(null);
  const closeSnackbar = useCallback(() => setSnackbar(null), []);

  const checkIn = async () => {
    try {
      await api.post("/attendances/check-in");
      setSnackbar({ message: "Check in berhasil!", type: "success" });
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Gagal check in";
      setSnackbar({ message, type: "error" });
    }
  };

  const checkOut = async () => {
    try {
      await api.post("/attendances/check-out");
      setSnackbar({ message: "Check out berhasil!", type: "success" });
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Gagal check out";
      setSnackbar({ message, type: "error" });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 py-10 px-4">
      {snackbar && <Snackbar message={snackbar.message} type={snackbar.type} onClose={closeSnackbar} />}
      <h3 className="text-lg font-semibold text-slate-800">Presensi Hari Ini</h3>
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <button
          onClick={checkIn}
          className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Check In
        </button>
        <button
          onClick={checkOut}
          className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          Check Out
        </button>
      </div>
    </div>
  );
}

function SummaryTab() {
  const { attendances, meta, fetchSummary } = useAttendanceStore();
  const [filterStatus, setFilterStatus] = useState<"all" | "late" | "ontime">("all");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [limit, setLimit] = useState(10);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const filters: { startDate?: string; endDate?: string; isLate?: boolean; page: number; limit?: number; order?: "asc" | "desc" } = { page }
    if (startDate) filters.startDate = startDate
    if (endDate) filters.endDate = endDate
    if (filterStatus === "late") filters.isLate = true
    else if (filterStatus === "ontime") filters.isLate = false
    if (order) filters.order = order
    if (limit) filters.limit = limit
    fetchSummary(filters);
  }, [fetchSummary, startDate, endDate, filterStatus, order, limit, page]);

  const handleReset = () => {
    setPage(1);
    setFilterStatus("all");
    setStartDate("");
    setEndDate("");
    setOrder("desc");
    setLimit(10);
  };

  const filtered = attendances;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-3">Rekap Presensi</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 w-12 shrink-0">Dari</label>
            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 w-12 shrink-0">Sampai</label>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value as "all" | "late" | "ontime"); setPage(1); }}
            className="col-span-1 sm:col-span-2 lg:col-span-1 text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="late">Terlambat</option>
            <option value="ontime">Tepat Waktu</option>
          </select>
          <select
            value={order}
            onChange={(e) => { setOrder(e.target.value as "asc" | "desc"); setPage(1); }}
            className="col-span-1 sm:col-span-2 lg:col-span-1 text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="desc">Terbaru</option>
            <option value="asc">Terlama</option>
          </select>
          {(filterStatus !== "all" || startDate || endDate) && (
            <button
              onClick={handleReset}
              className="col-span-1 sm:col-span-2 lg:col-span-1 text-sm px-3 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <p className="text-sm">Tidak ada data presensi</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">No</th>
                <th className="px-6 py-3">Tanggal</th>
                <th className="px-6 py-3">Datang</th>
                <th className="px-6 py-3">Pulang</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-500">{index + 1}</td>
                  <td className="px-6 py-4 text-slate-700">{String(item.attendance_date ?? "-")}</td>
                  <td className="px-6 py-4 text-slate-700">{String(item.checkIn ?? item.check_in ?? "-")}</td>
                  <td className="px-6 py-4 text-slate-700">{String(item.checkOut ?? item.check_out ?? "-")}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.isLate || item.is_late
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {item.isLate || item.is_late ? "Terlambat" : "Tepat Waktu"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {meta && (
        <div className="px-4 sm:px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <p className="text-sm text-slate-500">
              Menampilkan {attendances.length} dari {meta.total} data
            </p>
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              &laquo;
            </button>
            {Array.from({ length: meta.total_pages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === meta.total_pages || Math.abs(p - page) <= 1)
              .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === "..." ? (
                  <span key={`ellipsis-${idx}`} className="px-2 py-1.5 text-slate-400 text-sm">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                      p === page
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setPage((p) => Math.min(meta.total_pages, p + 1))}
              disabled={page === meta.total_pages}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              &raquo;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <>
      <Navbar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="pt-24 min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6">
          {activeTab === "dashboard" && <DashboardTab />}
          {activeTab === "attendance" && <AttendanceTab />}
          {activeTab === "summary" && <SummaryTab />}
        </div>
      </div>
    </>
  );
}