import React from 'react'
import { Button } from '../ui/button'
import { Link } from 'react-router-dom'
import { UserButton, useUser } from '@clerk/clerk-react'

function Header() {
  const { isSignedIn } = useUser();

  return (
    <div className="w-full flex justify-between items-center shadow-md p-2 px-4 min-h-[80px]">
      <img src="/logoApp.png" width={90} height={90} alt="ASE Logo" />
      
      {isSignedIn ? (
        <div className="flex items-center gap-4">
          <Link to={'/dashboard/calendar'}>
          <Button className=" text-white hover:brightness-110">Calendar</Button>
          </Link>
          <Link to={'/dashboard/notifications'}>
          <Button className=" text-white hover:brightness-110">Notifications</Button>
          </Link>
          <Link to={'/dashboard'}>
          <Button className=" text-white hover:brightness-110">Dashboard</Button>
          </Link>
          <Link to={'/'}>
          <Button className=" text-white hover:brightness-110">Home</Button>
          </Link>
          <UserButton />
        </div>
      ) : (
        <Link to="/auth/sign-in">
          <Button
            className=" text-white hover:brightness-110 h-10 text-sm px-3 py-1"
          >
            Get Started
          </Button>
        </Link>
      )}
    </div>
  )
}

export default Header
