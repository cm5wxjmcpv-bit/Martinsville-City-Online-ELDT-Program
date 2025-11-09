// js/auth.js — site-wide login + session guard

// 🔐 Set your site password here
const PORTAL_PASSWORD = "CDL2025!";

// Storage keys
const SESSION_KEY = "mfd_auth_ok";
const STUDENT_KEY = "studentName";

// ---------- Login wiring ----------
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("loginBtn");
  if (btn) btn.addEventListener("click", login);

  const form = document.getElementById("loginForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      login();
    });
  }
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
  if (err) {
    err.textContent = msg;
    err.classList.remove("hidden");
    err.setAttribute("role", "alert");
  } else {
    alert(msg);
  }
}

// ---------- Session helpers ----------
function requireLogin() {
  if (localStorage.getItem(SESSION_KEY) !== "yes") {
    window.location.replace("index.html");
  }
}
function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.replace("index.html");
}

// Make sure globals exist even if bundlers change scope
window.login = login;
window.requireLogin = requireLogin;
window.logout = logout;
