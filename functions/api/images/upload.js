function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
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

export async function onRequestPost({ request, env }) {
  // Protected: upload image for a section. Stores image data in D1 as base64 text.
  const auth = await authenticate(request, env);
  if (!auth) return new Response('Unauthorized', { status: 401 });

  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) return new Response('Expected multipart/form-data', { status: 400 });
  const form = await request.formData();
  const sectionSlug = form.get('section');
  const file = form.get('file');
  if (!sectionSlug || !file) return new Response('Missing fields', { status: 400 });
  const filename = file.name || 'upload';
  const buf = await file.arrayBuffer();
  const size = buf.byteLength || 0;
  // Limit to 2MB for Pages/D1 storage safety
  if (size > 2 * 1024 * 1024) return new Response('File too large', { status: 400 });
  const ct = file.type || 'application/octet-stream';
  if (!['image/png','image/jpeg','image/jpg','image/gif','image/webp'].includes(ct)) {
    return new Response('Invalid image type', { status: 400 });
  }

  const secRow = await env.DB.prepare('SELECT id FROM sections WHERE slug = ?').bind(sectionSlug).first();
  if (!secRow) return new Response('Invalid section', { status: 400 });

  // Generate a unique r2_key placeholder so existing schema's NOT NULL constraint is satisfied
  const key = `${Date.now()}-${Math.random().toString(36).slice(2)}-${filename}`;
  const b64 = arrayBufferToBase64(buf);

  await env.DB.prepare('INSERT INTO images (section_id, r2_key, filename, content_type, data) VALUES (?, ?, ?, ?, ?)').bind(secRow.id, key, filename, ct, b64).run();
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type':'application/json' } });
}
