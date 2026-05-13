'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, ChefHat, ShoppingBag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const steps = [
  { id: 'received', label: 'Order Received', icon: ShoppingBag, status: 'completed' },
  { id: 'preparing', label: 'Preparing', icon: ChefHat, status: 'current' },
  { id: 'cooking', label: 'Cooking', icon: Clock, status: 'pending' },
  { id: 'served', label: 'Served', icon: CheckCircle2, status: 'pending' },
];

export default function OrderTrackingPage() {
  const { orderId } = useParams();

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="text-gray-500 hover:text-gray-900 flex items-center">
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back to Menu
          </Link>
          <span className="text-sm font-semibold text-gray-500">#{orderId}</span>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 text-center mb-8 border border-gray-100">
          <h1 className="text-3xl font-extrabold text-[#1F2937] mb-2">We're on it!</h1>
          <p className="text-[#6B7280] mb-8 italic">
            Your delicious meal is being prepared with love.
          </p>

          <div className="relative">
            {/* Connector Line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2" />

            <div className="relative flex justify-between">
              {steps.map((step, idx) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`
                    w-12 h-12 rounded-full flex items-center justify-center z-10 border-4 border-white shadow-md
                    ${
                      step.status === 'completed'
                        ? 'bg-[#F59E0B] text-white'
                        : step.status === 'current'
                          ? 'bg-white border-[#F59E0B] text-[#F59E0B] animate-pulse'
                          : 'bg-gray-100 text-gray-300'
                    }
                  `}
                  >
                    <step.icon className="w-6 h-6" />
                  </div>
                  <span
                    className={`mt-4 text-xs font-bold uppercase tracking-wider
                    ${step.status === 'pending' ? 'text-gray-300' : 'text-[#1F2937]'}
                  `}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-xl p-6 border border-orange-100 flex items-start">
          <div className="w-12 h-12 bg-[#F59E0B] rounded-full flex items-center justify-center text-white mr-4 flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-[#1F2937]">Estimated Wait Time</h3>
            <p className="text-2xl font-black text-[#F59E0B]">12 - 15 mins</p>
            <p className="text-sm text-[#6B7280] mt-1 italic">
              Hang tight! Our chefs are working their magic.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-4">Need help with your order?</p>
          <Button variant="outline" className="border-gray-300 text-gray-600 hover:bg-gray-50">
            Call a Waiter
          </Button>
        </div>
      </div>
    </div>
  );
}
