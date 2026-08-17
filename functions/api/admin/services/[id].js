import { json, error } from '../../../_shared/response.js';
import { authenticateRequest } from '../../../_shared/auth.js';

export async function onRequestPut({ params, request, env }) {
  const auth = await authenticateRequest(request, env);
  if (!auth) return error('Unauthorized', 401);

  const id = params.id;
  const body = await request.json().catch(() => null);
  if (!body) return error('Missing body', 400);

  // Fetch existing row to support safe partial updates
  const existing = await env.DB.prepare('SELECT * FROM services WHERE id = ?').bind(id).first();
  if (!existing) return error('Not found', 404);

  // Determine new values: if a field is not present in the request body, keep existing value.
  const has = (k) => Object.prototype.hasOwnProperty.call(body, k);

  let title = existing.title;
  if (has('title')) {
    title = body.title != null ? (body.title + '').trim().slice(0, 255) : null;
  }

  let slug = existing.slug;
  if (has('slug')) {
    slug = body.slug != null ? (body.slug + '').trim().toLowerCase() : null;
    if (slug && slug !== existing.slug) {
      const exist = await env.DB.prepare('SELECT id FROM services WHERE slug = ? AND id != ?').bind(slug, id).first();
      if (exist) return error('Slug already in use', 409);
    }
  }

  const description = has('description') ? (body.description ?? null) : existing.description;
  const image_id = has('image_id') ? (body.image_id ?? null) : existing.image_id;
  const display_order = has('display_order')
    ? (Number.isFinite(Number(body.display_order)) ? Number(body.display_order) : 0)
    : existing.display_order;
  const active = has('active')
    ? (body.active === 0 || body.active === '0' || body.active === false ? 0 : 1)
    : existing.active;

  await env.DB.prepare(
    'UPDATE services SET title = ?, slug = ?, description = ?, image_id = ?, display_order = ?, active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).bind(title, slug, description, image_id, display_order, active, id).run();

  const updated = await env.DB.prepare('SELECT * FROM services WHERE id = ?').bind(id).first();
  return json(updated);
}

export async function onRequestDelete({ params, request, env }) {
  const auth = await authenticateRequest(request, env);
  if (!auth) return error('Unauthorized', 401);

  const id = params.id;
  const existing = await env.DB.prepare('SELECT id FROM services WHERE id = ?').bind(id).first();
  if (!existing) return error('Not found', 404);

  // soft-delete
  await env.DB.prepare('UPDATE services SET active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(id).run();
  return json({ ok: true });
}
