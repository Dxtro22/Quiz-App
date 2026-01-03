import { QuizState } from "./state.js";
import { renderQuestion, highlightSelectedOption, revealResult } from "./quizRenderer.js";

// Local State
let selectedOptionIndex = null;
let isAnswerChecked = false;
let timerInterval = null; // 🟢 Timer Variable

// 🟢 1. INITIALIZE QUIZ & START TIMER
export function initQuiz() {
  QuizState.currentIndex = 0;
  QuizState.score = 0;
  QuizState.answers = [];
  
  loadQuestion();
  
  // Start the timer based on difficulty
  if (QuizState.config && QuizState.config.difficulty) {
    startTimer(QuizState.config.difficulty);
  } else {
    startTimer("easy"); // Default fallback
  }
}

// 🟢 2. TIMER LOGIC
function startTimer(difficulty) {
  // Set Duration (Minutes * 60)
  let duration = 10 * 60; // Default Easy
  if (difficulty === "medium") duration = 15 * 60;
  if (difficulty === "hard") duration = 20 * 60;

  const timerDisplay = document.getElementById("timer");

  // Clear any existing timer to prevent bugs
  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    // Update UI (e.g., "14:05")
    if (timerDisplay) {
      timerDisplay.innerText = `Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      
      // Visual Warning: Turn Red when under 1 minute
      if (duration < 60) timerDisplay.style.color = "#EF4444";
      else timerDisplay.style.color = "var(--accent)";
    }

    // Time's Up Logic
    if (duration <= 0) {
      clearInterval(timerInterval);
      finishQuiz(true); // true = ended by timer
    }

    duration--;
  }, 1000);
}

function loadQuestion() {
  selectedOptionIndex = null;
  isAnswerChecked = false;
  renderQuestion();
  updateActionButton("Check Answer", true);
}

export function handleOptionSelect(index) {
  if (isAnswerChecked) return;
  selectedOptionIndex = index;
  highlightSelectedOption(index);
  updateActionButton("Check Answer", false);
}

export function handleMainButtonClick() {
  if (!isAnswerChecked) {
    confirmAnswer();
  } else {
    nextQuestion();
  }
}

function confirmAnswer() {
  isAnswerChecked = true;
  const q = QuizState.activeQuestions[QuizState.currentIndex];
  
  const isCorrect = selectedOptionIndex === q.answer;
  if (isCorrect) QuizState.score++;

  QuizState.answers.push({
    questionId: q.id,
    selected: selectedOptionIndex,
    correct: q.answer
  });

  revealResult(isCorrect, q.answer, q.explanation);
  
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
    finishQuiz(false); // false = ended normally
  }
}

// 🟢 3. FINISH QUIZ & SHOW PIE CHART
function finishQuiz(isTimeUp = false) {
  clearInterval(timerInterval); // Stop the clock

  const total = QuizState.activeQuestions.length;
  // We use QuizState.answers.length to know how many were actually submitted
  const answeredCount = QuizState.answers.length; 
  const correct = QuizState.score;
  const wrong = answeredCount - correct; 
  const notAttempted = total - answeredCount;

  // Compliment Logic
  let message = isTimeUp ? "⏰ Time's Up!" : "🎉 Quiz Completed!";
  let subMessage = "";
  
  const percentage = (correct / total) * 100;
  if (percentage >= 80) subMessage = "🌟 Outstanding! You are a Pro!";
  else if (percentage >= 50) subMessage = "👍 Good Job! Keep Practicing.";
  else subMessage = "📚 Don't give up! Study a bit more.";

  // Calculate Chart Angles
  const degCorrect = (correct / total) * 360;
  const degWrong = (wrong / total) * 360;
  // The rest is gray (not attempted)

  const stop1 = degCorrect;
  const stop2 = degCorrect + degWrong;

  // Replace the Quiz Card Content with Result
  const quizCard = document.getElementById("quiz-card"); // Targeting the main card
  
  // Re-center content for result view
  quizCard.style.justifyContent = "center";
  quizCard.style.alignItems = "center";

  quizCard.innerHTML = `
    <div class="result-box">
        <h2 style="font-size: 2.5rem; margin-bottom: 10px;">${message}</h2>
        <p class="compliment">${subMessage}</p>
        
        <div class="result-chart-container">
            <div class="pie-chart" style="background: conic-gradient(
                #4CAF50 0deg ${stop1}deg, 
                #F44336 ${stop1}deg ${stop2}deg, 
                #9E9E9E ${stop2}deg 360deg
            );"></div>
            
            <div class="chart-legend">
                <span class="legend-item"><span class="dot dot-green"></span> Correct (${correct})</span>
                <span class="legend-item"><span class="dot dot-red"></span> Wrong (${wrong})</span>
                <span class="legend-item"><span class="dot dot-gray"></span> Skipped (${notAttempted})</span>
            </div>
        </div>

        <h3 style="font-size: 2rem; margin-bottom: 20px;">Score: ${correct} / ${total}</h3>
        <button onclick="location.reload()" class="btn-restart">Play Again 🔄</button>
    </div>
  `;
}

function updateActionButton(text, disabled) {
  const btn = document.getElementById("action-btn");
  if (btn) {
    btn.textContent = text;
    btn.disabled = disabled;
    btn.style.opacity = disabled ? "0.5" : "1";
    btn.style.cursor = disabled ? "not-allowed" : "pointer";
  }
}