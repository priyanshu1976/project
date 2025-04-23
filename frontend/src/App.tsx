import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Landing from './pages/Landing'
import Transaction from './pages/Transaction'
import ProtectedRoute from './components/ProtectedRoute'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/useAuthStore'
function App() {
  const { checkAuth: authCheck } = useAuthStore()

  useEffect(() => {
    authCheck()
    console.log('i can say that this function ran')
  }, [authCheck])

  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/landing" element={<Landing />} />
          <Route path="/transactions" element={<Transaction />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  )
}

export default App
