document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const nameInput = document.getElementById("studentName");
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    if (!name) return;
    localStorage.setItem("mfd_student_name", name);
    location.href = "dashboard.html";
  });
});