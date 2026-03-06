import { useEffect, useState } from 'react'
import Head from 'next/head'
import styles from './index.module.css'

interface Recipient {
  email?: string
  clicked?: boolean
}

const RED_FLAGS = [
  {
    icon: '📮',
    title: 'Domain pengirim tidak cocok',
    body: 'Email tampak berasal dari alamat yang sah, namun domain pengiriman sebenarnya sedikit berbeda. Selalu periksa header From secara lengkap, bukan hanya nama tampilan.',
  },
  {
    icon: '⏰',
    title: 'Urgensi buatan',
    body: "Frasa seperti 'Tindakan segera diperlukan' atau 'Akun Anda kedaluwarsa hari ini' adalah taktik tekanan yang dirancang agar Anda bertindak tanpa berpikir kritis.",
  },
  {
    icon: '🔗',
    title: 'Tautan tak terduga',
    body: 'Sistem internal yang sah jarang meminta Anda mengklik tautan email yang tidak diminta. Akses portal langsung dengan mengetik URL di browser Anda.',
  },
  {
    icon: '🎭',
    title: 'Peniruan otoritas',
    body: 'Email meniru IT, HRD, atau manajemen. Penyerang memanfaatkan naluri Anda untuk mematuhi figur otoritas.',
  },
]

const TIPS = [
  {
    icon: '🔍',
    title: 'Arahkan kursor sebelum mengklik',
    body: 'Arahkan kursor ke tautan apa pun untuk melihat pratinjau URL tujuan sebenarnya di bilah status browser.',
  },
  {
    icon: '🔑',
    title: 'Gunakan pengelola kata sandi',
    body: 'Pengelola kata sandi hanya mengisi otomatis di situs yang dikenal dan sah — tidak akan mengisi di halaman palsu.',
  },
  {
    icon: '📞',
    title: 'Hubungi untuk verifikasi',
    body: 'Jika email meminta Anda melakukan sesuatu yang tidak biasa — bahkan dari atasan Anda — hubungi mereka langsung untuk konfirmasi.',
  },
  {
    icon: '🚨',
    title: 'Laporkan phishing dengan cepat',
    body: "Gunakan tombol 'Laporkan Phishing' di Outlook/Gmail atau teruskan ke tim keamanan Anda.",
  },
  {
    icon: '🔒',
    title: 'Aktifkan MFA di mana saja',
    body: 'Autentikasi multi-faktor berarti kata sandi yang dicuri saja tidak cukup untuk mengkompromikan akun Anda.',
  },
  {
    icon: '📖',
    title: 'Tetap ikuti pelatihan',
    body: 'Taktik penyerang terus berkembang. Pelatihan keamanan rutin menjaga pola-pola ini tetap segar dan mudah dikenali.',
  },
]

export default function WarningPage() {
  const [rec, setRec] = useState<Recipient>({})
  const [tracked, setTracked] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token') || ''
    const email = params.get('email') || ''

    if (token || email) {
      // Fire tracking
      fetch(`/api/track?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`)

      // Fetch recipient data
      fetch(`/api/recipient?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`)
        .then((r) => r.json())
        .then((data) => setRec(data))

      setTracked(true)
    }
  }, [])

  const emailAddr = rec.email || ''
  const firstName = emailAddr.includes('@')
    ? emailAddr.split('@')[0].split('.')[0]
    : 'Anda'
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1)
  const didClick = rec.clicked ?? tracked

  return (
    <>
      <Head>
        <title>Keamanan Siber | IT</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className={styles.page}>
        <div className={styles.container}>

          {/* Hero */}
          <div className={styles.hero}>
            <div className={styles.heroBg} />
            <span className={styles.badge}>⚠ Pelatihan Kesadaran Keamanan</span>
            <div className={styles.heroIcon}>🎣</div>
            <h1 className={styles.heroTitle}>Anda baru saja mengklik tautan phishing simulasi.</h1>
            <p className={styles.heroSub}>
              Ini adalah uji coba yang dikendalikan oleh Tim Keamanan IT perusahaan Anda.
              Tidak ada data nyata yang dikumpulkan dan akun Anda sepenuhnya aman.
            </p>
          </div>

          {/* Result box */}
          {didClick ? (
            <div className={`${styles.resultBox} ${styles.amber}`}>
              <span className={styles.resultIcon}>⚠️</span>
              <div>
                <strong>Halo {displayName} — Anda mengklik tautan tersebut.</strong>
                <br />
                Dalam serangan phishing nyata, hanya dengan mengklik saja sudah cukup bagi penyerang
                untuk mengonfirmasi bahwa email Anda aktif, menyebarkan malware melalui unduhan
                otomatis, atau mencuri cookie sesi — tanpa Anda perlu memasukkan kata sandi sama sekali.
              </div>
            </div>
          ) : (
            <div className={`${styles.resultBox} ${styles.green}`}>
              <span className={styles.resultIcon}>✅</span>
              <div>
                <strong>Halo {displayName} — naluri Anda bagus!</strong>
                <br />
                Anda membuka halaman ini tanpa memicu peristiwa klik yang dilacak. Tetap waspada
                dan percayai insting Anda.
              </div>
            </div>
          )}

          {/* Red flags */}
          <div className={styles.sectionLabel}>Tanda bahaya dalam email uji ini</div>
          <div className={styles.grid2}>
            {RED_FLAGS.map((f) => (
              <div key={f.title} className={styles.tipCard}>
                <span className={styles.tipIcon}>{f.icon}</span>
                <div>
                  <div className={styles.tipTitle}>{f.title}</div>
                  <div className={styles.tipBody}>{f.body}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Protection tips */}
          <div className={styles.sectionLabel}>Cara melindungi diri Anda</div>
          <div className={styles.grid2}>
            {TIPS.map((t) => (
              <div key={t.title} className={styles.tipCard}>
                <span className={styles.tipIcon}>{t.icon}</span>
                <div>
                  <div className={styles.tipTitle}>{t.title}</div>
                  <div className={styles.tipBody}>{t.body}</div>
                </div>
              </div>
            ))}
          </div>

          <hr className={styles.divider} />
          <p className={styles.footer}>
            Latihan ini telah diotorisasi oleh Tim Keamanan IT Anda. Hasil digunakan hanya untuk
            tujuan pelatihan — tidak pernah untuk tindakan disipliner. Ada pertanyaan? Hubungi{' '}
            <strong>ahmed.siddiq@petridish-id.org</strong>.
          </p>
        </div>
      </div>
    </>
  )
}
