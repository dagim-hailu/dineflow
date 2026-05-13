import Link from 'next/link';
import { Facebook, Linkedin, Twitter, Youtube } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function SiteFooter() {
  const t = useTranslations('Footer');
  const tNav = useTranslations('Navigation');

  return (
    <footer className="mt-auto border-t border-white/10 bg-dark-navy text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 font-display text-lg font-semibold text-primary">{t('company')}</h3>
            <ul className="flex flex-col gap-2 text-sm text-white/80">
              <li>
                <Link href="/about" className="hover:text-primary">
                  {t('aboutUs')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary">
                  {t('contactUs')}
                </Link>
              </li>
              <li>
                <Link href="/booking" className="hover:text-primary">
                  {t('reservation')}
                </Link>
              </li>
              <li>
                <span className="cursor-not-allowed opacity-60">{t('privacyPolicy')}</span>
              </li>
              <li>
                <span className="cursor-not-allowed opacity-60">{t('terms')}</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-display text-lg font-semibold text-primary">{t('contact')}</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li>{t('address')}</li>
              <li>
                <a href="tel:+251943303466" className="hover:text-primary">
                  +251 943 303 466
                </a>
              </li>
              <li>
                <a href="mailto:kmemsolution@gmail.com" className="hover:text-primary">
                  kmemsolution@gmail.com
                </a>
              </li>
            </ul>
            <div className="mt-4 flex gap-2">
              {[
                { Icon: Twitter, href: '#', label: 'Twitter' },
                { Icon: Facebook, href: '#', label: 'Facebook' },
                { Icon: Youtube, href: '#', label: 'YouTube' },
                { Icon: Linkedin, href: '#', label: 'LinkedIn' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/20 text-white transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-4 font-display text-lg font-semibold text-primary">{t('opening')}</h3>
            <p className="text-sm font-medium text-white">{t('mondaySaturday')}</p>
            <p className="mb-3 text-sm text-white/80">9:00 AM – 9:00 PM</p>
            <p className="text-sm font-medium text-white">{t('sunday')}</p>
            <p className="text-sm text-white/80">10:00 AM – 8:00 PM</p>
          </div>
          <div>
            <h3 className="mb-4 font-display text-lg font-semibold text-primary">
              {t('newsletter')}
            </h3>
            <p className="mb-3 text-sm text-white/80">{t('newsletterDesc')}</p>
            <form className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="email"
                placeholder={t('emailPlaceholder')}
                className="border-white/20 bg-white/5 text-white placeholder:text-white/50"
              />
              <Button type="button" className="shrink-0 shadow-md">
                {t('signUp')}
              </Button>
            </form>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center text-sm text-white/70 sm:flex-row sm:text-left sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {t('rights')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/" className="hover:text-primary">
              {tNav('home')}
            </Link>
            <span className="cursor-not-allowed opacity-60">{t('cookies')}</span>
            <span className="cursor-not-allowed opacity-60">{t('help')}</span>
            <span className="cursor-not-allowed opacity-60">{t('faqs')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
