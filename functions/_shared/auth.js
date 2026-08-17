export async function authenticateRequest(request, env) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return null;
  const row = await env.DB.prepare('SELECT token, admin_id, expires_at FROM sessions WHERE token = ?').bind(token).first();
  if (!row) return null;
  if (row.expires_at && new Date(row.expires_at) < new Date()) {
    await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
    return null;
  }
  return { adminId: row.admin_id, token };
}
