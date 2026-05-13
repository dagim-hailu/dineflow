'use client';

import { useQuery } from '@apollo/client';
import { GlassWater, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { MarketingShell } from '@/components/marketing-shell';
import { SitePageHeader } from '@/components/site-page-header';
import { Button } from '@/components/ui/button';
import { DEFAULT_DEMO_TABLE_ID, GET_MENU } from '@/lib/graphql/menu';
import { useCartStore } from '@/store/cartStore';

function formatPrice(value: number | string): string {
  const n = typeof value === 'string' ? Number.parseFloat(value) : value;
  if (Number.isNaN(n)) return '—';
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n);
}

const DRINK_IMAGES = [
  '/img/menu-1.jpg',
  '/img/menu-2.jpg',
  '/img/menu-3.jpg',
  '/img/menu-4.jpg',
  '/img/menu-5.jpg',
  '/img/menu-6.jpg',
  '/img/menu-7.jpg',
  '/img/menu-8.jpg',
];

type MenuItem = {
  id: string;
  name: string;
  description?: string | null;
  price: number | string;
  imageUrl?: string | null;
  dietaryTags?: string[];
};

type Category = {
  id: string;
  name: string;
  items: MenuItem[];
};

export default function DrinksPage() {
  const t = useTranslations('Menu');
  const tNav = useTranslations('Navigation');
  const { data, loading, error } = useQuery(GET_MENU, {
    variables: { tableId: DEFAULT_DEMO_TABLE_ID },
  });

  const { addItem, setTableId } = useCartStore();

  const categories: Category[] = data?.menu?.categories ?? [];
  const drinksCategory = categories.find((c) => c.name.toLowerCase() === 'drinks');
  const drinks: MenuItem[] = drinksCategory?.items ?? [];

  return (
    <MarketingShell>
      <SitePageHeader
        title={t('drinksMenuTitle')}
        breadcrumbs={[{ name: tNav('home'), link: '/' }, { name: tNav('drinks') }]}
      />

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              {t('beverages')}
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
              {t('drinksSelection')}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{t('drinksDescription')}</p>
          </div>

          {loading ? (
            <div className="mt-16 flex flex-col items-center gap-4 text-center text-muted-foreground">
              <GlassWater className="h-10 w-10 animate-pulse text-primary/40" />
              <p>{t('loading')}</p>
            </div>
          ) : error ? (
            <div
              className="mx-auto mt-12 max-w-2xl rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6 text-center text-sm text-destructive"
              role="alert"
            >
              {t('error')}
            </div>
          ) : drinks.length === 0 ? (
            <div className="mt-16 text-center text-muted-foreground">{t('empty')}</div>
          ) : (
            <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {drinks.map((item, index) => (
                <li
                  key={item.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-muted">
                    <img
                      src={item.imageUrl || DRINK_IMAGES[index % DRINK_IMAGES.length]}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Dietary badges */}
                    {item.dietaryTags && item.dietaryTags.length > 0 && (
                      <div className="absolute left-3 top-3 flex flex-wrap gap-1">
                        {item.dietaryTags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground backdrop-blur-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-display text-lg font-semibold text-foreground">
                        {item.name}
                      </h3>
                      <span className="shrink-0 text-base font-bold text-primary">
                        {formatPrice(item.price)}
                      </span>
                    </div>

                    {item.description && (
                      <p className="mt-2 flex-1 text-sm italic text-muted-foreground">
                        {item.description}
                      </p>
                    )}

                    <Button
                      id={`order-drink-${item.id}`}
                      className="mt-5 min-h-[44px] w-full gap-2 shadow-sm"
                      size="lg"
                      onClick={() => {
                        setTableId(DEFAULT_DEMO_TABLE_ID);
                        addItem({
                          id: item.id,
                          name: item.name,
                          price:
                            typeof item.price === 'string' ? parseFloat(item.price) : item.price,
                          imageUrl: item.imageUrl ?? undefined,
                        });
                        toast.success(`${item.name} ${t('addedToCart')}`);
                      }}
                    >
                      <ShoppingCart className="h-4 w-4" aria-hidden />
                      {t('addToCart')}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </MarketingShell>
  );
}
