import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/button'
import { UserButton, useUser } from '@clerk/clerk-react'
import { useStrapiUser } from '@/hooks/useStrapiUser'

export default function Header() {
  // încarcă starea Clerk
  const { isLoaded, isSignedIn, user } = useUser()
  // fetch din Strapi pe baza clerkUserId
  const { user: strapiUser, loading } = useStrapiUser(user?.id)

  // nu afișăm nimic până nu știm starea
  if (!isLoaded || loading) return null

  // aflăm numele rolului
  const role = strapiUser?.role?.name
  // alegem ruta de dashboard în funcție de rol
  const dashPath =
    role === 'admin'
      ? '/dashboard/admin'
      : role === 'company'
      ? '/dashboard/company'
      : '/dashboard'

  return (
    <header className="w-full flex justify-between items-center shadow-md p-2 px-4 min-h-[80px] bg-transparent">
      {/* logo-ul */}
      <Link to="/" className="flex-shrink-0">
        <img
          src="/logoApp.png"
          width={90}
          height={90}
          alt="ASE Logo"
          className="cursor-pointer"
        />
      </Link>

      {/* meniul */}
      {isSignedIn ? (
        <nav className="flex items-center gap-4">
          <Link to="/dashboard/calendar">
            <Button className="text-white hover:brightness-110">Calendar</Button>
          </Link>
          <Link to="/dashboard/notifications">
            <Button className="text-white hover:brightness-110">Notifications</Button>
          </Link>
          <Link to={dashPath}>
            <Button className="text-white hover:brightness-110">Dashboard</Button>
          </Link>
          <Link to="/">
            <Button className="text-white hover:brightness-110">Home</Button>
          </Link>
          <UserButton />
        </nav>
      ) : (
        <Link to="/auth/sign-up">
          <Button className="text-white hover:brightness-110 h-10 text-sm px-3 py-1">
            Get Started
          </Button>
        </Link>
      )}
    </header>
  )
}
