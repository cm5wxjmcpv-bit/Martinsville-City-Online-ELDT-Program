// auth.js — simple local login
function login() {
  const student = (document.getElementById("studentId")?.value || "").trim();
  const err = document.getElementById("error");

  if (!student) {
    if (err) { err.textContent = "Enter your name or student ID."; err.classList.remove("hidden"); }
    else alert("Enter your name or student ID.");
    return;
  }

  localStorage.setItem("studentName", student);
  window.location.href = "dashboard.html";
}
