import { QuizState } from "./state.js";
import { renderQuestion } from "./quizRenderer.js";

export function initQuiz() {
  QuizState.currentIndex = 0;
  QuizState.score = 0;
  QuizState.answers = [];

  renderQuestion();
}

export function handleAnswer(selectedIndex, button) {
  const q = QuizState.activeQuestions[QuizState.currentIndex];

  // Lock all buttons
  document.querySelectorAll(".option-btn").forEach(btn => {
    btn.disabled = true;
  });

  // Mark answer
  if (selectedIndex === q.answer) {
    QuizState.score++;
    button.style.background = "var(--easy)";
  } else {
    button.style.background = "var(--hard)";
  }

  QuizState.answers.push({
    questionId: q.id,
    selected: selectedIndex,
    correct: q.answer
  });

  // Move to next after delay
  setTimeout(() => {
    QuizState.currentIndex++;

    if (QuizState.currentIndex < QuizState.activeQuestions.length) {
      renderQuestion();
    } else {
      localStorage.setItem("quizResult", JSON.stringify(QuizState));
      location.href = "result.html";
    }
  }, 800);
}
