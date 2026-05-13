'use client';

import { Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { MarketingShell } from '@/components/marketing-shell';
import { SitePageHeader } from '@/components/site-page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ContactPage() {
  const t = useTranslations('Contact');
  const tNav = useTranslations('Navigation');

  const emails = [
    { title: t('booking'), addr: 'book@example.com' },
    { title: t('general'), addr: 'info@example.com' },
    { title: t('technical'), addr: 'tech@example.com' },
  ];

  return (
    <MarketingShell>
      <SitePageHeader
        title={t('title')}
        breadcrumbs={[
          { name: tNav('home'), link: '/' },
          { name: tNav('pages'), link: '#' },
          { name: tNav('contact') },
        ]}
      />
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              {t('title')}
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{t('subtitle')}</h2>
          </div>
          <div className="mt-12 grid gap-10 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-3">
                {emails.map((e) => (
                  <div
                    key={e.title}
                    className="rounded-lg border border-border bg-card p-4 shadow-sm"
                  >
                    <p className="text-sm font-semibold text-primary">{e.title}</p>
                    <a
                      href={`mailto:${e.addr}`}
                      className="mt-2 flex items-center gap-2 text-sm text-foreground hover:underline"
                    >
                      <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                      {e.addr}
                    </a>
                  </div>
                ))}
              </div>
              <div className="aspect-video overflow-hidden rounded-xl border border-border shadow-md">
                <iframe
                  title="Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3001156.4288297426!2d-78.01371936852176!3d42.72876761954724!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4ccc4bf0f123a5a9%3A0xddcfc6c1de189567!2sNew%20York%2C%20USA!5e0!3m2!1sen!2sbd!4v1603794290143!5m2!1sen!2sbd"
                  className="h-full min-h-[280px] w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
            <form className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="c-name">{t('yourName')}</Label>
                  <Input id="c-name" placeholder={t('placeholderName')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-email">{t('placeholderEmail')}</Label>
                  <Input id="c-email" type="email" placeholder={t('placeholderEmail')} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-subject">{t('subject')}</Label>
                <Input id="c-subject" placeholder={t('placeholderSubject')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-message">{t('message')}</Label>
                <textarea
                  id="c-message"
                  rows={5}
                  placeholder={t('placeholderMessage')}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <Button type="button" className="h-12 w-full min-h-[44px]">
                {t('sendMessage')}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
