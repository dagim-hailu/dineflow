'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, ChefHat, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { GET_KITCHEN_ORDERS } from '@/lib/graphql/orders';
import { useSocket, OrderNewEvent, OrderStatusEvent } from '@/hooks/useSocket';
import { gql } from '@apollo/client';
import { useTranslations } from 'next-intl';
import { StaffHeader } from '@/components/staff-header';
import { cn } from '@/lib/utils';

const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($id: ID!, $status: OrderStatus!) {
    updateOrderStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

type OrderStatus = 'PENDING' | 'COOKING' | 'READY' | 'SERVED' | 'PAID' | 'CANCELLED';

interface KitchenOrder {
  id: string;
  status: OrderStatus;
  createdAt: string;
  totalAmount: number;
  table: { id: string; tableNumber: number };
  items: Array<{ id: string; quantity: number; menuItem: { id: string; name: string } }>;
}

const BADGE_STYLES: Record<OrderStatus, string> = {
  PENDING: 'bg-red-100 text-red-800',
  COOKING: 'bg-blue-100 text-blue-800',
  READY: 'bg-green-100 text-green-800',
  SERVED: 'bg-purple-100 text-purple-800',
  PAID: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-gray-100 text-gray-400',
};

export default function KitchenDashboardPage() {
  const t = useTranslations('Staff');
  const { data, loading, error, refetch } = useQuery(GET_KITCHEN_ORDERS, {
    fetchPolicy: 'cache-and-network',
    pollInterval: 30000, // refresh every 30s as fallback
  });
  const [updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS);
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const { on } = useSocket();

  // Sync query data into local state
  useEffect(() => {
    if (data?.kitchenOrders) {
      setOrders(
        [...data.kitchenOrders].sort(
          (a: KitchenOrder, b: KitchenOrder) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ),
      );
    }
  }, [data]);

  // Real-time: new order arrives
  useEffect(() => {
    const cleanup = on('order:new', (event: OrderNewEvent) => {
      toast.success(t('newOrderFromTable'), {
        description: event.items.map((i) => `${i.quantity}× ${i.name}`).join(', '),
      });
      // Refetch to get full order details
      refetch();
    });
    return cleanup;
  }, [on, refetch, t]);

  // Real-time: order status change from elsewhere
  useEffect(() => {
    const cleanup = on('order:status', (_event: OrderStatusEvent) => {
      refetch();
    });
    return cleanup;
  }, [on, refetch]);

  const handleUpdateStatus = async (id: string, currentStatus: OrderStatus) => {
    const nextStatus: Record<string, OrderStatus> = {
      PENDING: 'COOKING',
      COOKING: 'READY',
    };
    const newStatus = nextStatus[currentStatus];
    if (!newStatus) return;

    // Optimistic update
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));

    try {
      await updateOrderStatus({ variables: { id, status: newStatus } });
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error('Failed to update: ' + err.message);
      refetch(); // revert
    }
  };

  const pending = orders.filter((o) => o.status === 'PENDING');
  const cooking = orders.filter((o) => o.status === 'COOKING');
  const ready = orders.filter((o) => o.status === 'READY');

  const renderOrderCard = (order: KitchenOrder) => (
    <Card
      key={order.id}
      className={`shadow-md ${order.status === 'READY' ? 'border-2 border-green-400' : ''}`}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">
          {t('table')} {order.table?.tableNumber}
        </CardTitle>
        <span
          className={`text-xs px-2 py-1 rounded-full font-semibold ${BADGE_STYLES[order.status]}`}
        >
          {t(order.status.toLowerCase() as any)}
        </span>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-5 mb-3 text-gray-700 text-sm space-y-1">
          {order.items.map((item) => (
            <li key={item.id}>
              {item.quantity}× {item.menuItem.name}
            </li>
          ))}
        </ul>
        <p className="text-xs text-gray-400 mb-3">
          {new Date(order.createdAt).toLocaleTimeString()}
        </p>
        {order.status === 'PENDING' && (
          <Button
            onClick={() => handleUpdateStatus(order.id, order.status)}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white"
          >
            {t('startCooking')}
          </Button>
        )}
        {order.status === 'COOKING' && (
          <Button
            onClick={() => handleUpdateStatus(order.id, order.status)}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {t('markAsReady')}
          </Button>
        )}
        {order.status === 'READY' && (
          <Button disabled className="w-full bg-gray-300 text-gray-500 cursor-not-allowed">
            {t('awaitingPickup')}
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <StaffHeader title={t('kitchenDisplay')} icon={<ChefHat className="h-5 w-5 text-amber-500" />} />
      
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">

        {loading && orders.length === 0 && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <ChefHat className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-xl">{t('noActiveOrders')}</p>
          </div>
        )}

        {orders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center text-red-600">
                <Clock className="h-5 w-5 mr-2" /> {t('pending')} ({pending.length})
              </h2>
              <div className="space-y-4">
                {pending.length === 0 ? (
                  <p className="text-gray-400 text-sm">{t('pending')} (0)</p>
                ) : (
                  pending.map(renderOrderCard)
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center text-blue-600">
                <ChefHat className="h-5 w-5 mr-2" /> {t('cooking')} ({cooking.length})
              </h2>
              <div className="space-y-4">
                {cooking.length === 0 ? (
                  <p className="text-gray-400 text-sm">{t('cooking')} (0)</p>
                ) : (
                  cooking.map(renderOrderCard)
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center text-green-600">
                <CheckCircle2 className="h-5 w-5 mr-2" /> {t('ready')} ({ready.length})
              </h2>
              <div className="space-y-4">
                {ready.length === 0 ? (
                  <p className="text-gray-400 text-sm">{t('ready')} (0)</p>
                ) : (
                  ready.map(renderOrderCard)
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
