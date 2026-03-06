import type { NextApiRequest, NextApiResponse } from 'next'
import { getRecipientByToken, getRecipientByEmail } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = (req.query.token as string) || ''
  const email = (req.query.email as string) || ''

  let rec = token ? await getRecipientByToken(token) : null
  if (!rec && email) rec = await getRecipientByEmail(email)

  res.status(200).json(rec || {})
}
