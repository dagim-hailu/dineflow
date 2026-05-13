'use client';

import React from 'react';
import { Coffee, Pizza, Beef, Martini } from 'lucide-react';
import { cn } from 'lib/utils';

interface MenuCategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const MenuCategoryTabs: React.FC<MenuCategoryTabsProps> = ({
  activeCategory,
  onCategoryChange,
}) => {
  const categories = [
    { id: 'Food', label: 'Food', icon: Pizza },
    { id: 'Drinks', label: 'Drinks', icon: Coffee },
    { id: 'Special', label: 'Special', icon: Beef },
    { id: 'Cocktails', label: 'Cocktails', icon: Martini },
  ];

  return (
    <div className="w-full overflow-x-auto hide-scrollbar bg-white sticky top-[64px] z-40 shadow-sm border-b border-gray-100">
      <div className="flex px-4 py-3 space-x-2 min-w-max">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={cn(
                'flex items-center px-4 py-2.5 rounded-full font-bold text-sm min-h-[44px] transition-all whitespace-nowrap',
                isActive
                  ? 'bg-[#F59E0B] text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              )}
            >
              <Icon className={cn('w-4 h-4 mr-2', isActive ? 'text-white' : 'text-[#F59E0B]')} />
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
