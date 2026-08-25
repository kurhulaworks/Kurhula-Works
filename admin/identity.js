const API_URL =
  "https://YOUR-WORKER-URL.workers.dev";


const form =
  document.getElementById("company-name-form");

const input =
  document.getElementById("company-name");

const message =
  document.getElementById("company-name-message");


form.addEventListener("submit", async (event) => {

  event.preventDefault();

  const companyName =
    input.value.trim();

  if (!companyName) {
    message.textContent =
      "Please enter a company name.";

    return;
  }


  message.textContent =
    "Saving...";


  try {

    const response =
      await fetch(
        `${API_URL}/identity`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            company_name:
              companyName
          })
        }
      );


    const data =
      await response.json();


    if (!response.ok || !data.success) {

      message.textContent =
        data.error ||
        "Unable to save company name.";

      return;
    }


    message.textContent =
      "Company name saved successfully.";

  } catch (error) {

    console.error(error);

    message.textContent =
      "Unable to connect to the server.";

  }

});
