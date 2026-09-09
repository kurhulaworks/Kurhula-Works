
export function onRequest() {
  return new Response(
    JSON.stringify({
      success: true,
      message: "Kurhula Works Pages Function works."
    }),
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}
