export async function handleEnquiry(request, env) {
  try {
    const data = await request.json();

    if (!data.name || !data.phone || !data.service || !data.message) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Required fields are missing."
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
        "INSERT INTO enquiries (name, phone, email, service, message) VALUES (?, ?, ?, ?, ?)"
      )
      .bind(
        data.name,
        data.phone,
        data.email || null,
        data.service,
        data.message
      )
      .run();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Enquiry received."
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

  } catch (error) {
    console.error("Enquiry error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unable to save enquiry."
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
}


export async function getEnquiries(env) {
  try {
    const result = await env.DB
      .prepare(
        `SELECT
          id,
          name,
          phone,
          email,
          service,
          message,
          status,
          created_at
        FROM enquiries
        ORDER BY created_at DESC`
      )
      .all();

    return new Response(
      JSON.stringify({
        success: true,
        enquiries: result.results
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

  } catch (error) {
    console.error("Get enquiries error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Unable to load enquiries."
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
}
