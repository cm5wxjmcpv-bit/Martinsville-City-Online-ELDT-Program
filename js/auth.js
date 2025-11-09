// auth.js
function login() {
  const student = (document.getElementById("studentId")?.value || "").trim();
  if (!student) { alert("Enter name"); return; }
  localStorage.setItem("studentName", student);
  window.location.href = "dashboard.html";
}
