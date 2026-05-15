'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronDown, Menu, UtensilsCrossed, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CartDrawer } from '@/components/menu/CartDrawer';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useAuthStore } from '@/store/authStore';

function navLinkClass(active: boolean) {
  return cn(
    'rounded-md px-3 py-2 text-sm font-semibold transition-colors min-h-[44px] inline-flex items-center',
    active ? 'text-primary' : 'text-white/90 hover:text-primary',
  );
}

export type SiteNavbarVariant = 'default' | 'transparent';

export function SiteNavbar({ variant = 'default' }: { variant?: SiteNavbarVariant }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const t = useTranslations('Navigation');
  const { isAuthenticated, user } = useAuthStore();

  const pagesLinks = [
    { href: '/booking', label: t('bookTable') },
    { href: '/team', label: t('team') },
    { href: '/testimonial', label: t('testimonial') },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const barBg =
    variant === 'transparent' && !scrolled
      ? 'bg-transparent'
      : 'border-b border-white/10 bg-dark-navy/95 shadow-sm backdrop-blur-md';

  return (
    <header
      className={cn(
        'left-0 right-0 top-0 z-50 w-full',
        variant === 'transparent' ? 'fixed' : 'sticky',
        barBg,
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/logo.png" 
              alt="Cook Solution" 
              width={64} 
              height={64} 
              className="h-12 w-auto object-contain" 
              priority
            />
          </Link>
          <LanguageSwitcher className="border-white/10" />
        </div>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          <Link href="/" className={navLinkClass(pathname === '/')}>
            {t('home')}
          </Link>
          <Link href="/about" className={navLinkClass(pathname === '/about')}>
            {t('about')}
          </Link>
          <Link href="/service" className={navLinkClass(pathname === '/service')}>
            {t('service')}
          </Link>
          <Link href="/menu" className={navLinkClass(pathname === '/menu')}>
            {t('menu')}
          </Link>
          <Link href="/drinks" className={navLinkClass(pathname === '/drinks')}>
            {t('drinks')}
          </Link>
          <Link href="/orders" className={navLinkClass(pathname === '/orders')}>
            {t('orders')}
          </Link>
          <div
            className="relative"
            onMouseEnter={() => setDropdown(true)}
            onMouseLeave={() => setDropdown(false)}
          >
            <button
              type="button"
              className={cn(navLinkClass(pagesLinks.some((p) => pathname === p.href)), 'gap-1')}
              aria-expanded={dropdown}
              aria-haspopup="true"
            >
              {t('pages')}
              <ChevronDown className="h-4 w-4" aria-hidden />
            </button>
            {dropdown ? (
              <div className="absolute left-0 top-full z-50 min-w-[12rem] rounded-md border border-border bg-popover py-1 text-popover-foreground shadow-lg">
                {pagesLinks.map((p) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    className="block px-4 py-2.5 text-sm hover:bg-muted"
                    onClick={() => setDropdown(false)}
                  >
                    {p.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
          <Link href="/contact" className={navLinkClass(pathname === '/contact')}>
            {t('contact')}
          </Link>
          <Button asChild className="ml-2 shadow-md">
            <Link href="/booking">{t('bookTable')}</Link>
          </Button>

          {isAuthenticated ? (
            <Button asChild variant="outline" className="ml-2 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white">
              <Link href={(() => {
                const role = user?.role?.toLowerCase();
                if (role === 'admin' || role === 'manager') return '/manager';
                if (role === 'waiter') return '/waiter';
                if (role === 'kitchen') return '/kitchen';
                if (role === 'customer') return '/orders';
                return '/kitchen'; // fallback
              })()}>
                {t('dashboard')}
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" className="ml-2 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white">
              <Link href="/login">{t('login')}</Link>
            </Button>
          )}
          <CartDrawer />
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <CartDrawer />
          <Button asChild size="sm" className="shadow-md">
            <Link href="/booking">{t('book')}</Link>
          </Button>
          {isAuthenticated ? (
            <Button asChild size="sm" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white">
              <Link href={user?.role === 'CUSTOMER' ? '/orders' : '/kitchen'}>
                {user?.role === 'CUSTOMER' ? t('orders') : t('dashboard')}
              </Link>
            </Button>
          ) : (
            <Button asChild size="sm" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white">
              <Link href="/login">{t('login')}</Link>
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 hover:text-white"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-dark-navy px-4 py-4 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {[
              { href: '/', label: t('home') },
              { href: '/about', label: t('about') },
              { href: '/service', label: t('service') },
              { href: '/menu', label: t('menu') },
              { href: '/drinks', label: t('drinks') },
              { href: '/orders', label: t('orders') },
              { href: '/contact', label: t('contact') },
              ...pagesLinks,
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-md px-3 py-3 text-sm font-semibold text-white hover:bg-white/10"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
