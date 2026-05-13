/**
 * Database seed — run after schema push.
 * Docker: `docker compose exec api node dist/scripts/seed.js`
 * Local:  `pnpm --filter api db:seed`
 */
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import * as schema from '../infrastructure/database/schema';

const {
  users,
  restaurants,
  tables,
  menuCategories,
  menuItems,
  orderItems,
  orders,
  cartItems,
  favorites,
} = schema;

export const DEMO_TABLE_ID = '00000000-0000-4000-8000-000000000001';
const RESTAURANT_ID = 'a0000000-0000-4000-8000-000000000001';
const TABLE_2_ID = '00000000-0000-4000-8000-000000000002';
const TABLE_3_ID = '00000000-0000-4000-8000-000000000003';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });
  console.log('Seeding DineFlow demo data…');

  const passwordHash = await bcrypt.hash('password', 12);

  // ── Users ────────────────────────────────────────────────────────────────
  const [existingDemoUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, 'test@example.com'))
    .limit(1);
  if (!existingDemoUser) {
    await db
      .insert(users)
      .values({ name: 'Test User', email: 'test@example.com', passwordHash, role: 'customer' });
    console.log('Created user test@example.com / password');
  } else {
    console.log('User test@example.com already exists — skipping user insert');
  }

  const staffUsers = [
    { name: 'Demo Manager', email: 'manager@example.com', role: 'manager' as const },
    { name: 'Demo Waiter', email: 'waiter@example.com', role: 'waiter' as const },
    { name: 'Demo Kitchen', email: 'kitchen@example.com', role: 'kitchen' as const },
  ];
  for (const s of staffUsers) {
    const [existing] = await db.select().from(users).where(eq(users.email, s.email)).limit(1);
    if (!existing) {
      await db.insert(users).values({ name: s.name, email: s.email, passwordHash, role: s.role });
      console.log(`Created staff user ${s.email} (role: ${s.role})`);
    } else {
      console.log(`Staff user ${s.email} already exists — skipping`);
    }
  }

  // ── Restaurant ───────────────────────────────────────────────────────────
  const [existingRestaurant] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.slug, 'dineflow-demo'))
    .limit(1);
  if (!existingRestaurant) {
    await db.insert(restaurants).values({
      id: RESTAURANT_ID,
      name: 'DineFlow Demo Restaurant',
      slug: 'dineflow-demo',
      description: 'Seeded venue for local development and Docker.',
      address: '123 Market Street',
      phone: '555-0100',
    });
    console.log('Created restaurant dineflow-demo');
  } else {
    console.log('Restaurant dineflow-demo already exists — skipping restaurant insert');
  }

  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.slug, 'dineflow-demo'))
    .limit(1);
  if (!restaurant) {
    console.error('Restaurant not found after insert');
    process.exit(1);
  }
  const rid = restaurant.id;

  // ── Tables ───────────────────────────────────────────────────────────────
  const [demoTableRow] = await db
    .select()
    .from(tables)
    .where(eq(tables.id, DEMO_TABLE_ID))
    .limit(1);
  if (!demoTableRow) {
    await db.insert(tables).values([
      {
        id: DEMO_TABLE_ID,
        restaurantId: rid,
        tableNumber: 1,
        qrUuid: '10000000-0000-4000-8000-000000000001',
        status: 'available',
      },
      {
        id: TABLE_2_ID,
        restaurantId: rid,
        tableNumber: 2,
        qrUuid: '10000000-0000-4000-8000-000000000002',
        status: 'available',
      },
      {
        id: TABLE_3_ID,
        restaurantId: rid,
        tableNumber: 3,
        qrUuid: '10000000-0000-4000-8000-000000000003',
        status: 'available',
      },
    ]);
    console.log('Created tables 1–3');
  } else {
    console.log('Demo table already present — skipping table insert');
  }

  // ── Menu: always force-reseed so images stay up to date ─────────────────
  // Must delete in FK-safe order: cart_items → favorites → order_items → orders → menu_items → categories
  await db.delete(cartItems).where(eq(cartItems.menuItemId, cartItems.menuItemId)); // all cart items
  await db.delete(favorites).where(eq(favorites.menuItemId, favorites.menuItemId)); // all favorites
  const existingItems = await db
    .select({ id: menuItems.id })
    .from(menuItems)
    .where(eq(menuItems.restaurantId, rid));
  if (existingItems.length > 0) {
    // Delete order_items referencing these menu items
    await db.delete(orderItems).where(eq(orderItems.menuItemId, orderItems.menuItemId));
    // Delete orders referencing this restaurant
    await db.delete(orders).where(eq(orders.restaurantId, rid));
    await db.delete(menuItems).where(eq(menuItems.restaurantId, rid));
    console.log('Cleared existing menu items for reseed');
  }
  const existingCatRows = await db
    .select()
    .from(menuCategories)
    .where(eq(menuCategories.restaurantId, rid));
  if (existingCatRows.length > 0) {
    await db.delete(menuCategories).where(eq(menuCategories.restaurantId, rid));
    console.log('Cleared existing menu categories for reseed');
  }

  const [breakfastCat] = await db
    .insert(menuCategories)
    .values({
      restaurantId: rid,
      name: 'Breakfast',
      nameAm: 'ቁርስ',
      displayOrder: 1,
      description: 'Morning favourites to start your day right',
      descriptionAm: 'ለቀኑ ጥሩ ጅምር የሚሆኑ የጠዋት ምርጫዎች',
    })
    .returning();

  const [lunchCat] = await db
    .insert(menuCategories)
    .values({
      restaurantId: rid,
      name: 'Lunch',
      nameAm: 'ምሳ',
      displayOrder: 2,
      description: 'Hearty midday meals and light bites',
      descriptionAm: 'አጥጋቢ የቀትር ምግቦች እና ቀለል ያሉ መክሰሶች',
    })
    .returning();

  const [dinnerCat] = await db
    .insert(menuCategories)
    .values({
      restaurantId: rid,
      name: 'Dinner',
      nameAm: 'እራት',
      displayOrder: 3,
      description: 'Elevated evening dishes crafted with care',
      descriptionAm: 'በጥንቃቄ የተዘጋጁ የምሽት ምግቦች',
    })
    .returning();

  const [drinksCat] = await db
    .insert(menuCategories)
    .values({
      restaurantId: rid,
      name: 'Drinks',
      nameAm: 'መጠጦች',
      displayOrder: 4,
      description: 'Refreshing beverages, cocktails, and more',
      descriptionAm: 'የሚያድሱ መጠጦች፣ ኮክቴሎች እና ሌሎችም',
    })
    .returning();

  if (!breakfastCat || !lunchCat || !dinnerCat || !drinksCat) {
    console.error('Failed to create menu categories');
    process.exit(1);
  }

  await db.insert(menuItems).values([
    // ── Breakfast (8 items) ─────────────────────────────────────────────
    {
      restaurantId: rid,
      categoryId: breakfastCat.id,
      name: 'Avocado Toast',
      description: 'Sourdough, smashed avocado, poached egg, chilli flakes & micro herbs',
      price: '12.00',
      prepTime: 15,
      isAvailable: true,
      imageUrl:
        'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=480&h=320&fit=crop&q=80',
    },
    {
      restaurantId: rid,
      categoryId: breakfastCat.id,
      name: 'Classic Eggs Benedict',
      description: 'Canadian bacon, silky hollandaise on a toasted English muffin',
      price: '14.50',
      prepTime: 20,
      isAvailable: true,
      imageUrl:
        'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=480&h=320&fit=crop&q=80',
    },
    {
      restaurantId: rid,
      categoryId: breakfastCat.id,
      name: 'Buttermilk Pancakes',
      description: 'Stack of three, maple syrup, wild berry compote & whipped butter',
      price: '11.00',
      prepTime: 15,
      isAvailable: true,
      imageUrl:
        'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=480&h=320&fit=crop&q=80',
    },
    {
      restaurantId: rid,
      categoryId: breakfastCat.id,
      name: 'Full English Breakfast',
      description: 'Bacon, sausage, fried egg, baked beans, toast & grilled tomato',
      price: '16.00',
      prepTime: 25,
      isAvailable: true,
      imageUrl:
        'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=480&h=320&fit=crop&q=80',
    },
    {
      restaurantId: rid,
      categoryId: breakfastCat.id,
      name: 'Granola & Yogurt Parfait',
      description: 'Greek yogurt, house-made granola, seasonal fruit & honey drizzle',
      price: '9.50',
      prepTime: 8,
      isAvailable: true,
      imageUrl:
        'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=480&h=320&fit=crop&q=80',
    },
    {
      restaurantId: rid,
      categoryId: breakfastCat.id,
      name: 'French Toast',
      description: 'Brioche, vanilla custard, cinnamon sugar, fresh strawberries & cream',
      price: '13.00',
      prepTime: 18,
      isAvailable: true,
      imageUrl:
        'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=480&h=320&fit=crop&q=80',
    },
    {
      restaurantId: rid,
      categoryId: breakfastCat.id,
      name: 'Smoked Salmon Bagel',
      description: 'Cream cheese, capers, red onion, dill on toasted sesame bagel',
      price: '15.50',
      prepTime: 12,
      isAvailable: true,
      imageUrl:
        'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=480&h=320&fit=crop&q=80',
    },
    {
      restaurantId: rid,
      categoryId: breakfastCat.id,
      name: 'Açaí Power Bowl',
      description: 'Açaí blend, banana, granola, coconut flakes, chia seeds & agave',
      price: '13.50',
      prepTime: 10,
      isAvailable: true,
      imageUrl:
        'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=480&h=320&fit=crop&q=80',
    },

    // ── Lunch (8 items) ─────────────────────────────────────────────────
    {
      restaurantId: rid,
      categoryId: lunchCat.id,
      name: 'Grilled Chicken Caesar',
      description: 'Romaine, parmesan shards, croutons, house Caesar dressing',
      price: '15.00',
      prepTime: 15,
      isAvailable: true,
      imageUrl:
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=480&h=320&fit=crop&q=80',
    },
    {
      restaurantId: rid,
      categoryId: lunchCat.id,
      name: 'Smash Burger',
      description: 'Double smash patty, American cheese, pickles, secret sauce, brioche bun',
      price: '16.50',
      prepTime: 20,
      isAvailable: true,
      imageUrl:
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=480&h=320&fit=crop&q=80',
    },
    {
      restaurantId: rid,
      categoryId: lunchCat.id,
      name: 'Margherita Flatbread',
      description: 'San Marzano tomato, buffalo mozzarella, fresh basil, extra virgin olive oil',
      price: '13.00',
      prepTime: 18,
      isAvailable: true,
      imageUrl:
        'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=480&h=320&fit=crop&q=80',
    },
    {
      restaurantId: rid,
      categoryId: lunchCat.id,
      name: 'Falafel Wrap',
      description: 'Crispy falafel, hummus, pickled cabbage, tahini & fresh veggies',
      price: '12.50',
      prepTime: 15,
      isAvailable: true,
      imageUrl:
        'https://images.unsplash.com/photo-1555126634-323283e090fa?w=480&h=320&fit=crop&q=80',
    },
    {
      restaurantId: rid,
      categoryId: lunchCat.id,
      name: 'Spicy Tuna Tartare',
      description: 'Sushi-grade tuna, sriracha mayo, cucumber, sesame, wonton chips',
      price: '18.00',
      prepTime: 15,
      isAvailable: true,
      imageUrl:
        'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=480&h=320&fit=crop&q=80',
    },
    {
      restaurantId: rid,
      categoryId: lunchCat.id,
      name: 'Caprese Salad',
      description: 'Heritage tomatoes, burrata, basil oil, aged balsamic, flaky sea salt',
      price: '14.00',
      prepTime: 10,
      isAvailable: true,
      imageUrl:
        'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=480&h=320&fit=crop&q=80',
    },
    {
      restaurantId: rid,
      categoryId: lunchCat.id,
      name: 'Street Beef Tacos',
      description: 'Slow-braised beef, pico de gallo, guacamole, coriander & lime (×3)',
      price: '14.50',
      prepTime: 20,
      isAvailable: true,
      imageUrl:
        'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=480&h=320&fit=crop&q=80',
    },
    {
      restaurantId: rid,
      categoryId: lunchCat.id,
      name: 'Tom Yum Noodle Soup',
      description: 'Tiger prawn, lemongrass, galangal, kaffir lime, rice noodles, Thai chilli',
      price: '13.50',
      prepTime: 20,
      isAvailable: true,
      imageUrl:
        'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=480&h=320&fit=crop&q=80',
    },

    // ── Dinner (8 items) ────────────────────────────────────────────────
    {
      restaurantId: rid,
      categoryId: dinnerCat.id,
      name: 'Pan-Seared Salmon',
      description: 'Lemon beurre blanc, charred asparagus, crushed herb potatoes',
      price: '28.00',
      prepTime: 25,
      isAvailable: true,
      imageUrl:
        'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=480&h=320&fit=crop&q=80',
    },
    {
      restaurantId: rid,
      categoryId: dinnerCat.id,
      name: '8oz Ribeye Steak',
      description: 'Grass-fed beef, house chimichurri, truffle fries, seasonal greens',
      price: '38.00',
      prepTime: 30,
      isAvailable: true,
      imageUrl:
        'https://images.unsplash.com/photo-1544025162-d76694265947?w=480&h=320&fit=crop&q=80',
    },
    {
      restaurantId: rid,
      categoryId: dinnerCat.id,
      name: 'Truffle Mushroom Risotto',
      description: 'Arborio rice, wild mushrooms, white truffle oil, aged parmesan',
      price: '24.00',
      prepTime: 22,
      isAvailable: true,
      imageUrl:
        'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=480&h=320&fit=crop&q=80',
    },
    {
      restaurantId: rid,
      categoryId: dinnerCat.id,
      name: 'Rack of Lamb',
      description: 'French-trimmed, rosemary jus, dauphinoise potatoes, minted peas',
      price: '42.00',
      prepTime: 35,
      isAvailable: true,
      imageUrl:
        'https://images.unsplash.com/photo-1558030006-450675393462?w=480&h=320&fit=crop&q=80',
    },
    {
      restaurantId: rid,
      categoryId: dinnerCat.id,
      name: 'Pasta Carbonara',
      description: 'Fresh tagliatelle, guanciale, pecorino romano, egg yolk, cracked pepper',
      price: '19.00',
      prepTime: 20,
      isAvailable: true,
      imageUrl:
        'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=480&h=320&fit=crop&q=80',
    },
    {
      restaurantId: rid,
      categoryId: dinnerCat.id,
      name: 'Grilled Sea Bass',
      description: 'Whole sea bass, salsa verde, fennel slaw, lemon butter sauce',
      price: '32.00',
      prepTime: 28,
      isAvailable: true,
      imageUrl:
        'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=480&h=320&fit=crop&q=80',
    },
    {
      restaurantId: rid,
      categoryId: dinnerCat.id,
      name: 'Duck Leg Confit',
      description: 'Slow-cooked duck, cherry gastrique, celeriac purée, crispy kale',
      price: '34.00',
      prepTime: 30,
      isAvailable: true,
      imageUrl:
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=480&h=320&fit=crop&q=80',
    },
    {
      restaurantId: rid,
      categoryId: dinnerCat.id,
      name: 'Spicy Tiger Prawns',
      description: 'Garlic chilli butter, crusty sourdough, pickled cucumber, lemon',
      price: '26.00',
      prepTime: 20,
      isAvailable: true,
      imageUrl:
        'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=480&h=320&fit=crop&q=80',
    },

    // ── Drinks (8 items) ────────────────────────────────────────────────
    {
      restaurantId: rid,
      categoryId: drinksCat.id,
      name: 'Fresh Orange Juice',
      description: 'Cold-pressed navel oranges, no added sugar, served chilled',
      price: '5.00',
      prepTime: 5,
      isAvailable: true,
      imageUrl:
        'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=480&h=320&fit=crop&q=80',
    },
    {
      restaurantId: rid,
      categoryId: drinksCat.id,
      name: 'Specialty Iced Coffee',
      description: 'Double espresso, oat milk, vanilla syrup, served over crystal ice',
      price: '6.50',
      prepTime: 7,
      isAvailable: true,
      imageUrl:
        'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=480&h=320&fit=crop&q=80',
    },
    {
      restaurantId: rid,
      categoryId: drinksCat.id,
      name: 'Watermelon Lemonade',
      description: 'Fresh watermelon, house lemonade, muddled mint, pink salt rim',
      price: '6.00',
      prepTime: 8,
      isAvailable: true,
      imageUrl:
        'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=480&h=320&fit=crop&q=80',
    },
    {
      restaurantId: rid,
      categoryId: drinksCat.id,
      name: 'Classic Mojito',
      description: 'White rum, fresh lime, cane sugar, soda water, fresh mint',
      price: '10.00',
      prepTime: 10,
      isAvailable: true,
      imageUrl:
        'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=480&h=320&fit=crop&q=80',
    },
    {
      restaurantId: rid,
      categoryId: drinksCat.id,
      name: 'Mango Smoothie',
      description: 'Alphonso mango, coconut water, lime juice, turmeric & chia seeds',
      price: '7.00',
      prepTime: 8,
      isAvailable: true,
      imageUrl:
        'https://images.unsplash.com/photo-1546548970-71785318a17b?w=480&h=320&fit=crop&q=80',
    },
    {
      restaurantId: rid,
      categoryId: drinksCat.id,
      name: 'Flat White',
      description: 'Ristretto double shot, velvety steamed whole milk, latte art',
      price: '5.50',
      prepTime: 6,
      isAvailable: true,
      imageUrl:
        'https://images.unsplash.com/photo-1534687941688-651ccaafbff8?w=480&h=320&fit=crop&q=80',
    },
    {
      restaurantId: rid,
      categoryId: drinksCat.id,
      name: 'Matcha Latte',
      description: 'Ceremonial grade matcha, oat milk, honey — served hot or iced',
      price: '6.50',
      prepTime: 7,
      isAvailable: true,
      imageUrl:
        'https://images.unsplash.com/photo-1545038900-5d74e33f7a4e?w=480&h=320&fit=crop&q=80',
    },
    {
      restaurantId: rid,
      categoryId: drinksCat.id,
      name: 'Passion Fruit Spritz',
      description: 'Prosecco, passion fruit purée, elderflower, sparkling water',
      price: '11.00',
      prepTime: 10,
      isAvailable: true,
      imageUrl:
        'https://images.unsplash.com/photo-1560762484-813fc97650a0?w=480&h=320&fit=crop&q=80',
    },
  ]);

  console.log('Seeded 4 categories × 8 items = 32 menu items with Unsplash images');

  await pool.end();

  console.log('');
  console.log('--- Demo identifiers ---');
  console.log(`NEXT_PUBLIC_DEMO_TABLE_ID=${DEMO_TABLE_ID}`);
  console.log(`Table 2 UUID: ${TABLE_2_ID}`);
  console.log(`Table 3 UUID: ${TABLE_3_ID}`);
  console.log('Login: test@example.com / password');
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
