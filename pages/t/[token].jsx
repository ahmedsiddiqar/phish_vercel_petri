import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function TrackPersonPage() {
  const router = useRouter()
  const { token } = router.query
  const [phase, setPhase] = useState('hook')
  const [recipientName, setRecipientName] = useState('')

  useEffect(() => {
    if (!token) return

    fetch('/api/track-person', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.recipient_name) setRecipientName(d.recipient_name.split(' ')[0])
      })
      .catch(console.error)

    const t1 = setTimeout(() => setPhase('reveal'), 1800)
    const t2 = setTimeout(() => setPhase('educate'), 3800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [token]) // removed `tracked` — was cancelling timers on re-render

  return (
    <>
      <Head>
        <title>Important Security Notice — Petridish</title>
        <meta name="robots" content="noindex,nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@400;700;800&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #0a0a0f; --surface: #13131a; --border: #2a2a3a;
          --accent: #ff3b3b; --accent2: #ff8c42; --green: #00e676;
          --text: #e8e8f0; --muted: #6b6b80;
          --mono: 'IBM Plex Mono', monospace; --sans: 'Syne', sans-serif;
        }
        body { background: var(--bg); color: var(--text); font-family: var(--sans); min-height: 100vh; overflow-x: hidden; }

        .noise { position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          opacity: 0.4; }

        .hook-screen { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background: var(--bg); z-index: 10; transition: opacity 0.6s ease, transform 0.6s ease; }
        .hook-screen.out { opacity: 0; transform: scale(1.04); pointer-events: none; }
        .hook-logo { font-family: var(--mono); font-size: 13px; letter-spacing: 0.3em; color: var(--muted); text-transform: uppercase; margin-bottom: 40px; text-align: center; }
        .hook-logo span { color: var(--accent2); }
        .spinner { width: 48px; height: 48px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 24px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .hook-text { font-size: 14px; color: var(--muted); font-family: var(--mono); letter-spacing: 0.05em; text-align: center; }

        .reveal-screen { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background: var(--bg); z-index: 9; opacity: 0; transform: scale(0.97); transition: opacity 0.5s ease, transform 0.5s ease; }
        .reveal-screen.in { opacity: 1; transform: scale(1); }
        .reveal-screen.out { opacity: 0; transform: scale(1.03); pointer-events: none; }
        .reveal-inner { text-align: center; max-width: 480px; padding: 40px 24px; }
        .warn-icon { width: 80px; height: 80px; background: rgba(255,59,59,0.1); border: 2px solid rgba(255,59,59,0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 28px; font-size: 32px; animation: pulse-border 2s ease infinite; }
        @keyframes pulse-border { 0%,100% { box-shadow: 0 0 0 0 rgba(255,59,59,0.3); } 50% { box-shadow: 0 0 0 16px rgba(255,59,59,0); } }
        .reveal-title { font-size: clamp(28px, 6vw, 44px); font-weight: 800; line-height: 1.1; margin-bottom: 16px; background: linear-gradient(135deg, var(--accent), var(--accent2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .reveal-name { font-size: clamp(20px, 4vw, 28px); font-weight: 700; margin-bottom: 12px; color: var(--text); }
        .reveal-sub { font-family: var(--mono); font-size: 13px; color: var(--muted); letter-spacing: 0.08em; }

        .main-content { position: relative; z-index: 1; max-width: 800px; margin: 0 auto; padding: 60px 24px 100px; opacity: 0; transform: translateY(20px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .main-content.visible { opacity: 1; transform: translateY(0); }

        .top-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 64px; padding-bottom: 20px; border-bottom: 1px solid var(--border); }
        .logo-text { font-family: var(--mono); font-size: 13px; letter-spacing: 0.25em; color: var(--muted); text-transform: uppercase; }
        .logo-text b { color: var(--accent2); font-weight: 600; }
        .badge { font-family: var(--mono); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; padding: 5px 12px; border: 1px solid rgba(0,230,118,0.3); border-radius: 100px; color: var(--green); background: rgba(0,230,118,0.05); }

        .hero-section { margin-bottom: 64px; }
        .caught-label { font-family: var(--mono); font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: var(--accent); margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
        .caught-label::before { content: ''; display: inline-block; width: 24px; height: 1px; background: var(--accent); }
        h1 { font-size: clamp(36px, 7vw, 60px); font-weight: 800; line-height: 1.08; letter-spacing: -0.02em; margin-bottom: 24px; }
        h1 em { font-style: normal; background: linear-gradient(90deg, var(--accent), var(--accent2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-body { font-size: 17px; line-height: 1.7; color: rgba(232,232,240,0.7); max-width: 560px; }

        .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; margin-bottom: 64px; }
        .stat { background: var(--surface); padding: 24px 20px; text-align: center; }
        .stat-num { font-size: 32px; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 4px; background: linear-gradient(135deg, var(--accent2), var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .stat-label { font-family: var(--mono); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); }

        .section-label { font-family: var(--mono); font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: var(--muted); margin-bottom: 24px; display: flex; align-items: center; gap: 12px; }
        .section-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }

        .cards { display: grid; gap: 16px; margin-bottom: 64px; }
        .card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 24px; display: grid; grid-template-columns: 48px 1fr; gap: 20px; align-items: start; transition: border-color 0.2s ease, transform 0.2s ease; }
        .card:hover { border-color: rgba(255,140,66,0.3); transform: translateX(4px); }
        .card-icon { width: 48px; height: 48px; background: rgba(255,140,66,0.08); border: 1px solid rgba(255,140,66,0.15); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
        .card-title { font-size: 16px; font-weight: 700; margin-bottom: 6px; letter-spacing: -0.01em; }
        .card-body { font-size: 14px; line-height: 1.65; color: rgba(232,232,240,0.6); }

        .checklist { display: grid; gap: 12px; margin-bottom: 64px; }
        .check-item { display: flex; gap: 14px; align-items: flex-start; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 16px 20px; }
        .check-dot { width: 20px; height: 20px; flex-shrink: 0; background: rgba(0,230,118,0.1); border: 1px solid rgba(0,230,118,0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; color: var(--green); margin-top: 1px; }
        .check-text { font-size: 14px; line-height: 1.6; color: rgba(232,232,240,0.75); }
        .check-text strong { color: var(--text); font-weight: 600; }

        .cta-block { background: var(--surface); border: 1px solid rgba(255,140,66,0.2); border-radius: 16px; padding: 40px; text-align: center; position: relative; overflow: hidden; }
        .cta-block::before { content: ''; position: absolute; top: -60px; left: 50%; transform: translateX(-50%); width: 300px; height: 150px; background: radial-gradient(ellipse, rgba(255,140,66,0.12) 0%, transparent 70%); }
        .cta-title { font-size: 22px; font-weight: 800; margin-bottom: 10px; position: relative; }
        .cta-sub { font-size: 14px; color: var(--muted); margin-bottom: 28px; font-family: var(--mono); letter-spacing: 0.05em; position: relative; }
        .cta-btn { display: inline-block; background: linear-gradient(135deg, var(--accent), var(--accent2)); color: white; border: none; padding: 14px 36px; border-radius: 8px; font-family: var(--sans); font-size: 15px; font-weight: 700; letter-spacing: 0.02em; cursor: pointer; position: relative; text-decoration: none; transition: opacity 0.2s ease, transform 0.2s ease; }
        .cta-btn:hover { opacity: 0.88; transform: translateY(-2px); }

        footer { margin-top: 80px; padding-top: 24px; border-top: 1px solid var(--border); text-align: center; font-family: var(--mono); font-size: 11px; color: var(--muted); letter-spacing: 0.08em; }

        @media (max-width: 600px) { .stats-row { grid-template-columns: 1fr; } .cta-block { padding: 28px 20px; } }
      `}</style>

      <div className="noise" />

      {/* PHASE 1 — Hook */}
      <div className={`hook-screen ${phase !== 'hook' ? 'out' : ''}`}>
        <div>
          <div className="hook-logo"><span>PETRIDISH</span> · INTERNAL</div>
          <div className="spinner" />
          <div className="hook-text">Loading secure content...</div>
        </div>
      </div>

      {/* PHASE 2 — Reveal */}
      <div className={`reveal-screen ${phase === 'reveal' ? 'in' : ''} ${phase === 'educate' ? 'out' : ''}`}>
        <div className="reveal-inner">
          <div className="warn-icon">⚠️</div>
          {recipientName && <div className="reveal-name">Hey {recipientName},</div>}
          <div className="reveal-title">You clicked a phishing link.</div>
          <div className="reveal-sub">But don't worry — this was a test.</div>
        </div>
      </div>

      {/* PHASE 3 — Education */}
      <div className={`main-content ${phase === 'educate' ? 'visible' : ''}`}>
        <div className="top-bar">
          <div className="logo-text"><b>Petridish</b> · Security Awareness</div>
          <div className="badge">✓ Internal Simulation</div>
        </div>

        <div className="hero-section">
          <div className="caught-label">Simulation complete</div>
          <h1>{recipientName ? `${recipientName}, you just got ` : 'You just got '}<em>phished</em> — here's what happened.</h1>
          <p className="hero-body">
            This was a controlled phishing simulation run by Petridish's security team.
            The link you clicked was designed to look legitimate — and it worked.
            Your information was not compromised, but in a real attack, it could have been.
          </p>
        </div>

        <div className="stats-row">
          <div className="stat"><div className="stat-num">91%</div><div className="stat-label">of attacks start with phishing</div></div>
          <div className="stat"><div className="stat-num">3.4B</div><div className="stat-label">phishing emails sent daily</div></div>
          <div className="stat"><div className="stat-num">97s</div><div className="stat-label">avg. time to click malicious link</div></div>
        </div>

        <div className="section-label">Red flags you may have missed</div>
        <div className="cards">
          {[
            { icon: '🔗', title: 'Suspicious URL', body: 'Real internal links always use petridish.com domains. Hover over links before clicking to inspect the full URL — attackers often use lookalike domains.' },
            { icon: '📧', title: 'Unexpected sender', body: 'Always verify sender addresses by checking the full email header, not just the display name. Spoofed names are trivial to fake.' },
            { icon: '⚡', title: 'Urgency tactics', body: 'Phishing emails create urgency — "Act now", "Your account will be suspended". Slow down and verify independently before clicking anything.' },
            { icon: '🔑', title: 'Request for credentials', body: 'Petridish IT will never ask for your password via email, link, or chat message. Any unexpected login page should be treated as suspicious.' },
          ].map((c, i) => (
            <div className="card" key={i}>
              <div className="card-icon">{c.icon}</div>
              <div><div className="card-title">{c.title}</div><div className="card-body">{c.body}</div></div>
            </div>
          ))}
        </div>

        <div className="section-label">What to do next time</div>
        <div className="checklist">
          {[
            ['Hover before you click', 'Always inspect a link\'s URL before clicking. If it looks off, it probably is.'],
            ['Verify through a separate channel', 'If an email seems important, call or message the sender directly.'],
            ['Report suspicious emails', 'Forward anything suspicious to security@petridish.com.'],
            ['Enable MFA everywhere', 'Multi-factor authentication limits damage even if your password is compromised.'],
            ['When in doubt, do nothing', 'It\'s always safer to pause and verify than to click and regret.'],
          ].map(([title, text], i) => (
            <div className="check-item" key={i}>
              <div className="check-dot">✓</div>
              <div className="check-text"><strong>{title}.</strong> {text}</div>
            </div>
          ))}
        </div>

        <div className="cta-block">
          <div className="cta-title">Complete your Security Awareness Training</div>
          <div className="cta-sub">Takes 10 minutes · Required for all Petridish employees</div>
          <a href="https://petridish.com/security-training" className="cta-btn">Start Training →</a>
        </div>

        <footer>© {new Date().getFullYear()} Petridish · Security Team · This was an internal phishing simulation</footer>
      </div>
    </>
  )
}
