export async function onRequestGet({ params, env }) {
  const id = params.key;
  if (!id) return new Response('Not found', { status: 404 });
  const row = await env.DB.prepare('SELECT data, content_type FROM images WHERE id = ?').bind(id).first();
  if (!row || !row.data) return new Response('Not found', { status: 404 });
  // Decode base64 to binary
  const b64 = row.data;
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return new Response(bytes, { headers: { 'Content-Type': row.content_type || 'application/octet-stream' } });
}
