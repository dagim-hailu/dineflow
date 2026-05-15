'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Home, LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useAuthStore } from '@/store/authStore';

interface StaffHeaderProps {
  title: string;
  icon?: React.ReactNode;
}

export function StaffHeader({ title, icon }: StaffHeaderProps) {
  const t = useTranslations('Navigation');
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary/10 p-1.5 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Image 
                src="/logo.png" 
                alt="Cook Solution" 
                width={32} 
                height={32} 
                className="h-8 w-8 object-contain"
              />
            </div>
            <span className="hidden sm:inline-block font-display font-bold text-gray-900">
              Cook Solution
            </span>
          </Link>
          <div className="h-6 w-px bg-gray-200 mx-2" />
          <h1 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            {icon}
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <LanguageSwitcher className="border-gray-200" />
          
          <Button 
            variant="ghost" 
            size="sm" 
            asChild
            className="hidden sm:flex text-gray-600 hover:text-primary hover:bg-primary/5"
          >
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              {t('home')}
            </Link>
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="text-gray-600 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline-block">{t('logout')}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
