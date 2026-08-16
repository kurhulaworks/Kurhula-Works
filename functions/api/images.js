export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const section = url.searchParams.get('section');
  if (!section) return new Response(JSON.stringify([]), { headers: { 'Content-Type':'application/json' } });
  const q = await env.DB.prepare('SELECT images.id, images.filename, images.content_type, sections.slug FROM images JOIN sections ON images.section_id = sections.id WHERE sections.slug = ? ORDER BY images.uploaded_at DESC').bind(section).all();
  const results = (q.results || []).map(r => ({ id: r.id, filename: r.filename, url: `/images/${r.id}`, content_type: r.content_type }));
  return new Response(JSON.stringify(results), { headers: { 'Content-Type':'application/json' } });
}
