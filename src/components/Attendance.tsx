import { useCallback, useState } from "react";
import api from "../api/axios";
import Snackbar from "./Snackbar";

export default function Attendance() {
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
          Datang
        </button>
        <button
          onClick={checkOut}
          className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          Pulang
        </button>
      </div>
    </div>
  );
}