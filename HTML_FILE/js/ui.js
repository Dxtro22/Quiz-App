// Check Auth on Load
const currentUser = JSON.parse(localStorage.getItem("quizUser"));

if (!currentUser) {
  // If no user found, force them to login
  window.location.href = "login.html"; 
} else {
  // Optional: Update UI with name
  console.log(`Logged in as: ${currentUser.name}`);
}

function logout() {
  localStorage.removeItem("quizUser");
  window.location.href = "login.html";
}

const state = {
  category: null,
  difficulty: null
};

function goToSetup() {
  document.body.style.opacity = "0";
  setTimeout(() => {
    window.location.href = "setup.html";
  }, 500);
}

function selectCategory(el, value) {
  document.querySelectorAll(".category")
    .forEach(c => c.classList.remove("active"));

  el.classList.add("active");
  state.category = value;
}

function selectDifficulty(el, level) {
  document.querySelectorAll(".pill")
    .forEach(p => p.classList.remove("active"));

  el.classList.add("active");
  state.difficulty = level;

  // Dynamic theme switch
  document.documentElement.style.setProperty(
    "--accent",
    level === "easy" ? "var(--easy)" :
    level === "medium" ? "var(--medium)" :
    "var(--hard)"
  );
}

function saveAndContinue() {
  if (!state.category || !state.difficulty) {
    alert("Select category & difficulty");
    return;
  }

  localStorage.setItem("quizConfig", JSON.stringify(state));
  window.location.href = "quiz.html";
}
