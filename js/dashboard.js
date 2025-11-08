// ============================================
// dashboard.js — Fetches completion data from Sheet
// ============================================

// READ endpoint — returns { ok:true, completed:[moduleIds] }
const readURL = "https://script.google.com/macros/s/AKfycbzce52bMa2ipXI8U9cM_KINtS76gt_nxzukUxzrMBz3NxxXJ1_u9bwTMGMFaB0f3OwkzQ/exec";

// Your training modules
const MODULES = [
  { id: "5C_0X6G4ytI", title: "Module 1 — Test Video" },
  { id: "qZkkgkMLsvI", title: "Module 2 — Example" },
  { id: "-deVMu0kyik", title: "Module 3 — Example" }
];

(async function init() {
  const listEl  = document.getElementById("moduleList");
  const student = (localStorage.getItem("studentName") || "").trim();

  listEl.innerHTML = `<div class="col-span-1 sm:col-span-2 text-gray-600">Loading your progress…</div>`;

  let completedSet = new Set();

  try {
    if (student) {
      const url = `${readURL}?action=status&student=${encodeURIComponent(student)}`;
      const res = await fetch(url, { method: "GET" });
      const data = await res.json();
      if (data && data.ok && Array.isArray(data.completed)) {
        completedSet = new Set(data.completed);
      }
    }
  } catch (err) {
    console.error("Progress fetch error:", err);
  }

  listEl.innerHTML = "";
  MODULES.forEach((m) => {
    const done = completedSet.has(m.id);
    const href = `module.html?id=${encodeURIComponent(m.id)}`;

    const card = document.createElement("a");
    card.href = href;
    card.className = "block border rounded-xl p-4 shadow-sm hover:shadow-md transition bg-white/90";

    card.innerHTML = `
      <div class="flex items-center justify-between">
        <h2 class="font-semibold text-gray-900">${escapeHtml(m.title)}</h2>
        ${done
          ? `<span class="inline-flex items-center gap-1 text-green-700 font-semibold">✅ Completed</span>`
          : `<span class="inline-flex items-center gap-1 text-gray-500"><span class="w-2 h-2 rounded-full bg-gray-400"></span> Not started</span>`
        }
      </div>
    `;
    listEl.appendChild(card);
  });

  renderFinalTestTile(listEl, completedSet);
})();

function renderFinalTestTile(container, completedSet) {
  const allDone = MODULES.every(m => completedSet.has(m.id));
  const wrap = document.createElement("div");
  wrap.className = "block border rounded-xl p-4 shadow-sm bg-white/90";

  if (allDone) {
    wrap.innerHTML = `
      <div class="flex items-center justify-between">
        <a href="test.html" class="font-semibold text-gray-900 underline">Final Test</a>
        <span class="inline-flex items-center gap-1 text-green-700 font-semibold">✅ Unlocked</span>
      </div>
      <p class="text-sm text-gray-600 mt-1">You’ve completed all modules. Good luck!</p>
    `;
  } else {
    wrap.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="font-semibold text-gray-900">Final Test</span>
        <span class="inline-flex items-center gap-1 text-amber-600 font-semibold">🔒 Locked</span>
      </div>
      <p class="text-sm text-gray-600 mt-1">Complete all modules to unlock.</p>
    `;
  }

  container.appendChild(wrap);
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;","&gt;":">&gt;",'"':"&quot;","'":"&#39;" }[c]));
}
