export async function onRequestGet({ params, env }) {
  const key = params.key;
  if (!key) return new Response('Not found', { status: 404 });
  const obj = await env.IMAGES.get(key);
  if (!obj) return new Response('Not found', { status: 404 });
  return new Response(obj.body, { headers: { 'Content-Type': obj.httpMetadata.contentType || 'application/octet-stream' } });
}
