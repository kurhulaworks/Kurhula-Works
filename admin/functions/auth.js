const jsonHeaders = {
  "Content-Type": "application/json"
};

const SESSION_DAYS = 7;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: jsonHeaders
  });
}

function getCookie(request, name) {
  const cookieHeader = request.headers.get("Cookie") || "";

  for (const part of cookieHeader.split(";")) {
    const [key, ...valueParts] = part.trim().split("=");

    if (key === name) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return null;
}

function bytesToHex(bytes) {
  return [...new Uint8Array(bytes)]
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256(value) {
  const data = new TextEncoder().encode(value);

  const hash = await crypto.subtle.digest(
    "SHA-256",
    data
  );

  return bytesToHex(hash);
}

function createToken() {
  const bytes = new Uint8Array(32);

  crypto.getRandomValues(bytes);

  return bytesToHex(bytes);
}

function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders()
    });
  }

  const url = new URL(request.url);

  if (request.method !== "POST") {
    return json({
      success: false,
      error: "Method not allowed."
    }, 405);
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

  /*
    LOGIN
    POST /auth/login
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

    const passwordHash = await sha256(password);

    let account = await env.DB
      .prepare(
        `SELECT id, email, name, status
         FROM admins
         WHERE email = ?
         AND password_hash = ?
         AND status = 'active'
         LIMIT 1`
      )
      .bind(email, passwordHash)
      .first();

    let accountType = "admin";

    if (!account) {
      account = await env.DB
        .prepare(
          `SELECT id, email, name, status
           FROM users
           WHERE email = ?
           AND password_hash = ?
           AND status = 'active'
           LIMIT 1`
        )
        .bind(email, passwordHash)
        .first();

      accountType = "user";
    }

    if (!account) {
      return json({
        success: false,
        error: "Invalid email or password."
      }, 401);
    }

    const token = createToken();
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
        account.id,
        expiresAt
      )
      .run();

    return new Response(
      JSON.stringify({
        success: true,
        account: {
          type: accountType,
          id: account.id,
          email: account.email,
          name: account.name
        }
      }),
      {
        status: 200,
        headers: {
          ...jsonHeaders,
          "Set-Cookie":
            `kw_admin_session=${encodeURIComponent(token)}; ` +
            `Path=/; ` +
            `HttpOnly; ` +
            `Secure; ` +
            `SameSite=Strict; ` +
            `Max-Age=${SESSION_DAYS * 24 * 60 * 60}`
        }
      }
    );
  }

  /*
    LOGOUT
    POST /auth/logout
  */

  if (url.pathname === "/auth/logout") {
    const token = getCookie(
      request,
      "kw_admin_session"
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

    return new Response(
      JSON.stringify({
        success: true,
        message: "Logged out."
      }),
      {
        status: 200,
        headers: {
          ...jsonHeaders,
          "Set-Cookie":
            "kw_admin_session=; " +
            "Path=/; " +
            "HttpOnly; " +
            "Secure; " +
            "SameSite=Strict; " +
            "Max-Age=0"
        }
      }
    );
  }

  return json({
    success: false,
    error: "Authentication endpoint not found."
  }, 404);
}
