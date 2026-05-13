'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/store/cartStore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ShoppingCart, X, Trash2, Plus, Minus, Loader2, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { DEFAULT_DEMO_TABLE_ID } from '@/lib/graphql/menu';

export function CartDrawer() {
  const router = useRouter();
  const t = useTranslations('Cart');
  const commonT = useTranslations('Common');
  const {
    items,
    removeItem,
    updateQuantity,
    getTotalPrice,
    getTotalItems,
    placeOrder,
    isLoading,
    tableId,
  } = useCartStore();
  const [isOpen, setIsOpen] = React.useState(false);
  const [specialInstructions, setSpecialInstructions] = React.useState('');

  const handleRemove = (id: string, name: string) => {
    removeItem(id);
    toast.info(`${name} removed from cart`);
  };

  const handlePlaceOrder = async () => {
    const tid = tableId || DEFAULT_DEMO_TABLE_ID;
    try {
      const order = await placeOrder(tid, specialInstructions);
      setIsOpen(false);
      setSpecialInstructions('');
      toast.success('Order placed! Tracking your meal…');
      router.push(`/track/${order.id}`);
    } catch (err: any) {
      const msg =
        err?.graphQLErrors?.[0]?.message ??
        err?.message ??
        'Failed to place order. Please try again.';
      toast.error(msg);
    }
  };

  const total = getTotalPrice();
  const count = getTotalItems();

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        id="cart-drawer-trigger"
        onClick={() => setIsOpen(true)}
        className="relative flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
      >
        <ShoppingCart className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-red-500 text-[10px] font-bold text-white">
            {count}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer */}
          <div className="relative flex h-full w-full max-w-md flex-col bg-background shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <ShoppingCart className="h-5 w-5 text-primary" />
                {t('title')}
                {count > 0 && (
                  <span className="ml-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-semibold text-primary">
                    {count}
                  </span>
                )}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="font-semibold text-foreground">{t('empty')}</p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-xl border bg-card p-3"
                  >
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-14 w-14 rounded-lg object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{item.name}</p>
                      <p className="text-xs text-primary font-bold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    {/* Qty controls */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-foreground transition hover:bg-muted/70"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-5 text-center text-sm font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-foreground transition hover:bg-muted/70"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    {/* Remove */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="ml-1 rounded-full p-1.5 text-muted-foreground transition hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Item?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Remove {item.name} from your order?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{commonT('cancel')}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemove(item.id, item.name)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            {commonT('delete')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t bg-card p-6 space-y-4">
                {/* Special instructions */}
                <div>
                  <label
                    htmlFor="cart-instructions"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                  >
                    {t('specialInstructions')}
                  </label>
                  <textarea
                    id="cart-instructions"
                    rows={2}
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="mt-1.5 w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                {/* Total */}
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>{t('total')}</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
                {/* Place order */}
                <button
                  id="place-order-btn"
                  onClick={handlePlaceOrder}
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> {t('placeOrder')}…
                    </>
                  ) : (
                    <>
                      <ClipboardList className="h-5 w-5" /> {t('placeOrder')}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
