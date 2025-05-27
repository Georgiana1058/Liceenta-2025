import React from 'react'
import { Outlet }  from 'react-router-dom'
import { Toaster } from './components/ui/sonner'
import ClerkSyncToStrapi from './router/auth/ClerkSyncToStrapi'
import { useUser } from '@clerk/clerk-react';
import NotificationListener from './router/notification/notificationGlobal/NotificationListerner';

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
