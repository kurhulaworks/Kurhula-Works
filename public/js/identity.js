const API_URL =
  "https://kurhula-works-api.kurhulaworks.workers.dev";


async function loadWebsiteIdentity() {

  try {

    const response =
      await fetch(
        `${API_URL}/identity`
      );


    const data =
      await response.json();


    if (
      !response.ok ||
      !data.success
    ) {
      return;
    }


    const companyName =
      data.identity.company_name;


    document
      .querySelectorAll(
        "[data-company-name]"
      )
      .forEach((element) => {

        element.textContent =
          companyName;

      });

  } catch (error) {

    console.error(
      "Unable to load website identity:",
      error
    );

  }

}


loadWebsiteIdentity();
