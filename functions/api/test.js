export async function onRequest(context) {
  return new Response(
    JSON.stringify({
      hasEnv: !!context.env,
      hasService: !!context.env?.SERVICE,
      envKeys: context.env ? Object.keys(context.env) : []
    }),
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}

