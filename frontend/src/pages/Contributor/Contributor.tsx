import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './Contributor.css';
import { getContributors, confirmContribution as apiConfirm, deleteContribution as apiDelete, logout as apiLogout } from '../../../frontend_apis';

type ContributorView = {
  _id: string;
  name?: string;
  displayName?: string;
  total?: number;
  count?: number;
  contributions?: Array<any>;
};

const ContributorPage: React.FC = () => {
  
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [contributors, setContributors] = useState<ContributorView[] | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const navigate = useNavigate();

  const logout = async () => {
    try { await apiLogout(token || undefined); } catch {}
    try { localStorage.removeItem('auth_token'); } catch {}
    setToken(null);
    setIsAdmin(false);
    navigate('/');
  }

  const fetchContributors = async (tkn?: string) => {
    setError(null);
    try {
      const data = await getContributors(tkn || token || undefined);
      setContributors(data.contributors || []);
    } catch (err: any) {
      setError(err?.message || 'fetch_error');
    }
  };

  // Auto-load token from localStorage and fetch contributors
  useEffect(() => {
    try {
      const stored = localStorage.getItem('auth_token');
      if (stored) {
        setToken(stored);
        fetchContributors(stored);
        // decode token to detect admin flag (unsafe but fine for UI)
        try {
          const parts = stored.split('.')
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
            setIsAdmin(!!payload.isAdmin)
          }
        } catch {}
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalContributed = useMemo(() => {
    if (!contributors) return 0;
    return contributors.reduce((s, c) => s + (c.total || 0), 0);
  }, [contributors]);

  const target = 20000; // pounds
  const remaining = Math.max(0, target - totalContributed);

  const fmt = (v: number) => v.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' });

  // flatten contributions so each contribution is rendered as its own card
  const contributionsList = useMemo(() => {
    if (!contributors) return [];
    return contributors.flatMap((c) => (c.contributions || []).map((x: any) => ({ ...x, contributor: c })));
  }, [contributors]);

  const confirmContribution = async (id: string) => {
    if (!token) return setError('not_authenticated')
    try {
      await apiConfirm(id, token)
      await fetchContributors()
    } catch (err: any) {
      setError(err?.message || 'confirm_error')
    }
  }

  const deleteContribution = async (id: string) => {
    if (!token) return setError('not_authenticated')
    try {
      await apiDelete(id, token)
      await fetchContributors()
    } catch (err: any) {
      setError(err?.message || 'delete_error')
    }
  }

  return (
    <main id="contrib-root">
      <header className="contrib-header">
        <div className="contrib-logo">Faitherpa</div>
        <div className="contrib-header-stats">
          <div className="contrib-header-item"><strong>Total:</strong> {fmt(totalContributed)}</div>
          <div className="contrib-header-item"><strong>Remaining:</strong> {fmt(remaining)}</div>
        </div>
        {token && (
          <button className="btn btn--outline contrib-logout" onClick={logout}>Logout</button>
        )}
      </header>

      {error && <div className="error">Error: {error}</div>}

      {contributors && (
        <section className="contributors-list">
          <h2>Contributions</h2>

          {contributors.length === 0 && <p>No contributions available.</p>}

          <div className="contributors-grid">
            {/** If API returned per-contribution details (admin view), render each contribution as a card. Otherwise render aggregated contributor cards. */}
            {contributors[0] && Array.isArray(contributors[0].contributions) ? (
              // admin-like response: flatten contributions already handled by contributionsList
              contributionsList.map((item: any) => (
                <article className="contributor-card" key={item._id}>
                  <div className="contrib-card-header">
                    <div>
                      <div className="contrib-name">{isAdmin ? (item.contributor?.name || '—') : (item.isAnonymous ? 'Anonymous' : (item.contributor?.displayName || item.contributor?.name))}</div>
                      <div className="contrib-date">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</div>
                    </div>
                    <div className="contrib-total-large">{fmt(item.amount || 0)}</div>
                  </div>

                  {item.note && <div className="contrib-note">{isAdmin ? (item.note || '—') : (item.isAnonymous ? 'Anonymous' : item.note)}</div>}

                  <div className="contrib-meta">
                    {item.isRepayable ? (
                      <span className="badge small repayable">Repayable</span>
                    ) : (
                      <span className="badge small gift">Gift</span>
                    )}
                    {item.confirmed && <span className="badge small confirmed">✓ Confirmed</span>}
                  </div>

                  {isAdmin && (
                    <div className="contrib-actions card-actions">
                      <button
                        onClick={async () => { if (!item.confirmed) await confirmContribution(item._id); }}
                        className="btn btn--small btn--primary"
                        disabled={!!item.confirmed}
                      >
                        {item.confirmed ? 'Confirmed' : 'Confirm'}
                      </button>
                      <button
                        onClick={async () => {
                          const ok = window.confirm('Delete this contribution and remove the contributor? This will delete all contributions for that user and the user record. Continue?')
                          if (ok) await deleteContribution(item._id)
                        }}
                        className="btn btn--outline btn--small"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </article>
              ))
            ) : (
              // aggregated contributors for non-admins
              contributors.map((c) => (
                <article className="contributor-card" key={c._id}>
                  <div className="contrib-card-header">
                    <div>
                      <div className="contrib-name">{c.displayName || c.name || '—'}</div>
                      <div className="contrib-count">{(c.count || 0)} contribution{(c.count || 0) === 1 ? '' : 's'}</div>
                    </div>
                    <div className="contrib-total-large">{fmt(c.total || 0)}</div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      )}
    </main>
  );
};

export default ContributorPage;
