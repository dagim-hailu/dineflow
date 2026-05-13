'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Home, UtensilsCrossed, ShoppingCart, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useCartStore } from 'store/cartStore';
import { CartSheet } from './CartSheet';

export const BottomNavigation = () => {
  const pathname = usePathname();
  const { items } = useCartStore();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);

  const navItems = [
    { label: 'Home', href: '/', icon: Home, isAction: false },
    { label: 'Menu', href: '/menu', icon: UtensilsCrossed, isAction: false },
    {
      label: 'Cart',
      href: '#',
      icon: ShoppingCart,
      badge: totalItems > 0 ? totalItems : undefined,
      isAction: true,
    },
    { label: 'Profile', href: '/profile', icon: User, isAction: false },
  ];

  return (
    <>
      <CartSheet isOpen={isCartOpen} onOpenChange={setIsCartOpen} />
      <div className="h-16 md:hidden"></div>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex justify-around items-center h-[72px] pb-safe md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.isAction && isCartOpen);
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <button
                key={item.label}
                onClick={() => setIsCartOpen(true)}
                className={`flex flex-col items-center justify-center w-full h-full min-w-[44px] min-h-[44px] ${
                  isActive ? 'text-[#F59E0B]' : 'text-gray-500 hover:text-gray-900'
                } transition-colors`}
              >
                <div className="relative">
                  <Icon className={`w-6 h-6 ${isActive ? 'fill-current text-[#F59E0B]' : ''}`} />
                  {item.badge !== undefined && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full min-w-[44px] min-h-[44px] ${
                isActive ? 'text-[#F59E0B]' : 'text-gray-500 hover:text-gray-900'
              } transition-colors`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 ${isActive ? 'fill-current text-[#F59E0B]' : ''}`} />
              </div>
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};
