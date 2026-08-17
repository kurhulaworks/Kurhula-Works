export async function onRequestGet({ env }) {
  const row = await env.DB.prepare('SELECT * FROM business ORDER BY id LIMIT 1').first();
  return new Response(JSON.stringify(row || {}), { headers: { 'Content-Type': 'application/json' } });
}
