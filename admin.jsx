import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'

const PASSWORD_KEY = 'pd_admin_pw'

export default function AdminPanel() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')

  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // New campaign form
  const [form, setForm] = useState({ name: '', description: '', slug: '' })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')

  // Clicks modal
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [clicks, setClicks] = useState([])
  const [clicksLoading, setClicksLoading] = useState(false)

  const storedPw = () => typeof window !== 'undefined' ? localStorage.getItem(PASSWORD_KEY) : null

  const fetchCampaigns = useCallback(async (pw) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/campaigns', {
        headers: { 'x-admin-password': pw || storedPw() },
      })
      if (res.status === 401) { setAuthed(false); return }
      if (!res.ok) throw new Error('Failed to fetch campaigns')
      const data = await res.json()
      setCampaigns(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleLogin = async () => {
    setAuthError('')
    const res = await fetch('/api/campaigns', {
      headers: { 'x-admin-password': password },
    })
    if (res.status === 401) {
      setAuthError('Incorrect password')
      return
    }
    localStorage.setItem(PASSWORD_KEY, password)
    setAuthed(true)
    const data = await res.json()
    setCampaigns(data)
  }

  useEffect(() => {
    const pw = storedPw()
    if (pw) {
      setPassword(pw)
      fetchCampaigns(pw).then(() => setAuthed(true))
    }
  }, [fetchCampaigns])

  const slugify = (s) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const handleNameChange = (val) => {
    setForm((f) => ({ ...f, name: val, slug: slugify(val) }))
  }

  const createCampaign = async () => {
    setCreating(true)
    setCreateError('')
    setCreateSuccess('')
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': storedPw(),
        },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create')
      setCreateSuccess(`Campaign created! Link: /t/${data.slug}`)
      setForm({ name: '', description: '', slug: '' })
      fetchCampaigns(storedPw())
    } catch (e) {
      setCreateError(e.message)
    } finally {
      setCreating(false)
    }
  }

  const toggleActive = async (id, current) => {
    await fetch('/api/campaigns', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': storedPw() },
      body: JSON.stringify({ id, is_active: !current }),
    })
    fetchCampaigns(storedPw())
  }

  const deleteCampaign = async (id) => {
    if (!confirm('Delete this campaign and all its click data?')) return
    await fetch('/api/campaigns', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': storedPw() },
      body: JSON.stringify({ id }),
    })
    fetchCampaigns(storedPw())
  }

  const viewClicks = async (campaign) => {
    setSelectedCampaign(campaign)
    setClicksLoading(true)
    setClicks([])
    const res = await fetch(`/api/clicks?campaign_id=${campaign.id}`, {
      headers: { 'x-admin-password': storedPw() },
    })
    const data = await res.json()
    setClicks(data)
    setClicksLoading(false)
  }

  const getBaseUrl = () =>
    typeof window !== 'undefined' ? window.location.origin : ''

  const copyLink = (slug) => {
    navigator.clipboard.writeText(`${getBaseUrl()}/t/${slug}`)
  }

  const logout = () => {
    localStorage.removeItem(PASSWORD_KEY)
    setAuthed(false)
    setPassword('')
    setCampaigns([])
  }

  const styles = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0a0a0f; --surface: #13131a; --surface2: #1c1c28;
      --border: #2a2a3a; --accent: #ff8c42; --accent2: #ff3b3b;
      --green: #00e676; --blue: #448aff;
      --text: #e8e8f0; --muted: #6b6b80;
      --mono: 'IBM Plex Mono', monospace; --sans: 'Syne', sans-serif;
    }
    body { background: var(--bg); color: var(--text); font-family: var(--sans); min-height: 100vh; }

    /* Login */
    .login-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .login-box { width: 100%; max-width: 400px; background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 40px 36px; }
    .login-logo { font-family: var(--mono); font-size: 12px; letter-spacing: 0.3em; color: var(--muted); text-transform: uppercase; margin-bottom: 32px; }
    .login-logo b { color: var(--accent); }
    .login-title { font-size: 24px; font-weight: 800; margin-bottom: 8px; }
    .login-sub { font-size: 13px; color: var(--muted); margin-bottom: 32px; font-family: var(--mono); }
    .input { width: 100%; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 12px 16px; color: var(--text); font-size: 14px; font-family: var(--mono); outline: none; transition: border-color 0.2s; }
    .input:focus { border-color: var(--accent); }
    .btn { display: inline-flex; align-items: center; gap: 8px; padding: 11px 20px; border-radius: 8px; font-size: 14px; font-weight: 700; font-family: var(--sans); cursor: pointer; border: none; transition: opacity 0.2s, transform 0.15s; letter-spacing: 0.01em; }
    .btn:hover { opacity: 0.85; transform: translateY(-1px); }
    .btn-primary { background: var(--accent); color: #0a0a0f; }
    .btn-ghost { background: transparent; color: var(--muted); border: 1px solid var(--border); }
    .btn-ghost:hover { color: var(--text); border-color: var(--text); }
    .btn-danger { background: rgba(255,59,59,0.1); color: var(--accent2); border: 1px solid rgba(255,59,59,0.2); }
    .btn-sm { padding: 6px 12px; font-size: 12px; }
    .btn-full { width: 100%; justify-content: center; margin-top: 16px; }
    .err { font-family: var(--mono); font-size: 12px; color: var(--accent2); margin-top: 10px; }
    .suc { font-family: var(--mono); font-size: 12px; color: var(--green); margin-top: 10px; }

    /* Layout */
    .layout { display: grid; grid-template-columns: 260px 1fr; min-height: 100vh; }
    .sidebar { background: var(--surface); border-right: 1px solid var(--border); padding: 32px 24px; display: flex; flex-direction: column; gap: 32px; }
    .sidebar-logo { font-family: var(--mono); font-size: 12px; letter-spacing: 0.25em; color: var(--muted); text-transform: uppercase; }
    .sidebar-logo b { color: var(--accent); display: block; font-size: 18px; font-family: var(--sans); letter-spacing: normal; color: var(--text); margin-bottom: 4px; }
    .sidebar-nav { display: flex; flex-direction: column; gap: 4px; }
    .nav-item { padding: 10px 14px; border-radius: 8px; font-size: 14px; font-weight: 600; color: var(--muted); cursor: pointer; transition: background 0.15s, color 0.15s; display: flex; align-items: center; gap: 10px; }
    .nav-item.active, .nav-item:hover { background: var(--surface2); color: var(--text); }
    .sidebar-footer { margin-top: auto; }

    .main { padding: 40px; overflow-y: auto; }
    .page-title { font-size: 28px; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 6px; }
    .page-sub { font-size: 13px; color: var(--muted); font-family: var(--mono); margin-bottom: 36px; }

    /* Form card */
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 28px; margin-bottom: 28px; }
    .card-title { font-size: 15px; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
    .form-grid { display: grid; gap: 14px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    label { font-family: var(--mono); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); display: block; margin-bottom: 6px; }
    .input-wrap { position: relative; }
    .input-prefix { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-family: var(--mono); font-size: 12px; color: var(--muted); pointer-events: none; }
    .input-indent { padding-left: 52px; }

    /* Table */
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead tr { border-bottom: 1px solid var(--border); }
    th { text-align: left; font-family: var(--mono); font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted); padding: 12px 16px; white-space: nowrap; }
    td { padding: 14px 16px; border-bottom: 1px solid rgba(42,42,58,0.5); vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: var(--surface2); }
    .status-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 100px; font-family: var(--mono); font-size: 10px; letter-spacing: 0.08em; font-weight: 600; }
    .status-active { background: rgba(0,230,118,0.08); color: var(--green); border: 1px solid rgba(0,230,118,0.2); }
    .status-inactive { background: rgba(107,107,128,0.1); color: var(--muted); border: 1px solid var(--border); }
    .slug-cell { font-family: var(--mono); font-size: 12px; color: var(--accent); }
    .count-big { font-size: 18px; font-weight: 800; color: var(--accent); }
    .actions { display: flex; gap: 6px; align-items: center; }
    .empty { text-align: center; padding: 60px; font-family: var(--mono); font-size: 13px; color: var(--muted); }

    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(10,10,15,0.85); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 24px; backdrop-filter: blur(4px); }
    .modal { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; width: 100%; max-width: 860px; max-height: 80vh; display: flex; flex-direction: column; overflow: hidden; }
    .modal-header { padding: 24px 28px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
    .modal-title { font-size: 16px; font-weight: 700; }
    .modal-sub { font-size: 12px; color: var(--muted); font-family: var(--mono); }
    .modal-body { padding: 24px 28px; overflow-y: auto; flex: 1; }
    .ua-cell { font-family: var(--mono); font-size: 10px; color: var(--muted); max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .time-cell { font-family: var(--mono); font-size: 11px; white-space: nowrap; }

    @media (max-width: 768px) {
      .layout { grid-template-columns: 1fr; }
      .sidebar { display: none; }
      .form-row { grid-template-columns: 1fr; }
      .main { padding: 24px 16px; }
    }
  `

  if (!authed) {
    return (
      <>
        <Head>
          <title>Admin — Petridish Security</title>
          <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@400;700;800&display=swap" rel="stylesheet" />
        </Head>
        <style>{styles}</style>
        <div className="login-wrap">
          <div className="login-box">
            <div className="login-logo"><b>Petridish</b>Security Admin</div>
            <div className="login-title">Admin Panel</div>
            <div className="login-sub">Phishing Simulation Dashboard</div>
            <label>Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Enter admin password"
            />
            {authError && <div className="err">⚠ {authError}</div>}
            <button className="btn btn-primary btn-full" onClick={handleLogin}>
              Access Dashboard →
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Admin — Petridish Security</title>
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@400;700;800&display=swap" rel="stylesheet" />
      </Head>
      <style>{styles}</style>

      <div className="layout">
        {/* Sidebar */}
        <div className="sidebar">
          <div>
            <div className="sidebar-logo">
              <b>Petridish</b>
              Security Console
            </div>
          </div>
          <nav className="sidebar-nav">
            <div className="nav-item active">📊 Campaigns</div>
          </nav>
          <div className="sidebar-footer">
            <button className="btn btn-ghost btn-sm" onClick={logout}>Sign out</button>
          </div>
        </div>

        {/* Main */}
        <main className="main">
          <div className="page-title">Phishing Campaigns</div>
          <div className="page-sub">Generate tracking links · Monitor who clicked · Educate your team</div>

          {/* Create form */}
          <div className="card">
            <div className="card-title">＋ New Campaign</div>
            <div className="form-grid">
              <div className="form-row">
                <div>
                  <label>Campaign Name</label>
                  <input
                    className="input"
                    placeholder="e.g. IT Alert Q2 2025"
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                  />
                </div>
                <div>
                  <label>URL Slug</label>
                  <div className="input-wrap">
                    <span className="input-prefix">/t/</span>
                    <input
                      className="input input-indent"
                      placeholder="it-alert-q2-2025"
                      value={form.slug}
                      onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label>Description (optional)</label>
                <input
                  className="input"
                  placeholder="Brief description of this campaign"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button
                  className="btn btn-primary"
                  onClick={createCampaign}
                  disabled={creating || !form.name || !form.slug}
                >
                  {creating ? 'Creating...' : 'Create Campaign'}
                </button>
                {createError && <span className="err">⚠ {createError}</span>}
                {createSuccess && <span className="suc">✓ {createSuccess}</span>}
              </div>
            </div>
          </div>

          {/* Campaigns table */}
          <div className="card">
            <div className="card-title" style={{ justifyContent: 'space-between' }}>
              <span>All Campaigns</span>
              <button className="btn btn-ghost btn-sm" onClick={() => fetchCampaigns()}>
                ↻ Refresh
              </button>
            </div>
            {loading ? (
              <div className="empty">Loading campaigns...</div>
            ) : error ? (
              <div className="empty" style={{ color: 'var(--accent2)' }}>Error: {error}</div>
            ) : campaigns.length === 0 ? (
              <div className="empty">No campaigns yet. Create one above.</div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Campaign</th>
                      <th>Link</th>
                      <th>Status</th>
                      <th>Clicks</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                          {c.description && (
                            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{c.description}</div>
                          )}
                        </td>
                        <td>
                          <div className="slug-cell">/t/{c.slug}</div>
                        </td>
                        <td>
                          <span className={`status-badge ${c.is_active ? 'status-active' : 'status-inactive'}`}>
                            {c.is_active ? '● Active' : '○ Paused'}
                          </span>
                        </td>
                        <td>
                          <span className="count-big">{c.click_count}</span>
                        </td>
                        <td>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>
                            {new Date(c.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td>
                          <div className="actions">
                            <button className="btn btn-ghost btn-sm" onClick={() => copyLink(c.slug)} title="Copy link">
                              Copy Link
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={() => viewClicks(c)}>
                              View Clicks
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => toggleActive(c.id, c.is_active)}
                            >
                              {c.is_active ? 'Pause' : 'Activate'}
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => deleteCampaign(c.id)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Clicks Modal */}
      {selectedCampaign && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setSelectedCampaign(null)}>
          <div className="modal">
            <div className="modal-header">
              <div>
                <div className="modal-title">Click Log — {selectedCampaign.name}</div>
                <div className="modal-sub">/t/{selectedCampaign.slug} · {clicks.length} records</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedCampaign(null)}>Close</button>
            </div>
            <div className="modal-body">
              {clicksLoading ? (
                <div className="empty">Loading clicks...</div>
              ) : clicks.length === 0 ? (
                <div className="empty">No clicks recorded yet for this campaign.</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Timestamp</th>
                      <th>IP Address</th>
                      <th>User Agent</th>
                      <th>Referrer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clicks.map((click, i) => (
                      <tr key={click.id}>
                        <td style={{ color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 11 }}>{i + 1}</td>
                        <td className="time-cell">{new Date(click.clicked_at).toLocaleString()}</td>
                        <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{click.ip_address}</td>
                        <td><div className="ua-cell" title={click.user_agent}>{click.user_agent}</div></td>
                        <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>
                          {click.referrer || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
