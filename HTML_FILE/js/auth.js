import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// YOUR CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyA6HUD37l3unvbOh6VACK2bnqry4h77-Co",
    authDomain: "quiz-app-f4af5.firebaseapp.com",
    projectId: "quiz-app-f4af5",
    storageBucket: "quiz-app-f4af5.firebasestorage.app",
    messagingSenderId: "537292876856",
    appId: "1:537292876856:web:ede3c3fa85b8ce0b300acd",
    measurementId: "G-BDDF0LEGZ4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// DOM ELEMENTS
const form = document.getElementById("auth-form");
const fullnameInput = document.getElementById("fullname");
const googleBtn = document.getElementById("google-btn");
const guestBtn = document.getElementById("guest-btn");
const toggleBtn = document.getElementById("toggle-auth");
const toggleText = document.getElementById("toggle-text");
const submitText = document.getElementById("submit-text");

// NEW: Password Toggle Elements
const passwordInput = document.getElementById("password");
const eyeIcon = document.getElementById("toggle-password");

let isSignUp = false;

// 1. Password Visibility Toggle Logic
eyeIcon.addEventListener("click", () => {
  // Check current type
  const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);
  
  // Change Color to indicate active state (Blue when visible, Grey when hidden)
  eyeIcon.style.color = type === "text" ? "#3B82F6" : "#94A3B8";
});

// 2. Toggle Login / Sign Up Logic
toggleBtn.addEventListener("click", (e) => {
  e.preventDefault();
  isSignUp = !isSignUp;

  if (isSignUp) {
    fullnameInput.style.display = "block";
    submitText.textContent = "Sign Up";
    toggleText.textContent = "Have an account?";
    toggleBtn.textContent = "Log In";
  } else {
    fullnameInput.style.display = "none";
    submitText.textContent = "Log In";
    toggleText.textContent = "Don't have an account?";
    toggleBtn.textContent = "Sign up";
  }
});

// 3. Handle Form Submit
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const name = fullnameInput.value;

  try {
    let userCred;
    if (isSignUp) {
      userCred = await createUserWithEmailAndPassword(auth, email, password);
      if(name) {
        await updateProfile(userCred.user, { displayName: name });
      }
    } else {
      userCred = await signInWithEmailAndPassword(auth, email, password);
    }
    saveUser(userCred.user);
  } catch (error) {
    const cleanError = error.message.replace("Firebase: ", "").replace("auth/", "");
    alert("Error: " + cleanError);
  }
});

// 4. Handle Google
googleBtn.addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    saveUser(result.user);
  } catch (error) {
    alert(error.message);
  }
});

// 5. Handle Guest
guestBtn.addEventListener("click", () => {
  const guestUser = { uid: "guest", displayName: "Guest", isGuest: true };
  saveUser(guestUser);
});

function saveUser(user) {
  const userData = {
    uid: user.uid,
    name: user.displayName || user.email,
    isGuest: user.isGuest || false
  };
  localStorage.setItem("quizUser", JSON.stringify(userData));
  window.location.href = "index.html";
}