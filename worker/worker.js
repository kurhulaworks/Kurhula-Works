import { handleEnquiry } from "./enquiries.js";
import {
  getIdentity, 
  updateIdentity
} from "./identity.js";
import { uploadImage } from "./upload-image.js";

export default {
  async fetch(request, env) {

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
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

      // ========================================
// GITHUB CONNECTION TEST
// ========================================

if (
  request.method === "GET" &&
  url.pathname === "/github-test"
) {

  try {

    const response = await fetch(
      "https://api.github.com/repos/kurhulaworks/Kurhula-Works",
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "kurhula-works-worker"
        }
      }
    );


    const data = await response.json();


    if (!response.ok) {

      return new Response(
        JSON.stringify({
          success: false,
          error: data.message || "GitHub connection failed."
        }),
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }


    return new Response(
      JSON.stringify({
        success: true,
        message: "GitHub connection works.",
        repository: data.full_name
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );

  } catch (error) {

    console.error("GitHub test error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Unable to connect to GitHub."
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  }
        }
    // ========================================
    // WEBSITE IDENTITY
    // ========================================

    if (
      request.method === "GET" &&
      url.pathname === "/identity"
    ) {

      const response = await getIdentity(env);

      const headers = new Headers(
        response.headers
      );

      Object.entries(corsHeaders).forEach(
        ([key, value]) => {
          headers.set(key, value);
        }
      );

      return new Response(
        response.body,
        {
          status: response.status,
          headers
        }
      );
    }


    if (
      request.method === "PUT" &&
      url.pathname === "/identity"
    ) {

      const response =
        await updateIdentity(
          request,
          env
        );

      const headers = new Headers(
        response.headers
      );

      Object.entries(corsHeaders).forEach(
        ([key, value]) => {
          headers.set(key, value);
        }
      );

      return new Response(
        response.body,
        {
          status: response.status,
          headers
        }
      );
    }


    // ========================================
    // ENQUIRIES
    // ========================================

    if (
      request.method === "POST" &&
      url.pathname === "/enquiries"
    ) {

      const response =
        await handleEnquiry(
          request,
          env
        );

      const headers = new Headers(
        response.headers
      );

      Object.entries(corsHeaders).forEach(
        ([key, value]) => {
          headers.set(key, value);
        }
      );

      return new Response(
        response.body,
        {
          status: response.status,
          headers
        }
      );
    }


    // ========================================
    // UNKNOWN ENDPOINT
    // ========================================

    return new Response(
      JSON.stringify({
        success: false,
        error: "Endpoint not found."
      }),
      {
        status: 404,
        headers: {
          "Content-Type":
            "application/json",
          ...corsHeaders
        }
      }
    );
  }
};
