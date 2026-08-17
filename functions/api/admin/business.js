import { json, error } from '../../_shared/response.js';
import { authenticateRequest } from '../../_shared/auth.js';

export async function onRequestGet({ request, env }) {
  const auth = await authenticateRequest(request, env);
  if (!auth) return error('Unauthorized', 401);
  const row = await env.DB.prepare('SELECT * FROM business ORDER BY id LIMIT 1').first();
  return json(row || {});
}

export async function onRequestPut({ request, env }) {
  const auth = await authenticateRequest(request, env);
  if (!auth) return error('Unauthorized', 401);
  const data = await request.json().catch(() => null);
  if (!data || !data.name) return error('Missing required field: name', 400);
  const name = (data.name || '').trim().slice(0, 255);
  const description = data.description || null;
  const phone = data.phone || null;
  const email = data.email || null;
  const whatsapp = data.whatsapp || null;
  const address = data.address || null;
  const socials = data.socials ? JSON.stringify(data.socials) : null;
  const metadata = data.metadata ? JSON.stringify(data.metadata) : null;

  const existing = await env.DB.prepare('SELECT id FROM business ORDER BY id LIMIT 1').first();
  if (existing && existing.id) {
    await env.DB.prepare(
      `UPDATE business SET name = ?, description = ?, phone = ?, email = ?, whatsapp = ?, address = ?, socials = ?, metadata = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    ).bind(name, description, phone, email, whatsapp, address, socials, metadata, existing.id).run();
    const updated = await env.DB.prepare('SELECT * FROM business WHERE id = ?').bind(existing.id).first();
    return json(updated);
  } else {
    await env.DB.prepare(
      `INSERT INTO business (name, description, phone, email, whatsapp, address, socials, metadata, created_at) VALUES (?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)`
    ).bind(name, description, phone, email, whatsapp, address, socials, metadata).run();
    const inserted = await env.DB.prepare('SELECT * FROM business ORDER BY id DESC LIMIT 1').first();
    return json(inserted, 201);
  }
}
