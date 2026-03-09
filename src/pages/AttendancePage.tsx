import { useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

const TABS = [
  { id: "beranda", label: "Beranda" },
  { id: "presensi", label: "Presensi" },
  { id: "rekap", label: "Rekap Presensi" },
];

function BerandaTab() {
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

function PresensiTab() {
  const checkIn = async () => {
    await api.post("/attendances/check-in");
  };

  const checkOut = async () => {
    await api.post("/attendances/check-out");
  };

  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <h3 className="text-lg font-semibold text-slate-800">Presensi Hari Ini</h3>
      <div className="flex gap-4">
        <button
          onClick={checkIn}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Check In
        </button>
        <button
          onClick={checkOut}
          className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          Check Out
        </button>
      </div>
    </div>
  );
}

function RekapTab() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p className="text-lg font-medium">Rekap Presensi</p>
      <p className="text-sm mt-1">Data rekap presensi akan ditampilkan di sini</p>
    </div>
  );
}

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState("beranda");

  return (
    <>
      <Navbar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="pt-24 min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6">
          {activeTab === "beranda" && <BerandaTab />}
          {activeTab === "presensi" && <PresensiTab />}
          {activeTab === "rekap" && <RekapTab />}
        </div>
      </div>
    </>
  );
}