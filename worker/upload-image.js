export async function uploadImage(request, env) {

  try {

    const body = await request.json();

    const {
      file_name,
      file_base64,
      content_type
    } = body;


    // ========================================
    // VALIDATION
    // ========================================

    if (!file_name || !file_base64 || !content_type) {

      return new Response(
        JSON.stringify({
          success: false,
          error: "File name, image data and content type are required."
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

    }


    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];


    if (!allowedTypes.includes(content_type)) {

      return new Response(
        JSON.stringify({
          success: false,
          error: "Only JPG, PNG and WebP images are allowed."
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

    }


    // ========================================
    // CLEAN FILE NAME
    // ========================================

    const cleanFileName =
      file_name
        .replace(/[^a-zA-Z0-9._-]/g, "-");


    const path =
      `public/assets/projects/${cleanFileName}`;


    // ========================================
    // GITHUB UPLOAD
    // ========================================

    const githubResponse = await fetch(
      `https://api.github.com/repos/kurhulaworks/Kurhula-Works/contents/${path}`,
      {
        method: "PUT",

        headers: {
          "Authorization":
            `Bearer ${env.GITHUB_TOKEN}`,

          "Accept":
            "application/vnd.github+json",

          "X-GitHub-Api-Version":
            "2022-11-28",

          "User-Agent":
            "kurhula-works-worker",

          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({

          message:
            `Upload project image: ${cleanFileName}`,

          content:
            file_base64

        })

      }
    );


    const githubData =
      await githubResponse.json();


    // ========================================
    // GITHUB ERROR
    // ========================================

    if (!githubResponse.ok) {

      console.error(
        "GitHub upload error:",
        githubData
      );


      return new Response(
        JSON.stringify({
          success: false,
          error:
            githubData.message ||
            "GitHub upload failed."
        }),
        {
          status: githubResponse.status,

          headers: {
            "Content-Type":
              "application/json"
          }
        }
      );

    }


    // ========================================
    // SUCCESS
    // ========================================

    return new Response(
      JSON.stringify({

        success: true,

        message:
          "Image uploaded successfully.",

        file_name:
          cleanFileName,

        path,

        url:
          `https://raw.githubusercontent.com/kurhulaworks/Kurhula-Works/main/${path}`,

        github_url:
          githubData.content?.html_url || null

      }),
      {
        status: 200,

        headers: {
          "Content-Type":
            "application/json"
        }
      }
    );


  } catch (error) {

    console.error(
      "Upload image error:",
      error
    );


    return new Response(
      JSON.stringify({
        success: false,
        error:
          "Unable to upload image."
      }),
      {
        status: 500,

        headers: {
          "Content-Type":
            "application/json"
        }
      }
    );

  }

          }
