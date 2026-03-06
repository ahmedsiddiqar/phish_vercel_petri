import { supabaseAdmin } from '../../lib/supabase'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'petridish-admin-2025'

export default async function handler(req, res) {
  const auth = req.headers['x-admin-password']
  if (auth !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { campaign_id } = req.query

  if (!campaign_id) {
    return res.status(400).json({ error: 'campaign_id is required' })
  }

  const { data, error } = await supabaseAdmin
    .from('clicks')
    .select('*')
    .eq('campaign_id', campaign_id)
    .order('clicked_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })

  return res.status(200).json(data)
}
