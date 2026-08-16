export async function onRequestDelete({ params, env }) {
  const id = params.id;
  if (!id) return new Response('Not found', { status: 404 });
  const row = await env.DB.prepare('SELECT r2_key FROM images WHERE id = ?').bind(id).first();
  if (!row) return new Response('Not found', { status: 404 });
  await env.IMAGES.delete(row.r2_key);
  await env.DB.prepare('DELETE FROM images WHERE id = ?').bind(id).run();
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type':'application/json' } });
}
