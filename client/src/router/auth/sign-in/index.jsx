import { SignIn } from '@clerk/clerk-react';
import React from 'react';

function SignInPage() {
  return (
    <div
      className="w-screen h-screen bg-cover bg-center relative flex items-center justify-center"
      style={{ backgroundImage: "url('/fundalHome.png')" }}
    >
     
      <div className="absolute inset-0 bg-black/50 z-0"></div>

      <div className="z-10">
        <SignIn />
      </div>
    </div>
  );
}

export default SignInPage;
