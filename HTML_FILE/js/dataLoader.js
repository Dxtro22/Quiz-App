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
    // If we get fewer than 5 questions, assume AI failed
    if (!aiQuestions || aiQuestions.length < 5) throw new Error("AI returned too few questions");
    
    saveToState(aiQuestions, category, difficulty);
    console.log("✅ SUCCESS: Loaded fresh questions from Gemini AI");
    return;
  } catch (err) {
    console.warn("⚠️ AI Failed. Switching to Master Question Bank.");
  }

  // --- PHASE 2: MASTER LOCAL BANK ---
  console.log("📂 Opening Vault: Loading from Local Database...");
  loadLocalQuestions(category, difficulty);
}

// ==========================================
// 🧠 ENGINE A: GEMINI AI
// ==========================================
async function fetchGeminiQuestions(category, difficulty) {
  let topicPrompt = category;
  if (category === "Quant") topicPrompt = "Advanced Algebra, Probability, Geometry, and Logical Reasoning";
  
  const prompt = `
    Create a JSON quiz with 10 multiple-choice questions about "${topicPrompt}" (${difficulty} level).
    Output STRICT JSON Array only. No Markdown.
    Format: [{"question":"...","options":["A","B","C","D"],"answer":0,"explanation":"..."}]
  `;

  for (const model of MODEL_CANDIDATES) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      if (!response.ok) throw new Error(response.statusText);
      const data = await response.json();
      let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Empty");

      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const start = text.indexOf("[");
      const end = text.lastIndexOf("]");
      if (start === -1 || end === -1) throw new Error("Invalid JSON");
      
      return JSON.parse(text.substring(start, end + 1));
    } catch (e) { /* try next */ }
  }
  throw new Error("All models failed");
}

// ==========================================
// 🏦 ENGINE B: THE MASTER QUESTION BANK
// ==========================================
const LOCAL_DB = {
  "Quant": [
    // --- ALGEBRA & NUMBERS ---
    { q: "If x + 1/x = 3, what is x² + 1/x²?", o: ["7", "9", "11", "6"], a: 0, e: "Square both sides: (x+1/x)² = 9 → x² + 1/x² + 2 = 9 → x² + 1/x² = 7." },
    { q: "The sum of ages of 5 children born at intervals of 3 years each is 50 years. What is the age of the youngest child?", o: ["4", "8", "10", "None of these"], a: 0, e: "x + (x+3) + (x+6) + (x+9) + (x+12) = 50. 5x+30=50. 5x=20. x=4." },
    { q: "If log 27 = 1.431, then the value of log 9 is:", o: ["0.934", "0.945", "0.954", "0.958"], a: 2, e: "log 27 = 3log3 = 1.431 → log3 = 0.477. log 9 = 2log3 = 0.954." },
    { q: "Find the next number: 2, 6, 12, 20, 30, ...", o: ["40", "42", "44", "38"], a: 1, e: "Differences: 4, 6, 8, 10. Next is 12. 30+12=42." },
    { q: "A father is aged three times more than his son Ronit. After 8 years, he would be two and a half times of Ronit's age.", o: ["2 times", "2.5 times", "3 times", "4 times"], a: 0, e: "Let Ronit be x, Father is 4x. (4x+8) = 2.5(x+8). Solve for x." },
    
    // --- PROBABILITY & STATISTICS ---
    { q: "What is the probability of drawing a King from a standard 52-card deck?", o: ["1/13", "1/52", "4/13", "1/4"], a: 0, e: "4 Kings / 52 Cards = 1/13." },
    { q: "Three unbiased coins are tossed. What is the probability of getting at most two heads?", o: ["3/4", "7/8", "1/2", "1/4"], a: 1, e: "Total = 8 events. Only HHH is excluded. So 7/8." },
    { q: "In a throw of two dice, what is the probability of getting a sum of 9?", o: ["1/9", "1/12", "1/6", "1/8"], a: 0, e: "Pairs: (3,6), (4,5), (5,4), (6,3). Total 4. 4/36 = 1/9." },
    
    // --- GEOMETRY & MENSURATION ---
    { q: "The length of a rectangle is halved, while its breadth is tripled. What is the percentage change in area?", o: ["10% increase", "25% increase", "50% increase", "50% decrease"], a: 2, e: "New Area = (L/2) * (3B) = 1.5 * LB. Increase of 50%." },
    { q: "A wheel makes 1000 revolutions in covering a distance of 88 km. What is the diameter of the wheel?", o: ["24m", "28m", "40m", "14m"], a: 1, e: "Distance = 88000m. 1000 * Circumference = 88000. πd = 88. d = 28m." },
    { q: "The surface area of a cube is 600 cm². What is the length of its diagonal?", o: ["10√2", "10√3", "10", "20"], a: 1, e: "6a²=600 → a=10. Diagonal = a√3 = 10√3." },
    
    // --- SPEED, TIME & DISTANCE ---
    { q: "A train 240m long passes a pole in 24 seconds. How long will it take to pass a platform 650m long?", o: ["65s", "89s", "100s", "50s"], a: 1, e: "Speed = 10m/s. Total Dist = 240+650=890. Time = 89s." },
    { q: "Two trains running in opposite directions cross a man standing on the platform in 27s and 17s respectively and they cross each other in 23s.", o: ["1:3", "3:2", "3:4", "None"], a: 1, e: "(t3-t2)/(t1-t3) = (23-17)/(27-23) = 6/4 = 3:2." },
    
    // --- PERCENTAGES & PROFIT/LOSS ---
    { q: "If A's salary is 20% less than B's salary, by how much percent is B's salary more than A's?", o: ["20%", "25%", "30%", "15%"], a: 1, e: "Let B=100, A=80. Diff=20. (20/80)*100 = 25%." },
    { q: "A shopkeeper sells an article for $2400 and makes a profit of 20%. What was the cost price?", o: ["2000", "2100", "2200", "1800"], a: 0, e: "1.2 * CP = 2400. CP = 2400/1.2 = 2000." },
    { q: "A fruit seller had some apples. He sells 40% apples and still has 420 apples. Originally, he had:", o: ["588", "600", "672", "700"], a: 3, e: "60% = 420. Total = 420/0.6 = 700." },
    
    // --- WORK & TIME ---
    { q: "A does a work in 10 days and B in 15 days. In how many days will they finish the work together?", o: ["5", "6", "8", "9"], a: 1, e: "1/10 + 1/15 = 5/30 = 1/6. Answer: 6 days." },
    { q: "If 6 men and 8 boys can do a piece of work in 10 days while 26 men and 48 boys can do the same in 2 days...", o: ["4 days", "5 days", "6 days", "7 days"], a: 0, e: "Complex algebra. 15m+20b is exactly 2.5x of 6m+8b. 10/2.5 = 4 days." },
    
    // --- NUMBER SYSTEMS ---
    { q: "What is the smallest number which when decreased by 8 is divisible by 21, 27, 33, and 55?", o: ["1490", "10405", "10403", "None"], a: 3, e: "LCM(21,27,33,55) + 8." },
    { q: "The product of two numbers is 120 and the sum of their squares is 289. The sum of the number is:", o: ["20", "23", "169", "None"], a: 1, e: "(a+b)² = a²+b²+2ab = 289 + 240 = 529. Sqrt(529) = 23." },
    
    // --- PERMUTATIONS & COMBINATIONS ---
    { q: "In how many ways can the letters of the word 'LEADER' be arranged?", o: ["72", "144", "360", "720"], a: 2, e: "6 letters, E repeats twice. 6! / 2! = 720/2 = 360." },
    { q: "From a group of 7 men and 6 women, five persons are to be selected to form a committee so that at least 3 men are there...", o: ["564", "645", "735", "756"], a: 3, e: "Calculate combinations for (3m,2w) + (4m,1w) + (5m,0w)." },
    
    // --- HARDER LOGIC ---
    { q: "Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?", o: ["(1/3)", "(1/8)", "(2/8)", "(1/16)"], a: 1, e: "Each number is half the previous one." },
    { q: "SCD, TEF, UGH, ____, WKL", o: ["CMN", "UJI", "VIJ", "IJT"], a: 2, e: "First letter +1 (V), second +1 (I), third +1 (J). Answer VIJ." },
    { q: "Pointing to a photograph, a man said, 'I have no brother or sister but that man’s father is my father’s son.'", o: ["His own", "His Son", "His Father", "His Nephew"], a: 1, e: "'My father's son' is ME. So, 'That man's father is ME'. It's his son." },
    { q: "If A = 26, SUN = 27, then CAT = ?", o: ["24", "27", "57", "58"], a: 2, e: "Reverse alphabet values. C=24, A=26, T=7. Sum = 57." },
    
    // --- CALCULUS / ADVANCED ---
    { q: "What is the derivative of x²?", o: ["x", "2x", "x²", "2"], a: 1, e: "Power rule: d/dx(x^n) = nx^(n-1). 2x." },
    { q: "Limit of (sin x)/x as x approaches 0 is:", o: ["0", "1", "Infinity", "Undefined"], a: 1, e: "Standard limit." },
    { q: "Integral of 1/x dx is:", o: ["ln(x)", "x", "1/x^2", "e^x"], a: 0, e: "ln(|x|) + C." }
  ],

  // 🟢 OTHER CATEGORIES (Standard)
  "HTML": [
    { q: "What does HTML stand for?", o: ["Hyper Text Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language", "Hyper Tool Multi Language"], a: 0, e: "Standard markup language." },
    { q: "Which tag is used for the largest heading?", o: ["<head>", "<h6>", "<h1>", "<heading>"], a: 2, e: "<h1> is the largest." },
    { q: "Which HTML element defines the title of a document?", o: ["<meta>", "<head>", "<title>", "<header>"], a: 2, e: "Title goes in <title>." },
    { q: "Which attribute specifies the destination of a link?", o: ["src", "href", "link", "url"], a: 1, e: "href (Hypertext Reference) is used." },
    { q: "What is the correct HTML element for playing video files?", o: ["<media>", "<video>", "<movie>", "<film>"], a: 1, e: "The <video> tag is standard." }
  ],
  "CSS": [
    { q: "What does CSS stand for?", o: ["Cascading Style Sheets", "Creative Style System", "Computer Style Sheets", "Colorful Style Sheets"], a: 0, e: "Style sheet language." },
    { q: "Which property controls text color?", o: ["font-color", "text-style", "text-color", "color"], a: 3, e: "Color property." },
    { q: "How do you make text bold?", o: ["font-weight: bold", "style: bold", "font: bold", "text-align: bold"], a: 0, e: "Font-weight property." },
    { q: "Which property is used to change the background color?", o: ["bgcolor", "color", "background-color", "bg"], a: 2, e: "background-color." },
    { q: "How do you select an element with id 'demo'?", o: [".demo", "demo", "#demo", "*demo"], a: 2, e: "# is for ID." }
  ],
  "JS": [
     { q: "Inside which HTML element do we put the JavaScript?", o: ["<javascript>", "<js>", "<script>", "<scripting>"], a: 2, e: "The <script> tag." },
     { q: "How do you write 'Hello World' in an alert box?", o: ["msg('Hello World')", "alert('Hello World')", "msgBox('Hello World')", "alertBox('Hello World')"], a: 1, e: "alert() function." },
     { q: "Which operator is used to assign a value to a variable?", o: ["*", "-", "=", "x"], a: 2, e: "Assignment operator =." },
     { q: "How do you create a function in JavaScript?", o: ["function = myFunction()", "function myFunction()", "function:myFunction()", "create myFunction()"], a: 1, e: "function name() {}" },
     { q: "How do you call a function named 'myFunction'?", o: ["call myFunction()", "myFunction()", "call function myFunction()", "Run.myFunction()"], a: 1, e: "myFunction()" }
  ],
  "English": [
    { q: "Identify the noun: 'The cat slept.'", o: ["The", "slept", "cat", "quickly"], a: 2, e: "Noun is a thing." },
    { q: "Antonym for 'Happy'?", o: ["Joyful", "Sad", "Bright", "Content"], a: 1, e: "Opposite." },
    { q: "Choose correct spelling.", o: ["Recieve", "Receive", "Receeve", "Riceive"], a: 1, e: "I before E except after C." },
    { q: "Synonym for 'Difficult'?", o: ["Easy", "Simple", "Hard", "Soft"], a: 2, e: "Hard means difficult." },
    { q: "Past tense of 'Go'?", o: ["Goed", "Gone", "Went", "Going"], a: 2, e: "Went." }
  ],
  "GK": [
     { q: "Capital of France?", o: ["Berlin", "Madrid", "Paris", "Rome"], a: 2, e: "Paris." },
     { q: "Who wrote 'Romeo and Juliet'?", o: ["Dickens", "Shakespeare", "Austen", "Hemingway"], a: 1, e: "Shakespeare." },
     { q: "Chemical symbol for Gold?", o: ["Au", "Ag", "Fe", "Go"], a: 0, e: "Au." },
     { q: "Largest planet in our solar system?", o: ["Earth", "Mars", "Jupiter", "Saturn"], a: 2, e: "Jupiter." },
     { q: "Hardest natural substance?", o: ["Gold", "Iron", "Diamond", "Platinum"], a: 2, e: "Diamond." }
  ]
};

// ==========================================
// 🎲 THE SHUFFLER ENGINE (Fixed: Limits to 10)
// ==========================================
function loadLocalQuestions(category, difficulty) {
  let key = "GK";
  const c = category.toLowerCase();
  
  if (c.includes("html")) key = "HTML";
  else if (c.includes("css")) key = "CSS";
  else if (c.includes("js") || c.includes("java")) key = "JS";
  else if (c.includes("english")) key = "English";
  else if (c.includes("quant") || c.includes("math")) key = "Quant";

  // 1. Get the pool of questions
  const allQuestions = LOCAL_DB[key] || LOCAL_DB["GK"];

  // 2. SHUFFLE: Copy array and sort randomly
  const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());

  // 3. 🟢 LIMIT TO 10: This ensures you never see "Question 1 / 29" again.
  const selected = shuffled.slice(0, 10);

  // 4. Map to Quiz format
  QuizState.allQuestions = selected.map((q, i) => ({
    id: i,
    category, difficulty,
    question: q.question || q.q,
    options: q.options || q.o,
    answer: q.answer !== undefined ? q.answer : q.a,
    explanation: q.explanation || q.e
  }));
  
  console.log(`🎰 Vault has ${allQuestions.length} questions. Selected top 10 for you.`);
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