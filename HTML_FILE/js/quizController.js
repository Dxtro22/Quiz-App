import { QuizState } from "./state.js";
import { renderQuestion, highlightSelectedOption, revealResult } from "./quizRenderer.js";

// Local State for the current question flow
let selectedOptionIndex = null;
let isAnswerChecked = false;

export function initQuiz() {
  QuizState.currentIndex = 0;
  QuizState.score = 0;
  QuizState.answers = [];
  loadQuestion();
}

function loadQuestion() {
  // Reset local state
  selectedOptionIndex = null;
  isAnswerChecked = false;
  
  // Render UI
  renderQuestion();
  updateActionButton("Check Answer", true); // Disabled initially
}

// 1. Called when user clicks an Option (A, B, C, D)
export function handleOptionSelect(index) {
  if (isAnswerChecked) return; // Prevent changing answer after checking

  selectedOptionIndex = index;
  highlightSelectedOption(index); // Update Visuals (Blue Border)
  updateActionButton("Check Answer", false); // Enable Button
}

// 2. Called when user clicks the big "Check Answer" / "Next" button
export function handleMainButtonClick() {
  if (!isAnswerChecked) {
    // PHASE 1: CHECK ANSWER
    confirmAnswer();
  } else {
    // PHASE 2: GO TO NEXT QUESTION
    nextQuestion();
  }
}

function confirmAnswer() {
  isAnswerChecked = true;
  const q = QuizState.activeQuestions[QuizState.currentIndex];
  
  // Logic
  const isCorrect = selectedOptionIndex === q.answer;
  if (isCorrect) QuizState.score++;

  // Record Data
  QuizState.answers.push({
    questionId: q.id,
    selected: selectedOptionIndex,
    correct: q.answer
  });

  // Update UI: Show Red/Green & Explanation
  revealResult(isCorrect, q.answer, q.explanation);
  
  // Change Button to "Next"
  updateActionButton(
    QuizState.currentIndex < QuizState.activeQuestions.length - 1 ? "Next Question ➔" : "Finish Quiz 🏁", 
    false
  );
}

function nextQuestion() {
  QuizState.currentIndex++;

  if (QuizState.currentIndex < QuizState.activeQuestions.length) {
    loadQuestion();
  } else {
    finishQuiz();
  }
}

function finishQuiz() {
  // Save progress logic...
  const category = QuizState.config.category;
  const raw = localStorage.getItem("userMastery");
  const mastery = raw ? JSON.parse(raw) : {};
  mastery[category] = (mastery[category] || 0) + QuizState.score;
  localStorage.setItem("userMastery", JSON.stringify(mastery));

  localStorage.setItem("quizResult", JSON.stringify(QuizState));
  location.href = "result.html";
}

// Helper to manage the main button state
function updateActionButton(text, disabled) {
  const btn = document.getElementById("action-btn");
  if (btn) {
    btn.textContent = text;
    btn.disabled = disabled;
    btn.style.opacity = disabled ? "0.5" : "1";
    btn.style.cursor = disabled ? "not-allowed" : "pointer";
  }
}