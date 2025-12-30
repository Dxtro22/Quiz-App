import { QuizState } from "./state.js";

// ==========================================
// 1. CONFIGURATION
// ==========================================
const QUIZAPI_KEY = "gu35UdpO1ZtwTMjRrwKG9G0MC4N8CS5riRByfBaz"; 

// ==========================================
// 2. OFFLINE BACKUP DATA (Expanded to 10+ Questions)
// ==========================================
const OFFLINE_DATA = {
  "HTML": [
    { question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language"], answer: "Hyper Text Markup Language" },
    { question: "Which tag is used for the largest heading?", options: ["<h6>", "<h1>", "<heading>", "<head>"], answer: "<h1>" },
    { question: "What is the correct HTML element for inserting a line break?", options: ["<break>", "<lb>", "<br>", "<newline>"], answer: "<br>" },
    { question: "Which character is used to indicate an end tag?", options: ["*", "/", "<", "^"], answer: "/" },
    { question: "How can you make a numbered list?", options: ["<ul>", "<dl>", "<list>", "<ol>"], answer: "<ol>" },
    { question: "Which HTML attribute specifies an alternate text for an image?", options: ["title", "alt", "src", "longdesc"], answer: "alt" },
    { question: "Which doctype is correct for HTML5?", options: ["<!DOCTYPE html>", "<html doctype>", "<!DOCTYPE HTML5>"], answer: "<!DOCTYPE html>" },
    { question: "Which HTML element is used to specify a footer for a document or section?", options: ["<bottom>", "<footer>", "<section>", "<area>"], answer: "<footer>" },
    { question: "In HTML, which attribute is used to specify that an input field must be filled out?", options: ["placeholder", "validate", "required", "formvalidate"], answer: "required" },
    { question: "Which HTML element defines navigation links?", options: ["<nav>", "<navigate>", "<links>", "<menu>"], answer: "<nav>" }
  ],
  "CSS": [
    { question: "What does CSS stand for?", options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets"], answer: "Cascading Style Sheets" },
    { question: "Which property is used to change the background color?", options: ["color", "bgcolor", "background-color"], answer: "background-color" },
    { question: "How do you select an element with id 'demo'?", options: [".demo", "demo", "#demo", "*demo"], answer: "#demo" },
    { question: "Which property changes the text color?", options: ["text-color", "fgcolor", "color", "font-color"], answer: "color" },
    { question: "How do you make each word in a text start with a capital letter?", options: ["text-transform: capitalize", "text-style: capitalize", "transform: capitalize"], answer: "text-transform: capitalize" },
    { question: "Which property controls the text size?", options: ["font-size", "text-style", "text-size", "font-style"], answer: "font-size" },
    { question: "What is the correct CSS syntax for making all the <p> elements bold?", options: ["p {text-size:bold;}", "p {font-weight:bold;}", "<p style='font-size:bold;'>", "p {style:bold;}"], answer: "p {font-weight:bold;}" },
    { question: "How do you insert a comment in a CSS file?", options: ["// this is a comment", "/* this is a comment */", "' this is a comment", "// this is a comment //"], answer: "/* this is a comment */" },
    { question: "Which property specifies the stack order of an element?", options: ["z-index", "s-index", "x-index", "stack-order"], answer: "z-index" },
    { question: "Which HTML attribute is used to define inline styles?", options: ["style", "class", "font", "styles"], answer: "style" }
  ],
  "JavaScript": [
    { question: "Inside which HTML element do we put the JavaScript?", options: ["<js>", "<scripting>", "<script>", "<javascript>"], answer: "<script>" },
    { question: "How do you write 'Hello World' in an alert box?", options: ["msg('Hello World');", "alertBox('Hello World');", "alert('Hello World');"], answer: "alert('Hello World');" },
    { question: "How do you create a function in JavaScript?", options: ["function = myFunction()", "function myFunction()", "create myFunction()"], answer: "function myFunction()" },
    { question: "How to write an IF statement in JavaScript?", options: ["if i = 5 then", "if (i == 5)", "if i == 5 then"], answer: "if (i == 5)" },
    { question: "Which event occurs when the user clicks on an HTML element?", options: ["onmouseover", "onclick", "onchange", "onmouseclick"], answer: "onclick" },
    { question: "How do you declare a JavaScript variable?", options: ["v carName;", "var carName;", "variable carName;"], answer: "var carName;" },
    { question: "Which operator is used to assign a value to a variable?", options: ["*", "x", "=", "-"], answer: "=" },
    { question: "How do you find the number with the highest value of x and y?", options: ["Math.ceil(x, y)", "Math.max(x, y)", "ceil(x, y)", "top(x, y)"], answer: "Math.max(x, y)" },
    { question: "What is the correct way to write a JavaScript array?", options: ["var colors = (1:'red', 2:'green')", "var colors = ['red', 'green', 'blue']", "var colors = 'red', 'green', 'blue'"], answer: "var colors = ['red', 'green', 'blue']" },
    { question: "How do you round the number 7.25, to the nearest integer?", options: ["Math.rnd(7.25)", "Math.round(7.25)", "round(7.25)", "rnd(7.25)"], answer: "Math.round(7.25)" }
  ]
};

// ==========================================
// 3. MAIN LOADING LOGIC
// ==========================================

const TECH_TAGS = { "HTML": "HTML", "CSS": "CSS", "JavaScript": "JavaScript" };
const OPENTDB_MAP = { "GK": 9, "Quant": 19, "English": 10, "Web Dev": 18 };

export async function loadQuestions(config) {
  const category = config.category;
  
  // --- SCENARIO A: CODING QUESTIONS (QuizAPI + Fallback) ---
  if (TECH_TAGS[category]) {
    const tag = TECH_TAGS[category];
    const difficulty = config.difficulty.toLowerCase();
    const url = `https://quizapi.io/api/v1/questions?apiKey=${QUIZAPI_KEY}&tags=${tag}&difficulty=${difficulty}&limit=10`;

    try {
      console.log(`Attempting to fetch ${category} from API...`);
      const res = await fetch(url);
      
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      const data = await res.json();
      
      if (!Array.isArray(data) || data.length === 0) throw new Error("No data returned");

      QuizState.allQuestions = data.map((q, index) => {
        const validOptions = [];
        let correctIndex = 0;
        
        Object.entries(q.answers).forEach(([key, val]) => {
          if (val) validOptions.push(val);
        });

        Object.keys(q.correct_answers).forEach((key, i) => {
          if (q.correct_answers[key] === "true") correctIndex = i;
        });

        return {
          id: index,
          category: category,
          difficulty: config.difficulty,
          question: q.question,
          options: validOptions,
          answer: correctIndex,
          explanation: "Source: QuizAPI.io"
        };
      });
      return; 

    } catch (err) {
      console.warn("API Failed. Switching to OFFLINE MODE.", err);
      loadOfflineData(category, config.difficulty);
      return; 
    }
  }

  // --- SCENARIO B: GENERAL QUESTIONS (OpenTDB) ---
  const catId = OPENTDB_MAP[category] || 9;
  const url = `https://opentdb.com/api.php?amount=10&category=${catId}&difficulty=${config.difficulty.toLowerCase()}&type=multiple`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.response_code !== 0) throw new Error("OpenTDB Error");

    QuizState.allQuestions = data.results.map((q, index) => {
      const allOptions = [...q.incorrect_answers, q.correct_answer];
      const shuffled = allOptions.sort(() => Math.random() - 0.5);
      return {
        id: index,
        category: category,
        difficulty: config.difficulty,
        question: decodeHTML(q.question),
        options: shuffled.map(decodeHTML),
        answer: shuffled.indexOf(q.correct_answer),
        explanation: `Correct: ${q.correct_answer}`
      };
    });
  } catch (err) {
    console.error(err);
    alert("Unable to load questions. Please check your internet connection.");
    throw err;
  }
}

// Helper: Load Offline Data
function loadOfflineData(category, difficulty) {
  console.log(`Loading built-in questions for ${category}`);
  const rawData = OFFLINE_DATA[category] || OFFLINE_DATA["HTML"];
  
  QuizState.allQuestions = rawData.map((q, index) => {
    const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
    return {
      id: index,
      category: category,
      difficulty: difficulty,
      question: q.question,
      options: shuffledOptions,
      answer: shuffledOptions.indexOf(q.answer),
      explanation: "Offline Mode"
    };
  });
  
  QuizState.allQuestions.sort(() => Math.random() - 0.5);
}

function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}