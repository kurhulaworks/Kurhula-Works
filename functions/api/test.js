export async function onRequestPost(context) {
  try {
    const testEnquiry = {
      name: "Test Customer",
      phone: "0720000000",
      email: "test@example.com",
      service: "House Construction",
      message: "This is a backend connection test."
    };

    const response = await context.env.SERVICE.fetch(
      new Request("https://kurhula-works-api/enquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(testEnquiry)
      })
    );

    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json"
      }
    });

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Unable to connect to Worker.",
        details: error.message
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
