export async function getIdentity(env) {
  const identity = await env.DB
    .prepare(
      `SELECT id, company_name, logo_url, updated_at
       FROM website_identity
       WHERE id = 1
       LIMIT 1`
    )
    .first();

  if (!identity) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Website identity not found."
      }),
      {
        status: 404,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      identity
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}


export async function updateIdentity(request, env) {
  let data;

  try {
    data = await request.json();
  } catch {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Invalid JSON."
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }

  const companyName = String(data.company_name || "")
    .trim();

  if (!companyName) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Company name is required."
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }

  await env.DB
    .prepare(
      `UPDATE website_identity
       SET company_name = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = 1`
    )
    .bind(companyName)
    .run();

  return new Response(
    JSON.stringify({
      success: true,
      message: "Website identity updated."
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}
