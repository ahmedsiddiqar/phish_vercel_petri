import type { NextApiRequest, NextApiResponse } from 'next'
import { clearAllData } from '@/lib/supabase'
import crypto from 'crypto'

const ADMIN_HASH = crypto
  .createHash('sha256')
  .update(process.env.ADMIN_PASSWORD || 'admin123')
  .digest('hex')

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const pwd = req.headers['x-admin-password'] as string
  if (!pwd || crypto.createHash('sha256').update(pwd).digest('hex') !== ADMIN_HASH) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  await clearAllData()
  res.status(200).json({ ok: true })
}
