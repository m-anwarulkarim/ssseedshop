// Cloudflare Pages Function: proxies /api/meta-catalog (and /api/meta-catalog.csv)
// to the live Supabase Edge Function so Meta Commerce Manager can schedule a daily
// fetch against https://ssseedshop.com/api/meta-catalog.csv.
// Keys used here are publishable/anon only — safe for client-visible code.

const PROJECT_URL = 'https://mmscnllcjgsqpzzdaeby.supabase.co'
const ANON_KEY = 'sb_publishable_Sw5LgD9nooriZGKsCiB2Tw_1tcKyP8g'

export async function onRequest() {
  try {
    const res = await fetch(`${PROJECT_URL}/functions/v1/meta-catalog`, {
      headers: { Authorization: `Bearer ${ANON_KEY}` },
    })

    return new Response(res.body, {
      status: res.status,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return new Response('Internal error generating feed', {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }
}
