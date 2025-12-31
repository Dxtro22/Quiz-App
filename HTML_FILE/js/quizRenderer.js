import { QuizState } from "./state.js";
import { handleOptionSelect } from "./quizController.js";

export function renderQuestion() {
  const q = QuizState.activeQuestions[QuizState.currentIndex];
  const total = QuizState.activeQuestions.length;
  
  // 1. Update Header Info
  const progressText = document.getElementById("progress-text");
  const progressBar = document.getElementById("progress-bar");
  
  // Safety check in case elements are missing
  if (progressText) progressText.textContent = `Question ${QuizState.currentIndex + 1} / ${total}`;
  if (progressBar) progressBar.style.width = `${((QuizState.currentIndex + 1) / total) * 100}%`;
  
  // 2. Render Question Text
  document.getElementById("question").textContent = q.question;

  // 3. Reset & Render Options
  const optionsEl = document.getElementById("options");
  optionsEl.innerHTML = "";
  
  q.options.forEach((opt, index) => {
    const btn = document.createElement("button");
    btn.className = "btn option-btn"; 
    btn.id = `opt-${index}`;
    
    // 🔴 FIX: Escape HTML so tags like <br> show up as text!
    const safeText = opt.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    
    btn.innerHTML = `
      <span style="opacity:0.6; margin-right:10px; font-weight:bold;">
        ${String.fromCharCode(65 + index)}.
      </span> 
      ${safeText}
    `;
    
    // Click Event
    btn.onclick = () => handleOptionSelect(index);
    
    optionsEl.appendChild(btn);
  });

  // 4. Hide Feedback Area initially
  const feedbackEl = document.getElementById("feedback-area");
  if (feedbackEl) {
    feedbackEl.style.display = "none";
    feedbackEl.className = "feedback-box"; 
  }
}

// Visual: Just highlights the border Blue (Selected state)
export function highlightSelectedOption(selectedIndex) {
  document.querySelectorAll(".option-btn").forEach(btn => btn.classList.remove("selected"));
  
  const btn = document.getElementById(`opt-${selectedIndex}`);
  if (btn) btn.classList.add("selected");
}

// Visual: Shows Green/Red and Explanation
export function revealResult(isCorrect, correctIndex, explanationText) {
  const options = document.querySelectorAll(".option-btn");
  
  options.forEach((btn, index) => {
    btn.disabled = true; // Lock buttons
    
    if (index === correctIndex) {
      btn.classList.add("correct"); // Turn Green
    } else if (btn.classList.contains("selected") && !isCorrect) {
      btn.classList.add("wrong"); // Turn Red if you picked it wrong
    }
  });

  // Show Explanation Box
  const feedbackEl = document.getElementById("feedback-area");
  const explainTextEl = document.getElementById("explanation-text");
  
  if (feedbackEl && explainTextEl) {
    feedbackEl.style.display = "block";
    feedbackEl.style.borderColor = isCorrect ? "var(--easy)" : "var(--hard)";
    
    const title = feedbackEl.querySelector(".feedback-title");
    if (title) {
      title.textContent = isCorrect ? "✅ Correct!" : "❌ Incorrect";
      title.style.color = isCorrect ? "var(--easy)" : "var(--hard)";
    }

    // Allow HTML tags in explanation (bolding etc)
    explainTextEl.innerHTML = explanationText || "No explanation provided.";
  }
}