import { QuizState } from "./state.js";

// ==========================================
// 🟢 CONFIGURATION
// ==========================================
const GEMINI_API_KEY = "AIzaSyA5OVja-s5a4tHoJK5P_sVJVv40QXjfbpw"; 

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
    // If we get fewer than 5 questions, assume AI failed and go to backup
    if (!aiQuestions || aiQuestions.length < 5) throw new Error("AI returned too few questions");
    
    saveToState(aiQuestions, category, difficulty);
    console.log("✅ SUCCESS: Loaded fresh questions from Gemini AI");
    return;
  } catch (err) {
    console.warn("⚠️ AI Failed or blocked. Switching to Extended Local Backup.");
  }

  // --- PHASE 2: LOCAL BACKUP ---
  console.log("📂 Loading from Local Database...");
  loadLocalQuestions(category, difficulty);
}

// ==========================================
// 🧠 ENGINE A: GEMINI AI (Smart Fetch)
// ==========================================
async function fetchGeminiQuestions(category, difficulty) {
  let topicPrompt = category;
  if (category === "HTML") topicPrompt = "HTML5 tags, attributes, and semantic structure";
  if (category === "CSS") topicPrompt = "CSS3 styling, flexbox, grid, and selectors";
  if (category === "JS") topicPrompt = "JavaScript ES6 syntax, functions, and logic";
  if (category === "English") topicPrompt = "English grammar, vocabulary, synonyms, and antonyms";
  if (category === "Quant") topicPrompt = "Advanced Algebra, Probability, Geometry, and Logical Reasoning";
  
  const prompt = `
    Create a JSON quiz with 10 multiple-choice questions about "${topicPrompt}" (${difficulty} level).
    Output STRICT JSON Array only. No Markdown. No code blocks.
    Format: [{"question":"...","options":["A","B","C","D"],"answer":0,"explanation":"..."}]
    (Answer must be the integer index 0-3 of the correct option).
  `;

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
// 📂 ENGINE B: LOCAL DATABASE (Expanded & Hard)
// ==========================================
const LOCAL_DB = {
  "HTML": [
    { q: "What does HTML stand for?", o: ["Hyper Text Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language", "Hyper Tool Multi Language"], a: 0, e: "Standard markup language." },
    { q: "Which tag is used for the largest heading?", o: ["<head>", "<h6>", "<h1>", "<heading>"], a: 2, e: "<h1> is the largest." },
    { q: "Which HTML element defines the title of a document?", o: ["<meta>", "<head>", "<title>", "<header>"], a: 2, e: "Title goes in <title>." },
    { q: "Which attribute specifies the destination of a link?", o: ["src", "href", "link", "url"], a: 1, e: "href (Hypertext Reference) is used." },
    { q: "What is the correct HTML element for playing video files?", o: ["<media>", "<video>", "<movie>", "<film>"], a: 1, e: "The <video> tag is standard." },
    { q: "In HTML5, which tag is used to define navigation links?", o: ["<nav>", "<navigation>", "<links>", "<ul>"], a: 0, e: "<nav> is the semantic tag." },
    { q: "Which input type defines a slider control?", o: ["slider", "range", "controls", "search"], a: 1, e: "input type='range'." },
    { q: "Which HTML tag is used to define an unordered list?", o: ["<ul>", "<ol>", "<li>", "<list>"], a: 0, e: "<ul> stands for Unordered List." },
    { q: "Which HTML element is used to specify a footer for a document or section?", o: ["<bottom>", "<footer>", "<section>", "<end>"], a: 1, e: "<footer> is the semantic tag." },
    { q: "What is the correct HTML for making a text input field?", o: ["<input type='text'>", "<textfield>", "<textinput>", "<input='text'>"], a: 0, e: "Standard input tag." }
  ],
  "CSS": [
    { q: "What does CSS stand for?", o: ["Cascading Style Sheets", "Creative Style System", "Computer Style Sheets", "Colorful Style Sheets"], a: 0, e: "Style sheet language." },
    { q: "Which property controls text color?", o: ["font-color", "text-style", "text-color", "color"], a: 3, e: "Color property." },
    { q: "How do you make text bold?", o: ["font-weight: bold", "style: bold", "font: bold", "text-align: bold"], a: 0, e: "Font-weight property." },
    { q: "Which property is used to change the background color?", o: ["bgcolor", "color", "background-color", "bg"], a: 2, e: "background-color." },
    { q: "How do you select an element with id 'demo'?", o: [".demo", "demo", "#demo", "*demo"], a: 2, e: "# is for ID." },
    { q: "Which CSS property controls the text size?", o: ["font-style", "text-size", "font-size", "text-style"], a: 2, e: "font-size." },
    { q: "What is the default value of the position property?", o: ["relative", "fixed", "absolute", "static"], a: 3, e: "Static is default." },
    { q: "Which property is used to change the font of an element?", o: ["font-family", "font-weight", "font-style", "typeface"], a: 0, e: "font-family." },
    { q: "How do you display hyperlinks without an underline?", o: ["text-decoration: none", "text-decoration: no-underline", "underline: none", "decoration: none"], a: 0, e: "text-decoration: none." },
    { q: "Which property controls the space between the element border and the element content?", o: ["margin", "padding", "border", "spacing"], a: 1, e: "Padding is inside the border." }
  ],
  "Quant": [
    // --- EASY ---
    { q: "What is 15% of 200?", o: ["20", "25", "30", "35"], a: 2, e: "10% is 20, 5% is 10. Total 30." },
    { q: "Solve: 2 + 2 * 3", o: ["12", "8", "6", "10"], a: 1, e: "BODMAS: 2*3=6, 6+2=8." },
    { q: "What is the square root of 144?", o: ["10", "11", "12", "13"], a: 2, e: "12 * 12 = 144." },
    // --- HARD (NEW) ---
    { q: "If a coin is flipped 3 times, what is the probability of getting at least one head?", o: ["1/8", "7/8", "3/8", "1/2"], a: 1, e: "Total outcomes = 8. Only TTT has no heads. So 1 - 1/8 = 7/8." },
    { q: "Find the next number in the series: 2, 6, 12, 20, 30, ...", o: ["40", "42", "44", "38"], a: 1, e: "Differences are 4, 6, 8, 10. Next difference is 12. 30+12 = 42." },
    { q: "If x + 1/x = 3, what is the value of x² + 1/x²?", o: ["9", "7", "6", "11"], a: 1, e: "(x+1/x)² = x² + 1/x² + 2. So 3² = 9. 9 - 2 = 7." },
    { q: "A train 240m long passes a pole in 24 seconds. How long will it take to pass a platform 650m long?", o: ["65s", "89s", "100s", "50s"], a: 1, e: "Speed = 240/24 = 10m/s. Total distance = 240+650 = 890m. Time = 890/10 = 89s." },
    { q: "The sum of ages of 5 children born at intervals of 3 years each is 50 years. What is the age of the youngest child?", o: ["4", "8", "10", "None of these"], a: 0, e: "x + (x+3) + (x+6) + (x+9) + (x+12) = 50. 5x + 30 = 50. 5x=20. x=4." },
    { q: "What is the probability of drawing a King from a standard deck of 52 cards?", o: ["1/13", "1/52", "4/13", "1/4"], a: 0, e: "There are 4 Kings. 4/52 simplifies to 1/13." },
    { q: "If A can do a work in 10 days and B in 15 days, how long will they take together?", o: ["5 days", "6 days", "8 days", "9 days"], a: 1, e: "1/10 + 1/15 = 5/30 = 1/6. So 6 days." }
  ],
  "English": [
    { q: "Identify the noun: 'The cat slept.'", o: ["The", "slept", "cat", "quickly"], a: 2, e: "Noun is a thing." },
    { q: "Antonym for 'Happy'?", o: ["Joyful", "Sad", "Bright", "Content"], a: 1, e: "Opposite." },
    { q: "Choose correct spelling.", o: ["Recieve", "Receive", "Receeve", "Riceive"], a: 1, e: "I before E except after C." },
    { q: "Synonym for 'Difficult'?", o: ["Easy", "Simple", "Hard", "Soft"], a: 2, e: "Hard means difficult." },
    { q: "Past tense of 'Go'?", o: ["Goed", "Gone", "Went", "Going"], a: 2, e: "Went." },
    { q: "Plural of 'Child'?", o: ["Childs", "Children", "Childrens", "Childes"], a: 1, e: "Children." },
    { q: "Adjective in: 'Blue sky'", o: ["Blue", "Sky", "Is", "The"], a: 0, e: "Describes the noun." },
    { q: "Correct article: '___ hour'", o: ["A", "An", "The", "None"], a: 1, e: "An hour (silent H)." },
    { q: "Verb in: 'They play soccer.'", o: ["They", "Play", "Soccer", "Game"], a: 1, e: "Action word." },
    { q: "Homophone for 'See'?", o: ["Sea", "Saw", "Seen", "Scene"], a: 0, e: "Sea (ocean)." }
  ],
  "JS": [
     { q: "Inside which HTML element do we put the JavaScript?", o: ["<javascript>", "<js>", "<script>", "<scripting>"], a: 2, e: "The <script> tag." },
     { q: "How do you write 'Hello World' in an alert box?", o: ["msg('Hello World')", "alert('Hello World')", "msgBox('Hello World')", "alertBox('Hello World')"], a: 1, e: "alert() function." },
     { q: "Which operator is used to assign a value to a variable?", o: ["*", "-", "=", "x"], a: 2, e: "Assignment operator =." },
     { q: "How do you create a function in JavaScript?", o: ["function = myFunction()", "function myFunction()", "function:myFunction()", "create myFunction()"], a: 1, e: "function name() {}" },
     { q: "How do you call a function named 'myFunction'?", o: ["call myFunction()", "myFunction()", "call function myFunction()", "Run.myFunction()"], a: 1, e: "myFunction()" },
     { q: "How to write an IF statement in JavaScript?", o: ["if i = 5", "if i == 5 then", "if (i == 5)", "if i = 5 then"], a: 2, e: "if (condition)" },
     { q: "How does a FOR loop start?", o: ["for (i = 0; i <= 5)", "for (i = 0; i <= 5; i++)", "for i = 1 to 5", "for (i <= 5; i++)"], a: 1, e: "Standard loop syntax." },
     { q: "How can you add a comment in a JavaScript?", o: ["'This is a comment", "//This is a comment", "", "#This is a comment"], a: 1, e: "// for single line." },
     { q: "What is the correct way to write a JavaScript array?", o: ["var colors = (1:'red', 2:'green')", "var colors = ['red', 'green']", "var colors = 'red', 'green'", "var colors = 1 = ('red'), 2 = ('green')"], a: 1, e: "Square brackets []." },
     { q: "Which event occurs when the user clicks on an HTML element?", o: ["onchange", "onclick", "onmouseclick", "onmouseover"], a: 1, e: "onclick event." }
  ],
  "GK": [
     { q: "Capital of France?", o: ["Berlin", "Madrid", "Paris", "Rome"], a: 2, e: "Paris." },
     { q: "Who wrote 'Romeo and Juliet'?", o: ["Dickens", "Shakespeare", "Austen", "Hemingway"], a: 1, e: "Shakespeare." },
     { q: "Chemical symbol for Gold?", o: ["Au", "Ag", "Fe", "Go"], a: 0, e: "Au." },
     { q: "Largest planet in our solar system?", o: ["Earth", "Mars", "Jupiter", "Saturn"], a: 2, e: "Jupiter." },
     { q: "Hardest natural substance?", o: ["Gold", "Iron", "Diamond", "Platinum"], a: 2, e: "Diamond." },
     { q: "How many continents are there?", o: ["5", "6", "7", "8"], a: 2, e: "Seven." },
     { q: "Fastest land animal?", o: ["Lion", "Cheetah", "Horse", "Tiger"], a: 1, e: "Cheetah." },
     { q: "Boiling point of water?", o: ["100°C", "90°C", "110°C", "50°C"], a: 0, e: "100 degrees Celsius." },
     { q: "Which gas do plants absorb?", o: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], a: 1, e: "CO2." },
     { q: "Currency of Japan?", o: ["Yuan", "Won", "Yen", "Dollar"], a: 2, e: "Yen." }
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
  // Randomize so the hard questions mix with easy ones
  const shuffled = questions.sort(() => 0.5 - Math.random());

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