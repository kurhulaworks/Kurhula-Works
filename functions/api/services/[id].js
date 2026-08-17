export async function onRequestGet({ params, env }) {
  const id = params.id;
  const row = await env.DB.prepare(
    'SELECT id, title, slug, description, image_id, display_order FROM services WHERE id = ? AND active = 1'
  ).bind(id).first();
  if (!row) return new Response('Not found', { status: 404 });
  return new Response(JSON.stringify(row), { headers: { 'Content-Type': 'application/json' } });
}
