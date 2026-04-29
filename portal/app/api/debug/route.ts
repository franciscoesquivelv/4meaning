import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'NO DEFINIDA'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'NO DEFINIDA'
  return NextResponse.json({
    url_prefix: url.substring(0, 40),
    key_prefix: key.substring(0, 30),
    key_length: key.length,
  })
}
