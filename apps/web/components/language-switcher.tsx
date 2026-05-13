'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { setUserLocale } from '@/lib/locale';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Languages } from 'lucide-react';

export function LanguageSwitcher({ className }: { className?: string }) {
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const router = useRouter();

  const toggleLocale = () => {
    const nextLocale = locale === 'en' ? 'am' : 'en';
    startTransition(async () => {
      await setUserLocale(nextLocale);
      router.refresh();
    });
  };

  return (
    <Button
      variant="outline"
      onClick={toggleLocale}
      disabled={isPending}
      className={cn(
        'flex items-center gap-2 text-xs font-bold border-input text-foreground hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all h-9 px-3',
        className,
      )}
    >
      <Languages className="h-4 w-4" />
      <span>{locale === 'en' ? 'አማርኛ' : 'English'}</span>
    </Button>
  );
}
