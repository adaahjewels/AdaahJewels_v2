/**
 * ProductList.jsx
 *
 * Fixes applied:
 * 1. Reads ?category= and ?search= from URL on mount and when URL changes
 * 2. Passes categoryId (number) to backend — matches /api/products?categoryId=N
 * 3. Passes materialType and search strings correctly
 * 4. Debounces search so we don't hit the server on every keystroke
 * 5. Updates URL params when filters change (shareable links)
 * 6. Uses category slug/id lookup so the backend filter actually works
 */
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import { getProducts } from '../services/productService';
import { getCategories } from '../services/categoryService';

/* ── tiny debounce helper ─────────────────────────────────────── */
const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const SORT_OPTIONS = [
  { value: 'default',    label: 'Default' },
  { value: 'price-low',  label: 'Price: Low → High' },
  { value: 'price-high', label: 'Price: High → Low' },
  { value: 'rating',     label: 'Highest Rated' },
];

const PRICE_RANGES = [
  { label: 'All Prices',    min: null, max: null },
  { label: 'Under ₹500',   min: 0,    max: 500  },
  { label: '₹500 – ₹1000', min: 500,  max: 1000 },
  { label: '₹1000 – ₹2000',min: 1000, max: 2000 },
  { label: 'Above ₹2000',  min: 2000, max: null  },
];

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  /* ── raw filter state (driven by URL) ──────────────────── */
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');
  const [searchInput,    setSearchInput]    = useState(searchParams.get('search')   || '');
  const [minPrice,       setMinPrice]       = useState(searchParams.get('minPrice') || '');
  const [maxPrice,       setMaxPrice]       = useState(searchParams.get('maxPrice') || '');
  const [materialFilter, setMaterialFilter] = useState(searchParams.get('material') || '');
  const [sortBy,         setSortBy]         = useState(searchParams.get('sort')     || 'default');

  /* ── debounce search so API isn't called on every keystroke */
  const debouncedSearch = useDebounce(searchInput, 400);

  /* ── data state ─────────────────────────────────────────── */
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]); // full category objects
  const [materials,  setMaterials]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  /* ── keep URL in sync ───────────────────────────────────── */
  useEffect(() => {
    const params = {};
    if (categoryFilter)    params.category = categoryFilter;
    if (debouncedSearch)   params.search   = debouncedSearch;
    if (minPrice)          params.minPrice = minPrice;
    if (maxPrice)          params.maxPrice = maxPrice;
    if (materialFilter)    params.material = materialFilter;
    if (sortBy !== 'default') params.sort  = sortBy;
    setSearchParams(params, { replace: true });
  }, [categoryFilter, debouncedSearch, minPrice, maxPrice, materialFilter, sortBy]);

  /* ── load categories once (parents + all subcategories) ─── */
  useEffect(() => {
    Promise.all([
      getCategories(),
      import('../api/apiClient').then(m => m.default.get('/subcategories/admin')).then(r => Array.isArray(r.data) ? r.data : []).catch(() => []),
    ]).then(([parents, subs]) => {
      // Merge top-level + subcategories so the sidebar shows both levels
      const all = [
        ...parents,
        ...subs.map(s => ({ ...s, parent_id: s.parent_id || s.parentId })),
      ];
      setCategories(all);
    }).catch(() => setCategories([]));
  }, []);

  /* ── load products whenever filters or categories change ── */
  // Categories must be included so the category-name→id lookup works
  useEffect(() => {
    loadProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, debouncedSearch, minPrice, maxPrice, materialFilter, categories]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Build the categoryId(s) to pass to the backend.
      // The Home page links use top-level category names (e.g. "Rings").
      // Products belong to SUBcategories.  So:
      //   1. Check if the filter matches a top-level category → collect all child subcategory IDs
      //   2. Also check if it directly matches a subcategory
      //   3. Fall back to null (no filter) if nothing matches
      let categoryId = null;

      if (categoryFilter) {
        const filterLower = categoryFilter.toLowerCase();

        // Check top-level categories
        const parentMatch = categories.find(c =>
          (c.name || c.CategoryName || '').toLowerCase() === filterLower ||
          String(c.id || c.CategoryId) === categoryFilter
        );

        if (parentMatch) {
          // It's a top-level category — we need to pass parent_id filter.
          // The backend /api/products?categoryId=N filters by subcategory id.
          // Use parent_id query on subcategories endpoint to get child ids, then
          // pass the first child (or all via multiple calls).
          // Simpler: pass the parent's id as categoryId — the stored procedure
          // `sp_get_products` already does a JOIN through subcategories that
          // includes parent_category_id. We pass the PARENT id and handle it
          // by also fetching all products and client-side filtering by parent name.
          categoryId = parentMatch.id || parentMatch.CategoryId;

          // Fetch all products and filter client-side by parent_category_name
          const data = await getProducts({ search: debouncedSearch || null });
          const all = Array.isArray(data) ? data : [];

          const filtered = all.filter(p => {
            const pParent = (p.parent_category_name || p.CategoryName || p.category || '').toLowerCase();
            const pSub    = (p.subcategory_name || p.SubcategoryName || '').toLowerCase();
            return pParent.includes(filterLower) || pSub.includes(filterLower) || String(p.parent_category_id) === String(categoryId);
          });

          // Apply price + material filters
          const withMaterial = materialFilter
            ? filtered.filter(p => (p.material_type || p.Material || '').toLowerCase() === materialFilter.toLowerCase())
            : filtered;
          const withPrice = (minPrice || maxPrice)
            ? withMaterial.filter(p => {
                const pr = Number(p.price || p.Price || 0);
                return (!minPrice || pr >= Number(minPrice)) && (!maxPrice || pr <= Number(maxPrice));
              })
            : withMaterial;

          const sorted = sortItems([...withPrice], sortBy);
          setProducts(sorted);
          setMaterials([...new Set(sorted.map(p => p.material_type || p.Material).filter(Boolean))].sort());
          setLoading(false);
          return;
        }

        // Direct subcategory match
        const subMatch = categories.find(c =>
          c.parent_id && (
            (c.name || c.CategoryName || '').toLowerCase() === filterLower ||
            String(c.id || c.CategoryId) === categoryFilter
          )
        );
        if (subMatch) {
          categoryId = subMatch.id || subMatch.CategoryId;
        }
      }

      const items = await getProducts({
        categoryId,
        materialType: materialFilter || null,
        minPrice:     minPrice  ? Number(minPrice)  : null,
        maxPrice:     maxPrice  ? Number(maxPrice)  : null,
        search:       debouncedSearch || null,
      });

      const sorted = sortItems(Array.isArray(items) ? items : [], sortBy);
      setProducts(sorted);
      setMaterials([...new Set(sorted.map(p => p.material_type || p.Material).filter(Boolean))].sort());
    } catch (err) {
      console.error('loadProducts error:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  /* ── re-sort in place when sortBy changes (no extra fetch) ─ */
  useEffect(() => {
    setProducts(prev => sortItems([...prev], sortBy));
  }, [sortBy]);

  const sortItems = (items, sort) => {
    switch (sort) {
      case 'price-low':
        return items.sort((a, b) => (a.price || a.Price || 0) - (b.price || b.Price || 0));
      case 'price-high':
        return items.sort((a, b) => (b.price || b.Price || 0) - (a.price || a.Price || 0));
      case 'rating':
        return items.sort((a, b) => (b.AverageRating || b.rating || 0) - (a.AverageRating || a.rating || 0));
      default:
        return items;
    }
  };

  const clearFilters = () => {
    setCategoryFilter('');
    setSearchInput('');
    setMinPrice('');
    setMaxPrice('');
    setMaterialFilter('');
    setSortBy('default');
    setSearchParams({}, { replace: true });
  };

  const activePriceRange = PRICE_RANGES.find(
    r => String(r.min ?? '') === minPrice && String(r.max ?? '') === maxPrice
  ) || PRICE_RANGES[0];

  const pageTitle = categoryFilter
    ? categories.find(c => (c.name || c.CategoryName || '').toLowerCase() === categoryFilter.toLowerCase())?.name || categoryFilter
    : debouncedSearch
      ? `Results for "${debouncedSearch}"`
      : 'All Products';

  return (
    <div className="min-h-screen py-8 md:py-12" style={{ background: 'var(--color-cream-100)' }}>
      <div className="container mx-auto px-4">

        {/* Page heading + mobile filter toggle */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold" style={{ color: 'var(--color-ink)' }}>
              {pageTitle}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-ink-muted)' }}>
              {loading ? 'Loading…' : `${products.length} product${products.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: 'white', border: '1px solid var(--color-brand-200)', color: 'var(--color-ink)' }}
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>

        {/* Inline search bar */}
        <div className="relative mb-6 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-brand-400)' }} />
          <input
            type="text"
            placeholder="Search products…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none"
            style={{ border: '1.5px solid var(--color-brand-200)', background: 'white', color: 'var(--color-ink)' }}
          />
          {searchInput && (
            <button onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4" style={{ color: 'var(--color-ink-muted)' }} />
            </button>
          )}
        </div>

        <div className="flex gap-8">

          {/* Mobile filter drawer */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ opacity: 0, x: -260 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -260 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-y-0 left-0 w-72 z-50 overflow-y-auto md:hidden"
                style={{ background: 'white', boxShadow: '4px 0 24px rgba(0,0,0,0.12)' }}
              >
                <div className="flex items-center justify-between p-5"
                  style={{ borderBottom: '1px solid var(--color-brand-100)' }}>
                  <span className="font-bold text-lg" style={{ color: 'var(--color-ink)' }}>Filters</span>
                  <button onClick={() => setShowFilters(false)}>
                    <X className="w-5 h-5" style={{ color: 'var(--color-ink-muted)' }} />
                  </button>
                </div>
                <div className="p-5">
                  <FilterContent
                    categories={categories}
                    materials={materials}
                    categoryFilter={categoryFilter}
                    setCategoryFilter={v => { setCategoryFilter(v); setShowFilters(false); }}
                    materialFilter={materialFilter}
                    setMaterialFilter={setMaterialFilter}
                    priceRanges={PRICE_RANGES}
                    activePriceRange={activePriceRange}
                    onPriceChange={(r) => { setMinPrice(r.min != null ? String(r.min) : ''); setMaxPrice(r.max != null ? String(r.max) : ''); }}
                    clearFilters={() => { clearFilters(); setShowFilters(false); }}
                  />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
          {showFilters && (
            <div className="fixed inset-0 z-40 md:hidden bg-black/40"
              onClick={() => setShowFilters(false)} />
          )}

          {/* Desktop sidebar */}
          <aside className="hidden md:block w-60 shrink-0">
            <div className="sticky top-24 rounded-2xl p-5"
              style={{ background: 'white', border: '1px solid var(--color-brand-100)', boxShadow: 'var(--shadow-sm)' }}>
              <p className="font-bold text-base mb-4" style={{ color: 'var(--color-ink)' }}>Filters</p>
              <FilterContent
                categories={categories}
                materials={materials}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                materialFilter={materialFilter}
                setMaterialFilter={setMaterialFilter}
                priceRanges={PRICE_RANGES}
                activePriceRange={activePriceRange}
                onPriceChange={(r) => { setMinPrice(r.min != null ? String(r.min) : ''); setMaxPrice(r.max != null ? String(r.max) : ''); }}
                clearFilters={clearFilters}
              />
            </div>
          </aside>

          {/* Products grid */}
          <main className="flex-1 min-w-0">

            {/* Sort bar */}
            <div className="flex items-center justify-between mb-5 px-4 py-3 rounded-xl"
              style={{ background: 'white', border: '1px solid var(--color-brand-100)' }}>
              <span className="text-sm font-medium" style={{ color: 'var(--color-ink-muted)' }}>Sort by</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="text-sm font-semibold focus:outline-none bg-transparent"
                style={{ color: 'var(--color-ink)' }}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[...Array(6)].map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-lg font-medium mb-4" style={{ color: 'var(--color-ink-muted)' }}>
                  No products found
                </p>
                <button onClick={clearFilters}
                  className="text-sm font-semibold underline"
                  style={{ color: 'var(--color-brand-600)' }}>
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {products.map((product, idx) => (
                  <motion.div key={product.id || product.ProductId}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, delay: Math.min(idx * 0.04, 0.4) }}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

/* ── Reusable filter sidebar content ──────────────────────────── */
const FilterContent = ({
  categories, materials,
  categoryFilter, setCategoryFilter,
  materialFilter, setMaterialFilter,
  priceRanges, activePriceRange, onPriceChange,
  clearFilters,
}) => (
  <div className="space-y-6">

    {/* Category — show parents then their children indented */}
    <div>
      <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-ink-muted)' }}>Category</p>
      <div className="space-y-1.5">
        <RadioOption
          checked={categoryFilter === ''}
          onChange={() => setCategoryFilter('')}
          label="All Categories"
        />
        {categories
          .filter(c => !c.parent_id)   // top-level first
          .map(parent => {
            const parentName = parent.name || parent.CategoryName || '';
            const children   = categories.filter(c => c.parent_id && String(c.parent_id) === String(parent.id || parent.CategoryId));
            return (
              <div key={parent.id || parent.CategoryId}>
                <RadioOption
                  checked={categoryFilter.toLowerCase() === parentName.toLowerCase()}
                  onChange={() => setCategoryFilter(parentName)}
                  label={parentName}
                  bold
                />
                {children.map(child => {
                  const childName = child.name || child.CategoryName || '';
                  return (
                    <div key={child.id || child.CategoryId} className="pl-4">
                      <RadioOption
                        checked={categoryFilter.toLowerCase() === childName.toLowerCase()}
                        onChange={() => setCategoryFilter(childName)}
                        label={childName}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
      </div>
    </div>

    {/* Price */}
    <div>
      <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-ink-muted)' }}>Price</p>
      <div className="space-y-1.5">
        {priceRanges.map(range => (
          <RadioOption
            key={range.label}
            name="price"
            checked={activePriceRange?.label === range.label}
            onChange={() => onPriceChange(range)}
            label={range.label}
          />
        ))}
      </div>
    </div>

    {/* Material */}
    {materials.length > 0 && (
      <div>
        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-ink-muted)' }}>Material</p>
        <div className="space-y-1.5">
          <RadioOption
            name="material"
            checked={materialFilter === ''}
            onChange={() => setMaterialFilter('')}
            label="All Materials"
          />
          {materials.map(mat => (
            <RadioOption
              key={mat}
              name="material"
              checked={materialFilter === mat}
              onChange={() => setMaterialFilter(mat)}
              label={mat}
            />
          ))}
        </div>
      </div>
    )}

    <button
      onClick={clearFilters}
      className="w-full py-2 text-sm font-semibold rounded-xl transition-colors"
      style={{ border: '1.5px solid var(--color-brand-300)', color: 'var(--color-brand-600)' }}
    >
      Clear All
    </button>
  </div>
);

const RadioOption = ({ checked, onChange, label, name, bold }) => (
  <label className="flex items-center gap-2.5 cursor-pointer group">
    <div
      className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors"
      style={{
        borderColor: checked ? 'var(--color-brand-500)' : 'var(--color-neutral-300)',
        background: checked ? 'var(--color-brand-500)' : 'transparent',
      }}
    >
      {checked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
    </div>
    <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
    <span className={`text-sm transition-colors ${bold ? 'font-semibold' : ''}`}
      style={{ color: checked ? 'var(--color-brand-700)' : 'var(--color-ink-secondary)' }}>
      {label}
    </span>
  </label>
);

export default ProductList;
