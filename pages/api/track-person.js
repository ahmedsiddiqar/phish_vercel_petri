import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { token } = req.body

  if (!token) return res.status(400).json({ error: 'Missing token' })

  try {
    // Find the recipient and their campaign
    const { data: recipient, error: rErr } = await supabaseAdmin
      .from('recipients')
      .select('id, name, email, campaign_id, campaigns(id, name, is_active)')
      .eq('token', token)
      .single()

    if (rErr || !recipient) {
      return res.status(404).json({ error: 'Recipient not found' })
    }

    const campaign = recipient.campaigns
    if (!campaign?.is_active) {
      return res.status(410).json({ error: 'Campaign inactive' })
    }

    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.socket?.remoteAddress ||
      'unknown'

    const userAgent = req.headers['user-agent'] || 'unknown'
    const referrer = req.headers['referer'] || req.headers['referrer'] || null
    const now = new Date().toISOString()

    // Update recipient: set clicked_at (first click) and increment count
    await supabaseAdmin
      .from('recipients')
      .update({
        clicked_at: recipient.clicked_at ?? now,
        click_count: supabaseAdmin.rpc ? undefined : undefined, // handled below
      })
      .eq('id', recipient.id)

    // Increment click_count via rpc or manual fetch
    await supabaseAdmin.rpc('increment_click_count', { recipient_id: recipient.id }).catch(() => {
      // Fallback if RPC not set up — just update clicked_at
    })

    // Also do a simple update for clicked_at and click_count
    const { data: updated } = await supabaseAdmin
      .from('recipients')
      .select('click_count')
      .eq('id', recipient.id)
      .single()

    await supabaseAdmin
      .from('recipients')
      .update({
        clicked_at: recipient.clicked_at ?? now,
        click_count: (updated?.click_count || 0) + 1,
      })
      .eq('id', recipient.id)

    // Log to clicks table
    await supabaseAdmin.from('clicks').insert({
      campaign_id: campaign.id,
      recipient_id: recipient.id,
      recipient_name: recipient.name,
      recipient_email: recipient.email,
      ip_address: ip,
      user_agent: userAgent,
      referrer: referrer,
      metadata: {
        accept_language: req.headers['accept-language'] || null,
        platform: req.headers['sec-ch-ua-platform'] || null,
      },
    })

    return res.status(200).json({
      success: true,
      recipient_name: recipient.name,
      campaign: campaign.name,
    })
  } catch (err) {
    console.error('Track person error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
