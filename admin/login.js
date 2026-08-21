const form = document.getElementById("login-form");
const message = document.getElementById("login-message");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  message.textContent = "Signing in...";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "same-origin",
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      message.textContent =
        data.error || "Unable to sign in.";

      return;
    }

    window.location.href = "index.html";

  } catch (error) {
    console.error("Login error:", error);

    message.textContent =
      "Unable to connect to the login service.";
  }
});
