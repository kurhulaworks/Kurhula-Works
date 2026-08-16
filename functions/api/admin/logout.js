export async function onRequestPost({ request, env }) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type':'application/json' } });
  await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type':'application/json' } });
}
