import { supabaseAdmin } from '../../lib/supabase'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'petridish-admin-2025'

export default async function handler(req, res) {
  const auth = req.headers['x-admin-password']
  if (auth !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // GET /api/recipients?campaign_id=xxx
  if (req.method === 'GET') {
    const { campaign_id } = req.query
    if (!campaign_id) return res.status(400).json({ error: 'campaign_id required' })

    const { data, error } = await supabaseAdmin
      .from('recipients')
      .select('*')
      .eq('campaign_id', campaign_id)
      .order('created_at', { ascending: true })

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  // POST /api/recipients — add one or bulk (array)
  if (req.method === 'POST') {
    const { campaign_id, recipients } = req.body

    if (!campaign_id || !recipients?.length) {
      return res.status(400).json({ error: 'campaign_id and recipients[] required' })
    }

    const rows = recipients.map((r) => ({
      campaign_id,
      name: r.name.trim(),
      email: r.email.trim().toLowerCase(),
    }))

    const { data, error } = await supabaseAdmin
      .from('recipients')
      .insert(rows)
      .select()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(data)
  }

  // DELETE /api/recipients — delete one recipient
  if (req.method === 'DELETE') {
    const { id } = req.body
    const { error } = await supabaseAdmin.from('recipients').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
