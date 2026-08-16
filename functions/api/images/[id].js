async function authenticate(request, env) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return null;
  const row = await env.DB.prepare('SELECT token, admin_id, expires_at FROM sessions WHERE token = ?').bind(token).first();
  if (!row) return null;
  if (new Date(row.expires_at) < new Date()) {
    await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
    return null;
  }
  return { adminId: row.admin_id, token };
}

export async function onRequestDelete({ params, env, request }) {
  const auth = await authenticate(request, env);
  if (!auth) return new Response('Unauthorized', { status: 401 });
  const id = params.id;
  if (!id) return new Response('Not found', { status: 404 });
  await env.DB.prepare('DELETE FROM images WHERE id = ?').bind(id).run();
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type':'application/json' } });
}
