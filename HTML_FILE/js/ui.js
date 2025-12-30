// 1. CHECK AUTHENTICATION ON LOAD
const currentUser = JSON.parse(localStorage.getItem("quizUser"));

if (!currentUser) {
  // If no user is found, kick them back to login
  window.location.href = "login.html"; 
} else {
  // If user exists, try to update the Profile Name in the UI
  const nameElement = document.getElementById("display-name");
  if (nameElement) {
    nameElement.textContent = currentUser.name || "Guest User";
  }
}

// 2. LOGOUT FUNCTION
function logout() {
  localStorage.removeItem("quizUser");
  window.location.href = "login.html";
}

// 3. PROFILE MENU LOGIC (New)
function toggleMenu() {
  const menu = document.getElementById("userDropdown");
  if (menu) {
    menu.classList.toggle("active");
  }
}

// Close the menu if the user clicks anywhere else on the screen
document.addEventListener("click", (e) => {
  const container = document.querySelector(".profile-container");
  const menu = document.getElementById("userDropdown");

  // If the menu exists AND the click was NOT inside the container
  if (container && menu && !container.contains(e.target)) {
    menu.classList.remove("active");
  }
});

// 4. QUIZ SETUP LOGIC (Existing)
const state = {
  category: null,
  difficulty: null
};

function goToSetup() {
  // Fade out effect
  document.body.style.opacity = "0";
  setTimeout(() => {
    window.location.href = "setup.html";
  }, 500);
}

function selectCategory(el, value) {
  // Remove 'active' class from all categories
  document.querySelectorAll(".category")
    .forEach(c => c.classList.remove("active"));

  // Add 'active' to the clicked one
  el.classList.add("active");
  state.category = value;
}

function selectDifficulty(el, level) {
  // Remove 'active' class from all pills
  document.querySelectorAll(".pill")
    .forEach(p => p.classList.remove("active"));

  // Add 'active' to the clicked one
  el.classList.add("active");
  state.difficulty = level;

  // Change the theme color based on difficulty
  document.documentElement.style.setProperty(
    "--accent",
    level === "easy" ? "var(--easy)" :
    level === "medium" ? "var(--medium)" :
    "var(--hard)"
  );
}

function saveAndContinue() {
  if (!state.category || !state.difficulty) {
    alert("Please select both a Category and a Difficulty level.");
    return;
  }

  localStorage.setItem("quizConfig", JSON.stringify(state));
  window.location.href = "quiz.html";
}