import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: number;
  productCode?: string;
  name: string;
  price: number;
  description: string;
  stock: number;
  createdAt: string;
}

export default function ProductManage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [langTab, setLangTab] = useState('en');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [inStockFilter, setInStockFilter] = useState('ALL');
  const [isDiscountedFilter, setIsDiscountedFilter] = useState('ALL');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const storeId = localStorage.getItem('storeId') || 'ALL';
      let url = `/api/products?storeId=${storeId}&page=${page}&limit=10`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (statusFilter !== 'ALL') url += `&status=${statusFilter}`;
      if (inStockFilter !== 'ALL') url += `&inStock=${inStockFilter}`;
      if (isDiscountedFilter !== 'ALL') url += `&isDiscounted=${isDiscountedFilter}`;
      if (minPrice) url += `&minPrice=${minPrice}`;
      if (maxPrice) url += `&maxPrice=${maxPrice}`;
      const res = await fetch(url);
      const json = await res.json();
      setProducts(json.data || []);
      if (json.pagination) {
        setTotalPages(json.pagination.totalPages);
        setTotalCount(json.pagination.total);
      }
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1); // Reset page on filter change
  }, [search, statusFilter, inStockFilter, isDiscountedFilter, minPrice, maxPrice]);

  useEffect(() => {
    fetchProducts();
  }, [page, search, statusFilter, inStockFilter, isDiscountedFilter, minPrice, maxPrice]);

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map(p => p.id)));
    }
  };

  const toggleSelect = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleBulkStatusChange = async (newStatus: 'ACTIVE' | 'INACTIVE') => {
    if (selectedIds.size === 0) return;
    try {
      setLoading(true);
      const promises = Array.from(selectedIds).map(id =>
        fetch(`/api/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        })
      );
      await Promise.all(promises);
      setSelectedIds(new Set());
      fetchProducts();
    } catch (err) {
      console.error('Failed to change product status', err);
      setLoading(false);
    }
  };

  return (
    <>
      <section className="admin-panel" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, marginBottom: '1rem' }}>Product Search</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
          <input 
            type="text" 
            placeholder="Search by product name or code (SKU)..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '0.8rem 1.2rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-panel)', color: 'var(--text-main)', width: '100%', fontSize: '1rem', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Status</label>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-panel)', color: 'var(--text-main)' }}>
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Stock</label>
              <select value={inStockFilter} onChange={e => setInStockFilter(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-panel)', color: 'var(--text-main)' }}>
                <option value="ALL">All Stock</option>
                <option value="true">In Stock</option>
                <option value="false">Out of Stock</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Discounted</label>
              <select value={isDiscountedFilter} onChange={e => setIsDiscountedFilter(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-panel)', color: 'var(--text-main)' }}>
                <option value="ALL">All Products</option>
                <option value="true">Discounted Only</option>
                <option value="false">No Discount</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '200px', display: 'flex', gap: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Min Price ($)</label>
                <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="0" style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-panel)', color: 'var(--text-main)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Max Price ($)</label>
                <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Max" style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-panel)', color: 'var(--text-main)' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="admin-panel product-list-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>Product Inventory</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)' }}>Total: {totalCount} products</span>
            {selectedIds.size > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => handleBulkStatusChange('INACTIVE')} style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-panel)', color: 'var(--text-main)', cursor: 'pointer' }}>
                  Deactivate ({selectedIds.size})
                </button>
                <button onClick={() => handleBulkStatusChange('ACTIVE')} style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: 'none', background: 'var(--lg-red)', color: '#fff', cursor: 'pointer' }}>
                  Activate ({selectedIds.size})
                </button>
              </div>
            )}
          </div>
        </div>
        {loading ? (
          <p>Loading products from database...</p>
        ) : (
          <div className="table-wrapper">
            <table className="product-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input 
                      type="checkbox" 
                      checked={products.length > 0 && selectedIds.size === products.length} 
                      onChange={toggleSelectAll} 
                    />
                  </th>
                  <th>ID</th>
                  <th>Product Code</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Date Added</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center">No products found. Add one!</td>
                  </tr>
                ) : (
                  products.map(p => (
                    <tr key={p.id} className="hover-row">
                      <td onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={selectedIds.has(p.id)} 
                          onChange={() => toggleSelect(p.id)} 
                        />
                      </td>
                      <td onClick={() => navigate(`/products/${p.id}`)} style={{ cursor: 'pointer' }}>#{p.id}</td>
                      <td onClick={() => navigate(`/products/${p.id}`)} style={{ color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer' }}>{p.productCode || '-'}</td>
                      <td onClick={() => navigate(`/products/${p.id}`)} className="fw-bold" style={{ cursor: 'pointer' }}>{p.name}</td>
                      <td onClick={() => navigate(`/products/${p.id}`)} style={{ cursor: 'pointer' }}>
                        <span className={(p as any).status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}>
                          {(p as any).status || 'ACTIVE'}
                        </span>
                      </td>
                      <td onClick={() => navigate(`/products/${p.id}`)} style={{ cursor: 'pointer' }}>${p.price.toLocaleString()}</td>
                      <td onClick={() => navigate(`/products/${p.id}`)} style={{ cursor: 'pointer' }}>
                        <span className={p.stock > 10 ? 'badge-success' : 'badge-warning'}>
                          {p.stock}
                        </span>
                      </td>
                      <td onClick={() => navigate(`/products/${p.id}`)} style={{ cursor: 'pointer' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    background: page === 1 ? 'var(--bg-card)' : 'var(--bg-panel)',
                    color: page === 1 ? 'var(--text-muted)' : 'var(--text-main)',
                    cursor: page === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Previous
                </button>
                <span style={{ display: 'flex', alignItems: 'center', padding: '0 0.5rem' }}>
                  Page {page} of {totalPages}
                </span>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    background: page === totalPages ? 'var(--bg-card)' : 'var(--bg-panel)',
                    color: page === totalPages ? 'var(--text-muted)' : 'var(--text-main)',
                    cursor: page === totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
}
