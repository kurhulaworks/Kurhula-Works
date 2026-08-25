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
const resetButton = document.getElementById("reset-password");


/*
 * LOGIN
 */

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


/*
 * RESET PASSWORD
 */

resetButton.addEventListener("click", async () => {

  const email =
    document.getElementById("email").value.trim();


  if (!email) {

    message.textContent =
      "Enter your email address first.";

    return;

  }


  message.textContent =
    "Sending password reset email...";


  try {

    await sendPasswordResetEmail(
      auth,
      email
    );

    message.textContent =
      "Password reset email sent. Check your inbox.";

  } catch (error) {

    console.error(
      "Password reset error:",
      error
    );

    if (error.code === "auth/invalid-email") {

      message.textContent =
        "Please enter a valid email address.";

    } else if (error.code === "auth/user-not-found") {

      message.textContent =
        "No account was found with that email.";

    } else {

      message.textContent =
        "Unable to send password reset email.";

    }

  }

});
