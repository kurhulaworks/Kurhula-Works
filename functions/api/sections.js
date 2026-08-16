export async function onRequestGet({ env }) {
  // GET /api/sections
  const res = await env.DB.prepare('SELECT id, name, slug FROM sections ORDER BY id').all();
  return new Response(JSON.stringify(res.results || []), { headers: { 'Content-Type':'application/json' } });
}
