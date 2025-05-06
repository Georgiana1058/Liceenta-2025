import Header from '@/components/header-custom/Header';
import { UserButton } from '@clerk/clerk-react';
import React from 'react';

function Home() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <img
        src="/image.png"
        alt="Fundal Home"
        className="absolute w-full h-full object-cover z-0"
      />
      <div className="relative z-10">
        <Header />
        <div className="text-white text-4xl font-bold p-8">
          
        </div>
      </div>
    </div>
  );
}

export default Home;
