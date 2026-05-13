'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  Crown,
  Edit,
  Trash2,
  Loader2,
  Plus,
  Save,
  X,
  ExternalLink,
  List,
  Users,
  BarChart3,
  CalendarCheck,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import {
  GET_MENU,
  CREATE_MENU_ITEM,
  UPDATE_MENU_ITEM,
  DELETE_MENU_ITEM,
  DEFAULT_DEMO_TABLE_ID,
  GET_PAGINATED_MENU_ITEMS,
} from '@/lib/graphql/menu';
import { GET_PAGINATED_USERS } from '@/lib/graphql/auth';
import { Search, Filter as FilterIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  RESTAURANT_BOOKINGS,
  UPDATE_BOOKING_STATUS,
  DEMO_RESTAURANT_ID,
} from '@/lib/graphql/booking';

type MenuItem = {
  id: string;
  name: string;
  nameAm?: string;
  description?: string;
  descriptionAm?: string;
  price: number | string;
  isAvailable: boolean;
  prepTime?: number;
  imageUrl?: string;
  categoryId?: string;
};
type Category = { id: string; name: string; items: MenuItem[] };
type Booking = {
  id: string;
  date: string;
  time: string;
  partySize: number;
  status: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  specialRequest?: string;
};

function price(v: number | string) {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return isNaN(n) ? '—' : n.toFixed(2);
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
};

export default function ManagerDashboardPage() {
  const t = useTranslations('Staff');
  const tNav = useTranslations('Navigation');
  const [activeTab, setActiveTab] = useState<'menu' | 'staff' | 'bookings' | 'analytics'>('menu');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newItem, setNewItem] = useState({
    name: '',
    nameAm: '',
    description: '',
    descriptionAm: '',
    price: '',
    categoryId: '',
    prepTime: '15',
    imageUrl: '',
  });
  const [showNewForm, setShowNewForm] = useState(false);
  const [menuPage, setMenuPage] = useState(0);
  const [menuSearch, setMenuSearch] = useState('');
  const [menuCategory, setMenuCategory] = useState('');
  const [staffPage, setStaffPage] = useState(0);
  const [staffSearch, setStaffSearch] = useState('');
  const [staffRole, setStaffRole] = useState('');

  const { data, loading, refetch } = useQuery(GET_MENU, {
    variables: { tableId: DEFAULT_DEMO_TABLE_ID },
    fetchPolicy: 'cache-and-network',
  });
  const {
    data: bookingData,
    loading: bookingsLoading,
    error: bookingsError,
    refetch: refetchBookings,
  } = useQuery(RESTAURANT_BOOKINGS, { variables: { restaurantId: DEMO_RESTAURANT_ID } });

  const {
    data: paginatedMenuData,
    loading: paginatedMenuLoading,
    refetch: refetchPaginatedMenu,
  } = useQuery(GET_PAGINATED_MENU_ITEMS, {
    variables: {
      limit: 6,
      offset: menuPage * 6,
      search: menuSearch || null,
      categoryId: menuCategory || null,
      restaurantId: DEMO_RESTAURANT_ID,
    },
    fetchPolicy: 'cache-and-network',
  });

  const { data: staffData, loading: staffLoading } = useQuery(GET_PAGINATED_USERS, {
    variables: {
      limit: 10,
      offset: staffPage * 10,
      search: staffSearch || null,
      role: staffRole || null,
    },
    fetchPolicy: 'cache-and-network',
  });

  const [createMenuItem, { loading: creating }] = useMutation(CREATE_MENU_ITEM, {
    onCompleted: () => {
      toast.success('Item added to menu!');
      refetch();
      refetchPaginatedMenu();
      setShowNewForm(false);
      setNewItem({
        name: '',
        nameAm: '',
        description: '',
        descriptionAm: '',
        price: '',
        categoryId: '',
        prepTime: '15',
        imageUrl: '',
      });
    },
    onError: (e) => toast.error(e.message),
  });
  const [updateMenuItem, { loading: updating }] = useMutation(UPDATE_MENU_ITEM, {
    onCompleted: () => {
      toast.success('Item updated!');
      refetch();
      refetchPaginatedMenu();
      setEditingItem(null);
    },
    onError: (e) => toast.error(e.message),
  });
  const [deleteMenuItem] = useMutation(DELETE_MENU_ITEM, {
    onCompleted: () => {
      toast.success('Item deleted');
      refetch();
      refetchPaginatedMenu();
    },
    onError: (e) => toast.error(e.message),
  });
  const [updateBookingStatus] = useMutation(UPDATE_BOOKING_STATUS, {
    onCompleted: () => toast.success('Booking updated'),
    onError: (e) => toast.error(e.message),
  });

  const categories: Category[] = data?.menu?.categories ?? [];
  const restaurantId = data?.menu?.restaurantId;
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('ALL');
  const [bookingPage, setBookingPage] = useState(0);
  const itemsPerBookingPage = 10;

  const bookings: Booking[] = bookingData?.bookings ?? [];

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.guestName?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      (b.guestEmail && b.guestEmail.toLowerCase().includes(bookingSearch.toLowerCase()));
    const matchesStatus = bookingStatusFilter === 'ALL' || b.status === bookingStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedBookingsList = filteredBookings.slice(
    bookingPage * itemsPerBookingPage,
    (bookingPage + 1) * itemsPerBookingPage,
  );
  const totalItems = categories.reduce((s, c) => s + c.items.length, 0);

  const handleCreate = () => {
    if (!newItem.name || !newItem.price || !newItem.categoryId) {
      toast.error('Name, price and category are required');
      return;
    }
    createMenuItem({
      variables: {
        input: {
          name: newItem.name,
          nameAm: newItem.nameAm || undefined,
          description: newItem.description,
          descriptionAm: newItem.descriptionAm || undefined,
          price: parseFloat(newItem.price),
          categoryId: newItem.categoryId,
          restaurantId,
          prepTime: parseInt(newItem.prepTime) || 15,
          imageUrl: newItem.imageUrl || undefined,
        },
      },
    });
  };
  const handleUpdate = () => {
    if (!editingItem) return;
    updateMenuItem({
      variables: {
        input: {
          id: editingItem.id,
          name: editingItem.name,
          nameAm: editingItem.nameAm,
          description: editingItem.description,
          descriptionAm: editingItem.descriptionAm,
          price: parseFloat(String(editingItem.price)),
          isAvailable: editingItem.isAvailable,
          prepTime: editingItem.prepTime,
          categoryId: editingItem.categoryId,
          imageUrl: editingItem.imageUrl,
        },
      },
    });
  };

  const handleUpdateBookingStatus = (id: string, status: string) => {
    updateBookingStatus({ variables: { id, status } });
  };

  const tabs = [
    { id: 'menu', label: tNav('menu'), icon: List },
    { id: 'bookings', label: t('reservations'), icon: CalendarCheck },
    { id: 'staff', label: t('staffManagement'), icon: Users },
    { id: 'analytics', label: t('analytics'), icon: BarChart3 },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        {/* ── Admin Container ── */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-orange-500 px-8 py-8 text-white text-center">
            <h1 className="flex items-center justify-center gap-4 text-4xl font-bold">
              <Crown className="h-9 w-9" /> {t('menuAdmin')}
            </h1>
            <p className="mt-2 opacity-90 text-lg">{t('manageMenu')}</p>
          </div>

          {/* QR / View menu link */}
          <div className="border-b-2 border-dashed border-gray-200 bg-gray-50 py-4 text-center">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-primary shadow-md transition hover:-translate-y-1 hover:shadow-lg"
            >
              <ExternalLink className="h-4 w-4" /> {t('viewCustomerMenu')} →
            </a>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex flex-1 items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors ${activeTab === id ? 'border-b-2 border-primary text-primary bg-white' : 'text-gray-500 hover:text-gray-800'}`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* ─── MENU TAB ─── */}
          {activeTab === 'menu' && (
            <div className="grid lg:grid-cols-2 min-h-[700px]">
              {/* Left: form */}
              <div className="border-r-2 border-dashed border-gray-100 p-8">
                <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-800">
                  <Edit className="h-6 w-6 text-primary" />
                  {editingItem ? `${t('editItem')}: ${editingItem.name}` : t('addNewItem')}
                </h2>

                {/* Category selector */}
                {!editingItem && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block mb-1.5 text-sm font-semibold text-gray-600">
                        {t('itemName')} *
                      </label>
                      <input
                        value={newItem.name}
                        onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))}
                        placeholder="e.g. Margherita Pizza"
                        className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-base transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
                      />
                    </div>

                    <div>
                      <label className="block mb-1.5 text-sm font-semibold text-gray-600">
                        {t('itemName')} (Amharic)
                      </label>
                      <input
                        value={newItem.nameAm}
                        onChange={(e) => setNewItem((p) => ({ ...p, nameAm: e.target.value }))}
                        placeholder="e.g. ማርጋሪታ ፒዛ"
                        className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-base transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
                      />
                    </div>
                    <div>
                      <label className="block mb-1.5 text-sm font-semibold text-gray-600">
                        {t('price')} *
                      </label>
                      <input
                        type="number"
                        value={newItem.price}
                        onChange={(e) => setNewItem((p) => ({ ...p, price: e.target.value }))}
                        placeholder="12.99"
                        step="0.01"
                        min="0"
                        className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-base transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
                      />
                    </div>
                    <div>
                      <label className="block mb-1.5 text-sm font-semibold text-gray-600">
                        {t('category')} *
                      </label>
                      <select
                        value={newItem.categoryId}
                        onChange={(e) => setNewItem((p) => ({ ...p, categoryId: e.target.value }))}
                        className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-base transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
                      >
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1.5 text-sm font-semibold text-gray-600">
                        {t('prepTime')}
                      </label>
                      <input
                        type="number"
                        value={newItem.prepTime}
                        onChange={(e) => setNewItem((p) => ({ ...p, prepTime: e.target.value }))}
                        placeholder="15"
                        className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-base transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
                      />
                    </div>
                    <div>
                      <label className="block mb-1.5 text-sm font-semibold text-gray-600">
                        {t('imageUrl')}
                      </label>
                      <input
                        value={newItem.imageUrl}
                        onChange={(e) => setNewItem((p) => ({ ...p, imageUrl: e.target.value }))}
                        placeholder="https://…"
                        className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-base transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block mb-1.5 text-sm font-semibold text-gray-600">
                        {t('description')}
                      </label>
                      <textarea
                        value={newItem.description}
                        onChange={(e) => setNewItem((p) => ({ ...p, description: e.target.value }))}
                        rows={3}
                        placeholder="Describe your delicious item…"
                        className="w-full resize-none rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-base transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block mb-1.5 text-sm font-semibold text-gray-600">
                        {t('description')} (Amharic)
                      </label>
                      <textarea
                        value={newItem.descriptionAm}
                        onChange={(e) =>
                          setNewItem((p) => ({ ...p, descriptionAm: e.target.value }))
                        }
                        rows={3}
                        placeholder="የምግቡን ዝርዝር ሁኔታ ይግለፁ…"
                        className="w-full resize-none rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-base transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
                      />
                    </div>
                    <div className="col-span-2 flex gap-3 pt-2">
                      <button
                        onClick={handleCreate}
                        disabled={creating}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-orange-500 py-4 font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60"
                      >
                        {creating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}{' '}
                        {t('saveItem')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Edit form */}
                {editingItem && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block mb-1.5 text-sm font-semibold text-gray-600">
                        {t('itemName')}
                      </label>
                      <input
                        value={editingItem.name}
                        onChange={(e) => setEditingItem((p) => p && { ...p, name: e.target.value })}
                        className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-base transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
                      />
                    </div>

                    <div>
                      <label className="block mb-1.5 text-sm font-semibold text-gray-600">
                        {t('itemName')} (Amharic)
                      </label>
                      <input
                        value={editingItem.nameAm || ''}
                        onChange={(e) =>
                          setEditingItem((p) => p && { ...p, nameAm: e.target.value })
                        }
                        className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-base transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
                      />
                    </div>
                    <div>
                      <label className="block mb-1.5 text-sm font-semibold text-gray-600">
                        {t('price')}
                      </label>
                      <input
                        type="number"
                        value={editingItem.price}
                        onChange={(e) =>
                          setEditingItem((p) => p && { ...p, price: e.target.value })
                        }
                        className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-base transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
                      />
                    </div>
                    <div>
                      <label className="block mb-1.5 text-sm font-semibold text-gray-600">
                        {t('prepTime')}
                      </label>
                      <input
                        type="number"
                        value={editingItem.prepTime ?? 15}
                        onChange={(e) =>
                          setEditingItem((p) => p && { ...p, prepTime: parseInt(e.target.value) })
                        }
                        className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-base transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block mb-1.5 text-sm font-semibold text-gray-600">
                        {t('imageUrl')}
                      </label>
                      <input
                        value={editingItem.imageUrl ?? ''}
                        onChange={(e) =>
                          setEditingItem((p) => p && { ...p, imageUrl: e.target.value })
                        }
                        className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-base transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block mb-1.5 text-sm font-semibold text-gray-600">
                        {t('description')}
                      </label>
                      <textarea
                        value={editingItem.description ?? ''}
                        rows={3}
                        onChange={(e) =>
                          setEditingItem((p) => p && { ...p, description: e.target.value })
                        }
                        className="w-full resize-none rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-base transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block mb-1.5 text-sm font-semibold text-gray-600">
                        {t('description')} (Amharic)
                      </label>
                      <textarea
                        value={editingItem.descriptionAm || ''}
                        rows={3}
                        onChange={(e) =>
                          setEditingItem((p) => p && { ...p, descriptionAm: e.target.value })
                        }
                        className="w-full resize-none rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-base transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
                      />
                    </div>
                    <div className="col-span-2 flex gap-3 pt-2">
                      <button
                        onClick={handleUpdate}
                        disabled={updating}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-orange-500 py-4 font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60"
                      >
                        {updating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}{' '}
                        {t('updateItem')}
                      </button>
                      <button
                        onClick={() => setEditingItem(null)}
                        className="flex items-center justify-center gap-2 rounded-xl bg-gray-500 px-5 py-4 font-semibold text-white transition hover:bg-gray-600 hover:-translate-y-0.5"
                      >
                        <X className="h-4 w-4" /> {t('cancel')}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: items grid */}
              <div className="max-h-[700px] overflow-y-auto bg-gray-50 p-8">
                <h2 className="mb-6 flex items-center justify-between text-2xl font-bold text-gray-800">
                  <span className="flex items-center gap-2">
                    <List className="h-6 w-6 text-primary" /> {t('menuItems')}
                  </span>
                  <span className="rounded-full bg-primary px-4 py-1 text-sm font-semibold text-white">
                    {loading ? '…' : `${totalItems} ${t('items')}`}
                  </span>
                </h2>
                {loading ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2">
                    {categories.flatMap((cat) =>
                      cat.items.map((item) => (
                        <div
                          key={item.id}
                          className="group overflow-hidden rounded-2xl bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
                        >
                          <img
                            src={
                              item.imageUrl ||
                              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=240&fit=crop'
                            }
                            alt={item.name}
                            className="h-44 w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=240&fit=crop';
                            }}
                          />
                          <div className="p-5">
                            <div className="mb-2 flex items-start justify-between gap-2">
                              <h3 className="text-lg font-bold text-gray-800 leading-tight">
                                {item.name}
                              </h3>
                              <span className="shrink-0 rounded-full bg-gradient-to-r from-primary to-orange-500 px-3 py-1 text-sm font-bold text-white">
                                ${price(item.price)}
                              </span>
                            </div>
                            <span className="mb-3 inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                              {cat.name}
                            </span>
                            <p className="min-h-[36px] text-sm text-gray-500 line-clamp-2">
                              {item.description}
                            </p>
                            <div className="mt-4 flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingItem(item);
                                  setShowNewForm(false);
                                }}
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#2196f3] py-2.5 text-sm font-semibold text-white transition hover:bg-[#1976d2] hover:-translate-y-0.5"
                              >
                                <Edit className="h-3.5 w-3.5" /> {t('editItem')}
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete "${item.name}"?`))
                                    deleteMenuItem({ variables: { id: item.id } });
                                }}
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#f44336] py-2.5 text-sm font-semibold text-white transition hover:bg-[#d32f2f] hover:-translate-y-0.5"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> {t('delete')}
                              </button>
                            </div>
                          </div>
                        </div>
                      )),
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── BOOKINGS TAB ─── */}
          {activeTab === 'bookings' && (
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Bookings</h2>
                  <p className="text-sm text-gray-500">Manage all restaurant reservations.</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search guests..."
                      className="pl-9 w-64"
                      value={bookingSearch}
                      onChange={(e) => {
                        setBookingSearch(e.target.value);
                        setBookingPage(0);
                      }}
                    />
                  </div>
                  <select
                    className="w-40 h-10 px-3 py-2 border rounded-md text-sm bg-white"
                    value={bookingStatusFilter}
                    onChange={(e) => {
                      setBookingStatusFilter(e.target.value);
                      setBookingPage(0);
                    }}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  <Button
                    variant="outline"
                    onClick={() => refetchBookings()}
                    disabled={bookingsLoading}
                  >
                    <RefreshCw
                      className={`h-4 w-4 mr-2 ${bookingsLoading ? 'animate-spin' : ''}`}
                    />
                    Refresh
                  </Button>
                </div>
              </div>

              {bookingsError && (
                <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">
                  Error loading bookings: {bookingsError.message}
                </div>
              )}

              <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 font-medium">Guest</th>
                      <th className="px-6 py-3 font-medium">Date & Time</th>
                      <th className="px-6 py-3 font-medium">Party Size</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBookingsList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          {bookingsLoading
                            ? 'Loading bookings...'
                            : 'No bookings found matching filters.'}
                        </td>
                      </tr>
                    ) : (
                      paginatedBookingsList.map((booking: Booking) => (
                        <tr
                          key={booking.id}
                          className="border-b hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900">{booking.guestName}</p>
                            <p className="text-xs text-gray-500">{booking.guestEmail}</p>
                            {booking.guestPhone && (
                              <p className="text-xs text-gray-500">{booking.guestPhone}</p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900">
                              {new Date(booking.date).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">{booking.time}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center justify-center bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-sm font-medium">
                              {booking.partySize} ppl
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                booking.status === 'CONFIRMED'
                                  ? 'bg-green-100 text-green-800'
                                  : booking.status === 'CANCELLED'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-green-200 text-green-700 hover:bg-green-50"
                                onClick={() => handleUpdateBookingStatus(booking.id, 'CONFIRMED')}
                                disabled={booking.status === 'CONFIRMED'}
                              >
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-200 text-red-700 hover:bg-red-50"
                                onClick={() => handleUpdateBookingStatus(booking.id, 'CANCELLED')}
                                disabled={booking.status === 'CANCELLED'}
                              >
                                Cancel
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Bookings Pagination */}
                {filteredBookings.length > itemsPerBookingPage && (
                  <div className="flex items-center justify-between px-6 py-4 border-t">
                    <span className="text-sm text-muted-foreground">
                      Showing {bookingPage * itemsPerBookingPage + 1} to{' '}
                      {Math.min((bookingPage + 1) * itemsPerBookingPage, filteredBookings.length)}{' '}
                      of {filteredBookings.length} bookings
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBookingPage((p) => p - 1)}
                        disabled={bookingPage === 0}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBookingPage((p) => p + 1)}
                        disabled={
                          (bookingPage + 1) * itemsPerBookingPage >= filteredBookings.length
                        }
                      >
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── STAFF TAB ─── */}
          {activeTab === 'staff' && (
            <div className="p-8">
              <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-800">
                <Users className="h-6 w-6 text-primary" /> {t('staffManagement')}
              </h2>

              <div className="mb-6 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search staff..."
                    value={staffSearch}
                    onChange={(e) => {
                      setStaffSearch(e.target.value);
                      setStaffPage(0);
                    }}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
                  />
                </div>
                <select
                  value={staffRole}
                  onChange={(e) => {
                    setStaffRole(e.target.value);
                    setStaffPage(0);
                  }}
                  className="rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="">All Roles</option>
                  <option value="manager">Manager</option>
                  <option value="waiter">Waiter</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {staffLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold">Name</th>
                        <th className="px-6 py-4 text-left font-semibold">Email</th>
                        <th className="px-6 py-4 text-left font-semibold">Role</th>
                        <th className="px-6 py-4 text-left font-semibold">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {staffData?.paginatedUsers?.items.map((user: any) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-800">
                            {user.displayName}
                          </td>
                          <td className="px-6 py-4 text-gray-600">{user.email}</td>
                          <td className="px-6 py-4">
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold capitalize text-blue-700">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                      {staffData?.paginatedUsers?.items.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                            No staff found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
                    <span className="text-sm text-gray-500">
                      Total: {staffData?.paginatedUsers?.totalCount || 0} users
                    </span>
                    <div className="flex gap-2">
                      <button
                        disabled={staffPage === 0}
                        onClick={() => setStaffPage((p) => p - 1)}
                        className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        disabled={
                          (staffPage + 1) * 10 >= (staffData?.paginatedUsers?.totalCount || 0)
                        }
                        onClick={() => setStaffPage((p) => p + 1)}
                        className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── ANALYTICS TAB ─── */}
          {activeTab === 'analytics' && (
            <div className="p-8">
              <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-800">
                <BarChart3 className="h-6 w-6 text-primary" /> {t('analytics')}
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: t('menuItems'), value: totalItems, color: 'from-primary to-orange-500' },
                  {
                    label: t('category'),
                    value: categories.length,
                    color: 'from-[#4facfe] to-[#00f2fe]',
                  },
                  {
                    label: t('available'),
                    value: categories.reduce(
                      (s, c) => s + c.items.filter((i) => i.isAvailable).length,
                      0,
                    ),
                    color: 'from-[#43e97b] to-[#38f9d7]',
                  },
                  {
                    label: t('reservations'),
                    value: bookings.length,
                    color: 'from-[#fa709a] to-[#fee140]',
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={`rounded-2xl bg-gradient-to-br ${stat.color} p-6 text-center text-white shadow-lg`}
                  >
                    <p className="text-5xl font-black">{loading ? '…' : stat.value}</p>
                    <p className="mt-2 text-sm font-semibold opacity-90">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
