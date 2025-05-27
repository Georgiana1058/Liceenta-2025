import React from 'react'
import './index.css'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom'

import App from './App.jsx'
import Home from './router/home'
import SignInPage from './router/auth/sign-in'
import SignUpPage from './router/auth/sign-up'
import Dashboard from './router/dashboard/dashboardUser'
import DashboardCompany from './router/dashboard/dashboardCompany'
import DashboardAdmin from './router/dashboard/dashboardAdmin'
import Notifications from './router/notification/Notifications'
import EditResume from './router/dashboard/dashboardUser/resume/[resumeId]/edit'
import ViewResume from './router/my-resume/[resumeId]/view'
import ProtectedRoute from './components/protected-route/ProtectedRoute'
import UserCalendar from './router/calendar/Calendar'
import ViewAdmin from './router/dashboard/dashboardAdmin/resumeItem/ViewAdmin'
import ViewCompany from './router/dashboard/dashboardCompany/cvItem/ViewCompany'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk publishable key (`VITE_CLERK_PUBLISHABLE_KEY`)')
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'auth/sign-in', element: <SignInPage /> },
      { path: 'auth/sign-up', element: <SignUpPage /> },
      { path: 'auth/callback', element: <Navigate to="/dashboard" replace /> },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute allowedRoles={['user', 'company', 'admin']}>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/company',
        element: (
          <ProtectedRoute allowedRoles={['company']}>
            <DashboardCompany />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/admin',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardAdmin />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/calendar',
        element: (
          <ProtectedRoute allowedRoles={['user', 'company','admin']}>
            <UserCalendar />
          </ProtectedRoute>
        ),
      },
      
      {
        path: 'dashboard/notifications',
        element: (
          <ProtectedRoute allowedRoles={['user', 'company', 'admin']}>
            <Notifications />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/resume/:resumeId/edit',
        element: (
          <ProtectedRoute allowedRoles={['user']}>
            <EditResume />
          </ProtectedRoute>
        ),
      },
      { path: 'my-resume/:resumeId/view', element: <ViewResume /> },
      { path: '*', element: <Navigate to="/" replace /> },

      {
        path: 'view-admin/:resumeId',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <ViewAdmin />
          </ProtectedRoute>
        ),
      },
      {
        path: 'view-company/:cvId',
        element: (
          <ProtectedRoute allowedRoles={['company']}>
            <ViewCompany />
          </ProtectedRoute>
        ),
      },
      
    ],
  },
])

function Root() {
  return (
    <ClerkProvider
  publishableKey={PUBLISHABLE_KEY}
  navigate={(to) => window.history.pushState(null, '', to)}
  afterSignOutUrl="/"
  signInUrl="/auth/sign-in"
  signUpUrl="/auth/sign-up"
  afterSignInUrl="/dashboard"
  afterSignUpUrl="/dashboard">

      <RouterProvider router={router} />
    </ClerkProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
