import re

with open('apps/web/components/home-drinks-section.tsx', 'r') as f:
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

  const categories: Category[] = menuData?.menu?.categories ?? [];
  const drinksCategory = categories.find((c) => c.name.toLowerCase() === 'drinks');

  const { data: paginatedData, loading: paginatedLoading } = useQuery(GET_PAGINATED_MENU_ITEMS, {
    variables: { 
      limit: 6, 
      offset: page * 6, 
      search: searchQuery || null, 
      categoryId: drinksCategory?.id || null,
      restaurantId: menuData?.menu?.restaurantId
    },
    skip: !drinksCategory?.id || !menuData?.menu?.restaurantId,
    fetchPolicy: 'cache-and-network'
  });
"""

content = re.sub(
    r'const \{ data, loading, error \} = useQuery\(GET_MENU, \{.*?\n  const drinks: DrinkItem\[\] = drinksCategory\?\.items \?\? \[\];',
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
              placeholder={t('searchMenu') || "Search drinks..."} 
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(0); }}
              className="w-full rounded-full border-2 border-border bg-card py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
            />
          </div>
        </div>
"""

content = content.replace(
    "</p>\n        </div>",
    "</p>\n        </div>\n" + search_ui
)

# 4. Replace items grid and add pagination
grid_replacement = """
        {menuLoading ? (
          <div className="mt-16 flex flex-col items-center gap-4 text-center text-muted-foreground">
            <GlassWater className="h-10 w-10 animate-pulse text-primary/40" />
            <p>Loading drinks menu…</p>
          </div>
        ) : menuError ? (
          <div
            className="mx-auto mt-12 max-w-2xl rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6 text-center text-sm text-destructive"
            role="alert"
          >
            Could not load drinks. Ensure the API is running.
          </div>
        ) : !drinksCategory ? (
          <div className="mt-16 text-center text-muted-foreground">
            No drinks category found.
          </div>
        ) : paginatedLoading ? (
          <div className="mt-16 flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : paginatedData?.paginatedMenuItems?.items.length === 0 ? (
          <div className="mt-16 text-center text-muted-foreground">
            No drinks found matching your search.
          </div>
        ) : (
          <>
            <ul
              ref={gridRef}
              className={cn(
                'mt-12 grid gap-6 opacity-0 sm:grid-cols-2 lg:grid-cols-3',
                gridInView && 'animate-fade-in-up',
              )}
            >
              {paginatedData.paginatedMenuItems.items.map((item: any, index: number) => (
                <li
                  key={item.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-muted">
                    <img
                      src={item.imageUrl || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-display text-lg font-semibold text-foreground">
                        {locale === 'am' && item.nameAm ? item.nameAm : item.name}
                      </h3>
                      <span className="shrink-0 text-base font-bold text-primary">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                    {(item.description || item.descriptionAm) && (
                      <p className="mt-2 flex-1 text-sm italic text-muted-foreground line-clamp-2">
                        {locale === 'am' && item.descriptionAm ? item.descriptionAm : item.description}
                      </p>
                    )}
                    <Button
                      id={`order-drink-${item.id}`}
                      className="mt-5 min-h-[44px] w-full gap-2 shadow-sm transition-transform duration-200 active:scale-95"
                      size="lg"
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
                    >
                      <ShoppingCart className="h-4 w-4" aria-hidden />
                      {t('addToCart')}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            
            {/* Pagination Controls */}
            {paginatedData?.paginatedMenuItems?.totalCount > 6 && (
              <div className="mt-10 flex items-center justify-center gap-4 animate-fade-in-up">
                <button 
                  disabled={page === 0} 
                  onClick={() => setPage(p => p - 1)} 
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:opacity-50 shadow-sm"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm font-semibold text-muted-foreground">
                  Page {page + 1} of {Math.ceil(paginatedData.paginatedMenuItems.totalCount / 6)}
                </span>
                <button 
                  disabled={(page + 1) * 6 >= paginatedData.paginatedMenuItems.totalCount} 
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
    r'\{loading \? \(\s*<div className="mt-16 flex flex-col items-center gap-4 text-center text-muted-foreground">.*?\s*\}\s*</div>\s*</section>',
    grid_replacement.strip() + "\n      </div>\n    </section>",
    content,
    flags=re.DOTALL
)

with open('apps/web/components/home-drinks-section.tsx', 'w') as f:
    f.write(content)

