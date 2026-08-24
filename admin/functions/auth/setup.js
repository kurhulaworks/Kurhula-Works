const SETUP_SECRET = "@Kurhula33444";
const PBKDF2_ITERATIONS = 310000;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

function bytesToBase64(bytes) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function createRandomBytes(length) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

async function hashPassword(password) {
  const salt = createRandomBytes(16);

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256"
    },
    key,
    256
  );

  return [
    "pbkdf2",
    PBKDF2_ITERATIONS,
    bytesToBase64(salt),
    bytesToBase64(new Uint8Array(bits))
  ].join("$");
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const providedSecret =
  request.headers.get("X-Setup-Secret");

if (
  !providedSecret ||
  providedSecret !== SETUP_SECRET
) {
  return json({
    success: false,
    error: "Unauthorized."
  }, 401);
}
  const existing = await env.DB
    .prepare("SELECT id FROM admins LIMIT 1")
    .first();

  if (existing) {
    return json({
      success: false,
      error: "Admin setup has already been completed."
    }, 403);
  }

  let data;

  try {
    data = await request.json();
  } catch {
    return json({
      success: false,
      error: "Invalid JSON."
    }, 400);
  }

  const email = String(data.email || "")
    .trim()
    .toLowerCase();

  const name = String(data.name || "").trim();
  const password = String(data.password || "");

  if (!email || !name || !password) {
    return json({
      success: false,
      error: "Email, name and password are required."
    }, 400);
  }

  if (password.length < 10) {
    return json({
      success: false,
      error: "Password must be at least 10 characters."
    }, 400);
  }

  const passwordHash = await hashPassword(password);

  await env.DB
    .prepare(
      `INSERT INTO admins
       (email, password_hash, name, status)
       VALUES (?, ?, ?, 'active')`
    )
    .bind(
      email,
      passwordHash,
      name
    )
    .run();

  return json({
    success: true,
    message: "First admin account created successfully."
  });
}
