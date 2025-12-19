export const QuizState = {
  config: null,        // category, difficulty, count
  allQuestions: [],    // raw dataset
  activeQuestions: [],// filtered & shuffled
  currentIndex: 0,
  score: 0,
  answers: [],
  startTime: null,
  endTime: null
};
