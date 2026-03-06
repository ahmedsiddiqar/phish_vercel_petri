import { supabaseAdmin } from '../../lib/supabase'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'petridish-admin-2025'

export default async function handler(req, res) {
  // Simple auth check via header
  const auth = req.headers['x-admin-password']
  if (auth !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    // Fetch all campaigns with click counts
    const { data: campaigns, error } = await supabaseAdmin
      .from('campaigns')
      .select(`
        id,
        name,
        description,
        slug,
        created_at,
        is_active,
        clicks(count)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    const result = campaigns.map((c) => ({
      ...c,
      click_count: c.clicks?.[0]?.count || 0,
    }))

    return res.status(200).json(result)
  }

  if (req.method === 'POST') {
    // Create new campaign
    const { name, description, slug } = req.body

    if (!name || !slug) {
      return res.status(400).json({ error: 'name and slug are required' })
    }

    // Sanitize slug
    const cleanSlug = slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .insert({ name, description: description || null, slug: cleanSlug })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Slug already exists. Choose a different one.' })
      }
      return res.status(500).json({ error: error.message })
    }

    return res.status(201).json(data)
  }

  if (req.method === 'PATCH') {
    // Toggle campaign active status
    const { id, is_active } = req.body

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .update({ is_active })
      .eq('id', id)
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === 'DELETE') {
    const { id } = req.body
    const { error } = await supabaseAdmin.from('campaigns').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
