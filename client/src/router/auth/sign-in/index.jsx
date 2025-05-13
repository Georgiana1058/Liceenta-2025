import React from 'react'
import { SignIn } from '@clerk/clerk-react'

export default function SignInPage() {
  return (
    <div className="w-screen h-screen bg-cover bg-center flex items-center justify-center"
         style={{ backgroundImage: "url('/fundalHome.png')" }}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="z-10">
      <SignIn
          path="/auth/sign-in"
          routing="path"
          signUpUrl="/auth/sign-up"
        />
      </div>
    </div>
  )
}
