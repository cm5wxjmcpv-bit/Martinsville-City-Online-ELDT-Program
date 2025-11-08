document.addEventListener("DOMContentLoaded", () => {
  const student = localStorage.getItem("mfd_student_name") || "Student";
  const label = document.getElementById("studentLabel");
  if (label) label.textContent = `Signed in as: ${student}`;
  const MODULES = [
    { id: "6DSvlh-zHu4", title: "Module 1 — Test Video" },
    { id: "6DSvlh-zHu4", title: "Module 2 — Test Video" },
    { id: "6DSvlh-zHu4", title: "Module 3 — Test Video" }
  ];
  const list = document.getElementById("moduleList");
  MODULES.forEach(m => {
    const card = document.createElement("div");
    card.className = "module-card";
    card.innerHTML = `<h3>${m.title}</h3>
      <div class="muted">Video ID: ${m.id}</div>
      <a class="btn" href="module.html?id=${encodeURIComponent(m.id)}&title=${encodeURIComponent(m.title)}">Start Module</a>`;
    list.appendChild(card);
  });
  const progressEl = document.getElementById("progressList");
  const completions = JSON.parse(localStorage.getItem("mfd_completions") || "[]");
  progressEl.innerHTML = "";
  if (completions.length === 0) {
    const li = document.createElement("li");
    li.className = "muted";
    li.textContent = "No modules completed yet.";
    progressEl.appendChild(li);
  } else {
    completions
      .sort((a,b) => (b.completedAt||"").localeCompare(a.completedAt||""))
      .forEach(c => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${c.title}</strong> — ${c.videoId} — <span class="muted">${new Date(c.completedAt).toLocaleString()}</span>`;
        progressEl.appendChild(li);
      });
  }
});