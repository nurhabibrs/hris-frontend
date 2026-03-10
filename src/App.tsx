import { useEffect } from 'react'
import AppRouter from './routes/AppRouter'
import { useAuthStore } from './store/authStore'

function App() {
  const initUser = useAuthStore((state) => state.initUser)

  useEffect(() => {
    initUser()
  }, [initUser])

  return <AppRouter />
}

export default App
