'use client';

import { ChefHat, Headphones, Sparkles, UtensilsCrossed } from 'lucide-react';
import { useInViewAnimate } from '@/hooks/use-in-view-animate';
import { cn } from '@/lib/utils';
import { MarketingShell } from '@/components/marketing-shell';
import { SitePageHeader } from '@/components/site-page-header';

const services = [
  {
    title: 'Master chefs',
    body: 'Seasoned professionals plating excellence every night.',
    Icon: ChefHat,
  },
  {
    title: 'Curated menus',
    body: 'Seasonal dishes engineered for flavor and margin.',
    Icon: UtensilsCrossed,
  },
  {
    title: 'Guest experience',
    body: 'QR ordering, transparent timing, and warm hospitality.',
    Icon: Sparkles,
  },
  {
    title: 'Always-on support',
    body: 'We partner with you from onboarding through busy service.',
    Icon: Headphones,
  },
];

export default function ServicePage() {
  const { ref: headingRef, inView: headingInView } = useInViewAnimate();
  const { ref: gridRef, inView: gridInView } = useInViewAnimate();

  return (
    <MarketingShell>
      <SitePageHeader
        title="Services"
        breadcrumbs={[
          { name: 'Home', link: '/' },
          { name: 'Pages', link: '#' },
          { name: 'Service' },
        ]}
      />
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            ref={headingRef}
            className={cn('text-center opacity-0', headingInView && 'animate-fade-in-up')}
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              What we offer
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
              Explore our services
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Full-stack dining tools for modern restaurants—from the pass to the guest phone.
            </p>
          </div>
          <div
            ref={gridRef}
            className={cn(
              'mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 opacity-0',
              gridInView && 'animate-fade-in-up',
            )}
          >
            {services.map(({ title, body, Icon }) => (
              <div
                key={title}
                className="rounded-xl border border-border bg-card p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Icon className="h-7 w-7" aria-hidden />
                </div>
                <h3 className="font-display text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
