export async function onRequestPost({ request, env }) {
  // POST /api/enquiries
  const data = await request.json().catch(()=>null);
  if (!data) return new Response('Bad request', { status: 400 });
  const name = (data.name||'').trim();
  const email = (data.email||'').trim();
  const phone = (data.phone||'').trim();
  const message = (data.message||'').trim();
  if (!name || !email || !message) return new Response('Missing fields', { status: 400 });
  await env.DB.prepare('INSERT INTO enquiries (name, email, phone, message) VALUES (?, ?, ?, ?)').bind(name, email, phone, message).run();
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type':'application/json' } });
}

export async function onRequestGet({ env, request }) {
  // GET /api/enquiries (protected)
  const auth = await authenticate(request, env);
  if (!auth) return new Response('Unauthorized', { status: 401 });
  const q = await env.DB.prepare('SELECT id, name, email, phone, message, created_at, is_read FROM enquiries ORDER BY created_at DESC').all();
  return new Response(JSON.stringify(q.results || []), { headers: { 'Content-Type':'application/json' } });
}

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
