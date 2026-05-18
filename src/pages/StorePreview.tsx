import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { showSuccessToast, showErrorToast, triggerConfetti } from '../utils/uiHelpers';

export default function StorePreview() {
  const [locale, setLocale] = useState('au');
  const [storeId, setStoreId] = useState('003');
  const [isLoading, setIsLoading] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [promoSuccessDetails, setPromoSuccessDetails] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    const handleShowModal = (e: any) => {
      setPromoSuccessDetails(e.detail);
      triggerConfetti();
    };
    window.addEventListener('show-promo-success-modal', handleShowModal as any);
    return () => window.removeEventListener('show-promo-success-modal', handleShowModal as any);
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const queryLocale = searchParams.get('locale');
    const queryCategoryId = searchParams.get('categoryId');

    if (queryCategoryId) {
      setCategoryId(queryCategoryId);
    }

    if (queryLocale) {
      const shortLocale = queryLocale.substring(0, 2).toLowerCase();
      setLocale(shortLocale);
      
      // Fetch storeId dynamically from backend
      fetch('/api/stores')
        .then(res => res.json())
        .then(stores => {
          const store = stores.find((s: any) => s.timezone && s.timezone.toLowerCase() === shortLocale.toLowerCase());
          if (store) {
            setStoreId(store.id);
          } else {
            setStoreId('UNKNOWN');
          }
        })
        .catch(err => {
          console.error("Failed to fetch stores for StorePreview", err);
          setStoreId('UNKNOWN');
        });
    } else {
      const currentStore = localStorage.getItem('storeId') || 'ALL';
      let newLocale = 'au';
      
      if (currentStore === '001') newLocale = 'kr';
      if (currentStore === '002') newLocale = 'us';
      if (currentStore === '003') newLocale = 'au';
      
      if (currentStore !== 'ALL') {
        setStoreId(currentStore);
      }
      setLocale(newLocale);
    }
  }, [location.search]);

  // Listen for the iframe telling us it has loaded products
  useEffect(() => {
    const handleIframeMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'storefront-products-loaded') {
        const pending = localStorage.getItem('pending-ai-promo');
        if (pending) {
          try {
            const detail = JSON.parse(pending);
            localStorage.removeItem('pending-ai-promo');
            
            // Wait 1 second for dramatic effect after products finish loading
            setTimeout(() => {
              const iframe = document.getElementById('store-preview-iframe') as HTMLIFrameElement;
              if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage({ type: 'ai-action-apply', detail }, '*');
              }
            }, 1000);
          } catch (e) {
            console.error("Failed to parse pending promo:", e);
          }
        }
      }
    };
    
    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, []);

  const handleSyncToPreview = async () => {
    if (!window.confirm(`Are you sure you want to sync LIVE data to the PREVIEW environment?\nThis will overwrite all current preview data for ${locale.toUpperCase()}.`)) return;
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/preview/sync-to-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseStore: storeId })
      });
      const data = await res.json();
      showSuccessToast(data.message || 'Synced successfully.');
      // Iframe 갱신
      const iframe = document.getElementById('store-preview-iframe') as HTMLIFrameElement;
      if (iframe) iframe.src = iframe.src;
    } catch (err) {
      console.error(err);
      showErrorToast('An error occurred while syncing.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishToLive = async () => {
    if (!window.confirm(`🚨 Are you sure you want to PUBLISH the PREVIEW data to the LIVE store (${locale.toUpperCase()})?\nThis will immediately affect real customers!`)) return;
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/preview/publish-to-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseStore: storeId })
      });
      const data = await res.json();
      localStorage.removeItem('pending-ai-promo');
      triggerConfetti();
      setShowPublishModal(true);
    } catch (err) {
      console.error(err);
      showErrorToast('An error occurred while publishing.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 130px)', width: '100%', marginTop: '1.5rem', overflow: 'hidden', borderRadius: '8px', border: '1px solid #eee' }}>
      
      {/* 미리보기 컨트롤 패널 */}
      <div style={{ 
        padding: '1rem 2rem', 
        background: '#fff', 
        borderBottom: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#333' }}>
            👀 Live Store Preview (<span style={{ color: '#E81123' }}>{locale.toUpperCase()}</span>)
          </h2>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#666' }}>
            Preview your changes here before publishing to the live server.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={handleSyncToPreview}
            disabled={isLoading}
            style={{
              padding: '0.6rem 1.2rem',
              background: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            🔄 Sync from Live
          </button>
          
          <button 
            onClick={handlePublishToLive}
            disabled={isLoading}
            style={{
              padding: '0.6rem 1.2rem',
              background: '#E81123',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 6px rgba(232, 17, 35, 0.2)'
            }}
          >
            🚀 Publish to Live
          </button>
        </div>
      </div>

      {/* Astro Storefront Iframe */}
      <div style={{ flex: 1, position: 'relative' }}>
        {promoSuccessDetails && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 9999,
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: '12px', padding: '24px', width: '400px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              animation: 'slideUp 0.3s ease-out',
              position: 'relative'
            }}>
              {/* Close Button */}
              <button 
                onClick={() => setPromoSuccessDetails(null)}
                style={{
                  position: 'absolute', top: '16px', right: '16px',
                  background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b'
                }}
              >✕</button>

              <div style={{ color: '#166534', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                Deployment Successful
              </div>
              
              <p style={{ fontSize: '0.95rem', marginBottom: '24px', color: '#14532d', lineHeight: '1.5' }}>
                Promotion <strong style={{ color: '#065f46' }}>[{promoSuccessDetails.promotionId}]</strong> applied to {promoSuccessDetails.affectedCount?.toLocaleString() || 1} item(s) in {promoSuccessDetails.target}.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button style={{ width: '100%', padding: '10px', background: 'white', border: '1px solid #94a3b8', borderRadius: '6px', fontSize: '0.9rem', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '500', transition: 'all 0.2s' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                  Download Excel List ({promoSuccessDetails.affectedCount || 1})
                </button>
                <button style={{ width: '100%', padding: '10px', background: '#b90e1c', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(185, 14, 28, 0.2)' }} onClick={() => {
                  setPromoSuccessDetails(null);
                  window.location.href = '/admin/promotions';
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                  View list in Promotion Admin
                </button>
              </div>
            </div>
          </div>
        )}
        {isLoading && (
          <div style={{ 
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(255,255,255,0.7)', 
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 20 
          }}>
            <h3 style={{ color: '#E81123' }}>Processing...</h3>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)', width: '100%', padding: '1rem', boxSizing: 'border-box', background: '#f1f5f9' }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%', 
            width: '100%', 
            borderRadius: '12px', 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 15px rgba(0,0,0,0.05)',
            border: '1px solid #cbd5e1',
            overflow: 'hidden',
            background: '#fff'
          }}>
            <div style={{ 
              background: '#e2e8f0', 
              padding: '12px 16px', 
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderBottom: '1px solid #cbd5e1'
            }}>
              {/* Fake window buttons */}
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }} />
              <div style={{ flex: 1, textAlign: 'center', color: '#1e293b', fontSize: '0.95rem', fontWeight: 800, letterSpacing: '1px' }}>
                LIVE STORE PREVIEW
              </div>
              <div style={{ width: '52px' }}></div> {/* Spacer to center the text */}
            </div>
            <iframe 
              id="store-preview-iframe"
              src={`${(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:4321' : (import.meta.env.VITE_STOREFRONT_URL || 'https://lg-ai-commerce.jeongbo83.workers.dev')}/${locale}/${categoryId ? 'products?categoryId=' + categoryId : ''}`}
              title="Storefront Live Preview"
              style={{ width: '100%', flex: 1, border: 'none', background: '#fff' }}
              onLoad={(e) => {
                const iframe = e.target as HTMLIFrameElement;
                const pendingPromoStr = localStorage.getItem('pending-ai-promo');
                if (pendingPromoStr && iframe.contentWindow) {
                  try {
                    const pendingPromo = JSON.parse(pendingPromoStr);
                    setTimeout(() => {
                      iframe.contentWindow?.postMessage({ type: 'ai-action-apply', detail: pendingPromo }, '*');
                    }, 800);
                  } catch (err) {
                    console.error("Failed to parse pending-ai-promo", err);
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Publish Success Modal (Plan B variant) */}
      {showPublishModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            background: 'rgba(30, 30, 30, 0.95)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '16px',
            padding: '2.5rem',
            textAlign: 'center',
            color: 'white',
            maxWidth: '400px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            animation: 'slideUp 0.4s ease-out'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌍✨</div>
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #4ade80, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Live published successfully!
            </h2>
            <p style={{ margin: '0 0 2rem 0', color: '#9ca3af', fontSize: '0.95rem', lineHeight: '1.5' }}>
              The storefront for <strong>{locale.toUpperCase()}</strong> has been fully synchronized and is now live to all customers.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={() => setShowPublishModal(false)}
                style={{
                  padding: '0.75rem 1.5rem', background: 'transparent', color: '#cbd5e1',
                  border: '1px solid #475569', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
                }}>
                Close
              </button>
              <button 
                onClick={() => {
                  setShowPublishModal(false);
                  window.open(`http://localhost:4321/${locale}/`, '_blank');
                }}
                style={{
                  padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #E81123, #b90e1c)', color: 'white',
                  border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold',
                  boxShadow: '0 4px 14px rgba(232, 17, 35, 0.4)'
                }}>
                View Storefront ↗
              </button>
            </div>
          </div>
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
          `}</style>
        </div>
      )}
    </div>
  );
}
