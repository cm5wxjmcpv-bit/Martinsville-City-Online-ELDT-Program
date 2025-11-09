// js/auth.js — login + session guard
const PORTAL_PASSWORD = "CDL2025!";
const SESSION_KEY = "mfd_auth_ok";
const STUDENT_KEY = "studentName";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const btn  = document.getElementById("loginBtn");
  if (form) form.addEventListener("submit", (e) => { e.preventDefault(); login(); });
  if (btn)  btn.addEventListener("click", (e) => { e.preventDefault(); login(); });
});

function login() {
  const student = (document.getElementById("studentId")?.value || "").trim();
  const password = (document.getElementById("password")?.value || "").trim();
  if (!student) return showErr("Enter your name or student ID.");
  if (!password) return showErr("Enter the portal password.");
  if (password !== PORTAL_PASSWORD) return showErr("Invalid password.");
  localStorage.setItem(STUDENT_KEY, student);
  localStorage.setItem(SESSION_KEY, "yes");
  window.location.href = "dashboard.html";
}
function showErr(msg) {
  const err = document.getElementById("error");
  if (err) { err.textContent = msg; err.classList.remove("hidden"); err.setAttribute("role","alert"); }
  else alert(msg);
}
function requireLogin() {
  if (localStorage.getItem(SESSION_KEY) !== "yes") {
    window.location.replace("index.html");
  }
}
function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.replace("index.html");
}
window.requireLogin = requireLogin;
window.logout = logout;
