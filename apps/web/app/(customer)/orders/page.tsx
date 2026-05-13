'use client';

import { useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { GET_MY_ORDERS } from '@/lib/graphql/orders';
import {
  ShoppingBag,
  Clock,
  ChefHat,
  CheckCircle2,
  Utensils,
  Package,
  ArrowLeft,
  Eye,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; pill: string }> = {
  PENDING: {
    label: 'orderReceived',
    icon: Clock,
    pill: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  COOKING: {
    label: 'beingPrepared',
    icon: ChefHat,
    pill: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  READY: {
    label: 'ready',
    icon: CheckCircle2,
    pill: 'bg-green-100 text-green-700 border-green-200',
  },
  SERVED: {
    label: 'served',
    icon: Utensils,
    pill: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  PAID: { label: 'completed', icon: Package, pill: 'bg-gray-100 text-gray-600 border-gray-200' },
  CANCELLED: { label: 'cancelled', icon: Package, pill: 'bg-red-100 text-red-600 border-red-200' },
};

const ACTIVE_STATUSES = new Set(['PENDING', 'COOKING', 'READY']);

export default function OrdersHistoryPage() {
  const t = useTranslations('Orders');
  const tNav = useTranslations('Navigation');
  const router = useRouter();
  const { data, loading, error, refetch } = useQuery(GET_MY_ORDERS, {
    fetchPolicy: 'cache-and-network',
  });
  const orders = data?.myOrders ?? [];
  const active = orders.filter((o: any) => ACTIVE_STATUSES.has(o.status));
  const past = orders.filter((o: any) => !ACTIVE_STATUSES.has(o.status));

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return t('justNow');
    if (m < 60) return `${m}${t('m_ago')}`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}${t('h_ago')}`;
    return new Date(iso).toLocaleDateString();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b border-white/50 bg-white/80 backdrop-blur-md px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" /> {tNav('home')}
          </Link>
          <h1 className="font-bold text-gray-900">{t('title')}</h1>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <RefreshCw className="h-3.5 w-3.5" /> {t('refresh')}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 space-y-8">
        {loading && (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-amber-500" />
          </div>
        )}

        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-center text-red-600">
            <p className="font-semibold">{t('failedLoad')}</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-md">
              <ShoppingBag className="h-10 w-10 text-gray-300" />
            </div>
            <p className="text-xl font-bold text-gray-800">{t('noOrders')}</p>
            <p className="text-sm text-gray-500">{t('noOrdersDesc')}</p>
            <button
              onClick={() => router.push('/')}
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {t('browseMenu')}
            </button>
          </div>
        )}

        {/* Active orders */}
        {active.length > 0 && (
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-amber-600">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-500" />
              {t('activeOrders')}
            </h2>
            <div className="space-y-3">
              {active.map((order: any) => (
                <OrderCard key={order.id} order={order} timeAgo={timeAgo} tOrders={t} />
              ))}
            </div>
          </section>
        )}

        {/* Past orders */}
        {past.length > 0 && (
          <section>
            <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-400">
              {t('orderHistory')}
            </h2>
            <div className="space-y-3">
              {past.map((order: any) => (
                <OrderCard key={order.id} order={order} timeAgo={timeAgo} tOrders={t} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  timeAgo,
  tOrders,
}: {
  order: any;
  timeAgo: (iso: string) => string;
  tOrders: any;
}) {
  const config = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
  const Icon = config.icon;
  const isActive = ACTIVE_STATUSES.has(order.status);

  return (
    <div
      className={`overflow-hidden rounded-2xl bg-white shadow-md transition-all hover:shadow-lg ${isActive ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}
    >
      <div className="flex items-center justify-between border-b px-5 py-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${config.pill}`}
          >
            <Icon className="h-3.5 w-3.5" />
            {tOrders(config.label)}
            {isActive && (
              <span className="ml-1 h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
            )}
          </span>
        </div>
        <span className="text-xs text-gray-400">{timeAgo(order.createdAt)}</span>
      </div>
      <div className="px-5 py-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-gray-400 font-mono">
              #{order.id.substring(0, 8).toUpperCase()}
            </p>
            <p className="text-sm text-gray-500">Table {order.table?.tableNumber ?? '—'}</p>
          </div>
          <p className="text-xl font-black text-gray-900">
            ${Number(order.totalAmount).toFixed(2)}
          </p>
        </div>
        {/* Item thumbnails */}
        <div className="flex gap-2 flex-wrap mb-4">
          {(order.items ?? []).slice(0, 4).map((item: any) => (
            <div
              key={item.id}
              className="flex items-center gap-1.5 rounded-full bg-gray-50 border px-2.5 py-1 text-xs font-medium text-gray-700"
            >
              {item.menuItem?.imageUrl && (
                <img
                  src={item.menuItem.imageUrl}
                  alt=""
                  className="h-4 w-4 rounded-full object-cover"
                />
              )}
              {item.menuItem?.name ?? '—'}
              {item.quantity > 1 && <span className="text-gray-400">×{item.quantity}</span>}
            </div>
          ))}
          {(order.items ?? []).length > 4 && (
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500">
              +{order.items.length - 4} more
            </span>
          )}
        </div>
        <Link
          href={`/track/${order.id}`}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-primary py-2.5 text-sm font-bold text-primary transition hover:bg-primary hover:text-primary-foreground"
        >
          <Eye className="h-4 w-4" /> {tOrders('trackOrder')}
        </Link>
      </div>
    </div>
  );
}
