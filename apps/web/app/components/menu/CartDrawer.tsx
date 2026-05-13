'use client';

import * as React from 'react';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, ShoppingCart, X } from 'lucide-react';
import { toast } from 'sonner';

export function CartDrawer() {
  const { items, removeItem, getTotalPrice } = useCartStore();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleRemove = (id: string, name: string) => {
    removeItem(id);
    toast.info(`${name} removed from cart`);
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(true)}
        className="relative bg-[#F59E0B] text-white p-3 rounded-full shadow-lg hover:bg-yellow-500 transition-all"
      >
        <ShoppingCart className="w-6 h-6" />
        {items.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white">
            {items.reduce((acc, i) => acc + i.quantity, 0)}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b flex items-center justify-between bg-gray-50">
              <h2 className="text-xl font-bold flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2 text-[#F59E0B]" />
                Your Order
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500 italic">Your cart is empty.</p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 border-b pb-4 last:border-0"
                  >
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-[#F59E0B] font-bold">
                        ${item.price.toFixed(2)} x {item.quantity}
                      </p>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Item?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove {item.name} from your order?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemove(item.id, item.name)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t bg-gray-50 space-y-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span className="text-[#F59E0B]">${getTotalPrice().toFixed(2)}</span>
                </div>
                <Button className="w-full bg-[#F59E0B] py-6 text-lg font-bold shadow-md hover:bg-yellow-500">
                  Checkout Now
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
