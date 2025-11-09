// Admin dashboard loader
// Tries to fetch completions from Apps Script; if not implemented, falls back to localStorage mirror.

const ENDPOINT = "https://script.google.com/macros/s/AKfycbyZA8eMIPHUkaECP6rqRjApA8vWNypsdZofdEdxv-41yZxlHaCh-TFKvIlKdsFBkmOj/exec";

async function fetchCompletions() {
  try {
    const res = await fetch(ENDPOINT + "?action=listCompletions");
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json(); // expects [{student,moduleTitle,yt,completedAt}]
  } catch (e) {
    // fallback to localStorage format used by module.js (none by default)
    const local = JSON.parse(localStorage.getItem("eldt_completions") || "[]");
    return local;
  }
}

function renderRows(rows) {
  const tbody = document.getElementById("adminBody");
  tbody.innerHTML = "";
  if (!rows.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = '<td class="py-3 text-gray-500" colspan="4">No completions yet.</td>';
    tbody.appendChild(tr);
    return;
  }
  rows.forEach(r => {
    const tr = document.createElement("tr");
    tr.className = "border-b";
    tr.innerHTML = `
      <td class="py-2">${r.student || ""}</td>
      <td class="py-2">${r.moduleTitle || ""}</td>
      <td class="py-2">${r.yt || r.videoId || ""}</td>
      <td class="py-2">${r.completedAt || r.timestamp || ""}</td>
    `;
    tbody.appendChild(tr);
  });
}

document.getElementById("clearAll")?.addEventListener("click", () => {
  localStorage.removeItem("eldt_completions");
  renderRows([]);
});

(async () => {
  const rows = await fetchCompletions();
  renderRows(rows);
})();
