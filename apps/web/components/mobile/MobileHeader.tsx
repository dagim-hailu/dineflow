'use client';

import React, { useState, useEffect } from 'react';
import { Utensils, Menu, X, ShoppingCart, User } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { cn } from 'lib/utils';
import { useCartStore } from 'store/cartStore';
import { LanguageSwitcher } from '@/components/language-switcher';

export const MobileHeader = () => {
  const t = useTranslations('Navigation');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { items } = useCartStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 45);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <>
      <header
        className={cn(
          'md:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled ? 'bg-[#0F172A] shadow-md' : 'bg-[#0F172A]',
        )}
      >
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 text-white">
              <Utensils className="w-6 h-6 text-[#F59E0B]" />
              <span className="text-xl font-black tracking-tighter uppercase">DineFlow</span>
            </Link>
            <LanguageSwitcher className="px-2 h-8 border-white/10" />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-white hover:bg-white/10 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Collapsible Menu */}
        <div
          className={cn(
            'overflow-hidden transition-all duration-300 bg-[#0F172A] text-white',
            isMenuOpen ? 'max-h-64 border-t border-gray-800' : 'max-h-0',
          )}
        >
          <nav className="flex flex-col px-4 py-2 space-y-2">
            <Link
              href="/"
              className="py-3 font-semibold hover:text-[#F59E0B] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('home')}
            </Link>
            <Link
              href="#about"
              className="py-3 font-semibold hover:text-[#F59E0B] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('about')}
            </Link>
            <Link
              href="#service"
              className="py-3 font-semibold hover:text-[#F59E0B] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('service')}
            </Link>
            <Link
              href="#menu"
              className="py-3 font-semibold hover:text-[#F59E0B] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('menu')}
            </Link>
          </nav>
        </div>
      </header>
      {/* Spacer to prevent content from hiding behind fixed header */}
      <div className="h-16 md:hidden"></div>
    </>
  );
};
