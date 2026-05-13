'use client';

import * as React from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { useCartStore } from 'store/cartStore';
import { Button } from 'components/ui/button';
import { cn } from 'lib/utils';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category?: string;
}

interface MenuItemCardProps {
  item: MenuItem;
  className?: string;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, className }) => {
  const addItem = useCartStore((state) => state.addItem);
  const [isAdding, setIsAdding] = React.useState(false);

  const handleOrder = () => {
    setIsAdding(true);
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
    });

    toast.success(`${item.name} added to cart`, {
      description: 'Your order is being prepared!',
      duration: 3000,
    });

    setTimeout(() => setIsAdding(false), 1000);
  };

  return (
    <div
      className={cn(
        'group flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all',
        className,
      )}
    >
      {item.imageUrl ? (
        <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover transition-transform group-hover:scale-110"
          />
        </div>
      ) : (
        <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
          No Image
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-bold text-[#1F2937] truncate">{item.name}</h3>
        <p className="text-sm text-[#6B7280] italic line-clamp-2 mt-1">{item.description}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-[#F59E0B]">${item.price.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex flex-col items-end space-y-2">
        <Button
          onClick={handleOrder}
          disabled={isAdding}
          className={cn(
            'bg-[#F59E0B] text-white px-6 py-2 rounded-md font-semibold hover:bg-yellow-500 transition-all min-h-[44px]',
            isAdding && 'bg-green-500 hover:bg-green-500',
          )}
        >
          {isAdding ? 'Added!' : 'Order'}
        </Button>
      </div>
    </div>
  );
};
