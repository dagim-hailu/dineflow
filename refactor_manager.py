import re

with open('apps/web/app/(staff)/manager/page.tsx', 'r') as f:
    content = f.read()

# 1. Imports
content = content.replace(
    "import { GET_MENU, CREATE_MENU_ITEM, UPDATE_MENU_ITEM, DELETE_MENU_ITEM, DEFAULT_DEMO_TABLE_ID } from '@/lib/graphql/menu';",
    "import { GET_MENU, CREATE_MENU_ITEM, UPDATE_MENU_ITEM, DELETE_MENU_ITEM, DEFAULT_DEMO_TABLE_ID, GET_PAGINATED_MENU_ITEMS } from '@/lib/graphql/menu';\nimport { GET_PAGINATED_USERS } from '@/lib/graphql/auth';\nimport { Search, Filter as FilterIcon, ChevronLeft, ChevronRight } from 'lucide-react';"
)

# 2. Add properties to MenuItem and newItem state
content = content.replace(
    "type MenuItem = { id: string; name: string; description?: string; price: number | string; isAvailable: boolean; prepTime?: number; imageUrl?: string };",
    "type MenuItem = { id: string; name: string; nameAm?: string; description?: string; descriptionAm?: string; price: number | string; isAvailable: boolean; prepTime?: number; imageUrl?: string; categoryId?: string };"
)
content = content.replace(
    "const [newItem, setNewItem] = useState({ name: '', description: '', price: '', categoryId: '', prepTime: '15', imageUrl: '' });",
    "const [newItem, setNewItem] = useState({ name: '', nameAm: '', description: '', descriptionAm: '', price: '', categoryId: '', prepTime: '15', imageUrl: '' });"
)

# 3. Add state variables for pagination
content = content.replace(
    "const [showNewForm, setShowNewForm] = useState(false);",
    "const [showNewForm, setShowNewForm] = useState(false);\n  const [menuPage, setMenuPage] = useState(0);\n  const [menuSearch, setMenuSearch] = useState('');\n  const [menuCategory, setMenuCategory] = useState('');\n  const [staffPage, setStaffPage] = useState(0);\n  const [staffSearch, setStaffSearch] = useState('');\n  const [staffRole, setStaffRole] = useState('');\n"
)

# 4. Add Queries
content = content.replace(
    "const { data: bookingData, loading: bookingsLoading } = useQuery(RESTAURANT_BOOKINGS, { variables: { restaurantId: DEMO_RESTAURANT_ID } });",
    """const { data: bookingData, loading: bookingsLoading } = useQuery(RESTAURANT_BOOKINGS, { variables: { restaurantId: DEMO_RESTAURANT_ID } });

  const { data: paginatedMenuData, loading: paginatedMenuLoading, refetch: refetchPaginatedMenu } = useQuery(GET_PAGINATED_MENU_ITEMS, {
    variables: { limit: 6, offset: menuPage * 6, search: menuSearch || null, categoryId: menuCategory || null, restaurantId: DEMO_RESTAURANT_ID },
    fetchPolicy: 'cache-and-network'
  });

  const { data: staffData, loading: staffLoading } = useQuery(GET_PAGINATED_USERS, {
    variables: { limit: 10, offset: staffPage * 10, search: staffSearch || null, role: staffRole || null },
    fetchPolicy: 'cache-and-network'
  });"""
)

# 5. Fix refetch in mutations
content = content.replace(
    "refetch(); setShowNewForm(false); setNewItem({ name:'', description:'', price:'', categoryId:'', prepTime:'15', imageUrl:'' });",
    "refetch(); refetchPaginatedMenu(); setShowNewForm(false); setNewItem({ name:'', nameAm:'', description:'', descriptionAm:'', price:'', categoryId:'', prepTime:'15', imageUrl:'' });"
)
content = content.replace(
    "refetch(); setEditingItem(null);",
    "refetch(); refetchPaginatedMenu(); setEditingItem(null);"
)
content = content.replace(
    "refetch(); },",
    "refetch(); refetchPaginatedMenu(); },"
)

# 6. Update Handle Create/Update
content = content.replace(
    "createMenuItem({ variables: { input: { name: newItem.name, description: newItem.description, price: parseFloat(newItem.price), categoryId: newItem.categoryId, restaurantId, prepTime: parseInt(newItem.prepTime) || 15, imageUrl: newItem.imageUrl || undefined } } });",
    "createMenuItem({ variables: { input: { name: newItem.name, nameAm: newItem.nameAm || undefined, description: newItem.description, descriptionAm: newItem.descriptionAm || undefined, price: parseFloat(newItem.price), categoryId: newItem.categoryId, restaurantId, prepTime: parseInt(newItem.prepTime) || 15, imageUrl: newItem.imageUrl || undefined } } });"
)
content = content.replace(
    "updateMenuItem({ variables: { input: { id: editingItem.id, name: editingItem.name, description: editingItem.description, price: parseFloat(String(editingItem.price)), isAvailable: editingItem.isAvailable, prepTime: editingItem.prepTime, imageUrl: editingItem.imageUrl } } });",
    "updateMenuItem({ variables: { input: { id: editingItem.id, name: editingItem.name, nameAm: editingItem.nameAm, description: editingItem.description, descriptionAm: editingItem.descriptionAm, price: parseFloat(String(editingItem.price)), isAvailable: editingItem.isAvailable, prepTime: editingItem.prepTime, categoryId: editingItem.categoryId, imageUrl: editingItem.imageUrl } } });"
)

# 7. Add inputs for NameAm and DescriptionAm in Create Form
create_inputs = """
                    <div>
                      <label className="block mb-1.5 text-sm font-semibold text-gray-600">{t('itemName')} (Amharic)</label>
                      <input value={newItem.nameAm} onChange={e => setNewItem(p => ({...p, nameAm: e.target.value}))} placeholder="e.g. ማርጋሪታ ፒዛ"
                        className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-base transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10" />
                    </div>
"""
content = content.replace(
    "<div>\n                      <label className=\"block mb-1.5 text-sm font-semibold text-gray-600\">{t('price')} *</label>",
    create_inputs + "<div>\n                      <label className=\"block mb-1.5 text-sm font-semibold text-gray-600\">{t('price')} *</label>"
)

create_desc_am = """
                    <div className="col-span-2">
                      <label className="block mb-1.5 text-sm font-semibold text-gray-600">{t('description')} (Amharic)</label>
                      <textarea value={newItem.descriptionAm} onChange={e => setNewItem(p => ({...p, descriptionAm: e.target.value}))} rows={3} placeholder="የምግቡን ዝርዝር ሁኔታ ይግለፁ…"
                        className="w-full resize-none rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-base transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10" />
                    </div>
"""
content = content.replace(
    "<div className=\"col-span-2 flex gap-3 pt-2\">\n                      <button onClick={handleCreate} disabled={creating}",
    create_desc_am + "<div className=\"col-span-2 flex gap-3 pt-2\">\n                      <button onClick={handleCreate} disabled={creating}"
)

# 8. Add inputs for NameAm and DescriptionAm in Edit Form
edit_inputs = """
                    <div>
                      <label className="block mb-1.5 text-sm font-semibold text-gray-600">{t('itemName')} (Amharic)</label>
                      <input value={editingItem.nameAm || ''} onChange={e => setEditingItem(p => p && ({...p, nameAm: e.target.value}))}
                        className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-base transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10" />
                    </div>
"""
content = content.replace(
    "<div>\n                      <label className=\"block mb-1.5 text-sm font-semibold text-gray-600\">{t('price')}</label>",
    edit_inputs + "<div>\n                      <label className=\"block mb-1.5 text-sm font-semibold text-gray-600\">{t('price')}</label>"
)

edit_desc_am = """
                    <div className="col-span-2">
                      <label className="block mb-1.5 text-sm font-semibold text-gray-600">{t('description')} (Amharic)</label>
                      <textarea value={editingItem.descriptionAm || ''} rows={3} onChange={e => setEditingItem(p => p && ({...p, descriptionAm: e.target.value}))}
                        className="w-full resize-none rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-base transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10" />
                    </div>
"""
content = content.replace(
    "<div className=\"col-span-2 flex gap-3 pt-2\">\n                      <button onClick={handleUpdate} disabled={updating}",
    edit_desc_am + "<div className=\"col-span-2 flex gap-3 pt-2\">\n                      <button onClick={handleUpdate} disabled={updating}"
)

# 9. Replace Menu Items Grid with Search/Filter and Pagination
menu_grid_replace = """
                <div className="mb-4 flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type="text" placeholder="Search menu..." value={menuSearch} onChange={e => { setMenuSearch(e.target.value); setMenuPage(0); }}
                      className="w-full rounded-xl border-2 border-gray-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10" />
                  </div>
                  <select value={menuCategory} onChange={e => { setMenuCategory(e.target.value); setMenuPage(0); }}
                    className="rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none">
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {paginatedMenuLoading ? (
                  <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : (
                  <>
                    <div className="grid gap-5 sm:grid-cols-2">
                      {paginatedMenuData?.paginatedMenuItems?.items.map((item: any) => (
                        <div key={item.id} className="group overflow-hidden rounded-2xl bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl">
                          <img src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=240&fit=crop'} alt={item.name} className="h-44 w-full object-cover" />
                          <div className="p-5">
                            <div className="mb-2 flex items-start justify-between gap-2">
                              <h3 className="text-lg font-bold text-gray-800 leading-tight">{item.name} {item.nameAm && <span className="text-sm font-normal text-gray-500 block">{item.nameAm}</span>}</h3>
                              <span className="shrink-0 rounded-full bg-gradient-to-r from-primary to-orange-500 px-3 py-1 text-sm font-bold text-white">${price(item.price)}</span>
                            </div>
                            <span className="mb-3 inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                              {categories.find(c => c.id === item.categoryId)?.name || 'Category'}
                            </span>
                            <p className="min-h-[36px] text-sm text-gray-500 line-clamp-2">{item.description}</p>
                            <div className="mt-4 flex gap-2">
                              <button onClick={() => { setEditingItem(item); setShowNewForm(false); }} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#2196f3] py-2.5 text-sm font-semibold text-white transition hover:bg-[#1976d2] hover:-translate-y-0.5">
                                <Edit className="h-3.5 w-3.5" /> {t('editItem')}
                              </button>
                              <button onClick={() => { if (confirm(`Delete "${item.name}"?`)) deleteMenuItem({ variables: { id: item.id } }); }} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#f44336] py-2.5 text-sm font-semibold text-white transition hover:bg-[#d32f2f] hover:-translate-y-0.5">
                                <Trash2 className="h-3.5 w-3.5" /> {t('delete')}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Menu Pagination Controls */}
                    <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                      <span className="text-sm text-gray-500">
                        Total: {paginatedMenuData?.paginatedMenuItems?.totalCount || 0} items
                      </span>
                      <div className="flex gap-2">
                        <button disabled={menuPage === 0} onClick={() => setMenuPage(p => p - 1)} className="rounded-lg p-2 hover:bg-gray-100 disabled:opacity-50"><ChevronLeft className="h-5 w-5" /></button>
                        <button disabled={(menuPage + 1) * 6 >= (paginatedMenuData?.paginatedMenuItems?.totalCount || 0)} onClick={() => setMenuPage(p => p + 1)} className="rounded-lg p-2 hover:bg-gray-100 disabled:opacity-50"><ChevronRight className="h-5 w-5" /></button>
                      </div>
                    </div>
                  </>
                )}
"""

content = re.sub(r'\{loading \? \(\s*<div className="flex justify-center py-16">.*?</div>\s*\) : \(\s*<div className="grid gap-5 sm:grid-cols-2">.*?</button>\s*</div>\s*</div>\s*</div>\s*\)\s*\)\s*}\s*</div>\s*\)}', menu_grid_replace, content, flags=re.DOTALL)

# 10. Replace Staff Tab
staff_tab_replace = """
              <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-800">
                <Users className="h-6 w-6 text-primary" /> {t('staffManagement')}
              </h2>
              
              <div className="mb-6 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" placeholder="Search staff..." value={staffSearch} onChange={e => { setStaffSearch(e.target.value); setStaffPage(0); }}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10" />
                </div>
                <select value={staffRole} onChange={e => { setStaffRole(e.target.value); setStaffPage(0); }}
                  className="rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none">
                  <option value="">All Roles</option>
                  <option value="manager">Manager</option>
                  <option value="waiter">Waiter</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {staffLoading ? (
                <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
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
                          <td className="px-6 py-4 font-medium text-gray-800">{user.displayName}</td>
                          <td className="px-6 py-4 text-gray-600">{user.email}</td>
                          <td className="px-6 py-4">
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold capitalize text-blue-700">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                      {staffData?.paginatedUsers?.items.length === 0 && (
                        <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No staff found.</td></tr>
                      )}
                    </tbody>
                  </table>
                  <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
                    <span className="text-sm text-gray-500">
                      Total: {staffData?.paginatedUsers?.totalCount || 0} users
                    </span>
                    <div className="flex gap-2">
                      <button disabled={staffPage === 0} onClick={() => setStaffPage(p => p - 1)} className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 disabled:opacity-50"><ChevronLeft className="h-4 w-4" /></button>
                      <button disabled={(staffPage + 1) * 10 >= (staffData?.paginatedUsers?.totalCount || 0)} onClick={() => setStaffPage(p => p + 1)} className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 disabled:opacity-50"><ChevronRight className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              )}
"""

content = re.sub(r'<h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-800">\s*<Users className="h-6 w-6 text-primary" /> {t\(\'staffManagement\'\)}\s*</h2>\s*<div className="rounded-xl bg-amber-50 border border-amber-200 p-6 text-sm text-amber-800">.*?</div>', staff_tab_replace, content, flags=re.DOTALL)

with open('apps/web/app/(staff)/manager/page.tsx', 'w') as f:
    f.write(content)

