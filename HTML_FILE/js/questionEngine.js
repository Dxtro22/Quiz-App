import { QuizState } from "./state.js";

export function buildQuiz(config) {
  QuizState.config = config;
  QuizState.startTime = Date.now();

  const filtered = filterQuestions(
    QuizState.allQuestions,
    config.category,
    config.difficulty
  );

  if (filtered.length < config.count) {
    console.error("CONFIG:", config);
    console.error("AVAILABLE QUESTIONS:", QuizState.allQuestions);
    throw new Error("Not enough questions for this selection");
  }

  const shuffled = shuffleArray(filtered);
  QuizState.activeQuestions = shuffled.slice(0, config.count);
}

function normalize(value) {
  return value.toString().toLowerCase().trim();
}

function filterQuestions(questions, category, difficulty) {
  return questions.filter(q =>
    normalize(q.category) === normalize(category) &&
    normalize(q.difficulty) === normalize(difficulty)
  );
}

function shuffleArray(arr) {
  const copy = [...arr];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}
