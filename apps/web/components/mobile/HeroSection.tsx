'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from 'components/ui/button';

export const HeroSection = () => {
  return (
    <section className="relative h-[50vh] md:h-[60vh] flex items-center justify-center bg-[#0F172A] overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <Image
          src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1200&auto=format&fit=crop"
          alt="Hero Background"
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
      </div>
      <div className="relative z-10 text-center w-full px-4 pt-16 md:pt-0">
        <h1 className="text-4xl md:text-7xl font-black text-white mb-4 leading-tight">
          Savor the Moment, <br />
          <span className="text-[#F59E0B]">Dine Your Way</span>
        </h1>
        <p className="text-base md:text-xl text-gray-300 mb-8 italic max-w-2xl mx-auto px-2">
          Experience the future of dining with real-time tracking, seamless ordering, and
          personalized service.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
          <Button className="w-full sm:w-auto bg-[#F59E0B] hover:bg-yellow-500 text-white min-h-[56px] text-lg font-black rounded-xl shadow-xl px-8">
            SEE FULL MENU
          </Button>
          <Button
            variant="outline"
            className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-[#0F172A] min-h-[56px] text-lg font-black rounded-xl transition-all px-8 bg-transparent"
          >
            BOOK A TABLE
          </Button>
        </div>
      </div>
    </section>
  );
};
