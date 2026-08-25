import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
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


const form = document.getElementById("login-form");
const message = document.getElementById("login-message");


form.addEventListener("submit", async (event) => {

  event.preventDefault();

  message.textContent = "Signing in...";

  const email =
    document.getElementById("email").value.trim();

  const password =
    document.getElementById("password").value;


  try {

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    message.textContent = "Login successful.";

    window.location.href = "index.html";

  } catch (error) {

    console.error("Firebase login error:", error);

    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/wrong-password" ||
      error.code === "auth/user-not-found"
    ) {

      message.textContent =
        "Invalid email or password.";

    } else if (error.code === "auth/too-many-requests") {

      message.textContent =
        "Too many attempts. Please try again later.";

    } else {

      message.textContent =
        "Unable to sign in. Please try again.";

    }

  }

});
