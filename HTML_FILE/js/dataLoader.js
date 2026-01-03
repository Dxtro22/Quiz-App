import { QuizState } from "./state.js";

// ==========================================
// 🟢 CONFIGURATION
// ==========================================
const GEMINI_API_KEY = "AIzaSyA5OVja-s5a4tHoJK5P_sVJVv40QXjfbpw"; 

// 🟢 EXACT NAMES FROM YOUR SCREENSHOT LIST
// We use "gemini-flash-latest" because your account explicitly lists it.
const MODEL_CANDIDATES = [
  "gemini-flash-latest", 
  "gemini-pro",
  "gemini-pro-latest"
];

// ==========================================
// 1. MAIN LOADER
// ==========================================
export async function loadQuestions(config) {
  const category = config.category;
  const difficulty = config.difficulty;
  
  console.log(`🚀 Starting Engine for: ${category} (${difficulty})...`);

  // --- PHASE 1: TRY GOOGLE GEMINI ---
  try {
    const aiQuestions = await fetchGeminiQuestions(category, difficulty);
    saveToState(aiQuestions, category, difficulty);
    console.log("✅ SUCCESS: Loaded fresh questions from Gemini AI");
    return;
  } catch (err) {
    console.warn("⚠️ AI Failed (All Models). Switching to Local Backup.");
    // We intentionally removed the annoying popup alert. 
    // It will just silently switch to backup now so you can play.
  }

  // --- PHASE 2: LOCAL BACKUP ---
  console.log("📂 Loading from Local Database...");
  loadLocalQuestions(category, difficulty);
}

// ==========================================
// 🧠 ENGINE A: GEMINI AI (Smart Fetch)
// ==========================================
async function fetchGeminiQuestions(category, difficulty) {
  // 1. Define specific prompts
  let topicPrompt = category;
  if (category === "HTML") topicPrompt = "HTML5 tags, attributes, and semantic structure";
  if (category === "CSS") topicPrompt = "CSS3 styling, flexbox, grid, and selectors";
  if (category === "JS") topicPrompt = "JavaScript ES6 syntax, functions, and logic";
  if (category === "English") topicPrompt = "English grammar, vocabulary, synonyms, and antonyms";
  if (category === "Quant") topicPrompt = "Mathematical aptitude, logical reasoning, and basic algebra";
  
  const prompt = `
    Create a JSON quiz with 10 multiple-choice questions about "${topicPrompt}" (${difficulty} level).
    Output STRICT JSON Array only. No Markdown. No code blocks.
    Format: [{"question":"...","options":["A","B","C","D"],"answer":0,"explanation":"..."}]
    (Answer must be the integer index 0-3 of the correct option).
  `;

  // 2. Loop through the valid models
  for (const model of MODEL_CANDIDATES) {
    try {
      console.log(`🔄 Attempting connection to: ${model}...`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      if (!response.ok) throw new Error(response.statusText);

      const data = await response.json();
      let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Empty Response");

      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const start = text.indexOf("[");
      const end = text.lastIndexOf("]");
      
      if (start === -1 || end === -1) throw new Error("Invalid JSON format");
      
      console.log(`✅ CONNECTED with ${model}`);
      return JSON.parse(text.substring(start, end + 1));

    } catch (e) {
      console.warn(`❌ Model ${model} failed, trying next...`);
    }
  }
  throw new Error("All models failed");
}

// ==========================================
// 📂 ENGINE B: LOCAL DATABASE (Specific Questions)
// ==========================================
const LOCAL_DB = {
  "HTML": [
    { q: "What does HTML stand for?", o: ["Hyper Text Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language", "Hyper Tool Multi Language"], a: 0, e: "HTML is the standard markup language for documents designed to be displayed in a web browser." },
    { q: "Which tag is used for the largest heading?", o: ["<head>", "<h6>", "<h1>", "<heading>"], a: 2, e: "<h1> defines the most important heading." },
    { q: "Which HTML element defines the title of a document?", o: ["<meta>", "<head>", "<title>", "<header>"], a: 2, e: "The <title> tag specifies the title shown in the browser tab." },
    { q: "Which character is used to indicate an end tag?", o: ["/", "*", "^", "<"], a: 0, e: "End tags always start with a slash, e.g., </p>." },
    { q: "Which element is used to display an image?", o: ["<image>", "<img>", "<pic>", "<src>"], a: 1, e: "The <img> tag is used to embed an image." }
  ],
  "CSS": [
    { q: "What does CSS stand for?", o: ["Cascading Style Sheets", "Creative Style System", "Computer Style Sheets", "Colorful Style Sheets"], a: 0, e: "CSS describes how HTML elements are to be displayed." },
    { q: "Which property controls text color?", o: ["font-color", "text-style", "text-color", "color"], a: 3, e: "The 'color' property sets the color of the text." },
    { q: "How do you make text bold?", o: ["font-weight: bold", "style: bold", "font: bold", "text-align: bold"], a: 0, e: "font-weight controls the thickness of the text." }
  ],
  "JS": [
    { q: "Inside which HTML element do we put the JavaScript?", o: ["<javascript>", "<js>", "<script>", "<scripting>"], a: 2, e: "The <script> tag is used to embed JS." },
    { q: "How do you write 'Hello World' in an alert box?", o: ["msg('Hello World')", "alert('Hello World')", "msgBox('Hello World')", "alertBox('Hello World')"], a: 1, e: "alert() is the built-in function." },
    { q: "Which operator is used to assign a value to a variable?", o: ["*", "-", "=", "x"], a: 2, e: "The = operator assigns values." }
  ],
  "English": [
    { q: "Identify the noun: 'The cat slept.'", o: ["The", "slept", "cat", "quickly"], a: 2, e: "A noun is a person, place, or thing." },
    { q: "Which word is an antonym for 'Happy'?", o: ["Joyful", "Sad", "Bright", "Content"], a: 1, e: "Antonyms are words with opposite meanings." },
    { q: "Choose the correct spelling.", o: ["Recieve", "Receive", "Receeve", "Riceive"], a: 1, e: "'I before E except after C'." }
  ],
  "Quant": [
    { q: "What is 15% of 200?", o: ["20", "25", "30", "35"], a: 2, e: "10% is 20, 5% is 10. Total 30." },
    { q: "Solve: 2 + 2 * 3", o: ["12", "8", "6", "10"], a: 1, e: "BODMAS: Multiply first (2*3=6), then add 2 (6+2=8)." },
    { q: "What is the square root of 144?", o: ["10", "11", "12", "13"], a: 2, e: "12 * 12 = 144." }
  ],
  "GK": [
    { q: "What is the capital of France?", o: ["Berlin", "Madrid", "Paris", "Rome"], a: 2, e: "Paris is the capital." },
    { q: "Who wrote 'Romeo and Juliet'?", o: ["Dickens", "Hemingway", "Shakespeare", "Austen"], a: 2, e: "William Shakespeare wrote it." },
    { q: "What is the chemical symbol for Gold?", o: ["Au", "Ag", "Fe", "Go"], a: 0, e: "Au stands for Aurum." }
  ]
};

function loadLocalQuestions(category, difficulty) {
  let key = "GK";
  const c = category.toLowerCase();
  if (c.includes("html")) key = "HTML";
  else if (c.includes("css")) key = "CSS";
  else if (c.includes("js") || c.includes("java") || c.includes("code")) key = "JS";
  else if (c.includes("english")) key = "English";
  else if (c.includes("quant") || c.includes("math")) key = "Quant";

  const questions = LOCAL_DB[key] || LOCAL_DB["GK"];
  const shuffled = questions.sort(() => 0.5 - Math.random()); // Shuffle so it feels fresh

  QuizState.allQuestions = shuffled.map((q, i) => ({
    id: i,
    category, difficulty,
    question: q.q,
    options: q.o,
    answer: q.a,
    explanation: q.e
  }));
}

function saveToState(questions, category, difficulty) {
  QuizState.allQuestions = questions.map((q, i) => ({
    id: i,
    category, difficulty,
    question: q.question,
    options: q.options,
    answer: q.answer,
    explanation: q.explanation || "Correct Answer"
  }));
}