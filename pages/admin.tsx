import { useState, useCallback } from 'react'
import Head from 'next/head'
import styles from './admin.module.css'

interface Recipient {
  email: string
  campaign: string
  clicked: boolean
  click_ts: string | null
  source: string
  token: string
}

interface Link {
  email: string
  token: string
  link: string
}

function toCsv(rows: Record<string, string | boolean | null>[]): string {
  if (!rows.length) return ''
  const keys = Object.keys(rows[0])
  const header = keys.join(',')
  const body = rows.map((r) => keys.map((k) => `"${String(r[k] ?? '').replace(/"/g, '""')}"`).join(','))
  return [header, ...body].join('\n')
}

function download(filename: string, content: string, type = 'text/csv') {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([content], { type }))
  a.download = filename
  a.click()
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pwd, setPwd] = useState('')
  const [pwdError, setPwdError] = useState('')
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [loading, setLoading] = useState(false)

  // Add recipients form
  const [campaign, setCampaign] = useState('Tes Keamanan Q1 2025')
  const [emailsRaw, setEmailsRaw] = useState('')
  const [baseUrl, setBaseUrl] = useState('https://your-app.vercel.app')
  const [method, setMethod] = useState<'both' | 'token' | 'email'>('both')
  const [newLinks, setNewLinks] = useState<Link[]>([])
  const [addLoading, setAddLoading] = useState(false)

  const headers = { 'Content-Type': 'application/json', 'x-admin-password': pwd }

  const fetchRecipients = useCallback(async (password = pwd) => {
    setLoading(true)
    const res = await fetch('/api/admin/recipients', {
      headers: { 'x-admin-password': password },
    })
    if (res.ok) {
      setRecipients(await res.json())
    }
    setLoading(false)
  }, [pwd])

  const handleLogin = async () => {
    const res = await fetch('/api/admin/recipients', {
      headers: { 'x-admin-password': pwd },
    })
    if (res.ok) {
      setAuthed(true)
      setRecipients(await res.json())
    } else {
      setPwdError('Kata sandi salah.')
    }
  }

  const handleAddRecipients = async () => {
    const emails = emailsRaw
      .split('\n')
      .map((e) => e.trim())
      .filter((e) => e.includes('@'))
    if (!emails.length) return
    setAddLoading(true)
    const res = await fetch('/api/admin/add-recipients', {
      method: 'POST',
      headers,
      body: JSON.stringify({ emails, campaign, baseUrl, method }),
    })
    const data: Link[] = await res.json()
    setNewLinks(data)
    setAddLoading(false)
    fetchRecipients()
  }

  const handleClear = async () => {
    if (!confirm('Hapus SEMUA data? Tindakan ini tidak dapat dibatalkan.')) return
    await fetch('/api/admin/clear', { method: 'POST', headers })
    setRecipients([])
  }

  const total = recipients.length
  const nClicked = recipients.filter((r) => r.clicked).length
  const clickPct = total ? Math.round((nClicked / total) * 100) : 0

  if (!authed) {
    return (
      <>
        <Head><title>Admin — Phishing Sim</title></Head>
        <div className={styles.loginPage}>
          <div className={styles.loginCard}>
            <div className={styles.loginIcon}>🛡️</div>
            <h1 className={styles.loginTitle}>Dasbor Admin</h1>
            <p className={styles.loginSub}>Simulasi Phishing — Akses Terbatas</p>
            <input
              className={styles.input}
              type="password"
              placeholder="Kata sandi admin..."
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            {pwdError && <p className={styles.error}>{pwdError}</p>}
            <button className={styles.btnPrimary} onClick={handleLogin}>
              Masuk →
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head><title>Admin — Phishing Sim</title></Head>
      <div className={styles.page}>
        <div className={styles.container}>

          <div className={styles.header}>
            <div>
              <div className={styles.headerMono}>🛡️ Simulasi Phishing</div>
              <div className={styles.headerTitle}>Dasbor Admin</div>
            </div>
            <button className={styles.btnSecondary} onClick={() => fetchRecipients()}>
              {loading ? '⟳ Memuat...' : '↻ Segarkan'}
            </button>
          </div>

          {/* KPIs */}
          <div className={styles.kpiRow}>
            {[
              { num: total, label: 'Total Penerima', cls: '' },
              { num: nClicked, label: 'Klik Tautan', cls: styles.amber },
              { num: `${clickPct}%`, label: 'Tingkat Klik', cls: styles.red },
              { num: total - nClicked, label: 'Tidak Klik', cls: styles.blue },
            ].map(({ num, label, cls }) => (
              <div key={label} className={styles.kpiCard}>
                <div className={`${styles.kpiNum} ${cls}`}>{num}</div>
                <div className={styles.kpiLabel}>{label}</div>
              </div>
            ))}
          </div>

          {/* Add recipients */}
          <details className={styles.details}>
            <summary className={styles.summary}>➕ Tambah Penerima &amp; Buat Tautan</summary>
            <div className={styles.detailBody}>
              <label className={styles.label}>Nama kampanye</label>
              <input
                className={styles.input}
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
              />

              <label className={styles.label}>Alamat email (satu per baris)</label>
              <textarea
                className={styles.textarea}
                rows={5}
                placeholder={'budi@perusahaan.com\nsiti@perusahaan.com'}
                value={emailsRaw}
                onChange={(e) => setEmailsRaw(e.target.value)}
              />

              <label className={styles.label}>URL publik aplikasi Anda</label>
              <input
                className={styles.input}
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
              />

              <label className={styles.label}>Format tautan</label>
              <div className={styles.radioGroup}>
                {([
                  { val: 'token', label: 'Token saja  (?token=...)' },
                  { val: 'email', label: 'Email saja  (?email=...)' },
                  { val: 'both',  label: 'Keduanya  (?token=...&email=...)  ← direkomendasikan' },
                ] as const).map(({ val, label }) => (
                  <label key={val} className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="method"
                      value={val}
                      checked={method === val}
                      onChange={() => setMethod(val)}
                    />
                    {label}
                  </label>
                ))}
              </div>

              <button
                className={styles.btnPrimary}
                onClick={handleAddRecipients}
                disabled={addLoading}
              >
                {addLoading ? 'Memproses...' : 'Buat Tautan Pelacakan'}
              </button>

              {newLinks.length > 0 && (
                <div className={styles.linksResult}>
                  <div className={styles.successBanner}>
                    ✅ Berhasil membuat {newLinks.length} tautan pelacakan!
                  </div>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Token</th>
                        <th>Tautan Pelacakan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newLinks.map((l) => (
                        <tr key={l.token}>
                          <td>{l.email}</td>
                          <td><code>{l.token}</code></td>
                          <td>
                            <a href={l.link} target="_blank" rel="noopener noreferrer" className={styles.link}>
                              {l.link}
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    className={styles.btnSecondary}
                    onClick={() =>
                      download(
                        'tautan_pelacakan.csv',
                        toCsv(newLinks.map((l) => ({ Email: l.email, Token: l.token, 'Tautan Pelacakan': l.link }))),
                      )
                    }
                  >
                    📥 Unduh CSV
                  </button>
                </div>
              )}
            </div>
          </details>

          {/* Tracking info */}
          <details className={styles.details}>
            <summary className={styles.summary}>ℹ️ Tentang dua metode pelacakan</summary>
            <div className={styles.detailBody}>
              <div className={styles.infoBlock}>
                <strong>Metode 1 — Token unik per penerima</strong> (paling akurat)
                <pre className={styles.pre}>https://your-app.vercel.app/?token=a3f9c1d2</pre>
                Setiap klik terhubung langsung ke individu tertentu.

                <br /><br />
                <strong>Metode 2 — Parameter email</strong> (untuk mail-merge)
                <pre className={styles.pre}>https://your-app.vercel.app/?email=budi@perusahaan.com</pre>
                Cocok digunakan dengan Mailchimp, mail merge Outlook, dll.

                <br /><br />
                <strong>Keduanya sekaligus — direkomendasikan</strong>
                <pre className={styles.pre}>https://your-app.vercel.app/?token=a3f9c1d2&email=budi@perusahaan.com</pre>
              </div>
            </div>
          </details>

          {/* Results table */}
          <div className={styles.sectionLabel}>📊 Hasil Kampanye</div>
          {recipients.length > 0 ? (
            <>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Kampanye</th>
                      <th>Status</th>
                      <th>Waktu Klik</th>
                      <th>Sumber</th>
                      <th>Token</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipients.map((r) => (
                      <tr key={r.token}>
                        <td>{r.email}</td>
                        <td>{r.campaign}</td>
                        <td>
                          <span className={r.clicked ? styles.tagAmber : styles.tagGreen}>
                            {r.clicked ? '🟡 Klik' : '🟢 Tidak Ada Tindakan'}
                          </span>
                        </td>
                        <td>{r.click_ts ? new Date(r.click_ts).toLocaleString('id-ID') : '—'}</td>
                        <td>{r.source}</td>
                        <td><code>{r.token}</code></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className={styles.tableActions}>
                <button
                  className={styles.btnSecondary}
                  onClick={() =>
                    download(
                      'hasil_kampanye.csv',
                      toCsv(
                        recipients.map((r) => ({
                          Email: r.email,
                          Kampanye: r.campaign,
                          Status: r.clicked ? 'Klik' : 'Tidak Ada Tindakan',
                          'Waktu Klik': r.click_ts || '',
                          Sumber: r.source,
                          Token: r.token,
                        })),
                      ),
                    )
                  }
                >
                  📥 Ekspor CSV
                </button>
                <button className={styles.btnDanger} onClick={handleClear}>
                  🗑️ Hapus SEMUA data
                </button>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              Belum ada penerima. Tambahkan di atas untuk memulai.
            </div>
          )}
        </div>
      </div>
    </>
  )
}
