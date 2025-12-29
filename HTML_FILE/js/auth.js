// Import Firebase functions from the web (CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- PASTE YOUR FIREBASE CONFIG HERE ---
const firebaseConfig = {
    apiKey: "AIzaSyA6HUD37l3unvbOh6VACK2bnqry4h77-Co",
    authDomain: "quiz-app-f4af5.firebaseapp.com",
    projectId: "quiz-app-f4af5",
    storageBucket: "quiz-app-f4af5.firebasestorage.app",
    messagingSenderId: "537292876856",
    appId: "1:537292876856:web:ede3c3fa85b8ce0b300acd",
    measurementId: "G-BDDF0LEGZ4"
  };
// ---------------------------------------

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// DOM Elements
const form = document.getElementById("auth-form");
const googleBtn = document.getElementById("google-btn");
const guestBtn = document.getElementById("guest-btn");
const toggleBtn = document.getElementById("toggle-auth");
const title = document.querySelector(".title");

let isSignUp = false;

// 1. Handle Google Login
googleBtn.addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    alert(`Welcome, ${user.displayName}!`);
    saveUser(user);
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
});

// 2. Handle Email/Password
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    let userCred;
    if (isSignUp) {
      userCred = await createUserWithEmailAndPassword(auth, email, password);
    } else {
      userCred = await signInWithEmailAndPassword(auth, email, password);
    }
    alert("Success!");
    saveUser(userCred.user);
  } catch (error) {
    alert(error.message);
  }
});

// 3. Handle Guest Mode
guestBtn.addEventListener("click", () => {
  const guestUser = { uid: "guest", displayName: "Guest User", isGuest: true };
  saveUser(guestUser);
});

// 4. Toggle between Sign In / Sign Up
toggleBtn.addEventListener("click", (e) => {
  e.preventDefault();
  isSignUp = !isSignUp;
  title.textContent = isSignUp ? "Create Account" : "Welcome Back";
  form.querySelector("button").textContent = isSignUp ? "Sign Up" : "Sign In";
  document.getElementById("toggle-text").textContent = isSignUp ? "Already have an account?" : "New here?";
  toggleBtn.textContent = isSignUp ? "Login" : "Create Account";
});

// Helper: Save user & Redirect
function saveUser(user) {
  const userData = {
    uid: user.uid,
    name: user.displayName || user.email,
    isGuest: user.isGuest || false
  };
  localStorage.setItem("quizUser", JSON.stringify(userData));
  window.location.href = "index.html"; // Redirect to home
}