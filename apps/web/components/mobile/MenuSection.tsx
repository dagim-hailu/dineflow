'use client';

import React, { useState } from 'react';
import { MenuCategoryTabs } from './MenuCategoryTabs';
import { MenuItemCard } from 'components/menu/MenuItemCard';

const sampleItems = [
  {
    id: '1',
    name: 'Classic Margherita Pizza',
    description: 'Fresh mozzarella, tomato sauce, and basil on our signature thin crust.',
    price: 14.99,
    category: 'Food',
    imageUrl:
      'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?q=80&w=400&h=400&auto=format&fit=crop',
  },
  {
    id: '2',
    name: 'Signature Cheeseburger',
    description: 'Angus beef patty, cheddar cheese, caramelized onions, and house sauce.',
    price: 12.49,
    category: 'Food',
    imageUrl:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400&h=400&auto=format&fit=crop',
  },
  {
    id: '3',
    name: 'Iced Caramel Macchiato',
    description: 'Rich espresso, milk, and sweet caramel over ice.',
    price: 5.99,
    category: 'Drinks',
    imageUrl:
      'https://images.unsplash.com/photo-1485808191679-5f6333fbc71f?q=80&w=400&h=400&auto=format&fit=crop',
  },
  {
    id: '4',
    name: 'BBQ Chicken Wings',
    description: 'Crispy wings tossed in our sweet and smoky BBQ sauce.',
    price: 10.99,
    category: 'Special',
    imageUrl:
      'https://images.unsplash.com/photo-1524114664604-cd8133cd67ad?q=80&w=400&h=400&auto=format&fit=crop',
  },
  {
    id: '5',
    name: 'Mojito',
    description: 'Classic Cuban highball with white rum, lime, and mint.',
    price: 8.99,
    category: 'Cocktails',
    imageUrl:
      'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?q=80&w=400&h=400&auto=format&fit=crop',
  },
];

export const MenuSection = () => {
  const [activeCategory, setActiveCategory] = useState('Food');

  const filteredItems = sampleItems.filter((item) => item.category === activeCategory);

  return (
    <div className="w-full">
      <MenuCategoryTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      <div className="px-4 md:px-0 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <MenuItemCard key={item.id} item={item} className="md:min-h-[140px]" />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500">
              No items available in this category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
