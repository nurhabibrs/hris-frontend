import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"

function Snackbar({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm text-white bg-red-600">
      <span>{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 text-lg leading-none">&times;</button>
    </div>
  );
}

export default function LoginPage() {
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const closeSnackbar = useCallback(() => setError(null), [])

  const handleLogin = async () => {
    try {
        await login(email, password)
        navigate("/")
    } catch (err: unknown) {
        const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Login gagal"
        setError(message)
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
        {error && <Snackbar message={error} onClose={closeSnackbar} />}
        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-200 rounded-xl mb-4">
                    <img src="/vite.svg" alt="HRIS Logo" className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to {import.meta.env.VITE_APP_NAME}!</h1>
                <p className="text-slate-600">Sign in with your {import.meta.env.VITE_APP_NAME} email to continue</p>
            </div>

            {/* Login Form Card */}
            <div className="bg-white rounded-2xl shadow-md p-8 border border-slate-200">
                <input
                    className="border w-full p-2 mb-4 rounded"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    className="border w-full p-2 mb-4 rounded"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    onClick={handleLogin}
                    type="button"
                    className="w-full flex items-center justify-center px-6 py-4 bg-white border-2 border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                <span className="ml-3 text-base font-semibold text-slate-700">{'Login'}</span>
                </button>
            </div>
        </div>
    </div>
  )
}