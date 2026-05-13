import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  integer,
  decimal,
  boolean,
  index,
  primaryKey,
  foreignKey,
} from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', [
  'customer',
  'waiter',
  'kitchen',
  'manager',
  'admin',
]);

// Users Table (Staff + Registered Customers)
export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    email: varchar('email', { length: 256 }).unique().notNull(),
    passwordHash: varchar('password_hash', { length: 256 }).notNull(),
    profileImageUrl: text('profile_image_url'),
    role: userRoleEnum('role').default('customer').notNull(), // 'customer', 'waiter', 'kitchen', 'manager', 'admin'
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    roleIdx: index('users_role_idx').on(table.role),
    emailIdx: index('users_email_idx').on(table.email),
  }),
);

// User Secrets Table (for tokens, OTPs, etc.)
export const userSecrets = pgTable(
  'user_secrets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    refreshToken: text('refresh_token').notNull(),
    otpSecret: varchar('otp_secret', { length: 256 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('user_secrets_user_id_idx').on(table.userId),
  }),
);

// Restaurants Table
export const restaurants = pgTable(
  'restaurants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    description: text('description'),
    address: text('address'),
    phone: varchar('phone', { length: 20 }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    slugIdx: index('restaurants_slug_idx').on(table.slug),
  }),
);

// Tables Table
export const tables = pgTable(
  'tables',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    restaurantId: uuid('restaurant_id')
      .notNull()
      .references(() => restaurants.id),
    tableNumber: integer('table_number').notNull(),
    qrUuid: uuid('qr_uuid').defaultRandom().unique().notNull(),
    currentWaiterId: uuid('current_waiter_id').references(() => users.id),
    status: varchar('status', { length: 50 }).default('available').notNull(), // 'available', 'occupied', 'needs_cleaning'
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    restaurantIdIdx: index('tables_restaurant_id_idx').on(table.restaurantId),
    qrUuidIdx: index('tables_qr_uuid_idx').on(table.qrUuid),
    restaurantFk: foreignKey({
      columns: [table.restaurantId],
      foreignColumns: [restaurants.id],
    }),
    waiterFk: foreignKey({
      columns: [table.currentWaiterId],
      foreignColumns: [users.id],
    }),
  }),
);

// Menu Categories Table
export const menuCategories = pgTable(
  'menu_categories',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    restaurantId: uuid('restaurant_id')
      .notNull()
      .references(() => restaurants.id),
    name: varchar('name', { length: 256 }).notNull(),
    nameAm: varchar('name_am', { length: 256 }),
    description: text('description'),
    descriptionAm: text('description_am'),
    displayOrder: integer('display_order').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    restaurantIdIdx: index('menu_categories_restaurant_id_idx').on(table.restaurantId),
  }),
);

// Menu Items Table
export const menuItems = pgTable(
  'menu_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    restaurantId: uuid('restaurant_id')
      .notNull()
      .references(() => restaurants.id),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => menuCategories.id),
    name: varchar('name', { length: 256 }).notNull(),
    nameAm: varchar('name_am', { length: 256 }),
    description: text('description'),
    descriptionAm: text('description_am'),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    imageUrl: text('image_url'),
    isAvailable: boolean('is_available').default(true).notNull(),
    prepTime: integer('prep_time').default(15),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    restaurantIdIdx: index('menu_items_restaurant_id_idx').on(table.restaurantId),
    categoryIdIdx: index('menu_items_category_id_idx').on(table.categoryId),
  }),
);

// Orders Table (Hybrid Support)
export const orders = pgTable(
  'orders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    restaurantId: uuid('restaurant_id')
      .notNull()
      .references(() => restaurants.id),
    tableId: uuid('table_id').references(() => tables.id),
    userId: uuid('user_id').references(() => users.id),
    guestId: varchar('guest_id', { length: 256 }),
    status: varchar('status', { length: 50 }).default('PENDING').notNull(), // PENDING, CONFIRMED, PREPARING, READY, DELIVERED, CANCELLED
    totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
    specialInstructions: text('special_instructions'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    restaurantIdIdx: index('orders_restaurant_id_idx').on(table.restaurantId),
    tableIdIdx: index('orders_table_id_idx').on(table.tableId),
    userIdIdx: index('orders_user_id_idx').on(table.userId),
  }),
);

// Order Items Table
export const orderItems = pgTable(
  'order_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id),
    menuItemId: uuid('menu_item_id')
      .notNull()
      .references(() => menuItems.id),
    quantity: integer('quantity').notNull(),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    orderIdIdx: index('order_items_order_id_idx').on(table.orderId),
    menuItemIdIdx: index('order_items_menu_item_id_idx').on(table.menuItemId),
  }),
);

// Cart Items Table
export const cartItems = pgTable(
  'cart_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id),
    guestId: varchar('guest_id', { length: 256 }),
    menuItemId: uuid('menu_item_id')
      .notNull()
      .references(() => menuItems.id),
    quantity: integer('quantity').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('cart_items_user_id_idx').on(table.userId),
    guestIdIdx: index('cart_items_guest_id_idx').on(table.guestId),
    menuItemIdIdx: index('cart_items_menu_item_id_idx').on(table.menuItemId),
  }),
);

// Favorites Junction Table
export const favorites = pgTable(
  'favorites',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    menuItemId: uuid('menu_item_id')
      .notNull()
      .references(() => menuItems.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    favoritesPk: primaryKey({ columns: [table.userId, table.menuItemId] }),
  }),
);

// Staff Assignments Table
export const staffAssignments = pgTable(
  'staff_assignments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    restaurantId: uuid('restaurant_id')
      .notNull()
      .references(() => restaurants.id),
    role: varchar('role', { length: 50 }).notNull(), // manager, waiter, kitchen
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    staffAssignmentsUserIdIdx: index('staff_assignments_user_id_idx').on(table.userId),
    staffAssignmentsRestaurantIdIdx: index('staff_assignments_restaurant_id_idx').on(
      table.restaurantId,
    ),
  }),
);

// Notifications Table
export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    type: varchar('type', { length: 50 }).notNull(), // order_update, table_request, system
    title: varchar('title', { length: 255 }).notNull(),
    message: text('message').notNull(),
    isRead: boolean('is_read').default(false),
    relatedEntityId: uuid('related_entity_id'), // order_id, table_id, etc.
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    notificationsUserIdIdx: index('notifications_user_id_idx').on(table.userId),
    notificationsIsReadIdx: index('notifications_is_read_idx').on(table.isRead),
  }),
);

// Restaurant Settings Table
export const restaurantSettings = pgTable(
  'restaurant_settings',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    restaurantId: uuid('restaurant_id')
      .notNull()
      .references(() => restaurants.id),
    key: varchar('key', { length: 255 }).notNull(),
    value: jsonb('value').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    restaurantIdIdx: index('restaurant_settings_restaurant_id_idx').on(table.restaurantId),
    keyIdx: index('restaurant_settings_key_idx').on(table.key),
  }),
);

// Bookings / Reservations Table
export const bookings = pgTable(
  'bookings',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    restaurantId: uuid('restaurant_id')
      .notNull()
      .references(() => restaurants.id),
    userId: uuid('user_id').references(() => users.id),
    guestEmail: varchar('guest_email', { length: 255 }),
    guestName: varchar('guest_name', { length: 255 }),
    guestPhone: varchar('guest_phone', { length: 20 }),
    date: varchar('date', { length: 20 }).notNull(), // 'YYYY-MM-DD'
    time: varchar('time', { length: 10 }).notNull(), // 'HH:MM'
    partySize: integer('party_size').notNull(),
    status: varchar('status', { length: 20 }).default('pending').notNull(),
    specialRequest: text('special_request'),
    tableId: uuid('table_id').references(() => tables.id),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    bookingsRestaurantIdIdx: index('bookings_restaurant_id_idx').on(table.restaurantId),
    bookingsUserIdIdx: index('bookings_user_id_idx').on(table.userId),
    bookingsDateIdx: index('bookings_date_idx').on(table.date),
  }),
);

// Export all table definitions
export const databaseSchema = {
  users,
  restaurants,
  tables,
  menuCategories,
  menuItems,
  orders,
  orderItems,
  favorites,
  staffAssignments,
  notifications,
  restaurantSettings,
  userSecrets,
  bookings,
};
