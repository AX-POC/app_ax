import { useState, useEffect } from 'react';
import { useTranslation } from '../contexts/TranslationContext';

interface Translation {
  id: number;
  system: string;
  screen: string;
  websiteId: string;
  locale: string;
  textKey: string;
  translatedText: string;
}

export default function TranslationManage() {
  const { t, refreshTranslations } = useTranslation();
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [system, setSystem] = useState('ADMIN_FRONT');
  const [screen, setScreen] = useState('COMMON');
  const [websiteId, setWebsiteId] = useState('ADMIN');
  const [locale, setLocale] = useState('en-US');
  const [textKey, setTextKey] = useState('');
  const [translatedText, setTranslatedText] = useState('');

  const fetchTranslations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/translations/admin/list');
      if (res.ok) {
        const data = await res.json();
        setTranslations(data);
      }
    } catch (err) {
      console.error('Failed to fetch translations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTranslations();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/translations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system, screen, websiteId, locale, textKey, translatedText })
      });
      if (res.ok) {
        setShowModal(false);
        fetchTranslations();
        refreshTranslations(); // Refresh global dictionary
      } else {
        alert(t('error.save_failed', 'Failed to save translation'));
      }
    } catch (err) {
      console.error(err);
      alert(t('error.save_error', 'Error saving translation'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('confirm.delete', 'Are you sure you want to delete this translation?'))) return;
    try {
      const res = await fetch(`/api/translations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchTranslations();
        refreshTranslations(); // Refresh global dictionary
      } else {
        alert(t('error.delete_failed', 'Failed to delete translation'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setSystem('ADMIN_FRONT');
    setScreen('COMMON');
    setWebsiteId('ADMIN');
    setLocale('en-US');
    setTextKey('');
    setTranslatedText('');
    setShowModal(true);
  };

  const openEditModal = (t: Translation) => {
    setEditingId(t.id);
    setSystem(t.system);
    setScreen(t.screen);
    setWebsiteId(t.websiteId || 'ADMIN');
    setLocale(t.locale);
    setTextKey(t.textKey);
    setTranslatedText(t.translatedText);
    setShowModal(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{t('admin.menu.translations', 'Translation Management')}</h1>
        <button 
          onClick={openAddModal}
          style={{ padding: '0.5rem 1rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + {t('translation.button.add', 'Add Translation')}
        </button>
      </div>

      <div className="admin-panel" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
        ) : (
          <div className="table-wrapper" style={{ flex: 1, overflowY: 'auto' }}>
            <table className="product-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>{t('translation.column.system', 'System')}</th>
                  <th>{t('translation.column.screen', 'Screen')}</th>
                  <th>{t('translation.column.websiteId', 'Website ID')}</th>
                  <th>{t('translation.column.locale', 'Locale')}</th>
                  <th>{t('translation.column.key', 'Key')}</th>
                  <th>{t('translation.column.text', 'Translated Text')}</th>
                  <th style={{ textAlign: 'right' }}>{t('translation.column.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {translations.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>{t('translation.empty', 'No translations found.')}</td>
                  </tr>
                ) : (
                  translations.map(trans => (
                    <tr key={trans.id}>
                      <td style={{ fontWeight: 'bold' }}>{trans.system}</td>
                      <td>{trans.screen}</td>
                      <td style={{ color: 'var(--accent)' }}>{trans.websiteId || 'ADMIN'}</td>
                      <td style={{ color: 'var(--success)' }}>{trans.locale}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{trans.textKey}</td>
                      <td>{trans.translatedText}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => openEditModal(trans)} style={{ background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: '4px', padding: '0.2rem 0.5rem', marginRight: '0.5rem', cursor: 'pointer' }}>{t('button.edit', 'Edit')}</button>
                        <button onClick={() => handleDelete(trans.id)} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer' }}>{t('button.delete', 'Delete')}</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="admin-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>{editingId ? 'Edit Translation' : 'Add Translation'}</h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>System</label>
                <input required value={system} onChange={e => setSystem(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px' }} placeholder="e.g. ADMIN_FRONT" />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Screen</label>
                  <input required value={screen} onChange={e => setScreen(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px' }} placeholder="e.g. COMMON" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Website ID</label>
                  <input required value={websiteId} onChange={e => setWebsiteId(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px' }} placeholder="e.g. ADMIN" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Locale</label>
                  <select required value={locale} onChange={e => setLocale(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px' }}>
                    <option value="en-US">en-US</option>
                    <option value="ko-KR">ko-KR</option>
                    <option value="es-ES">es-ES</option>
                    <option value="es-CL">es-CL</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Text Key</label>
                <input required value={textKey} onChange={e => setTextKey(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px' }} placeholder="e.g. login.button.submit" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Translated Text</label>
                <textarea required value={translatedText} onChange={e => setTranslatedText(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px', minHeight: '100px', resize: 'vertical' }} placeholder="e.g. Iniciar Sesión" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid #64748b', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.75rem 1.5rem', background: 'var(--accent)', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
