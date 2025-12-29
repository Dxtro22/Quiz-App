import { QuizState } from "./state.js";

export function buildQuiz(config) {
  QuizState.config = config;
  QuizState.startTime = Date.now();

  // Since we asked the API for specific questions, 
  // we assume ALL loaded questions are valid.
  // No need to filter by name anymore.
  const questions = QuizState.allQuestions;

  if (!questions || questions.length === 0) {
    alert("No questions loaded.");
    window.location.href = "setup.html";
    return;
  }

  // Just shuffle them and start
  QuizState.activeQuestions = shuffleArray(questions);
}

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}