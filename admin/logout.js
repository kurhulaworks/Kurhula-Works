import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getAuth,
  signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyDh4MEIwrdz-ZSiJ-7ndrPS8LeSYh7cIUM",
  authDomain: "kurhula-works.firebaseapp.com",
  projectId: "kurhula-works",
  storageBucket: "kurhula-works.firebasestorage.app",
  messagingSenderId: "527857454794",
  appId: "1:527857454794:web:b3a4b08fda52dd354b2e33"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


const logoutButton =
  document.getElementById("logout-button");


logoutButton.addEventListener("click", async () => {

  logoutButton.disabled = true;
  logoutButton.textContent = "Logging out...";


  try {

    await signOut(auth);

    window.location.href = "login.html";

  } catch (error) {

    console.error("Logout error:", error);

    logoutButton.disabled = false;
    logoutButton.textContent = "Logout";

    alert("Unable to log out. Please try again.");

  }

});
