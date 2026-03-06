import { supabaseAdmin } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { slug } = req.body

  if (!slug) {
    return res.status(400).json({ error: 'Missing slug' })
  }

  try {
    // Find the campaign
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('campaigns')
      .select('id, name, is_active')
      .eq('slug', slug)
      .single()

    if (campaignError || !campaign) {
      return res.status(404).json({ error: 'Campaign not found' })
    }

    if (!campaign.is_active) {
      return res.status(410).json({ error: 'Campaign is no longer active' })
    }

    // Extract visitor info
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.socket?.remoteAddress ||
      'unknown'

    const userAgent = req.headers['user-agent'] || 'unknown'
    const referrer = req.headers['referer'] || req.headers['referrer'] || null

    // Log the click
    const { error: insertError } = await supabaseAdmin.from('clicks').insert({
      campaign_id: campaign.id,
      ip_address: ip,
      user_agent: userAgent,
      referrer: referrer,
      metadata: {
        accept_language: req.headers['accept-language'] || null,
        sec_ch_ua: req.headers['sec-ch-ua'] || null,
        platform: req.headers['sec-ch-ua-platform'] || null,
      },
    })

    if (insertError) {
      console.error('Insert error:', insertError)
      return res.status(500).json({ error: 'Failed to log click' })
    }

    return res.status(200).json({ success: true, campaign: campaign.name })
  } catch (err) {
    console.error('Track error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
