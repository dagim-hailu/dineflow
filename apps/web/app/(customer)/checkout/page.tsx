'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Trash2, Plus, Minus, CreditCard, Clock, Utensils } from 'lucide-react';

export default function CheckoutPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;

    setIsProcessing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const orderId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    toast.success('Order placed successfully!', {
      description: `Your order ${orderId} has been sent to the kitchen.`,
    });

    clearCart();
    router.push(`/track/${orderId}`);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Utensils className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some delicious items from the menu!</p>
        <Button onClick={() => router.push('/')} className="bg-[#F59E0B]">
          Back to Menu
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Utensils className="w-5 h-5 mr-2 text-[#F59E0B]" />
              Order Summary
            </h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                    <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center border rounded-md">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-gray-100"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-2 font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method (Placeholder) */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-[#F59E0B]" />
              Payment Method
            </h2>
            <div className="p-4 border-2 border-[#F59E0B] rounded-lg bg-orange-50 flex items-center">
              <div className="w-10 h-10 bg-[#F59E0B] rounded-full flex items-center justify-center text-white mr-4">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Pay at Counter</p>
                <p className="text-sm text-gray-600">Pay after your meal</p>
              </div>
            </div>
          </div>
        </div>

        {/* Totals & Actions */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
            <h2 className="text-xl font-semibold mb-4">Total</h2>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (10%)</span>
                <span>${(getTotalPrice() * 0.1).toFixed(2)}</span>
              </div>
              <div className="pt-4 border-t flex justify-between text-xl font-bold text-gray-900">
                <span>Grand Total</span>
                <span>${(getTotalPrice() * 1.1).toFixed(2)}</span>
              </div>
            </div>

            <Button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="w-full bg-[#F59E0B] text-white py-6 rounded-lg text-lg font-bold hover:bg-yellow-500 transition-all flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <Clock className="w-5 h-5 mr-2 animate-spin" />
                  Placing Order...
                </>
              ) : (
                'Place Order'
              )}
            </Button>

            <p className="mt-4 text-xs text-center text-gray-500">
              By placing your order, you agree to DineFlow's terms of service and privacy policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
