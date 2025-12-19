import { QuizState } from "./state.js";
import { handleAnswer } from "./quizController.js";

export function renderQuestion() {
  const q = QuizState.activeQuestions[QuizState.currentIndex];

  const questionEl = document.getElementById("question");
  const optionsEl = document.getElementById("options");
  const progressEl = document.getElementById("progress");

  // Update progress
  const percent =
    (QuizState.currentIndex / QuizState.activeQuestions.length) * 100;
  progressEl.style.width = percent + "%";

  // Render question
  questionEl.textContent = `Q${QuizState.currentIndex + 1}. ${q.question}`;
  optionsEl.innerHTML = "";

  // Render options
  q.options.forEach((opt, index) => {
    const btn = document.createElement("button");
    btn.className = "btn option-btn";
    btn.textContent = opt;

    btn.onclick = () => handleAnswer(index, btn);

    optionsEl.appendChild(btn);
  });
}
