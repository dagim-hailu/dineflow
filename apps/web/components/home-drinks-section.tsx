'use client';

import { useQuery } from '@apollo/client';
import { GlassWater, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';

import { Button } from '@/components/ui/button';
import { useInViewAnimate } from '@/hooks/use-in-view-animate';
import { DEFAULT_DEMO_TABLE_ID, GET_MENU, GET_PAGINATED_MENU_ITEMS } from '@/lib/graphql/menu';
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';

function formatPrice(value: number | string): string {
  const n = typeof value === 'string' ? Number.parseFloat(value) : value;
  if (Number.isNaN(n)) return '—';
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(n);
}

const FALLBACK_IMAGES = [
  '/img/menu-1.jpg',
  '/img/menu-2.jpg',
  '/img/menu-3.jpg',
  '/img/menu-4.jpg',
  '/img/menu-5.jpg',
  '/img/menu-6.jpg',
];

type DrinkItem = {
  id: string;
  name: string;
  nameAm?: string | null;
  description?: string | null;
  descriptionAm?: string | null;
  price: number | string;
  imageUrl?: string | null;
};

type Category = {
  id: string;
  name: string;
  items: DrinkItem[];
};

export function HomeDrinksSection({ sectionId = 'drink-menu' }: { sectionId?: string }) {
  const t = useTranslations('Menu');
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);

  const {
    data: menuData,
    loading: menuLoading,
    error: menuError,
  } = useQuery(GET_MENU, {
    variables: { tableId: DEFAULT_DEMO_TABLE_ID },
  });

  const { addItem, setTableId } = useCartStore();
  const { ref: headingRef, inView: headingInView } = useInViewAnimate();
  const { ref: gridRef, inView: gridInView } = useInViewAnimate();

  const categories: Category[] = menuData?.menu?.categories ?? [];
  const drinksCategory = categories.find((c) => c.name.toLowerCase() === 'drinks');

  const { data: paginatedData, loading: paginatedLoading } = useQuery(GET_PAGINATED_MENU_ITEMS, {
    variables: {
      limit: 6,
      offset: page * 6,
      search: searchQuery || null,
      categoryId: drinksCategory?.id || null,
      restaurantId: menuData?.menu?.restaurantId,
    },
    skip: !drinksCategory?.id || !menuData?.menu?.restaurantId,
    fetchPolicy: 'cache-and-network',
  });

  return (
    <section id={sectionId} className="scroll-mt-24 bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading — fadeInUp on scroll */}
        <div
          ref={headingRef}
          className={cn('text-center opacity-0', headingInView && 'animate-fade-in-up')}
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            {t('beverages')}
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
            {t('drinksSelection')}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{t('drinksDescription')}</p>
        </div>

        {/* Search Bar */}
        <div className="mx-auto mt-8 max-w-md animate-fade-in-up">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('searchMenu') || 'Search drinks...'}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              className="w-full rounded-full border-2 border-border bg-card py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
            />
          </div>
        </div>

        {menuLoading ? (
          <div className="mt-16 flex flex-col items-center gap-4 text-center text-muted-foreground">
            <GlassWater className="h-10 w-10 animate-pulse text-primary/40" />
            <p>Loading drinks menu…</p>
          </div>
        ) : menuError ? (
          <div
            className="mx-auto mt-12 max-w-2xl rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6 text-center text-sm text-destructive"
            role="alert"
          >
            Could not load drinks. Ensure the API is running.
          </div>
        ) : !drinksCategory ? (
          <div className="mt-16 text-center text-muted-foreground">No drinks category found.</div>
        ) : paginatedLoading ? (
          <div className="mt-16 flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : paginatedData?.paginatedMenuItems?.items.length === 0 ? (
          <div className="mt-16 text-center text-muted-foreground">
            No drinks found matching your search.
          </div>
        ) : (
          <>
            <ul
              ref={gridRef}
              className={cn(
                'mt-12 grid gap-6 opacity-0 sm:grid-cols-2 lg:grid-cols-3',
                gridInView && 'animate-fade-in-up',
              )}
            >
              {paginatedData.paginatedMenuItems.items.map((item: any, index: number) => (
                <li
                  key={item.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-muted">
                    <img
                      src={item.imageUrl || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-display text-lg font-semibold text-foreground">
                        {locale === 'am' && item.nameAm ? item.nameAm : item.name}
                      </h3>
                      <span className="shrink-0 text-base font-bold text-primary">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                    {(item.description || item.descriptionAm) && (
                      <p className="mt-2 flex-1 text-sm italic text-muted-foreground line-clamp-2">
                        {locale === 'am' && item.descriptionAm
                          ? item.descriptionAm
                          : item.description}
                      </p>
                    )}
                    <Button
                      id={`order-drink-${item.id}`}
                      className="mt-5 min-h-[44px] w-full gap-2 shadow-sm transition-transform duration-200 active:scale-95"
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
                        toast.success(`${item.name} added to cart!`);
                      }}
                    >
                      <ShoppingCart className="h-4 w-4" aria-hidden />
                      {t('addToCart')}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Pagination Controls */}
            {paginatedData?.paginatedMenuItems?.totalCount > 6 && (
              <div className="mt-10 flex items-center justify-center gap-4 animate-fade-in-up">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:opacity-50 shadow-sm"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm font-semibold text-muted-foreground">
                  Page {page + 1} of {Math.ceil(paginatedData.paginatedMenuItems.totalCount / 6)}
                </span>
                <button
                  disabled={(page + 1) * 6 >= paginatedData.paginatedMenuItems.totalCount}
                  onClick={() => setPage((p) => p + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:opacity-50 shadow-sm"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
