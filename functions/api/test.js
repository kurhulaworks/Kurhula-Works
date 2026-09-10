export async function onRequest(context) {
  try {
    const response = await fetch(
      "https://kurhula-works-api.kurhulaworks.workers.dev/github-test",
      {
        method: "GET"
      }
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
        error: "Unable to connect to Worker."
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
