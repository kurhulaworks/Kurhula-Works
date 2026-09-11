export async function onRequestPost(context) {
  try {
    const response = await context.env.SERVICE.fetch(
      new Request("https://kurhula-works-api/enquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: await context.request.text()
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
