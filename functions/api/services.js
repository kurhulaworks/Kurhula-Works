export async function onRequestGet({ env }) {
  const q = await env.DB.prepare(
    'SELECT id, title, slug, description, image_id, display_order FROM services WHERE active = 1 ORDER BY display_order ASC, id DESC'
  ).all();
  return new Response(JSON.stringify(q.results || []), { headers: { 'Content-Type': 'application/json' } });
}
