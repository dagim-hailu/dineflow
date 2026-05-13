'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../components/ui/button';
import { UtensilsCrossed, Search, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-4 text-center">
      <div className="relative mb-8">
        <div className="w-32 h-32 bg-orange-100 rounded-full flex items-center justify-center text-[#F59E0B] animate-pulse">
          <UtensilsCrossed className="w-16 h-16" />
        </div>
        <div className="absolute -top-2 -right-2 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-[#F59E0B]">
          <Search className="w-6 h-6" />
        </div>
      </div>

      <h1 className="text-6xl font-black text-[#1F2937] mb-4 tracking-tight">404</h1>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Where's the flavor?</h2>
      <p className="text-[#6B7280] max-w-md mx-auto mb-10 italic">
        We couldn't find the page you were looking for. Maybe it was too delicious and someone ate
        it?
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-xs sm:max-w-none">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="w-full sm:w-auto border-gray-300 text-gray-600 hover:bg-gray-50 transition-all flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
        <Link href="/" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-[#F59E0B] text-white hover:bg-yellow-500 transition-all flex items-center">
            <Home className="w-4 h-4 mr-2" />
            Back to Menu
          </Button>
        </Link>
      </div>

      <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm font-bold text-gray-400">
        <div className="flex flex-col items-center">
          <span className="mb-1 text-[#F59E0B]">15 Years</span>
          <span className="uppercase text-[10px] tracking-widest">Experience</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="mb-1 text-[#F59E0B]">50 Chefs</span>
          <span className="uppercase text-[10px] tracking-widest">Master Chefs</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="mb-1 text-[#F59E0B]">2000+</span>
          <span className="uppercase text-[10px] tracking-widest">Happy Clients</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="mb-1 text-[#F59E0B]">100%</span>
          <span className="uppercase text-[10px] tracking-widest">Quality</span>
        </div>
      </div>
    </div>
  );
}
