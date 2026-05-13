'use client';

import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { GET_ORDER } from '@/lib/graphql/orders';
import { useSocket } from '@/hooks/useSocket';
import {
  Clock,
  ChefHat,
  CheckCircle2,
  Utensils,
  Package,
  ArrowLeft,
  ShoppingBag,
  Timer,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const STATUS_STEPS = ['PENDING', 'COOKING', 'READY', 'SERVED'] as const;
type Status = (typeof STATUS_STEPS)[number] | 'PAID' | 'CANCELLED';

const STEP_META: Record<
  string,
  {
    icon: React.ElementType;
    label: string;
    color: string;
    bg: string;
    message: string;
    estimatedMin: number;
  }
> = {
  PENDING: {
    icon: Clock,
    label: 'Order Received',
    color: 'text-blue-600',
    bg: 'bg-blue-500',
    message: 'Your order has been received! Hang tight…',
    estimatedMin: 5,
  },
  COOKING: {
    icon: ChefHat,
    label: 'Being Prepared',
    color: 'text-amber-600',
    bg: 'bg-amber-500',
    message: 'Our kitchen is working on your meal 👨‍🍳',
    estimatedMin: 20,
  },
  READY: {
    icon: CheckCircle2,
    label: 'Ready!',
    color: 'text-green-600',
    bg: 'bg-green-500',
    message: '🎉 Your order is ready! A waiter will bring it to you.',
    estimatedMin: 0,
  },
  SERVED: {
    icon: Utensils,
    label: 'Served',
    color: 'text-purple-600',
    bg: 'bg-purple-500',
    message: '✅ Enjoy your meal! Bon appétit!',
    estimatedMin: 0,
  },
  PAID: {
    icon: Package,
    label: 'Completed',
    color: 'text-gray-600',
    bg: 'bg-gray-500',
    message: 'Thank you for dining with us!',
    estimatedMin: 0,
  },
  CANCELLED: {
    icon: Package,
    label: 'Cancelled',
    color: 'text-red-600',
    bg: 'bg-red-500',
    message: 'This order has been cancelled.',
    estimatedMin: 0,
  },
};

function useCountdown(targetSeconds: number) {
  const [remaining, setRemaining] = useState(targetSeconds);
  useEffect(() => {
    if (targetSeconds <= 0) {
      setRemaining(0);
      return;
    }
    setRemaining(targetSeconds);
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, [targetSeconds]);
  return remaining;
}

function formatCountdown(secs: number) {
  if (secs <= 0) return 'Any moment now…';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s.toString().padStart(2, '0')}s` : `${s}s`;
}

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;
  const [status, setStatus] = useState<Status>('PENDING');
  const [prepTimeSeconds, setPrepTimeSeconds] = useState(0);
  const prevStatusRef = useRef<string>('');
  const { on } = useSocket();
  const remaining = useCountdown(prepTimeSeconds);

  const { data, loading, error, refetch } = useQuery(GET_ORDER, {
    variables: { id: orderId },
    fetchPolicy: 'cache-and-network',
    skip: !orderId,
  });

  // Initialise status + countdown from query data
  useEffect(() => {
    if (!data?.order) return;
    const s: Status = data.order.status;
    setStatus(s);

    if (s === 'PENDING' || s === 'COOKING') {
      const totalPrepMin = (data.order.items ?? []).reduce((acc: number, it: any) => {
        return Math.max(acc, it.menuItem?.prepTime ?? 0);
      }, STEP_META[s]?.estimatedMin ?? 15);
      const createdAt = new Date(data.order.createdAt).getTime();
      const elapsedSec = Math.floor((Date.now() - createdAt) / 1000);
      const totalSec = totalPrepMin * 60;
      setPrepTimeSeconds(Math.max(0, totalSec - elapsedSec));
    } else {
      setPrepTimeSeconds(0);
    }
  }, [data]);

  // Real-time status updates via WebSocket
  useEffect(() => {
    const cleanup = on('order:status', (event: any) => {
      if (event.orderId === orderId) {
        const newStatus: Status = event.status;
        setStatus(newStatus);
        refetch();
        const meta = STEP_META[newStatus];
        if (meta) {
          toast.success(meta.message, { duration: 5000 });
          if (newStatus === 'READY') {
            setPrepTimeSeconds(0);
          }
        }
        prevStatusRef.current = newStatus;
      }
    });
    return cleanup;
  }, [orderId, on, refetch]);

  if (!orderId) return <div className="p-8 text-center text-red-500">Invalid order ID.</div>;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-amber-200 border-t-amber-500" />
          <p className="text-amber-700 font-semibold">Loading your order…</p>
        </div>
      </div>
    );
  }

  if (error || !data?.order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <Package className="h-16 w-16 text-gray-300" />
        <p className="text-xl font-bold text-gray-800">Order not found</p>
        <p className="text-sm text-gray-500">{error?.message}</p>
        <button
          onClick={() => router.push('/')}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Go Home
        </button>
      </div>
    );
  }

  const order = data.order;
  const currentStepIndex = STATUS_STEPS.indexOf(status as any);
  const meta = STEP_META[status] ?? STEP_META.PENDING;
  const StatusIcon = meta.icon;
  const isCancelled = status === 'CANCELLED';

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b border-white/50 bg-white/80 backdrop-blur-md px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <span className="text-xs font-mono text-gray-400">
            #{orderId.substring(0, 8).toUpperCase()}
          </span>
          <Link
            href="/orders"
            className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <ShoppingBag className="h-4 w-4" /> My Orders
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        {/* Big status card */}
        <div className={`overflow-hidden rounded-3xl bg-white shadow-xl`}>
          {/* Coloured band */}
          <div className={`${meta.bg} px-8 py-10 text-white text-center`}>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <StatusIcon className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-black">{meta.label}</h1>
            <p className="mt-2 text-sm opacity-90">{meta.message}</p>
          </div>

          {/* Countdown */}
          {prepTimeSeconds > 0 && (
            <div className="flex items-center justify-center gap-3 border-b border-dashed py-5 px-8">
              <Timer className="h-5 w-5 text-amber-500 animate-pulse" />
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Estimated time
                </p>
                <p className="font-mono text-3xl font-black text-gray-800">
                  {formatCountdown(remaining)}
                </p>
              </div>
            </div>
          )}

          {/* Progress stepper */}
          {!isCancelled && (
            <div className="px-8 py-6">
              <div className="relative flex items-center justify-between">
                {/* connecting line */}
                <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200" />
                <div
                  className="absolute left-0 top-5 h-0.5 bg-green-500 transition-all duration-700"
                  style={{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                />
                {STATUS_STEPS.map((step, idx) => {
                  const done = currentStepIndex > idx;
                  const active = currentStepIndex === idx;
                  const StepIcon = STEP_META[step].icon;
                  return (
                    <div key={step} className="relative flex flex-col items-center gap-2 z-10">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                          done
                            ? 'border-green-500 bg-green-500 text-white'
                            : active
                              ? `border-current ${meta.bg} text-white ${active ? 'scale-110 shadow-lg' : ''}`
                              : 'border-gray-300 bg-white text-gray-400'
                        }`}
                      >
                        <StepIcon className="h-4 w-4" />
                      </div>
                      <span
                        className={`text-xs font-semibold whitespace-nowrap ${active ? meta.color : done ? 'text-green-600' : 'text-gray-400'}`}
                      >
                        {STEP_META[step].label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className="rounded-2xl bg-white shadow-md overflow-hidden">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="font-bold text-gray-800">Order Summary</h2>
            <span className="text-sm text-gray-400">Table {order.table?.tableNumber ?? '—'}</span>
          </div>
          <ul className="divide-y divide-gray-50 px-6">
            {(order.items ?? []).map((item: any) => (
              <li key={item.id} className="flex items-center gap-4 py-4">
                {item.menuItem?.imageUrl && (
                  <img
                    src={item.menuItem.imageUrl}
                    alt={item.menuItem?.name}
                    className="h-12 w-12 rounded-xl object-cover shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {item.menuItem?.name ?? '—'}
                  </p>
                  {item.notes && <p className="text-xs text-gray-400 italic">{item.notes}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400">×{item.quantity}</p>
                  <p className="font-bold text-gray-800">
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          {order.specialInstructions && (
            <div className="mx-6 mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <span className="font-semibold">Special instructions: </span>
              {order.specialInstructions}
            </div>
          )}
          <div className="flex items-center justify-between border-t px-6 py-4">
            <span className="font-bold text-gray-800 text-lg">Total</span>
            <span className="font-black text-xl text-primary">
              ${Number(order.totalAmount).toFixed(2)}
            </span>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400">
          🔄 Real-time updates enabled · Order ID: {orderId}
        </p>
      </div>
    </div>
  );
}
