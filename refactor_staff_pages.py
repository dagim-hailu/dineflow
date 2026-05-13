import re

# 1. Kitchen
with open('apps/web/app/(staff)/kitchen/page.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "import { useTranslations } from 'next-intl';",
    "import { useTranslations } from 'next-intl';\nimport { LanguageSwitcher } from '@/components/language-switcher';"
)
content = content.replace(
    """          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ChefHat className="h-8 w-8 text-amber-500" /> {t('kitchenDisplay')}
          </h1>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="ml-2">{t('refresh')}</span>
          </Button>""",
    """          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ChefHat className="h-8 w-8 text-amber-500" /> {t('kitchenDisplay')}
          </h1>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="ml-2">{t('refresh')}</span>
            </Button>
          </div>"""
)
with open('apps/web/app/(staff)/kitchen/page.tsx', 'w') as f:
    f.write(content)

# 2. Waiter
with open('apps/web/app/(staff)/waiter/page.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "import { useTranslations } from 'next-intl';",
    "import { useTranslations } from 'next-intl';\nimport { LanguageSwitcher } from '@/components/language-switcher';"
)
content = content.replace(
    """          <CardTitle className="text-3xl font-bold flex items-center gap-2">
            <Utensils className="h-7 w-7 text-amber-500" /> {t('waiterDashboard')}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="ml-2">{t('refresh')}</span>
          </Button>""",
    """          <CardTitle className="text-3xl font-bold flex items-center gap-2">
            <Utensils className="h-7 w-7 text-amber-500" /> {t('waiterDashboard')}
          </CardTitle>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="ml-2">{t('refresh')}</span>
            </Button>
          </div>"""
)
with open('apps/web/app/(staff)/waiter/page.tsx', 'w') as f:
    f.write(content)

# 3. Manager
with open('apps/web/app/(staff)/manager/page.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "import { Search, Filter as FilterIcon, ChevronLeft, ChevronRight } from 'lucide-react';",
    "import { Search, Filter as FilterIcon, ChevronLeft, ChevronRight } from 'lucide-react';\nimport { LanguageSwitcher } from '@/components/language-switcher';"
)

content = content.replace(
    """          <div className="flex items-center space-x-4">
            <Button onClick={handleLogout} variant="outline" size="sm">""",
    """          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <Button onClick={handleLogout} variant="outline" size="sm">"""
)

state_and_logic = """
  // State for Booking Tab Pagination & Filtering
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('ALL');
  const [bookingPage, setBookingPage] = useState(0);
  const itemsPerBookingPage = 10;

  const bookings: Booking[] = (bookingsData?.bookings ?? []);
  
  // Client-side filtering
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.guestName.toLowerCase().includes(bookingSearch.toLowerCase()) || 
                          (b.guestEmail && b.guestEmail.toLowerCase().includes(bookingSearch.toLowerCase()));
    const matchesStatus = bookingStatusFilter === 'ALL' || b.status === bookingStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedBookingsList = filteredBookings.slice(bookingPage * itemsPerBookingPage, (bookingPage + 1) * itemsPerBookingPage);
"""

content = content.replace(
    "const bookings: Booking[] = bookingsData?.bookings ?? [];",
    state_and_logic
)

booking_ui_replacement = """
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
                      onChange={(e) => { setBookingSearch(e.target.value); setBookingPage(0); }}
                    />
                  </div>
                  <Select value={bookingStatusFilter} onValueChange={(val) => { setBookingStatusFilter(val); setBookingPage(0); }}>
                    <SelectTrigger className="w-40">
                      <div className="flex items-center gap-2">
                        <FilterIcon className="h-4 w-4" />
                        <span>Status</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Statuses</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => refetchBookings()} disabled={bookingsLoading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${bookingsLoading ? 'animate-spin' : ''}`} />
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
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead>Guest</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Party Size</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedBookingsList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          {bookingsLoading ? 'Loading bookings...' : 'No bookings found matching filters.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedBookingsList.map((booking: Booking) => (
                        <TableRow key={booking.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell>
                            <p className="font-medium text-gray-900">{booking.guestName}</p>
                            <p className="text-xs text-gray-500">{booking.guestEmail}</p>
                            {booking.guestPhone && <p className="text-xs text-gray-500">{booking.guestPhone}</p>}
                          </TableCell>
                          <TableCell>
                            <p className="font-medium text-gray-900">
                              {new Date(booking.date).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">{booking.time}</p>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center justify-center bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-sm font-medium">
                              {booking.partySize} ppl
                            </span>
                          </TableCell>
                          <TableCell>
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
                          </TableCell>
                          <TableCell className="text-right">
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
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                
                {/* Bookings Pagination */}
                {filteredBookings.length > itemsPerBookingPage && (
                  <div className="flex items-center justify-between px-6 py-4 border-t">
                    <span className="text-sm text-muted-foreground">
                      Showing {bookingPage * itemsPerBookingPage + 1} to {Math.min((bookingPage + 1) * itemsPerBookingPage, filteredBookings.length)} of {filteredBookings.length} bookings
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBookingPage(p => p - 1)}
                        disabled={bookingPage === 0}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBookingPage(p => p + 1)}
                        disabled={(bookingPage + 1) * itemsPerBookingPage >= filteredBookings.length}
                      >
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
"""

content = re.sub(
    r'\{/\* ─── BOOKINGS TAB ─── \*/\}.*?\{/\* ─── STAFF TAB ─── \*/\}',
    booking_ui_replacement + "\n\n          {/* ─── STAFF TAB ─── */}",
    content,
    flags=re.DOTALL
)

with open('apps/web/app/(staff)/manager/page.tsx', 'w') as f:
    f.write(content)

