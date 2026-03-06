import type { NextApiRequest, NextApiResponse } from 'next'
import { logClick } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = (req.query.token as string) || ''
  const email = (req.query.email as string) || ''
  await logClick(token, email)
  res.status(200).json({ ok: true })
}
