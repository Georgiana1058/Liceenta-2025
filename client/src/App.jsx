import React from 'react'
import { Outlet }  from 'react-router-dom'
import { Toaster } from './components/ui/sonner'
import ClerkSyncToStrapi from './router/auth/ClerkSyncToStrapi'
import { useUser } from '@clerk/clerk-react';

export default function App() {
  const { isSignedIn } = useUser();
  return (
    <>
   <ClerkSyncToStrapi />
      <Outlet />   
      <Toaster />
    </>
  )
}
