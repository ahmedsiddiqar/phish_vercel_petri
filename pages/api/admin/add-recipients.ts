import type { NextApiRequest, NextApiResponse } from 'next'
import { insertRecipient } from '@/lib/supabase'
import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'

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

  const { emails, campaign, baseUrl, method } = req.body as {
    emails: string[]
    campaign: string
    baseUrl: string
    method: string
  }

  const links: { email: string; token: string; link: string }[] = []

  for (const email of emails) {
    if (!email.includes('@')) continue
    const token = uuidv4().slice(0, 12)
    await insertRecipient(token, email, campaign, 'token')

    let link = baseUrl.replace(/\/$/, '')
    if (method === 'token') link += `/?token=${token}`
    else if (method === 'email') link += `/?email=${encodeURIComponent(email)}`
    else link += `/?token=${token}&email=${encodeURIComponent(email)}`

    links.push({ email, token, link })
  }

  res.status(200).json(links)
}
