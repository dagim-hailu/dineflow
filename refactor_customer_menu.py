import re

with open('apps/web/components/home-menu-section.tsx', 'r') as f:
    content = f.read()

# 1. Imports
content = content.replace(
    "import { DEFAULT_DEMO_TABLE_ID, GET_MENU } from '@/lib/graphql/menu';",
    "import { DEFAULT_DEMO_TABLE_ID, GET_MENU, GET_PAGINATED_MENU_ITEMS } from '@/lib/graphql/menu';\nimport { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';"
)

# 2. Add state and queries
state_and_queries = """
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);

  const { data: menuData, loading: menuLoading, error: menuError } = useQuery(GET_MENU, {
    variables: { tableId: DEFAULT_DEMO_TABLE_ID },
  });

  const allCategories: Category[] = menuData?.menu?.categories ?? [];
  const categories = allCategories.filter((c) => c.name.toLowerCase() !== DRINKS_CATEGORY_NAME);
  
  const [activeCat, setActiveCat] = useState<string | null>(null);
  
  // Set initial category once loaded
  if (!activeCat && categories.length > 0) {
    setActiveCat(categories[0].id);
  }

  const { data: paginatedData, loading: paginatedLoading } = useQuery(GET_PAGINATED_MENU_ITEMS, {
    variables: { 
      limit: 8, 
      offset: page * 8, 
      search: searchQuery || null, 
      categoryId: activeCat || null,
      restaurantId: menuData?.menu?.restaurantId
    },
    skip: !activeCat || !menuData?.menu?.restaurantId,
    fetchPolicy: 'cache-and-network'
  });

  const handleCategoryChange = (id: string) => {
    setActiveCat(id);
    setPage(0);
  };
"""

content = re.sub(
    r'const \{ data, loading, error \} = useQuery\(GET_MENU, \{.*?\n  const activeCategory = categories\.find\(\(c\) => c\.id === activeCat\) \?\? categories\[0\];',
    state_and_queries.strip(),
    content,
    flags=re.DOTALL
)

# 3. Add Search Bar UI
search_ui = """
        {/* Search Bar */}
        <div className="mx-auto mt-8 max-w-md animate-fade-in-up">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder={t('searchMenu') || "Search menu..."} 
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(0); }}
              className="w-full rounded-full border-2 border-border bg-card py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
            />
          </div>
        </div>
"""

content = content.replace(
    "</h2>\n        </div>",
    "</h2>\n        </div>\n" + search_ui
)

# 4. Replace onClick in category buttons
content = content.replace(
    "onClick={() => setActiveCat(cat.id)}",
    "onClick={() => handleCategoryChange(cat.id)}"
)
content = content.replace(
    "const isActive = activeCategory?.id === cat.id;",
    "const isActive = activeCat === cat.id;"
)

# 5. Replace items grid and add pagination
grid_replacement = """
            {/* Items grid */}
            {paginatedLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : paginatedData?.paginatedMenuItems?.items.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">No items found matching your search.</div>
            ) : (
              <>
                <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in-up">
                  {paginatedData?.paginatedMenuItems?.items.map((item: any) => (
                    <li
                      key={item.id}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      {/* Image */}
                      <div className="relative h-44 overflow-hidden bg-muted">
                        <img
                          src={item.imageUrl || `/img/menu-placeholder.jpg`}
                          alt={item.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      {/* Content */}
                      <div className="flex flex-1 flex-col p-4">
                        <div className="flex items-baseline justify-between gap-2">
                          <h3 className="font-display text-base font-semibold text-foreground leading-tight">
                            {locale === 'am' && item.nameAm ? item.nameAm : item.name}
                          </h3>
                          <span className="shrink-0 text-sm font-bold text-primary">{formatPrice(item.price)}</span>
                        </div>
                        <p className="mt-1.5 flex-1 text-xs italic text-muted-foreground line-clamp-2">
                          {locale === 'am' && item.descriptionAm ? item.descriptionAm.trim() : (item.description?.trim() || '\u00a0')}
                        </p>
                        <button
                          id={`add-to-cart-${item.id}`}
                          onClick={() => {
                            setTableId(DEFAULT_DEMO_TABLE_ID);
                            addItem({
                              id: item.id,
                              name: item.name,
                              price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
                              imageUrl: item.imageUrl ?? undefined,
                            });
                            toast.success(`${item.name} added to cart!`);
                          }}
                          className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                          {t('addToCart')}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                
                {/* Pagination Controls */}
                {paginatedData?.paginatedMenuItems?.totalCount > 8 && (
                  <div className="mt-10 flex items-center justify-center gap-4 animate-fade-in-up">
                    <button 
                      disabled={page === 0} 
                      onClick={() => setPage(p => p - 1)} 
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:opacity-50 shadow-sm"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="text-sm font-semibold text-muted-foreground">
                      Page {page + 1} of {Math.ceil(paginatedData.paginatedMenuItems.totalCount / 8)}
                    </span>
                    <button 
                      disabled={(page + 1) * 8 >= paginatedData.paginatedMenuItems.totalCount} 
                      onClick={() => setPage(p => p + 1)} 
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:opacity-50 shadow-sm"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </>
            )}
"""

content = re.sub(
    r'\{\/\* Items grid \*\/}.*?</ul>\s*\)}',
    grid_replacement.strip(),
    content,
    flags=re.DOTALL
)

# 6. Fix `loading` to `menuLoading` and `error` to `menuError` in the initial check
content = content.replace("{loading ? (", "{menuLoading ? (")
content = content.replace(": error ? (", ": menuError ? (")

with open('apps/web/components/home-menu-section.tsx', 'w') as f:
    f.write(content)

