import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AiAgentSidebar from '../components/AiAgentSidebar';
import { useTranslation } from '../contexts/TranslationContext';
import '../App.css'; // Global styles
import '../ai-agent.css'; // AI Agent specific styles

interface Store {
  id: string;
  name: string;
  currency: string;
}

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, locale, setLocale } = useTranslation();
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    // Fetch stores for the region selector
    fetch('/api/stores?limit=100')
      .then(res => res.json())
      .then(json => {
        if (Array.isArray(json)) {
          setStores(json);
        } else if (json && json.data) {
          setStores(json.data);
        }
      })
      .catch(console.error);
  }, []);

  // 토큰이 없으면 로그인 페이지로 강제 이동 (보안 라우팅)
  const token = localStorage.getItem('adminToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRole');
    navigate('/login');
  };

  const adminRole = (localStorage.getItem('adminRole') || '').replace(/"/g, '').trim();
  const isSuperAdmin = adminRole === 'SUPER_ADMIN';
  console.log(isSuperAdmin);
  return (
    <div style={{ display: 'flex', height: '111.111vh', width: '111.111vw', overflow: 'hidden', transform: 'scale(0.9)', transformOrigin: 'top left' }}>
      {/* 🚀 AI Agent Sidebar on the left 🚀 */}
      <AiAgentSidebar />

      <div className="admin-container" style={{ flex: 1, overflowY: 'auto', padding: '2rem 1.5rem', boxSizing: 'border-box' }}>
        <header className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <svg viewBox="0 0 225 99" fill="none" style={{ height: '36px', width: 'auto' }}>
              <g clipPath="url(#clip0_415_130964)">
                <path d="M134.874 68.7831H165.274V81.2487H120.202V17.2373H134.874V68.7831Z" fill="#707070"/>
                <path d="M197.534 56.8451H209.482V68.0462C207.288 68.8892 202.987 69.7323 198.905 69.7323C185.694 69.7323 181.301 62.9711 181.301 49.241C181.301 36.1374 185.483 28.4265 198.682 28.4265C206.039 28.4265 210.213 30.7533 213.675 35.1904L222.802 26.7376C217.227 18.726 207.5 16.2981 198.365 16.2981C177.83 16.2897 167.033 27.5807 167.033 49.1314C167.033 70.5753 176.79 82.2007 198.256 82.2007C208.113 82.2007 217.748 79.6716 222.992 75.9651V44.9078H197.534V56.8451Z" fill="#707070"/>
                <path d="M83.831 84.5045C103.008 65.1736 103.007 33.831 83.829 14.499C64.6508 -4.83307 33.5576 -4.83396 14.3805 14.497C-4.79664 33.8279 -4.79576 65.1705 14.3825 84.5025C33.5607 103.835 64.6538 103.835 83.831 84.5045Z" fill="#A50034"/>
                <path d="M61.1184 66.6079H51.0826V28.5984H47.3721V70.3594H51.0909V70.3341H61.1268L61.1184 66.6079Z" fill="white"/>
                <path d="M86.1485 51.0737H61.1759V47.3447H89.8088C89.8479 48.0669 89.8674 48.7891 89.8674 49.5198C89.8674 71.9725 71.7136 90.1707 49.3252 90.1707C26.9368 90.1707 8.78027 71.9809 8.78027 49.5169C8.78027 27.053 26.9313 8.86597 49.3224 8.86597C49.9134 8.86597 50.5016 8.87814 51.0871 8.9025V12.6034C50.5016 12.5772 49.9153 12.5641 49.328 12.5641C28.9775 12.5641 12.474 29.11 12.474 49.5169C12.474 69.9239 28.9747 86.4726 49.328 86.4726C69.121 86.4726 85.2899 70.8175 86.1457 51.1777L86.1485 51.0737Z" fill="white"/>
                <path d="M34.2066 39.8496C35.3263 39.8441 36.4193 39.5043 37.3476 38.8732C38.276 38.2421 38.9981 37.3479 39.4227 36.3036C39.8474 35.2592 39.9557 34.1114 39.7339 33.005C39.5121 31.8987 38.9701 30.8834 38.1764 30.0872C37.3827 29.2911 36.3728 28.7497 35.2742 28.5316C34.1756 28.3134 33.0374 28.4282 32.0035 28.8614C30.9695 29.2946 30.086 30.0268 29.4645 30.9657C28.8429 31.9046 28.5112 33.008 28.5112 34.1367C28.5131 34.8888 28.6618 35.6331 28.949 36.3273C29.2362 37.0214 29.6563 37.6517 30.1851 38.1822C30.714 38.7127 31.3413 39.133 32.0313 39.4191C32.7213 39.7052 33.4605 39.8515 34.2066 39.8496Z" fill="white"/>
              </g>
              <defs>
                <clipPath id="clip0_415_130964">
                  <rect width="223" height="99" fill="white"/>
                </clipPath>
              </defs>
            </svg>
            <h1 style={{ margin: 0, paddingBottom: 0, fontSize: 'clamp(1rem, 2.5vw, 1.5rem)', whiteSpace: 'nowrap' }}>Global Admin</h1>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <select
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--bg-panel)',
                color: 'var(--text-main)',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
              value={localStorage.getItem('storeId') || 'ALL'}
              onChange={(e) => {
                localStorage.setItem('storeId', e.target.value);
                window.location.reload();
              }}
            >
              <option value="ALL">{t('admin.region.all', '📍 All Regions')}</option>
              {stores.map(store => (
                <option key={store.id} value={store.id}>
                  📍 {store.name}
                </option>
              ))}
            </select>
            <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Link
                to="/"
                style={{
                  color: location.pathname === '/' ? 'var(--accent)' : 'var(--text-muted)',
                  textDecoration: 'none',
                  fontWeight: location.pathname === '/' ? 'bold' : 'normal',
                  transition: 'color 0.2s'
                }}
              >
                {t('admin.menu.dashboard', 'Dashboard')}
              </Link>
              <Link
                to="/stores"
                style={{
                  color: location.pathname === '/stores' ? 'var(--accent)' : 'var(--text-muted)',
                  textDecoration: 'none',
                  fontWeight: location.pathname === '/stores' ? 'bold' : 'normal',
                  transition: 'color 0.2s'
                }}
              >
                {t('admin.menu.stores', 'Stores')}
              </Link>
              <Link
                to="/members"
                style={{
                  color: location.pathname === '/members' ? 'var(--accent)' : 'var(--text-muted)',
                  textDecoration: 'none',
                  fontWeight: location.pathname === '/members' ? 'bold' : 'normal',
                  transition: 'color 0.2s'
                }}
              >
                {t('admin.menu.customers', 'Customers')}
              </Link>
              <Link
                to="/products"
                style={{
                  color: location.pathname === '/products' ? 'var(--accent)' : 'var(--text-muted)',
                  textDecoration: 'none',
                  fontWeight: location.pathname === '/products' ? 'bold' : 'normal',
                  transition: 'color 0.2s'
                }}
              >
                {t('admin.menu.products', 'Products')}
              </Link>
              <Link 
                to="/promotions" 
                style={{ 
                  color: location.pathname.startsWith('/promotions') ? 'var(--accent)' : 'var(--text-muted)',
                  textDecoration: 'none',
                  fontWeight: location.pathname.startsWith('/promotions') ? 'bold' : 'normal',
                  transition: 'color 0.2s'
                }}
              >
                Promotions
              </Link>
              <Link
                to="/orders"
                style={{
                  color: location.pathname === '/orders' ? 'var(--accent)' : 'var(--text-muted)',
                  textDecoration: 'none',
                  fontWeight: location.pathname === '/orders' ? 'bold' : 'normal',
                  transition: 'color 0.2s'
                }}
              >
                {t('admin.menu.orders', 'Orders')}
              </Link>

              <Link
                to="/preview"
                style={{
                  color: location.pathname === '/preview' ? 'var(--lg-red, #a50034)' : 'var(--text-muted)',
                  textDecoration: 'none',
                  fontWeight: location.pathname === '/preview' ? 'bold' : 'normal',
                  transition: 'color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {t('admin.menu.preview', '✨ Live Store Preview')}
              </Link>
              <Link
                to="/security"
                style={{
                  color: location.pathname === '/security' ? '#ef4444' : 'var(--text-muted)',
                  textDecoration: 'none',
                  fontWeight: location.pathname === '/security' ? 'bold' : 'normal',
                  transition: 'color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                🛡️ Security
              </Link>

            </nav>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              style={{
                marginLeft: '1rem',
                padding: '0.4rem',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: 'var(--bg-panel)',
                color: 'var(--text-main)',
                cursor: 'pointer'
              }}
            >
              <option value="en-US">English</option>
              <option value="ko-KR">한국어</option>
            </select>
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontWeight: 500
              }}
              onMouseOver={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#ef4444'; }}
              onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              {t('admin.button.logout', 'Logout')}
            </button>
          </div>
        </header>
        <main className="admin-main" style={{ display: location.pathname === '/preview' ? 'block' : 'grid' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
