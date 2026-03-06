import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// ── Types ──────────────────────────────────────────────────────────────────
export interface Recipient {
  id?: number
  token: string
  email: string
  campaign: string
  clicked: boolean
  click_ts: string | null
  source: string
  added_ts: string
}

// ── Recipients ─────────────────────────────────────────────────────────────
export async function getAllRecipients(): Promise<Recipient[]> {
  const { data } = await supabase.from('recipients').select('*')
  return data || []
}

export async function getRecipientByToken(token: string): Promise<Recipient | null> {
  if (!token) return null
  const { data } = await supabase.from('recipients').select('*').eq('token', token)
  return data?.[0] ?? null
}

export async function getRecipientByEmail(email: string): Promise<Recipient | null> {
  if (!email) return null
  const { data } = await supabase
    .from('recipients')
    .select('*')
    .eq('email', email.toLowerCase())
  return data?.[0] ?? null
}

export async function insertRecipient(
  token: string,
  email: string,
  campaign: string,
  source = 'token',
) {
  await supabase.from('recipients').insert({
    token,
    email: email.toLowerCase(),
    campaign,
    clicked: false,
    click_ts: null,
    source,
    added_ts: new Date().toISOString(),
  })
}

export async function markClicked(token: string) {
  await supabase
    .from('recipients')
    .update({ clicked: true, click_ts: new Date().toISOString() })
    .eq('token', token)
}

export async function logEvent(
  token: string,
  emailParam: string,
  eventType = 'click',
) {
  await supabase.from('events').insert({
    token: token || '',
    email_param: emailParam || '',
    event_type: eventType,
    ts: new Date().toISOString(),
  })
}

export async function clearAllData() {
  await supabase.from('events').delete().neq('token', '___never___')
  await supabase.from('recipients').delete().neq('token', '___never___')
}

// ── Click logic ────────────────────────────────────────────────────────────
export async function logClick(token: string, emailParam: string) {
  await logEvent(token, emailParam, 'click')

  if (token) {
    const rec = await getRecipientByToken(token)
    if (rec && !rec.clicked) {
      await markClicked(token)
      return
    }
  }

  if (emailParam) {
    const rec = await getRecipientByEmail(emailParam)
    if (rec) {
      if (!rec.clicked) await markClicked(rec.token)
    } else {
      const newTok = token || Math.random().toString(36).slice(2, 14)
      await insertRecipient(newTok, emailParam, 'pelacakan-email-param', 'email_param')
      await markClicked(newTok)
    }
  }
}
