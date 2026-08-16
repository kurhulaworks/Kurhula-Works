export async function onRequestPost({ request, env }) {
  const data = await request.json().catch(()=>null);
  if (!data) return new Response('Bad request', { status: 400 });
  const username = (data.username||'').trim();
  const password = (data.password||'').trim();
  if (!username || !password) return new Response('Missing', { status: 400 });
  const row = await env.DB.prepare('SELECT id, password FROM administrators WHERE username = ?').bind(username).first();
  if (!row) return new Response('Unauthorized', { status: 401 });
  if (row.password !== password) return new Response('Unauthorized', { status: 401 });
  // Some Pages Functions runtimes may not expose crypto.getRandomValues in all contexts; use a simple PRNG for token generation to avoid runtime exceptions.
  const token = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,12);
  const expires = new Date(Date.now() + 1000*60*60*24).toISOString();
  await env.DB.prepare('INSERT INTO sessions (token, admin_id, expires_at) VALUES (?, ?, ?)').bind(token, row.id, expires).run();
  return new Response(JSON.stringify({ token }), { headers: { 'Content-Type':'application/json' } });
}
