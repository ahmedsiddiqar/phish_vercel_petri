import { supabaseAdmin } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { token } = req.body
  if (!token) return res.status(400).json({ error: 'Missing token' })

  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'
  const userAgent = req.headers['user-agent'] || 'unknown'
  const referrer = req.headers['referer'] || req.headers['referrer'] || null
  const meta = {
    accept_language: req.headers['accept-language'] || null,
    platform: req.headers['sec-ch-ua-platform'] || null,
  }

  try {
    // 1. Try personal recipient token first (hex token, 32 chars)
    const { data: recipient } = await supabaseAdmin
      .from('recipients')
      .select('id, name, email, campaign_id, clicked_at, click_count, campaigns(id, name, is_active)')
      .eq('token', token)
      .maybeSingle()

    if (recipient) {
      const campaign = recipient.campaigns
      if (!campaign?.is_active) return res.status(410).json({ error: 'Campaign inactive' })

      const now = new Date().toISOString()
      await supabaseAdmin.from('recipients').update({
        clicked_at: recipient.clicked_at ?? now,
        click_count: (recipient.click_count || 0) + 1,
      }).eq('id', recipient.id)

      await supabaseAdmin.from('clicks').insert({
        campaign_id: campaign.id,
        recipient_id: recipient.id,
        recipient_name: recipient.name,
        recipient_email: recipient.email,
        ip_address: ip,
        user_agent: userAgent,
        referrer,
        metadata: meta,
      })

      return res.status(200).json({
        success: true,
        type: 'person',
        recipient_name: recipient.name,
        campaign: campaign.name,
      })
    }

    // 2. Fall back to campaign slug
    const { data: campaign } = await supabaseAdmin
      .from('campaigns')
      .select('id, name, is_active')
      .eq('slug', token)
      .maybeSingle()

    if (!campaign) return res.status(404).json({ error: 'Not found' })
    if (!campaign.is_active) return res.status(410).json({ error: 'Campaign inactive' })

    await supabaseAdmin.from('clicks').insert({
      campaign_id: campaign.id,
      ip_address: ip,
      user_agent: userAgent,
      referrer,
      metadata: meta,
    })

    return res.status(200).json({ success: true, type: 'campaign', campaign: campaign.name })
  } catch (err) {
    console.error('Track error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
