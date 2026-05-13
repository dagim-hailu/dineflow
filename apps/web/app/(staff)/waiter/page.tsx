'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, BellRing, Utensils, Check, Loader2, Circle } from 'lucide-react';
import { GET_TABLES } from '@/lib/graphql/tables';
import { useSocket, OrderNewEvent, OrderStatusEvent } from '@/hooks/useSocket';

interface TableRow {
  id: string;
  tableNumber: number;
  status: string;
  currentWaiterId?: string | null;
}

interface OrderNotification {
  orderId: string;
  tableId: string | null;
  items: Array<{ name: string; quantity: number }>;
  totalAmount: number;
  createdAt: Date;
}

const TABLE_STATUS_COLOR: Record<string, string> = {
  available: 'bg-green-100 border-green-300 text-green-800',
  occupied: 'bg-red-100 border-red-300 text-red-800',
  needs_cleaning: 'bg-yellow-100 border-yellow-300 text-yellow-800',
};

export default function WaiterDashboardPage() {
  const t = useTranslations('Staff');
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const { on } = useSocket();

  const { data, loading, error, refetch } = useQuery(GET_TABLES, {
    fetchPolicy: 'cache-and-network',
  });

  // Real-time: new orders
  useEffect(() => {
    const cleanup = on('order:new', (event: OrderNewEvent) => {
      setNotifications((prev) => [
        {
          orderId: event.orderId,
          tableId: event.tableId,
          items: event.items,
          totalAmount: event.totalAmount,
          createdAt: event.createdAt,
        },
        ...prev,
      ]);
      const itemSummary = event.items.map((i) => `${i.quantity}× ${i.name}`).join(', ');
      toast.info(t('newOrder'), {
        description: `${itemSummary} — $${Number(event.totalAmount).toFixed(2)}`,
        icon: <BellRing className="h-4 w-4" />,
      });
    });
    return cleanup;
  }, [on, t]);

  // Real-time: order ready
  useEffect(() => {
    const cleanup = on('order:status', (event: OrderStatusEvent) => {
      if (event.status === 'READY') {
        toast.success(`${t('order')} #${event.orderId.substring(0, 8)} ${t('orderIsReady')}`, {
          icon: <Check className="h-4 w-4" />,
        });
      }
    });
    return cleanup;
  }, [on, t]);

  const tables: TableRow[] = data?.tables ?? [];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <Card className="w-full max-w-5xl shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-3xl font-bold flex items-center gap-2">
            <Utensils className="h-7 w-7 text-amber-500" /> {t('waiterDashboard')}
          </CardTitle>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="ml-2">{t('refresh')}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-8">
          {/* Table Grid */}
          <section>
            <h2 className="text-xl font-semibold mb-4">{t('tableStatus')}</h2>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            ) : error ? (
              <p className="text-red-500 text-center">Error: {error.message}</p>
            ) : tables.length === 0 ? (
              <p className="text-gray-500 text-center py-8">{t('noTablesFound')}</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {tables.map((table) => (
                  <div
                    key={table.id}
                    className={`rounded-xl border-2 p-4 text-center flex flex-col items-center justify-center aspect-square transition-all hover:shadow-md ${
                      TABLE_STATUS_COLOR[table.status] ??
                      'bg-gray-100 border-gray-200 text-gray-700'
                    }`}
                  >
                    <span className="text-5xl font-black mb-1">{table.tableNumber}</span>
                    <span className="text-xs font-semibold capitalize">
                      {table.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Notifications */}
          <section>
            <h2 className="text-xl font-semibold mb-4">
              {t('incomingOrders')}
              {notifications.length > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs">
                  {notifications.length}
                </span>
              )}
            </h2>
            {notifications.length === 0 ? (
              <p className="text-gray-500">{t('noNewOrderNotifications')}</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <Card key={notif.orderId} className="p-3 shadow-sm border-l-4 border-amber-400">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {t('order')} #{notif.orderId.substring(0, 8)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {notif.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                        </p>
                        <p className="text-sm font-bold text-amber-600">
                          ${Number(notif.totalAmount).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(notif.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setNotifications((prev) =>
                            prev.filter((n) => n.orderId !== notif.orderId),
                          )
                        }
                      >
                        {t('dismiss')}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
