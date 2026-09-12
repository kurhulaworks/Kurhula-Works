export async function onRequestGet(context) {
  try {
    const response = await context.env.SERVICE.fetch(
      new Request("https://kurhula-works-api/enquiries", {
        method: "GET"
      })
    );

    return response;

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
