'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChefHat, Headphones, Play, ShoppingCart, UtensilsCrossed } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { BackToTop } from '@/components/back-to-top';
import { HomeDrinksSection } from '@/components/home-drinks-section';
import { HomeMenuSection } from '@/components/home-menu-section';
import { PageSpinner } from '@/components/page-spinner';
import { SiteFooter } from '@/components/site-footer';
import { SiteNavbar } from '@/components/site-navbar';
import { TestimonialCarousel } from '@/components/testimonial-carousel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInViewAnimate } from '@/hooks/use-in-view-animate';
import { cn } from '@/lib/utils';

export default function Home() {
  const tHero = useTranslations('Hero');
  const tHome = useTranslations('Home');
  const tAbout = useTranslations('About');
  const tBooking = useTranslations('Booking');
  const tNav = useTranslations('Navigation');

  const services = [
    {
      title: tHome('services.chefsTitle'),
      body: tHome('services.chefsBody'),
      Icon: ChefHat,
    },
    {
      title: tHome('services.foodTitle'),
      body: tHome('services.foodBody'),
      Icon: UtensilsCrossed,
    },
    {
      title: tHome('services.orderTitle'),
      body: tHome('services.orderBody'),
      Icon: ShoppingCart,
    },
    {
      title: tHome('services.serviceTitle'),
      body: tHome('services.serviceBody'),
      Icon: Headphones,
    },
  ];

  const stats = [
    { value: '15', label: tHome('stats.years') },
    { value: '50', label: tHome('stats.chefs') },
    { value: '800', label: tHome('stats.dishes') },
    { value: '4.9', label: tHome('stats.rating') },
  ];

  /* ── Scroll-reveal refs (replaces WOW.js) ─────────────────────── */
  const { ref: servicesRef, inView: servicesInView } = useInViewAnimate();
  const { ref: aboutImgRef, inView: aboutImgInView } = useInViewAnimate();
  const { ref: aboutTextRef, inView: aboutTextInView } = useInViewAnimate();
  const { ref: teamRef, inView: teamInView } = useInViewAnimate();
  const { ref: testimonialRef, inView: testimonialInView } = useInViewAnimate();

  return (
    <>
      <PageSpinner />
      <div className="flex min-h-screen flex-col bg-background">
        <SiteNavbar variant="transparent" />

        <main className="flex-1">
          {/* ── Hero ─────────────────────────────────────────────────── */}
          <section className="relative bg-dark-navy pb-16 pt-28 text-white lg:pb-24 lg:pt-32">
            <div
              className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"
              aria-hidden
            />
            <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8">
              {/* Left — slideInLeft (matches original animated slideInLeft) */}
              <div className="animate-slide-in-left text-center lg:text-left">
                <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl whitespace-pre-line">
                  {tHero('tagline')}
                </h1>
                <p className="mx-auto mt-6 max-w-xl text-lg text-white/85 lg:mx-0">
                  {tHero('description')}
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                  <Button
                    asChild
                    size="lg"
                    className="min-h-[44px] px-8 shadow-lg transition-transform duration-200 active:scale-95"
                  >
                    <a href="#food-menu">{tHero('viewFoodMenu')}</a>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="min-h-[44px] border-white bg-transparent px-8 text-white transition-all duration-200 hover:bg-white hover:text-dark-navy active:scale-95"
                  >
                    {/* Drink menu scrolls to the drinks section on the same page */}
                    <a href="#drink-menu">{tHero('viewDrinksMenu')}</a>
                  </Button>
                </div>
              </div>

              {/* Right — spinning hero image */}
              <div className="relative mx-auto mt-10 aspect-square w-3/4 max-w-md animate-fade-in-up lg:mt-0 lg:w-full">
                <div className="relative h-full w-full overflow-hidden rounded-full drop-shadow-2xl">
                  <Image
                    src="/img/hero.png"
                    alt="Grilled dish"
                    fill
                    className="animate-spin-slow object-cover"
                    sizes="(max-width: 1024px) 100vw, 480px"
                    priority
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ── Services ─────────────────────────────────────────────── */}
          <section className="py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {/* fadeInUp on scroll — replaces data-wow-delay="0.1s" */}
              <div
                ref={servicesRef}
                className={cn(
                  'grid gap-6 opacity-0 sm:grid-cols-2 lg:grid-cols-4',
                  servicesInView && 'animate-fade-in-up',
                )}
              >
                {services.map(({ title, body, Icon }) => (
                  <div
                    key={title}
                    className="rounded-xl border border-border bg-card p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-primary hover:shadow-md"
                  >
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary transition-colors duration-300 group-hover:bg-white/20">
                      <Icon className="h-7 w-7" aria-hidden />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── About ────────────────────────────────────────────────── */}
          <section className="border-y border-border bg-muted/30 py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2">
                {/* Images — slideInLeft on scroll */}
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

                {/* Text — slideInRight on scroll */}
                <div
                  ref={aboutTextRef}
                  className={cn('opacity-0', aboutTextInView && 'animate-slide-in-right')}
                >
                  <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                    {tNav('about')}
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
                    {tAbout('welcome')}
                  </h2>
                  <p className="mt-4 text-muted-foreground">{tAbout('description1')}</p>
                  <p className="mt-4 text-muted-foreground">{tAbout('description2')}</p>

                  {/* Stats — counter-up style (animate-count-up on scroll) */}
                  <div className="mt-8 grid grid-cols-2 gap-6">
                    {stats.map(({ value, label }) => (
                      <div
                        key={label}
                        className={cn(
                          'border-l-4 border-primary pl-4 opacity-0',
                          aboutTextInView && 'animate-count-up',
                        )}
                      >
                        <p className="font-display text-4xl font-bold text-primary">{value}</p>
                        <p className="text-sm text-muted-foreground">{label}</p>
                      </div>
                    ))}
                  </div>
                  <Button
                    asChild
                    className="mt-8 min-h-[44px] shadow-md transition-transform duration-200 active:scale-95"
                    variant="secondary"
                  >
                    <Link href="/about">{tHome('readMore')}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* ── Food Menu Section (Breakfast / Lunch / Dinner tabs) ─── */}
          <HomeMenuSection />

          {/* ── Drinks Section (separate grid, no tab mixing) ────────── */}
          <HomeDrinksSection />

          {/* ── Reservation + Video ──────────────────────────────────── */}
          <section className="py-0">
            <div className="grid lg:grid-cols-2">
              <a
                href="https://www.youtube.com/watch?v=DWRcNpR6Kdc"
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex min-h-[280px] items-center justify-center bg-muted lg:min-h-[420px]"
              >
                <span
                  className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20"
                  aria-hidden
                />
                {/* Play button with pulse-border animation */}
                <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl ring-4 ring-white/30 transition-transform duration-200">
                  <span
                    className="absolute inset-0 rounded-full animate-pulse-border bg-primary"
                    aria-hidden
                  />
                  <Play className="ml-1 h-7 w-7 relative z-10" aria-hidden />
                </span>
                <span className="absolute bottom-4 left-4 z-10 text-sm font-medium text-white">
                  {tHome('watchKitchen')}
                </span>
              </a>
              <div className="flex flex-col justify-center bg-dark-navy px-6 py-12 text-white sm:px-10 lg:px-14">
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                  {tHome('testimonial')}
                </p>
                <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
                  {tBooking('title')}
                </h2>
                <form className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-1">
                    <Label htmlFor="res-name" className="text-white/90">
                      {tBooking('nameLabel')}
                    </Label>
                    <Input
                      id="res-name"
                      placeholder={tBooking('placeholderName') || 'Name'}
                      className="border-white/20 bg-white/10 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-1">
                    <Label htmlFor="res-email" className="text-white/90">
                      {tBooking('emailLabel')}
                    </Label>
                    <Input
                      id="res-email"
                      type="email"
                      placeholder={tBooking('placeholderEmail') || 'Email'}
                      className="border-white/20 bg-white/10 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-1">
                    <Label htmlFor="res-datetime" className="text-white/90">
                      {tBooking('dateTimeLabel')}
                    </Label>
                    <Input
                      id="res-datetime"
                      type="datetime-local"
                      className="border-white/20 bg-white/10 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-1">
                    <Label htmlFor="res-party" className="text-white/90">
                      {tBooking('partySizeLabel')}
                    </Label>
                    <Input
                      id="res-party"
                      type="number"
                      min={1}
                      max={20}
                      defaultValue={2}
                      className="border-white/20 bg-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="res-notes" className="text-white/90">
                      {tBooking('notesLabel')}
                    </Label>
                    <Input
                      id="res-notes"
                      placeholder={tBooking('placeholderNotes') || 'Notes'}
                      className="border-white/20 bg-white/10 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Button
                      type="button"
                      className="h-12 min-h-[44px] w-full text-base shadow-lg transition-transform duration-200 active:scale-95"
                    >
                      {tBooking('submit')}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </section>

          {/* ── Team ─────────────────────────────────────────────────── */}
          <section className="py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                {tHome('team')}
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
                {tHome('masterChefs')}
              </h2>
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
                    <h3 className="mt-4 font-display text-lg font-semibold">
                      {tAbout('masterChefs')}
                    </h3>
                    <p className="text-sm text-muted-foreground">{tAbout('team')}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Testimonials ─────────────────────────────────────────── */}
          <section className="border-t border-border bg-muted/30 py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="text-center text-sm font-semibold uppercase tracking-wide text-primary">
                {tHome('testimonial')}
              </p>
              <h2 className="mt-2 text-center font-display text-3xl font-bold sm:text-4xl">
                {tHome('clientsSay')}
              </h2>
              <div
                ref={testimonialRef}
                className={cn(
                  'relative mt-12 overflow-hidden opacity-0',
                  testimonialInView && 'animate-fade-in-up',
                )}
              >
                <TestimonialCarousel />
              </div>
            </div>
          </section>
        </main>

        <SiteFooter />
        <BackToTop />
      </div>
    </>
  );
}
