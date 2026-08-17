import { json, error } from '../../../_shared/response.js';
import { authenticateRequest } from '../../../_shared/auth.js';

export async function onRequestGet({ request, env }) {
  const auth = await authenticateRequest(request, env);
  if (!auth) return error('Unauthorized', 401);
  const q = await env.DB.prepare('SELECT * FROM services ORDER BY display_order ASC, id DESC').all();
  return json(q.results || []);
}

export async function onRequestPost({ request, env }) {
  const auth = await authenticateRequest(request, env);
  if (!auth) return error('Unauthorized', 401);
  const body = await request.json().catch(() => null);
  if (!body || !body.title) return error('Missing required field: title', 400);
  const title = (body.title || '').trim().slice(0, 255);
  const slug = body.slug ? (body.slug + '').trim().toLowerCase() : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const exist = await env.DB.prepare('SELECT id FROM services WHERE slug = ?').bind(slug).first();
  if (exist) return error('Slug already exists', 409);
  const description = body.description || null;
  const image_id = body.image_id || null;
  const display_order = Number.isFinite(Number(body.display_order)) ? Number(body.display_order) : 0;
  const active = body.active === 0 || body.active === '0' ? 0 : 1;
  await env.DB.prepare(
    'INSERT INTO services (title, slug, description, image_id, display_order, active, created_at) VALUES (?,?,?,?,?,?,CURRENT_TIMESTAMP)'
  ).bind(title, slug, description, image_id, display_order, active).run();
  const inserted = await env.DB.prepare('SELECT * FROM services ORDER BY id DESC LIMIT 1').first();
  return json(inserted, 201);
}
