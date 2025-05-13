// src/router/auth/sign-up.jsx (sau cum preferi să-l numești)
import React from 'react';
import { SignUp } from '@clerk/clerk-react';

export default function SignUpPage() {


    return (
        <div className="w-screen h-screen bg-cover bg-center flex items-center justify-center"
            style={{ backgroundImage: "url('/fundalHome.png')" }}>
            <div className="absolute inset-0 bg-black/50" />
            <div className="z-10">
                <SignUp
                    path="/auth/sign-up"
                    routing="path"
                    signInUrl="/auth/sign-in"
                    afterSignUpUrl="/dashboard"
                    afterSignInUrl="/dashboard"
                    forceRedirectUrl="/dashboard"
                />

            </div>
        </div>
    );


}
