// Simple quiz engine; logs score to Google Sheet
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyZA8eMIPHUkaECP6rqRjApA8vWNypsdZofdEdxv-41yZxlHaCh-TFKvIlKdsFBkmOj/exec";
const PASSING = 0.8;

const QUESTIONS = [
  { q: "What does ELDT stand for?", a: ["Entry-Level Driver Training","Engine Load Drive Test","Emergency Load Driving Techniques"], correct: 0 },
  { q: "Air brake test includes which step?", a: ["Governor cut-out check","Carburetor priming","Alternator spin-up"], correct: 0 },
  { q: "During pre-trip, you must:", a: ["Inspect vehicle systems","Skip tires if new","Only inspect at night"], correct: 0 },
  { q: "Safe following distance on highway (sec)?", a: ["1","2","4"], correct: 2 },
  { q: "Max BAC for CMV operation?", a: ["0.08%","0.04%","0.10%"], correct: 1 },
];

function renderQuiz() {
  const form = document.getElementById('quiz');
  form.innerHTML = "";
  QUESTIONS.forEach((it, idx) => {
    const id = `q${idx}`;
    const block = document.createElement('div');
    block.innerHTML = `
      <div class="font-semibold mb-2">${idx+1}. ${it.q}</div>
      ${
        it.a.map((opt, oi) => `
          <label class="block">
            <input type="radio" name="${id}" value="${oi}" class="mr-2" />
            ${opt}
          </label>
        `).join('')
      }
    `;
    form.appendChild(block);
  });
}

async function submitQuiz() {
  const total = QUESTIONS.length;
  let correct = 0;
  QUESTIONS.forEach((it, idx) => {
    const val = document.querySelector(`input[name="q${idx}"]:checked`);
    if (val && Number(val.value) === it.correct) correct++;
  });
  const percent = correct / total;
  const passed = percent >= PASSING;

  document.getElementById('result').textContent = `Score: ${Math.round(percent*100)}% — ${passed ? "PASS" : "FAIL"}`;

  const student = localStorage.getItem('eldt_student') || "unknown";
  const payload = {
    action: "logScore",
    student,
    testId: "final",
    testTitle: "Final ELDT Theory Quiz",
    score: correct,
    total,
    percent: Math.round(percent*100),
    passed
  };
  try {
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.error(e);
  }
}

document.getElementById('submitBtn').addEventListener('click', submitQuiz);
renderQuiz();
