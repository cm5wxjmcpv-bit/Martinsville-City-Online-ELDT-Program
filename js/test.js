// ============================================
// test.js — grade quiz and log score to Google Sheet
// ============================================

const scriptURL = "https://script.google.com/macros/s/AKfycbyZA8eMIPHUkaECP6rqRjApA8vWNypsdZofdEdxv-41yZxlHaCh-TFKvIlKdsFBkmOj/exec";

const student    = (localStorage.getItem("studentName") || "").trim() || "Unknown Student";
const TEST_ID    = "final";
const TEST_TITLE = "Final Test";
const PASS_PCT   = 80;

window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("quizForm");
  const resultEl = document.getElementById("quizResult");
  if (!form) { console.error("quizForm not found"); return; }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const { score, total } = gradeQuiz();
    const percent = Math.round((score / total) * 100);
    const passed  = percent >= PASS_PCT;

    if (resultEl) {
      resultEl.innerHTML = `
        <div class="p-3 rounded-lg border bg-white/90">
          <div class="text-lg font-semibold ${passed ? 'text-green-700' : 'text-red-700'}">
            ${passed ? '✅ Passed' : '❌ Not Passed'}
          </div>
          <div class="text-gray-800 mt-1">Score: <b>${score}</b> / ${total} (${percent}%)</div>
        </div>`;
      resultEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    try {
      const body = new URLSearchParams({
        student,
        testId: TEST_ID,
        testTitle: TEST_TITLE,
        score: String(score),
        total: String(total),
        percent: String(percent),
        passed: String(passed)
      });
      await fetch(scriptURL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body
      });
    } catch (err) {
      console.error("Score log error:", err);
    }
  });
});

function gradeQuiz() {
  const fieldsets = Array.from(document.querySelectorAll("fieldset[data-qid]"));
  let score = 0, total = 0;
  fieldsets.forEach(fs => {
    total += 1;
    const name = fs.getAttribute("data-qid");
    const picked = document.querySelector(`input[name="${CSS.escape(name)}"]:checked`);
    if (picked && picked.hasAttribute("data-correct")) score += 1;
  });
  return { score, total };
}
