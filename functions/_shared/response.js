export function json(obj, status=200){
  return new Response(JSON.stringify(obj||{}), { status, headers: { 'Content-Type': 'application/json' } });
}

export function error(msg, status=400){
  return new Response(JSON.stringify({ error: msg }), { status, headers: { 'Content-Type': 'application/json' } });
}
