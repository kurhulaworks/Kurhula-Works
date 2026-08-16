export async function onRequestPost({ request, env }) {
  // multipart form upload
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) return new Response('Expected multipart/form-data', { status: 400 });
  const form = await request.formData();
  const sectionSlug = form.get('section');
  const file = form.get('file');
  if (!sectionSlug || !file) return new Response('Missing fields', { status: 400 });
  const filename = file.name || 'upload';
  const buf = await file.arrayBuffer();
  const ct = file.type || 'application/octet-stream';
  if (!['image/png','image/jpeg','image/jpg','image/gif','image/webp'].includes(ct)) {
    return new Response('Invalid image type', { status: 400 });
  }
  const secRow = await env.DB.prepare('SELECT id FROM sections WHERE slug = ?').bind(sectionSlug).first();
  if (!secRow) return new Response('Invalid section', { status: 400 });
  const key = `${Date.now()}-${Math.random().toString(36).slice(2)}-${filename}`;
  await env.IMAGES.put(key, buf, { httpMetadata: { contentType: ct } });
  await env.DB.prepare('INSERT INTO images (section_id, r2_key, filename, content_type) VALUES (?, ?, ?, ?)').bind(secRow.id, key, filename, ct).run();
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type':'application/json' } });
}
