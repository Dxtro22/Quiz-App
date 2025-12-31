import { QuizState } from "./state.js";
import { handleAnswer } from "./quizController.js";

export function renderQuestion() {
  const q = QuizState.activeQuestions[QuizState.currentIndex];
  const total = QuizState.activeQuestions.length;
  const current = QuizState.currentIndex + 1; // Start at 1, not 0

  // 1. Update Text (Question 3 / 10)
  const progressText = document.getElementById("progress-text");
  if (progressText) {
    progressText.textContent = `Question ${current} / ${total}`;
  }

  // 2. Update Visual Bar Width
  const progressBar = document.getElementById("progress-bar");
  if (progressBar) {
    // Calculate percentage
    const percent = (current / total) * 100;
    progressBar.style.width = percent + "%";
  }

  // 3. Render Question Text
  const questionEl = document.getElementById("question");
  questionEl.textContent = q.question;

  // 4. Render Options
  const optionsEl = document.getElementById("options");
  optionsEl.innerHTML = "";

  q.options.forEach((opt, index) => {
    const btn = document.createElement("button");
    btn.className = "btn option-btn";
    btn.textContent = opt;
    
    // Pass the index and the button itself to the controller
    btn.onclick = () => handleAnswer(index, btn);

    optionsEl.appendChild(btn);
  });
}