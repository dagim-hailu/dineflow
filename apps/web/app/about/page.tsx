'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { MarketingShell } from '@/components/marketing-shell';
import { SitePageHeader } from '@/components/site-page-header';
import { Button } from '@/components/ui/button';
import { useInViewAnimate } from '@/hooks/use-in-view-animate';
import { cn } from '@/lib/utils';

export default function AboutPage() {
  const t = useTranslations('About');
  const tNav = useTranslations('Navigation');
  const tBooking = useTranslations('Booking');
  const { ref: aboutImgRef, inView: aboutImgInView } = useInViewAnimate();
  const { ref: aboutTextRef, inView: aboutTextInView } = useInViewAnimate();
  const { ref: teamRef, inView: teamInView } = useInViewAnimate();

  return (
    <MarketingShell>
      <SitePageHeader
        title={t('title')}
        breadcrumbs={[
          { name: tNav('home'), link: '/' },
          { name: tNav('pages'), link: '#' },
          { name: tNav('about') },
        ]}
      />
      <section className="border-b border-border bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div
              ref={aboutImgRef}
              className={cn(
                'grid grid-cols-2 gap-3 opacity-0 sm:gap-4',
                aboutImgInView && 'animate-slide-in-left',
              )}
            >
              <div className="space-y-3 sm:space-y-4">
                <img
                  src="/img/about-1.jpg"
                  alt=""
                  className="aspect-[4/5] w-full rounded-lg object-cover shadow-md transition-transform duration-500 hover:scale-[1.03]"
                />
                <img
                  src="/img/about-3.jpg"
                  alt=""
                  className="ml-auto aspect-square w-4/5 rounded-lg object-cover shadow-md transition-transform duration-500 hover:scale-[1.03]"
                />
              </div>
              <div className="space-y-3 pt-8 sm:space-y-4 sm:pt-12">
                <img
                  src="/img/about-2.jpg"
                  alt=""
                  className="aspect-square w-4/5 rounded-lg object-cover shadow-md transition-transform duration-500 hover:scale-[1.03]"
                />
                <img
                  src="/img/about-4.jpg"
                  alt=""
                  className="w-full rounded-lg object-cover shadow-md transition-transform duration-500 hover:scale-[1.03]"
                />
              </div>
            </div>
            <div
              ref={aboutTextRef}
              className={cn('opacity-0', aboutTextInView && 'animate-slide-in-right')}
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                {t('ourStory')}
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
                {t('welcome')}
              </h2>
              <p className="mt-4 text-muted-foreground">{t('description1')}</p>
              <p className="mt-4 text-muted-foreground">{t('description2')}</p>
              <div className="mt-8 grid grid-cols-2 gap-6">
                <div
                  className={cn(
                    'border-l-4 border-primary pl-4 opacity-0',
                    aboutTextInView && 'animate-count-up',
                  )}
                >
                  <p className="font-display text-4xl font-bold text-primary">15</p>
                  <p className="text-sm text-muted-foreground">{t('yearsExperience')}</p>
                </div>
                <div
                  className={cn(
                    'border-l-4 border-primary pl-4 opacity-0',
                    aboutTextInView && 'animate-count-up',
                  )}
                >
                  <p className="font-display text-4xl font-bold text-primary">50</p>
                  <p className="text-sm text-muted-foreground">{t('masterChefs')}</p>
                </div>
              </div>
              <Button
                asChild
                className="mt-8 min-h-[44px] shadow-md transition-transform duration-200 active:scale-95"
              >
                <Link href="/booking">{tBooking('bookTable')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">{t('team')}</p>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{t('meetKitchen')}</h2>
          <div
            ref={teamRef}
            className={cn(
              'mt-12 grid gap-8 opacity-0 sm:grid-cols-2 lg:grid-cols-4',
              teamInView && 'animate-fade-in-up',
            )}
          >
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                className="rounded-xl border border-border bg-card p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mx-auto h-36 w-36 overflow-hidden rounded-full border-2 border-primary/30">
                  <img
                    src={`/img/team-${num}.jpg`}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{t('masterChefs')}</h3>
                <p className="text-sm text-muted-foreground">{t('team')}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
