const form = document.getElementById("quote-form");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = {
    name: form.name.value.trim(),
    phone: form.phone.value.trim(),
    email: form.email.value.trim(),
    service: form.service.value,
    message: form.message.value.trim()
  };

  try {
    const response = await fetch(
      "https://kurhula-works-api.kurhulaworks.workers.dev/enquiries",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Unable to send enquiry.");
    }

    alert("Thank you. Your enquiry has been received.");
    form.reset();

  } catch (error) {
    alert("Sorry, your enquiry could not be sent. Please try again.");
    console.error(error);
  }
});
