const SESSION_COOKIE = "kw_admin_session";
const SESSION_DAYS = 7;
const PBKDF2_ITERATIONS = 310000;

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders
    }
  });
}

function getCookie(request, name) {
  const header = request.headers.get("Cookie") || "";

  for (const part of header.split(";")) {
    const trimmed = part.trim();
    const separator = trimmed.indexOf("=");

    if (separator === -1) continue;

    const key = trimmed.slice(0, separator);
    const value = trimmed.slice(separator + 1);

    if (key === name) {
      return decodeURIComponent(value);
    }
  }

  return null;
}

function bytesToBase64(bytes) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

function createRandomBytes(length) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

async function derivePasswordHash(password, salt) {
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
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

  return new Uint8Array(bits);
}

async function hashPassword(password) {
  const salt = createRandomBytes(16);
  const derived = await derivePasswordHash(password, salt);

  return [
    "pbkdf2",
    PBKDF2_ITERATIONS,
    bytesToBase64(salt),
    bytesToBase64(derived)
  ].join("$");
}

function constantTimeEqual(a, b) {
  if (a.length !== b.length) return false;

  let difference = 0;

  for (let i = 0; i < a.length; i++) {
    difference |= a[i] ^ b[i];
  }

  return difference === 0;
}

async function verifyPassword(password, storedHash) {
  const parts = storedHash.split("$");

  if (parts.length !== 4) return false;
  if (parts[0] !== "pbkdf2") return false;

  const iterations = Number(parts[1]);

  if (!Number.isInteger(iterations)) return false;

  const salt = base64ToBytes(parts[2]);
  const expected = base64ToBytes(parts[3]);

  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256"
    },
    key,
    expected.length * 8
  );

  return constantTimeEqual(
    new Uint8Array(bits),
    expected
  );
}

async function sha256(value) {
  const data = new TextEncoder().encode(value);

  const hash = await crypto.subtle.digest(
    "SHA-256",
    data
  );

  return bytesToBase64(new Uint8Array(hash));
}

function createSessionToken() {
  return bytesToBase64(createRandomBytes(32));
}

async function createSession(env, accountType, accountId) {
  const token = createSessionToken();
  const tokenHash = await sha256(token);

  const expiresAt = new Date(
    Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  await env.DB
    .prepare(
      `INSERT INTO sessions
       (session_token_hash, account_type, account_id, expires_at)
       VALUES (?, ?, ?, ?)`
    )
    .bind(
      tokenHash,
      accountType,
      accountId,
      expiresAt
    )
    .run();

  return {
    token,
    expiresAt
  };
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  let data;

  try {
    data = await request.json();
  } catch {
    return json({
      success: false,
      error: "Invalid JSON."
    }, 400);
  }

  /*
   * LOGIN
   * POST /auth/login
   */

  if (url.pathname === "/auth/login") {
    const email = String(data.email || "")
      .trim()
      .toLowerCase();

    const password = String(data.password || "");

    if (!email || !password) {
      return json({
        success: false,
        error: "Email and password are required."
      }, 400);
    }

    let account = await env.DB
      .prepare(
        `SELECT id, email, name, status, password_hash
         FROM admins
         WHERE email = ?
         LIMIT 1`
      )
      .bind(email)
      .first();

    let accountType = "admin";

    if (!account) {
      account = await env.DB
        .prepare(
          `SELECT id, email, name, status, password_hash
           FROM users
           WHERE email = ?
           LIMIT 1`
        )
        .bind(email)
        .first();

      accountType = "user";
    }

    if (
      !account ||
      account.status !== "active" ||
      !await verifyPassword(
        password,
        account.password_hash
      )
    ) {
      return json({
        success: false,
        error: "Invalid email or password."
      }, 401);
    }

    const session = await createSession(
      env,
      accountType,
      account.id
    );

    return json(
      {
        success: true,
        account: {
          type: accountType,
          id: account.id,
          email: account.email,
          name: account.name
        }
      },
      200,
      {
        "Set-Cookie":
          `${SESSION_COOKIE}=${encodeURIComponent(session.token)}; ` +
          `Path=/; ` +
          `HttpOnly; ` +
          `Secure; ` +
          `SameSite=Strict; ` +
          `Max-Age=${SESSION_DAYS * 24 * 60 * 60}`
      }
    );
  }

  /*
   * LOGOUT
   * POST /auth/logout
   */

  if (url.pathname === "/auth/logout") {
    const token = getCookie(
      request,
      SESSION_COOKIE
    );

    if (token) {
      const tokenHash = await sha256(token);

      await env.DB
        .prepare(
          "DELETE FROM sessions WHERE session_token_hash = ?"
        )
        .bind(tokenHash)
        .run();
    }

    return json(
      {
        success: true,
        message: "Logged out."
      },
      200,
      {
        "Set-Cookie":
          `${SESSION_COOKIE}=; ` +
          `Path=/; ` +
          `HttpOnly; ` +
          `Secure; ` +
          `SameSite=Strict; ` +
          `Max-Age=0`
      }
    );
  }

  return json({
    success: false,
    error: "Authentication endpoint not found."
  }, 404);
}





export function onRequestGet(context) {
  return new Response(
    JSON.stringify({
      success: true,
      message: "Authentication service is running."
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
      }
