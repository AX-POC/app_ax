import { useState, useEffect } from 'react';
import { showSuccessToast, showErrorToast, triggerConfetti } from '../utils/uiHelpers';

export default function StorePreview() {
  const [locale, setLocale] = useState('au');
  const [storeId, setStoreId] = useState('003');
  const [isLoading, setIsLoading] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
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
              src={window.location.hostname.includes('onrender.com') ? `https://lg-ai-commerce.onrender.com/${locale}/${categoryId ? 'products?categoryId=' + categoryId : ''}` : `http://localhost:4321/${locale}/${categoryId ? 'products?categoryId=' + categoryId : ''}`}
              title="Store Preview"
              style={{ width: '100%', flex: 1, border: 'none', background: '#fff' }}
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
