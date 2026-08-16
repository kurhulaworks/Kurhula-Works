// Cloudflare Worker: API for Kurhula Works

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      if (url.pathname.startsWith('/api/')) {
        return await handleApi(request, env);
      }
      if (url.pathname.startsWith('/images/')) {
        // Proxy images from R2 by key: /images/<r2_key>
        const key = url.pathname.replace('/images/', '');
        if (!key) return new Response('Not found', { status: 404 });
        const obj = await env.IMAGES.get(key);
        if (!obj) return new Response('Not found', { status: 404 });
        return new Response(obj.body, {
          headers: { 'Content-Type': obj.httpMetadata.contentType || 'application/octet-stream' }
        });
      }

      // For Pages, allow passthrough (serve static) — deployment will handle static assets.
      return new Response('Not found', { status: 404 });
    } catch (err) {
      return new Response('Internal error: ' + err.message, { status: 500 });
    }
  }
};

async function handleApi(request, env) {
  const url = new URL(request.url);
  const method = request.method;
  const path = url.pathname.replace('/api', '');

  // Public endpoints
  if (path === '/sections' && method === 'GET') return listSections(env);
  if (path === '/images' && method === 'GET') return listImages(request, env);
  if (path === '/enquiries' && method === 'POST') return createEnquiry(request, env);

  // Admin auth
  if (path === '/admin/login' && method === 'POST') return adminLogin(request, env);
  if (path === '/admin/logout' && method === 'POST') return adminLogout(request, env);

  // Protected endpoints
  const auth = await authenticate(request, env);
  if (!auth || !auth.adminId) return new Response('Unauthorized', { status: 401 });

  if (path === '/enquiries' && method === 'GET') return getEnquiries(env);

  if (path === '/images/upload' && method === 'POST') return uploadImage(request, env, auth);
  if (path.startsWith('/images/') && method === 'DELETE') {
    const id = path.split('/')[2];
    return deleteImage(id, env);
  }

  return new Response('Not found', { status: 404 });
}

// Utilities
async function listSections(env) {
  const res = await env.DB.prepare('SELECT id, name, slug FROM sections ORDER BY id').all();
  return json(res.results || []);
}

async function listImages(request, env) {
  const url = new URL(request.url);
  const section = url.searchParams.get('section');
  if (!section) return json([]);
  const q = await env.DB.prepare('SELECT images.id, images.filename, images.r2_key, images.content_type, sections.slug FROM images JOIN sections ON images.section_id = sections.id WHERE sections.slug = ? ORDER BY images.uploaded_at DESC').bind(section).all();
  const results = (q.results || []).map(r => ({ id: r.id, filename: r.filename, url: `/images/${r.r2_key}`, content_type: r.content_type }));
  return json(results);
}

async function createEnquiry(request, env) {
  const data = await request.json().catch(()=>null);
  if (!data) return new Response('Bad request', { status: 400 });
  const name = (data.name||'').trim();
  const email = (data.email||'').trim();
  const phone = (data.phone||'').trim();
  const message = (data.message||'').trim();
  if (!name || !email || !message) return new Response('Missing fields', { status: 400 });

  await env.DB.prepare('INSERT INTO enquiries (name, email, phone, message) VALUES (?, ?, ?, ?)').bind(name, email, phone, message).run();
  return json({ ok: true });
}

async function adminLogin(request, env) {
  const data = await request.json().catch(()=>null);
  if (!data) return new Response('Bad request', { status: 400 });
  const username = (data.username||'').trim();
  const password = (data.password||'').trim();
  if (!username || !password) return new Response('Missing', { status: 400 });
  const row = await env.DB.prepare('SELECT id, password FROM administrators WHERE username = ?').bind(username).first();
  if (!row) return new Response('Unauthorized', { status: 401 });
  if (row.password !== password) return new Response('Unauthorized', { status: 401 });

  // Create a session token
  const token = crypto.getRandomValues(new Uint8Array(32)).reduce((s,b)=>s+(b%16).toString(16),'') + Date.now();
  const expires = new Date(Date.now() + 1000*60*60*24).toISOString();
  await env.DB.prepare('INSERT INTO sessions (token, admin_id, expires_at) VALUES (?, ?, ?)').bind(token, row.id, expires).run();
  return json({ token });
}

async function adminLogout(request, env) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return json({ ok: true });
  await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
  return json({ ok: true });
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

async function getEnquiries(env) {
  const q = await env.DB.prepare('SELECT id, name, email, phone, message, created_at, is_read FROM enquiries ORDER BY created_at DESC').all();
  return json(q.results || []);
}

async function uploadImage(request, env, auth) {
  // Expect multipart/form-data with 'file' and 'section' fields.
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) return new Response('Expected multipart/form-data', { status: 400 });
  const form = await request.formData();
  const sectionSlug = form.get('section');
  const file = form.get('file');
  if (!sectionSlug || !file) return new Response('Missing fields', { status: 400 });
  const filename = file.name || 'upload';
  const buf = await file.arrayBuffer();

  // Validate simple image types by content-type
  const ct = file.type || 'application/octet-stream';
  if (!['image/png','image/jpeg','image/jpg','image/gif','image/webp'].includes(ct)) {
    return new Response('Invalid image type', { status: 400 });
  }

  const secRow = await env.DB.prepare('SELECT id FROM sections WHERE slug = ?').bind(sectionSlug).first();
  if (!secRow) return new Response('Invalid section', { status: 400 });

  const key = `${Date.now()}-${Math.random().toString(36).slice(2)}-${filename}`;
  await env.IMAGES.put(key, buf, { httpMetadata: { contentType: ct } });
  await env.DB.prepare('INSERT INTO images (section_id, r2_key, filename, content_type) VALUES (?, ?, ?, ?)').bind(secRow.id, key, filename, ct).run();
  return json({ ok: true });
}

async function deleteImage(id, env) {
  const row = await env.DB.prepare('SELECT r2_key FROM images WHERE id = ?').bind(id).first();
  if (!row) return new Response('Not found', { status: 404 });
  await env.IMAGES.delete(row.r2_key);
  await env.DB.prepare('DELETE FROM images WHERE id = ?').bind(id).run();
  return json({ ok: true });
}

function json(obj){
  return new Response(JSON.stringify(obj), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
