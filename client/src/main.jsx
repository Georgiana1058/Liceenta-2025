import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import SignInPage from './router/auth/sign-in/index.jsx'
import Home from './router/home/index.jsx'
import Dashboard from './router/dashboard/index.jsx'
import { ClerkProvider } from '@clerk/clerk-react'
import EditResume from './router/dashboard/resume/[resumeId]/edit/index.jsx'
import ViewResume from './router/my-resume/[resumeId]/view/index.jsx'
import Calendar from './router/calendar/Calendar.jsx'
import Notifications from './router/notification/Notifications.jsx'


const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

const router=createBrowserRouter([
  {
    element:<App/>,
    children:
    [
   
    {
      path:'/dashboard',
      element:<Dashboard/>
    },
    {
      path:'/dashboard/calendar',
      element:<Calendar/>
    },
    {
      path:'/dashboard/notifications',
      element:<Notifications/>
    },
    { path:'/dashboard/resume/:resumeId/edit',
      element:<EditResume/>

    },

    ]
  },

  {
    path:'/',
    element:<Home/>
  },


  {
    path:'/auth/sign-in',
    element:<SignInPage/>
  },

  {
    path:'/my-resume/:resumeId/view',
    element:<ViewResume/>
  }
]

)
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
     <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">

       <RouterProvider router={router}/>

     </ClerkProvider>
  </React.StrictMode>
)
