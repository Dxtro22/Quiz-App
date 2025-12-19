import { QuizState } from "./state.js";

export async function loadQuestions() {
  try {
    const res = await fetch("HTML_FILE/data/questions.json");

    if (!res.ok) {
      throw new Error("Failed to load questions");
    }

    const data = await res.json();

    validateQuestions(data);
    QuizState.allQuestions = data;

  } catch (err) {
    console.error("DATA LOAD ERROR:", err);
    alert("Unable to load quiz data. Please try again.");
  }
}

function validateQuestions(data) {
  if (!Array.isArray(data)) {
    throw new Error("Invalid question dataset");
  }

  data.forEach(q => {
    if (
      typeof q.question !== "string" ||
      !Array.isArray(q.options) ||
      typeof q.answer !== "number"
    ) {
      throw new Error("Corrupted question format");
    }
  });
}
