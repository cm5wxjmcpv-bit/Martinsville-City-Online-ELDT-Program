// js/test.js
const API_URL = "https://script.google.com/macros/s/AKfycbyZA8eMIPHUkaECP6rqRjApA8vWNypsdZofdEdxv-41yZxlHaCh-TFKvIlKdsFBkmOj/exec";

const student =
  localStorage.getItem("student") ||
  new URLSearchParams(location.search).get("student") ||
  "";

const TEST_ID = "final";
const TEST_TITLE = "Final ELDT Theory Quiz";

const quizEl = document.getElementById("quiz");
const submitBtn = document.getElementById("submitBtn");
const resultEl = document.getElementById("result");

// Example 10-question quiz (replace with your real items)
const QUESTIONS = [
  { q: "CDL stands for…",   a: ["Commercial Driver’s License","Certified Driving Log","Commercial Delivery License","Controlled Driving License"], correct: 0 },
  { q: "ELDT refers to…",   a: ["Entry-Level Driver Training","Emergency Loader Dump Truck","Engine Load Data Table","Enhanced Logbook Data Tracking"], correct: 0 },
  { q: "Pre-trip is done…", a: ["Before operating","After operating","Weekly","Only if lights fail"], correct: 0 },
  { q: "Air brake leak test checks…", a: ["Pressure loss","Coolant level","Fuel quality","Horn volume"], correct: 0 },
  { q: "Tires must be free of…", a: ["Cuts/bulges","Tread","Air","Valve caps"], correct: 0 },
  { q: "Three points of contact help prevent…", a:["Falls","Rollovers","Jackknives","Skids"], correct: 0 },
  { q: "DOT HOS manages…", a:["Driver fatigue","Tire pressure","Fuel economy","Coolant change"], correct: 0 },
  { q: "Blind spots are also called…", a:["No-zones","Hot zones","Safe zones","Clear zones"], correct: 0 },
  { q: "Load securement prevents…", a:["Shifting/escape","Idling","ABS faults","Insurance"], correct: 0 },
  { q: "Backing safest when…", a:["Using a spotter","Windows down only","At night only","On gravel"], correct: 0 }
];

function renderQuiz() {
  quizEl.innerHTML = QUESTIONS.map((item, idx) => {
    const opts = item.a.map((opt, j) => `
      <label class="block">
        <input type="radio" name="q${idx}" value="${j}" class="mr-2"/> ${opt}
      </label>
    `).join("");
    return `
      <div class="border rounded p-3">
        <div class="font-medium mb-2">${idx+1}. ${item.q}</div>
        ${opts}
      </div>
    `;
  }).join("");
}

renderQuiz();

submitBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  if (!student) { alert("No student found—please log in again."); location.replace("index.html"); return; }

  let score = 0;
  QUESTIONS.forEach((item, i) => {
    const chosen = document.querySelector(`input[name="q${i}"]:checked`);
    if (chosen && Number(chosen.value) === item.correct) score++;
  });

  const total = QUESTIONS.length;
  const percent = Math.round((score / total) * 100);
  const passed = percent >= 80;

  resultEl.textContent = `Score: ${score}/${total} (${percent}%) — ${passed ? "PASS ✅" : "RETAKE ❌"}`;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student,
        testId: TEST_ID,
        testTitle: TEST_TITLE,
        score,
        total,
        percent,
        passed
      })
    });
    const data = await res.json();
    if (!data?.ok) throw new Error(data?.error || "Failed to log score");
  } catch (err) {
    alert("Could not log test score: " + err.message);
  }
});
