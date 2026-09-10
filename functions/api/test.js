export async function onRequest(context) {
  try {
    const request = new Request(
      "https://kurhula-works-api/github-test",
      {
        method: "GET"
      }
    );

    return await context.env.SERVICE.fetch(request);

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
