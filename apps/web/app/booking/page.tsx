'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { toast } from 'sonner';
import {
  CalendarDays,
  Clock,
  Users,
  Phone,
  Mail,
  User,
  MessageSquare,
  CheckCircle,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { MarketingShell } from '@/components/marketing-shell';
import { SitePageHeader } from '@/components/site-page-header';
import { CREATE_BOOKING, DEMO_RESTAURANT_ID } from '@/lib/graphql/booking';

const TIME_SLOTS = [
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
  '21:30',
];

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function BookingPage() {
  const t = useTranslations('Booking');
  const [form, setForm] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    date: getTodayStr(),
    time: '19:00',
    partySize: '2',
    specialRequest: '',
  });
  const [confirmed, setConfirmed] = useState<{
    id: string;
    date: string;
    time: string;
    partySize: number;
  } | null>(null);

  const [createBooking, { loading }] = useMutation(CREATE_BOOKING, {
    onCompleted: (data) => {
      setConfirmed({
        id: data.createBooking.id,
        date: data.createBooking.date,
        time: data.createBooking.time,
        partySize: data.createBooking.partySize,
      });
      toast.success(t('success') + ' 🎉');
    },
    onError: (e) => toast.error(e.message),
  });

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.guestName || !form.guestEmail || !form.date || !form.time || !form.partySize) {
      toast.error('Please fill in all required fields');
      return;
    }
    createBooking({
      variables: {
        input: {
          restaurantId: DEMO_RESTAURANT_ID,
          guestName: form.guestName,
          guestEmail: form.guestEmail,
          guestPhone: form.guestPhone || undefined,
          date: form.date,
          time: form.time,
          partySize: parseInt(form.partySize),
          specialRequest: form.specialRequest || undefined,
        },
      },
    });
  };

  return (
    <MarketingShell>
      <SitePageHeader
        title={t('bookTable')}
        breadcrumbs={[{ name: t('home'), link: '/' }, { name: t('booking') }]}
      />

      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {confirmed ? (
            /* ── Confirmation card ── */
            <div className="rounded-2xl bg-white border border-border p-10 text-center shadow-lg animate-fade-in-up">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="font-display text-3xl font-bold text-foreground">
                {t('bookedTitle')}
              </h2>
              <p className="mt-3 text-muted-foreground">{t('bookedDesc')}</p>
              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div className="rounded-xl bg-muted p-4">
                  <CalendarDays className="mx-auto mb-2 h-5 w-5 text-primary" />
                  <p className="text-xs text-muted-foreground">{t('date')}</p>
                  <p className="font-semibold text-sm">{confirmed.date}</p>
                </div>
                <div className="rounded-xl bg-muted p-4">
                  <Clock className="mx-auto mb-2 h-5 w-5 text-primary" />
                  <p className="text-xs text-muted-foreground">{t('time')}</p>
                  <p className="font-semibold text-sm">{confirmed.time}</p>
                </div>
                <div className="rounded-xl bg-muted p-4">
                  <Users className="mx-auto mb-2 h-5 w-5 text-primary" />
                  <p className="text-xs text-muted-foreground">{t('guests')}</p>
                  <p className="font-semibold text-sm">{confirmed.partySize}</p>
                </div>
              </div>
              <p className="mt-6 text-xs text-muted-foreground">
                {t('bookingId')} {confirmed.id}
              </p>
              <button
                onClick={() => {
                  setConfirmed(null);
                  setForm({
                    guestName: '',
                    guestEmail: '',
                    guestPhone: '',
                    date: getTodayStr(),
                    time: '19:00',
                    partySize: '2',
                    specialRequest: '',
                  });
                }}
                className="mt-6 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {t('makeAnother')}
              </button>
            </div>
          ) : (
            /* ── Booking form ── */
            <div className="overflow-hidden rounded-2xl bg-white border border-border shadow-lg">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-primary/80 px-8 py-8 text-white">
                <p className="text-sm font-semibold uppercase tracking-widest opacity-80">
                  {t('reservations')}
                </p>
                <h2 className="mt-1 font-display text-3xl font-bold">{t('title')}</h2>
                <p className="mt-2 opacity-75">{t('fillForm')}</p>
              </div>

              <form onSubmit={handleSubmit} className="grid gap-5 p-8 sm:grid-cols-2">
                {/* Name */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="bk-name"
                    className="flex items-center gap-1.5 text-sm font-semibold text-foreground"
                  >
                    <User className="h-3.5 w-3.5 text-primary" /> {t('nameLabel')}
                  </label>
                  <input
                    id="bk-name"
                    required
                    value={form.guestName}
                    onChange={set('guestName')}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                  />
                </div>
                {/* Email */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="bk-email"
                    className="flex items-center gap-1.5 text-sm font-semibold text-foreground"
                  >
                    <Mail className="h-3.5 w-3.5 text-primary" /> {t('emailLabel')}
                  </label>
                  <input
                    id="bk-email"
                    type="email"
                    required
                    value={form.guestEmail}
                    onChange={set('guestEmail')}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                  />
                </div>
                {/* Phone */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="bk-phone"
                    className="flex items-center gap-1.5 text-sm font-semibold text-foreground"
                  >
                    <Phone className="h-3.5 w-3.5 text-primary" /> {t('phoneLabel')}
                  </label>
                  <input
                    id="bk-phone"
                    type="tel"
                    value={form.guestPhone}
                    onChange={set('guestPhone')}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                  />
                </div>
                {/* Party size */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="bk-party"
                    className="flex items-center gap-1.5 text-sm font-semibold text-foreground"
                  >
                    <Users className="h-3.5 w-3.5 text-primary" /> {t('partySizeLabel')}
                  </label>
                  <select
                    id="bk-party"
                    required
                    value={form.partySize}
                    onChange={set('partySize')}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? t('person') : t('people')}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Date */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="bk-date"
                    className="flex items-center gap-1.5 text-sm font-semibold text-foreground"
                  >
                    <CalendarDays className="h-3.5 w-3.5 text-primary" /> {t('dateLabel')}
                  </label>
                  <input
                    id="bk-date"
                    type="date"
                    required
                    value={form.date}
                    min={getTodayStr()}
                    onChange={set('date')}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                  />
                </div>
                {/* Time */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="bk-time"
                    className="flex items-center gap-1.5 text-sm font-semibold text-foreground"
                  >
                    <Clock className="h-3.5 w-3.5 text-primary" /> {t('timeLabel')}
                  </label>
                  <select
                    id="bk-time"
                    required
                    value={form.time}
                    onChange={set('time')}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                  >
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Special requests */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label
                    htmlFor="bk-req"
                    className="flex items-center gap-1.5 text-sm font-semibold text-foreground"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-primary" /> {t('notesLabel')}
                  </label>
                  <textarea
                    id="bk-req"
                    rows={3}
                    value={form.specialRequest}
                    onChange={set('specialRequest')}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition resize-none"
                  />
                </div>
                {/* Submit */}
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
                  >
                    {loading ? t('confirming') : t('submit')}
                  </button>
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    {t('confirmText')}
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>
    </MarketingShell>
  );
}
