import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'

const PASSWORD_KEY = 'pd_admin_pw'

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

  .login-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .login-box { width: 100%; max-width: 400px; background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 40px 36px; }
  .login-logo { font-family: var(--mono); font-size: 12px; letter-spacing: 0.3em; color: var(--muted); text-transform: uppercase; margin-bottom: 32px; }
  .login-logo b { color: var(--accent); font-size: 20px; font-family: var(--sans); letter-spacing: normal; display: block; margin-bottom: 4px; }
  .login-title { font-size: 24px; font-weight: 800; margin-bottom: 8px; }
  .login-sub { font-size: 13px; color: var(--muted); margin-bottom: 32px; font-family: var(--mono); }

  .input { width: 100%; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 11px 14px; color: var(--text); font-size: 14px; font-family: var(--mono); outline: none; transition: border-color 0.2s; }
  .input:focus { border-color: var(--accent); }
  textarea.input { resize: vertical; min-height: 100px; font-size: 13px; line-height: 1.6; }

  .btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 700; font-family: var(--sans); cursor: pointer; border: none; transition: opacity 0.2s, transform 0.15s; letter-spacing: 0.01em; white-space: nowrap; }
  .btn:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-primary { background: var(--accent); color: #0a0a0f; }
  .btn-ghost { background: transparent; color: var(--muted); border: 1px solid var(--border); }
  .btn-ghost:hover:not(:disabled) { color: var(--text); border-color: rgba(232,232,240,0.3); }
  .btn-green { background: rgba(0,230,118,0.1); color: var(--green); border: 1px solid rgba(0,230,118,0.2); }
  .btn-danger { background: rgba(255,59,59,0.08); color: var(--accent2); border: 1px solid rgba(255,59,59,0.15); }
  .btn-sm { padding: 5px 11px; font-size: 11px; }
  .btn-full { width: 100%; justify-content: center; margin-top: 16px; }
  .err { font-family: var(--mono); font-size: 12px; color: var(--accent2); margin-top: 8px; }
  .suc { font-family: var(--mono); font-size: 12px; color: var(--green); margin-top: 8px; }

  .layout { display: grid; grid-template-columns: 240px 1fr; min-height: 100vh; }
  .sidebar { background: var(--surface); border-right: 1px solid var(--border); padding: 28px 20px; display: flex; flex-direction: column; gap: 28px; position: sticky; top: 0; height: 100vh; }
  .sidebar-logo b { font-size: 20px; font-weight: 800; display: block; margin-bottom: 2px; }
  .sidebar-logo span { font-family: var(--mono); font-size: 11px; letter-spacing: 0.2em; color: var(--muted); text-transform: uppercase; }
  .sidebar-nav { display: flex; flex-direction: column; gap: 3px; }
  .nav-item { padding: 9px 12px; border-radius: 8px; font-size: 13px; font-weight: 600; color: var(--muted); cursor: pointer; transition: background 0.15s, color 0.15s; display: flex; align-items: center; gap: 10px; }
  .nav-item.active, .nav-item:hover { background: var(--surface2); color: var(--text); }
  .sidebar-footer { margin-top: auto; }

  .main { padding: 36px 40px; overflow-y: auto; }
  .page-header { margin-bottom: 32px; }
  .page-title { font-size: 26px; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 4px; }
  .page-sub { font-size: 13px; color: var(--muted); font-family: var(--mono); }

  .card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 24px; margin-bottom: 20px; }
  .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .card-title { font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
  .form-grid { display: grid; gap: 12px; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  label { font-family: var(--mono); font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); display: block; margin-bottom: 5px; }
  .input-wrap { position: relative; }
  .input-prefix { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-family: var(--mono); font-size: 12px; color: var(--muted); pointer-events: none; }
  .input-indent { padding-left: 50px; }

  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  thead tr { border-bottom: 1px solid var(--border); }
  th { text-align: left; font-family: var(--mono); font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted); padding: 10px 14px; white-space: nowrap; }
  td { padding: 12px 14px; border-bottom: 1px solid rgba(42,42,58,0.5); vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(28,28,40,0.6); }

  .status-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 100px; font-family: var(--mono); font-size: 10px; letter-spacing: 0.06em; font-weight: 600; }
  .status-active { background: rgba(0,230,118,0.08); color: var(--green); border: 1px solid rgba(0,230,118,0.2); }
  .status-inactive { background: rgba(107,107,128,0.1); color: var(--muted); border: 1px solid var(--border); }
  .status-clicked { background: rgba(255,59,59,0.08); color: var(--accent2); border: 1px solid rgba(255,59,59,0.2); }
  .status-pending { background: rgba(68,138,255,0.08); color: var(--blue); border: 1px solid rgba(68,138,255,0.2); }

  .slug-cell { font-family: var(--mono); font-size: 12px; color: var(--accent); }
  .count-big { font-size: 20px; font-weight: 800; color: var(--accent); }
  .mono-sm { font-family: var(--mono); font-size: 11px; color: var(--muted); }
  .actions { display: flex; gap: 5px; align-items: center; flex-wrap: wrap; }
  .empty { text-align: center; padding: 48px; font-family: var(--mono); font-size: 13px; color: var(--muted); }

  .modal-overlay { position: fixed; inset: 0; background: rgba(10,10,15,0.88); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 24px; backdrop-filter: blur(4px); }
  .modal { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; width: 100%; max-width: 940px; max-height: 85vh; display: flex; flex-direction: column; overflow: hidden; }
  .modal-header { padding: 22px 28px; border-bottom: 1px solid var(--border); display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
  .modal-title { font-size: 16px; font-weight: 700; margin-bottom: 2px; }
  .modal-sub { font-size: 12px; color: var(--muted); font-family: var(--mono); }
  .modal-tabs { display: flex; gap: 4px; padding: 12px 28px; border-bottom: 1px solid var(--border); }
  .tab { padding: 7px 16px; border-radius: 7px; font-size: 13px; font-weight: 600; cursor: pointer; color: var(--muted); transition: background 0.15s, color 0.15s; }
  .tab.active { background: var(--surface2); color: var(--text); }
  .modal-body { padding: 24px 28px; overflow-y: auto; flex: 1; }

  .summary-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
  .summary-stat { background: var(--surface2); border: 1px solid var(--border); border-radius: 10px; padding: 16px; text-align: center; }
  .summary-num { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; }
  .summary-label { font-family: var(--mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-top: 2px; }
  .num-red { color: var(--accent2); }
  .num-green { color: var(--green); }
  .num-orange { color: var(--accent); }

  .link-box { background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 8px 12px; font-family: var(--mono); font-size: 11px; color: var(--accent); word-break: break-all; cursor: pointer; transition: border-color 0.2s; }
  .link-box:hover { border-color: var(--accent); }

  @media (max-width: 768px) {
    .layout { grid-template-columns: 1fr; }
    .sidebar { display: none; }
    .form-row { grid-template-columns: 1fr; }
    .main { padding: 20px 16px; }
    .summary-row { grid-template-columns: repeat(2, 1fr); }
  }
`

export default function AdminPanel() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', description: '', slug: '' })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')
  const [modalCampaign, setModalCampaign] = useState(null)
  const [modalTab, setModalTab] = useState('recipients')
  const [recipients, setRecipients] = useState([])
  const [clicks, setClicks] = useState([])
  const [modalLoading, setModalLoading] = useState(false)
  const [addMode, setAddMode] = useState('single')
  const [singleForm, setSingleForm] = useState({ name: '', email: '' })
  const [bulkText, setBulkText] = useState('')
  const [addingRecipients, setAddingRecipients] = useState(false)
  const [addError, setAddError] = useState('')
  const [addSuccess, setAddSuccess] = useState('')

  const storedPw = () => typeof window !== 'undefined' ? localStorage.getItem(PASSWORD_KEY) : null
  const getBaseUrl = () => typeof window !== 'undefined' ? window.location.origin : ''

  const fetchCampaigns = useCallback(async (pw) => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/campaigns', { headers: { 'x-admin-password': pw || storedPw() } })
      if (res.status === 401) { setAuthed(false); return }
      const data = await res.json()
      setCampaigns(data)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  const handleLogin = async () => {
    setAuthError('')
    const res = await fetch('/api/campaigns', { headers: { 'x-admin-password': password } })
    if (res.status === 401) { setAuthError('Incorrect password'); return }
    localStorage.setItem(PASSWORD_KEY, password)
    setAuthed(true)
    const data = await res.json()
    setCampaigns(data)
  }

  useEffect(() => {
    const pw = storedPw()
    if (pw) { setPassword(pw); fetchCampaigns(pw).then(() => setAuthed(true)) }
  }, [fetchCampaigns])

  const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const createCampaign = async () => {
    setCreating(true); setCreateError(''); setCreateSuccess('')
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': storedPw() },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create')
      setCreateSuccess('Created! Open campaign to add recipients.')
      setForm({ name: '', description: '', slug: '' })
      fetchCampaigns(storedPw())
    } catch (e) { setCreateError(e.message) }
    finally { setCreating(false) }
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
    if (!confirm('Delete this campaign and all its data?')) return
    await fetch('/api/campaigns', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': storedPw() },
      body: JSON.stringify({ id }),
    })
    fetchCampaigns(storedPw())
  }

  const openModal = async (campaign) => {
    setModalCampaign(campaign)
    setModalTab('recipients')
    setAddError(''); setAddSuccess('')
    setSingleForm({ name: '', email: '' }); setBulkText('')
    setModalLoading(true)
    const [rRes, cRes] = await Promise.all([
      fetch(`/api/recipients?campaign_id=${campaign.id}`, { headers: { 'x-admin-password': storedPw() } }),
      fetch(`/api/clicks?campaign_id=${campaign.id}`, { headers: { 'x-admin-password': storedPw() } }),
    ])
    setRecipients(await rRes.json())
    setClicks(await cRes.json())
    setModalLoading(false)
  }

  const parseBulk = (text) =>
    text.split('\n').map((l) => l.trim()).filter(Boolean).map((line) => {
      const parts = line.split(/,|\t/).map((p) => p.trim())
      if (parts.length >= 2) return { name: parts[0], email: parts[1] }
      if (parts[0].includes('@')) return { name: parts[0].split('@')[0], email: parts[0] }
      return null
    }).filter(Boolean)

  const addRecipients = async () => {
    setAddingRecipients(true); setAddError(''); setAddSuccess('')
    try {
      const list = addMode === 'single'
        ? (singleForm.name && singleForm.email ? [singleForm] : (() => { throw new Error('Name and email required') })())
        : parseBulk(bulkText).length ? parseBulk(bulkText) : (() => { throw new Error('No valid entries. Format: Name, email@company.com') })()

      const res = await fetch('/api/recipients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': storedPw() },
        body: JSON.stringify({ campaign_id: modalCampaign.id, recipients: list }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setAddSuccess(`✓ Added ${data.length} recipient${data.length !== 1 ? 's' : ''}`)
      setSingleForm({ name: '', email: '' }); setBulkText('')
      const rRes = await fetch(`/api/recipients?campaign_id=${modalCampaign.id}`, { headers: { 'x-admin-password': storedPw() } })
      setRecipients(await rRes.json())
      fetchCampaigns(storedPw())
    } catch (e) { setAddError(e.message) }
    finally { setAddingRecipients(false) }
  }

  const deleteRecipient = async (id) => {
    await fetch('/api/recipients', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': storedPw() },
      body: JSON.stringify({ id }),
    })
    const rRes = await fetch(`/api/recipients?campaign_id=${modalCampaign.id}`, { headers: { 'x-admin-password': storedPw() } })
    setRecipients(await rRes.json())
    fetchCampaigns(storedPw())
  }

  const copyLink = (token) => navigator.clipboard.writeText(`${getBaseUrl()}/t/${token}`)

  const copyAllLinks = () => {
    const text = recipients.map((r) => `${r.name}\t${r.email}\t${getBaseUrl()}/t/${r.token}`).join('\n')
    navigator.clipboard.writeText(text)
  }

  const logout = () => { localStorage.removeItem(PASSWORD_KEY); setAuthed(false); setPassword(''); setCampaigns([]) }

  const clickedCount = recipients.filter((r) => r.click_count > 0).length
  const notClickedCount = recipients.filter((r) => r.click_count === 0).length
  const clickRate = recipients.length > 0 ? Math.round((clickedCount / recipients.length) * 100) : 0

  if (!authed) return (
    <>
      <Head><title>Admin — Petridish Security</title>
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@400;700;800&display=swap" rel="stylesheet" /></Head>
      <style>{styles}</style>
      <div className="login-wrap">
        <div className="login-box">
          <div className="login-logo"><b>Petridish</b>Security Admin</div>
          <div className="login-title">Admin Panel</div>
          <div className="login-sub">Phishing Simulation Dashboard</div>
          <label>Password</label>
          <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} placeholder="Enter admin password" />
          {authError && <div className="err">⚠ {authError}</div>}
          <button className="btn btn-primary btn-full" onClick={handleLogin}>Access Dashboard →</button>
        </div>
      </div>
    </>
  )

  return (
    <>
      <Head><title>Admin — Petridish Security</title>
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@400;700;800&display=swap" rel="stylesheet" /></Head>
      <style>{styles}</style>

      <div className="layout">
        <div className="sidebar">
          <div className="sidebar-logo"><b>Petridish</b><span>Security Console</span></div>
          <nav className="sidebar-nav"><div className="nav-item active">📊 Campaigns</div></nav>
          <div className="sidebar-footer"><button className="btn btn-ghost btn-sm" onClick={logout}>Sign out</button></div>
        </div>

        <main className="main">
          <div className="page-header">
            <div className="page-title">Phishing Campaigns</div>
            <div className="page-sub">Create campaigns · Add employees by name · Track who clicked</div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">＋ New Campaign</div></div>
            <div className="form-grid">
              <div className="form-row">
                <div>
                  <label>Campaign Name</label>
                  <input className="input" placeholder="IT Alert Q2 2025" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))} />
                </div>
                <div>
                  <label>URL Slug</label>
                  <div className="input-wrap">
                    <span className="input-prefix">/t/</span>
                    <input className="input input-indent" placeholder="it-alert-q2" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))} />
                  </div>
                </div>
              </div>
              <div>
                <label>Description (optional)</label>
                <input className="input" placeholder="Brief description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={createCampaign} disabled={creating || !form.name || !form.slug}>{creating ? 'Creating...' : 'Create Campaign'}</button>
                {createError && <span className="err">⚠ {createError}</span>}
                {createSuccess && <span className="suc">{createSuccess}</span>}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">All Campaigns</div>
              <button className="btn btn-ghost btn-sm" onClick={() => fetchCampaigns()}>↻ Refresh</button>
            </div>
            {loading ? <div className="empty">Loading...</div> : error ? <div className="empty" style={{ color: 'var(--accent2)' }}>{error}</div> : campaigns.length === 0 ? <div className="empty">No campaigns yet.</div> : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Campaign</th><th>Status</th><th>Total Clicks</th><th>Created</th><th>Actions</th></tr></thead>
                  <tbody>
                    {campaigns.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{c.name}</div>
                          {c.description && <div className="mono-sm" style={{ marginTop: 2 }}>{c.description}</div>}
                        </td>
                        <td><span className={`status-badge ${c.is_active ? 'status-active' : 'status-inactive'}`}>{c.is_active ? '● Active' : '○ Paused'}</span></td>
                        <td><span className="count-big">{c.click_count}</span></td>
                        <td><span className="mono-sm">{new Date(c.created_at).toLocaleDateString()}</span></td>
                        <td>
                          <div className="actions">
                            <button className="btn btn-green btn-sm" onClick={() => openModal(c)}>Manage Recipients</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(c.id, c.is_active)}>{c.is_active ? 'Pause' : 'Activate'}</button>
                            <button className="btn btn-danger btn-sm" onClick={() => deleteCampaign(c.id)}>Delete</button>
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

      {modalCampaign && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModalCampaign(null)}>
          <div className="modal">
            <div className="modal-header">
              <div>
                <div className="modal-title">{modalCampaign.name}</div>
                <div className="modal-sub">{recipients.length} recipients · {clickedCount} clicked · {clickRate}% click rate</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setModalCampaign(null)}>✕ Close</button>
            </div>

            <div className="modal-tabs">
              <div className={`tab ${modalTab === 'recipients' ? 'active' : ''}`} onClick={() => setModalTab('recipients')}>👥 Recipients ({recipients.length})</div>
              <div className={`tab ${modalTab === 'add' ? 'active' : ''}`} onClick={() => setModalTab('add')}>＋ Add People</div>
              <div className={`tab ${modalTab === 'clicks' ? 'active' : ''}`} onClick={() => setModalTab('clicks')}>📋 Click Log ({clicks.length})</div>
            </div>

            <div className="modal-body">
              {modalTab === 'recipients' && (
                <>
                  {recipients.length > 0 && (
                    <>
                      <div className="summary-row">
                        <div className="summary-stat"><div className="summary-num">{recipients.length}</div><div className="summary-label">Total</div></div>
                        <div className="summary-stat"><div className="summary-num num-red">{clickedCount}</div><div className="summary-label">Clicked</div></div>
                        <div className="summary-stat"><div className="summary-num num-green">{notClickedCount}</div><div className="summary-label">Safe</div></div>
                        <div className="summary-stat"><div className="summary-num num-orange">{clickRate}%</div><div className="summary-label">Click Rate</div></div>
                      </div>
                      <div style={{ marginBottom: 14 }}>
                        <button className="btn btn-ghost btn-sm" onClick={copyAllLinks}>📋 Copy all links as TSV (Name · Email · URL)</button>
                      </div>
                    </>
                  )}
                  {modalLoading ? <div className="empty">Loading...</div> : recipients.length === 0 ? (
                    <div className="empty">No recipients yet — go to "Add People" to add employees.</div>
                  ) : (
                    <table>
                      <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Status</th><th>Clicks</th><th>First Click</th><th>Unique Link</th><th></th></tr></thead>
                      <tbody>
                        {recipients.map((r, i) => (
                          <tr key={r.id}>
                            <td className="mono-sm">{i + 1}</td>
                            <td style={{ fontWeight: 600 }}>{r.name}</td>
                            <td className="mono-sm">{r.email}</td>
                            <td><span className={`status-badge ${r.click_count > 0 ? 'status-clicked' : 'status-pending'}`}>{r.click_count > 0 ? '🎣 Clicked' : '⏳ Pending'}</span></td>
                            <td style={{ fontWeight: 700, color: r.click_count > 0 ? 'var(--accent2)' : 'var(--muted)' }}>{r.click_count}</td>
                            <td className="mono-sm">{r.clicked_at ? new Date(r.clicked_at).toLocaleString() : '—'}</td>
                            <td>
                              <div className="link-box" onClick={() => copyLink(r.token)} title="Click to copy full link">
                                /t/{r.token.slice(0, 14)}…
                              </div>
                            </td>
                            <td><button className="btn btn-danger btn-sm" onClick={() => deleteRecipient(r.id)}>✕</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              )}

              {modalTab === 'add' && (
                <div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                    <button className={`btn btn-sm ${addMode === 'single' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setAddMode('single')}>Single Person</button>
                    <button className={`btn btn-sm ${addMode === 'bulk' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setAddMode('bulk')}>Bulk Import</button>
                  </div>

                  {addMode === 'single' ? (
                    <div className="form-row">
                      <div>
                        <label>Full Name</label>
                        <input className="input" placeholder="Jane Smith" value={singleForm.name} onChange={(e) => setSingleForm((f) => ({ ...f, name: e.target.value }))} />
                      </div>
                      <div>
                        <label>Email Address</label>
                        <input className="input" type="email" placeholder="jane@petridish.com" value={singleForm.email} onChange={(e) => setSingleForm((f) => ({ ...f, email: e.target.value }))} />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label>One employee per line — <span style={{ color: 'var(--accent)' }}>Name, email@company.com</span></label>
                      <textarea
                        className="input"
                        style={{ marginTop: 6 }}
                        placeholder={"Jane Smith, jane@petridish.com\nJohn Doe, john@petridish.com\nAlex Lee, alex@petridish.com"}
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                      />
                      {bulkText && <div className="mono-sm" style={{ marginTop: 6 }}>Detected: {parseBulk(bulkText).length} valid entries</div>}
                    </div>
                  )}

                  <div style={{ marginTop: 16, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <button className="btn btn-primary" onClick={addRecipients} disabled={addingRecipients}>{addingRecipients ? 'Adding...' : 'Add Recipients'}</button>
                    {addError && <span className="err">⚠ {addError}</span>}
                    {addSuccess && <span className="suc">{addSuccess}</span>}
                  </div>

                  <div style={{ marginTop: 28, padding: 18, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10 }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>How per-person tracking works</div>
                    <div style={{ fontSize: 13, color: 'rgba(232,232,240,0.65)', lineHeight: 1.7 }}>
                      Each employee gets a <strong style={{ color: 'var(--text)' }}>unique link</strong> with a random token — e.g. <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent)', fontSize: 12 }}>/t/3fa8c2d1...</span>. Send it to them individually in your phishing test email. When they click, you'll see exactly who it was — their name, email, timestamp, and click count.
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'clicks' && (
                clicks.length === 0 ? <div className="empty">No clicks recorded yet.</div> : (
                  <table>
                    <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Timestamp</th><th>IP</th><th>Browser / OS</th></tr></thead>
                    <tbody>
                      {clicks.map((c, i) => (
                        <tr key={c.id}>
                          <td className="mono-sm">{i + 1}</td>
                          <td style={{ fontWeight: 600 }}>{c.recipient_name || '—'}</td>
                          <td className="mono-sm">{c.recipient_email || '—'}</td>
                          <td className="mono-sm">{new Date(c.clicked_at).toLocaleString()}</td>
                          <td className="mono-sm">{c.ip_address}</td>
                          <td><div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.user_agent}>{c.user_agent}</div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
