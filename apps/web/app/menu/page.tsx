'use client';

import { HomeDrinksSection } from '@/components/home-drinks-section';
import { HomeMenuSection } from '@/components/home-menu-section';
import { MarketingShell } from '@/components/marketing-shell';
import { SitePageHeader } from '@/components/site-page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UtensilsCrossed, Wine } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function MenuPage() {
  const t = useTranslations('Menu');
  const tNav = useTranslations('Navigation');

  return (
    <MarketingShell>
      <SitePageHeader
        title={t('ourMenu')}
        breadcrumbs={[
          { name: tNav('home'), link: '/' },
          { name: t('pages'), link: '#' },
          { name: tNav('menu') },
        ]}
      />
      <div className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <Tabs defaultValue="food">
          <div className="flex justify-center flex-col items-center pb-8 animate-fade-in-up">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              {t('discover')}
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl mb-6">
              {t('ourOfferings')}
            </h2>
            <TabsList className="flex h-auto w-full max-w-md bg-muted/50 p-1 shadow-sm">
              <TabsTrigger
                value="food"
                className="flex flex-1 items-center gap-2 py-3 font-display font-semibold sm:text-base"
              >
                <UtensilsCrossed className="h-5 w-5" />
                {t('foodMenu')}
              </TabsTrigger>
              <TabsTrigger
                value="drinks"
                className="flex flex-1 items-center gap-2 py-3 font-display font-semibold sm:text-base"
              >
                <Wine className="h-5 w-5" />
                {t('drinksMenu')}
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="food" className="mt-0 outline-none border-none p-0">
            <HomeMenuSection sectionId="menu-page-food" />
          </TabsContent>
          <TabsContent value="drinks" className="mt-0 outline-none border-none p-0">
            <HomeDrinksSection />
          </TabsContent>
        </Tabs>
      </div>
    </MarketingShell>
  );
}
