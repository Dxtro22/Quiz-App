import { QuizState } from "./state.js";

const CATEGORY_IDS = {
  "Web Dev": 18,
  "GK": 9,
  "Quant": 19,
  "English": 10
};

export async function loadQuestions(config) {
  // Default to ID 18 (Computers) if category not found
  const catId = CATEGORY_IDS[config.category] || 18;
  const amount = 10;
  const difficulty = config.difficulty.toLowerCase();

  const url = `https://opentdb.com/api.php?amount=${amount}&category=${catId}&difficulty=${difficulty}&type=multiple`;

  console.log("Fetching URL:", url);

  const res = await fetch(url);
  const data = await res.json();

  if (data.response_code !== 0) {
    throw new Error(`API Error Code: ${data.response_code}. Try a different difficulty.`);
  }

  QuizState.allQuestions = data.results.map((q, index) => {
    const allOptions = [...q.incorrect_answers, q.correct_answer];
    const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);

    return {
      id: index,
      category: config.category,
      difficulty: config.difficulty,
      question: decodeHTML(q.question),
      options: shuffledOptions.map(decodeHTML),
      answer: shuffledOptions.indexOf(q.correct_answer),
      explanation: `Correct: ${q.correct_answer}`
    };
  });
}

function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}