import { QuizState } from "./state.js";

// ==========================================
// 1. CONFIGURATION
// ==========================================
const GEMINI_API_KEY = "AIzaSyBrFtz2OWIPfgv1Qk9pHL-hlvK7KUR2Du4"; 

// ==========================================
// 2. EXTENDED BACKUP DATA (Covers ALL Topics)
// ==========================================
const BACKUP_DATA = {
  // --- CODING ---
  "HTML": [
    { question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language"], answer: 0, explanation: "HTML is the standard markup language for Web pages." },
    { question: "Which tag is used for the largest heading?", options: ["<h6>", "<h1>", "<heading>", "<head>"], answer: 1, explanation: "<h1> defines the most important heading." },
    { question: "Which HTML element is used to define the footer?", options: ["<footer>", "<section>", "<bottom>", "<end>"], answer: 0, explanation: "The <footer> tag defines a footer for a document or section." }
  ],
  "CSS": [
    { question: "What does CSS stand for?", options: ["Cascading Style Sheets", "Creative Style Sheets", "Computer Style Sheets"], answer: 0, explanation: "CSS describes how HTML elements are to be displayed." },
    { question: "Which property is used to change the background color?", options: ["background-color", "color", "bgcolor"], answer: 0, explanation: "The background-color property sets the background color." }
  ],
  "JavaScript": [
    { question: "Inside which HTML element do we put the JavaScript?", options: ["<script>", "<js>", "<javascript>", "<scripting>"], answer: 0, explanation: "The <script> tag is used to define a client-side script." },
    { question: "How do you write 'Hello World' in an alert box?", options: ["alert('Hello World');", "msg('Hello World');", "msgBox('Hello World');"], answer: 0, explanation: "alert() is the built-in function to show a popup." }
  ],
  
  // --- GENERAL TOPICS (NEW!) ---
  "GK": [
    { question: "Which planet is known as the Red Planet?", options: ["Earth", "Mars", "Jupiter", "Venus"], answer: 1, explanation: "Mars appears red due to iron oxide." },
    { question: "What is the capital of France?", options: ["Berlin", "Madrid", "Paris", "Rome"], answer: 2, explanation: "Paris is the capital of France." },
    { question: "Who painted the Mona Lisa?", options: ["Van Gogh", "Picasso", "Da Vinci", "Monet"], answer: 2, explanation: "Painted by Leonardo da Vinci." }
  ],
  "English": [
    { question: "Choose the synonym of 'Happy'.", options: ["Sad", "Joyful", "Angry", "Bored"], answer: 1, explanation: "Joyful means feeling great pleasure." },
    { question: "Which word is a noun?", options: ["Run", "Quickly", "Cat", "Beautiful"], answer: 2, explanation: "A Cat is a living creature (noun)." },
    { question: "Find the antonym of 'Cold'.", options: ["Freezing", "Hot", "Icy", "Cool"], answer: 1, explanation: "Hot is the opposite of Cold." }
  ],
  "Quant": [
    { question: "What is 5 + 7?", options: ["10", "11", "12", "13"], answer: 2, explanation: "5 plus 7 equals 12." },
    { question: "What is the square root of 64?", options: ["6", "7", "8", "9"], answer: 2, explanation: "8 * 8 = 64." },
    { question: "Solve: 10 - 2 * 3", options: ["24", "4", "16", "6"], answer: 1, explanation: "Multiplication first: 2*3=6. Then 10-6=4." }
  ],
  "Web Dev": [
    { question: "What does HTTP stand for?", options: ["HyperText Transfer Protocol", "HyperText Test Protocol", "HyperText Transfer Package"], answer: 0, explanation: "HTTP is the foundation of data communication for the WWW." },
    { question: "Which is NOT a programming language?", options: ["Python", "HTML", "Java", "C++"], answer: 1, explanation: "HTML is a markup language, not a programming language." }
  ]
};

// ==========================================
// 3. MAIN LOADER
// ==========================================
export async function loadQuestions(config) {
  const category = config.category;
  const difficulty = config.difficulty;

  console.log(`fetching ${difficulty} questions for: ${category}`);

  // 1. Try Gemini API (Using 'gemini-pro' for better stability)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

  const prompt = `
    Create a JSON quiz with 10 multiple-choice questions about "${category}" (${difficulty} level).
    Output STRICT JSON Array only. No Markdown.
    Format: [{"question":"...","options":["A","B","C","D"],"answer":0,"explanation":"..."}]
    (Answer is the integer index 0-3 of the correct option).
  `;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!response.ok) throw new Error(`API Error ${response.status}`);

    const data = await response.json();
    let text = data.candidates[0].content.parts[0].text;
    
    // Clean data
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    // Safety: ensure brackets exist
    const firstBracket = text.indexOf("[");
    const lastBracket = text.lastIndexOf("]");
    if (firstBracket !== -1 && lastBracket !== -1) {
      text = text.substring(firstBracket, lastBracket + 1);
    }

    const questions = JSON.parse(text);

    // Save AI Questions
    QuizState.allQuestions = questions.map((q, i) => ({
      id: i,
      category, difficulty,
      question: q.question,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation
    }));
    
    console.log("SUCCESS: Loaded from Gemini AI");

  } catch (err) {
    console.warn("AI Failed. Switching to Backup Data.", err);
    loadBackupData(category, difficulty);
  }
}

// 4. FALLBACK FUNCTION
function loadBackupData(category, difficulty) {
  // Try to find the specific category
  let raw = BACKUP_DATA[category];
  
  // If not found, log it and default to HTML (This shouldn't happen now!)
  if (!raw) {
    console.error(`Backup data missing for ${category}. Defaulting to HTML.`);
    raw = BACKUP_DATA["HTML"];
  }

  console.log(`Using Backup Data for ${category}`);

  // Shuffle and format
  const shuffled = [...raw].sort(() => Math.random() - 0.5);

  QuizState.allQuestions = shuffled.map((q, i) => ({
    id: i,
    category, difficulty,
    question: q.question,
    options: q.options,
    answer: q.answer,
    explanation: q.explanation || "Standard Backup Explanation"
  }));
}