import { handleEnquiry } from "./enquiries.js";
import {
  getIdentity,
  updateIdentity
} from "./identity.js";


// Website Identity
if (request.method === "GET" && url.pathname === "/identity") {
  const response = await getIdentity(env);

  const headers = new Headers(response.headers);

  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    headers
  });
}

if (request.method === "PUT" && url.pathname === "/identity") {
  const response = await updateIdentity(request, env);

  const headers = new Headers(response.headers);

  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    headers
  });
}

export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    // Browser preflight request
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    const url = new URL(request.url);

    // Enquiries
    if (request.method === "POST" && url.pathname === "/enquiries") {
      const response = await handleEnquiry(request, env);

      const headers = new Headers(response.headers);

      Object.entries(corsHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });

      return new Response(response.body, {
        status: response.status,
        headers
      });
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: "Endpoint not found."
      }),
      {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  }
};
