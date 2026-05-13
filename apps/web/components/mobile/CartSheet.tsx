'use client';

import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from 'components/ui/sheet';
import { useCartStore } from 'store/cartStore';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from 'components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface CartSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CartSheet: React.FC<CartSheetProps> = ({ isOpen, onOpenChange }) => {
  const { items, removeItem, getTotalPrice } = useCartStore();

  const handleRemove = (id: string, name: string) => {
    removeItem(id);
    toast.info(`${name} removed from cart`);
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[80vh] rounded-t-3xl flex flex-col px-4 pb-safe pt-6"
      >
        <SheetHeader className="mb-4 text-left">
          <SheetTitle className="flex items-center text-2xl font-bold">
            <ShoppingCart className="w-6 h-6 mr-2 text-[#F59E0B]" />
            Your Order
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto hide-scrollbar -mx-4 px-4">
          <AnimatePresence>
            {items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <ShoppingCart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 italic">Your cart is empty.</p>
              </motion.div>
            ) : (
              items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.2 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={{ left: 0.5, right: 0 }}
                  onDragEnd={(e, { offset, velocity }) => {
                    if (offset.x < -50 || velocity.x < -500) {
                      handleRemove(item.id, item.name);
                    }
                  }}
                  className="flex items-center space-x-4 border-b border-gray-100 py-4 last:border-0 relative cursor-grab active:cursor-grabbing"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
                    <p className="text-sm text-[#F59E0B] font-bold">
                      ${item.price.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(item.id, item.name)}
                    className="p-3 text-gray-400 hover:text-red-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-gray-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {items.length > 0 && (
          <div className="pt-4 border-t border-gray-100 mt-auto">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-medium text-gray-500">Total</span>
              <span className="text-2xl font-black text-[#1F2937]">
                ${getTotalPrice().toFixed(2)}
              </span>
            </div>
            <Button
              className="w-full bg-[#F59E0B] hover:bg-yellow-500 text-white py-6 text-xl font-bold rounded-2xl shadow-xl min-h-[56px]"
              onClick={() => {
                onOpenChange(false);
                toast.success('Order placed successfully!', { position: 'bottom-center' });
              }}
            >
              Place Order
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
