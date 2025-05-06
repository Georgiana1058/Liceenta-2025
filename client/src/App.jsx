import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useState, useEffect } from 'react'
import { Calendar } from "@/components/ui/calendar"
import { Navigate, Outlet } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import Header from './components/header-custom/Header'
import { Toaster } from './components/ui/sonner'

export default function App() {
  const [count, setCount] = useState(0)
  const { user, isLoaded, isSignedIn } = useUser()


  if (!isSignedIn && isLoaded) {
    return <Navigate to="/auth/sign-in" />
  }

  return (
    <>
      <Header/>
      <Outlet />
      <Toaster />
    </>
  )
}
