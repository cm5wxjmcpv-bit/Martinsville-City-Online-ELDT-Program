document.addEventListener("DOMContentLoaded", () => {
  const body = document.getElementById("adminBody");
  const clearBtn = document.getElementById("clearAll");
  const rows = JSON.parse(localStorage.getItem("mfd_completions") || "[]");

  body.innerHTML = "";
  if (rows.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="4" class="muted">No local completion data.</td>`;
    body.appendChild(tr);
  } else {
    rows
      .sort((a,b)=> (b.completedAt||"").localeCompare(a.completedAt||""))
      .forEach(r => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${r.student || "-"}</td>
          <td>${r.title || "-"}</td>
          <td>${r.videoId || "-"}</td>
          <td>${r.completedAt ? new Date(r.completedAt).toLocaleString() : "-"}</td>
        `;
        body.appendChild(tr);
      });
  }

  clearBtn.addEventListener("click", () => {
    if (confirm("This clears local completion data stored in this browser only. Continue?")) {
      localStorage.removeItem("mfd_completions");
      location.reload();
    }
  });
});
