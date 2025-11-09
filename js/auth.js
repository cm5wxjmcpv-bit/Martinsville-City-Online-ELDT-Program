// Simple auth with required password
const PASSWORD = (window.LOCAL_PASSWORD || "ELDT2025"); // change this
const TOKEN_KEY = "eldt_token";
const STUDENT_KEY = "eldt_student";

// Optional: central Apps Script URL for logging auth or audit
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyZA8eMIPHUkaECP6rqRjApA8vWNypsdZofdEdxv-41yZxlHaCh-TFKvIlKdsFBkmOj/exec";

function login() {
  const student = document.getElementById('studentId')?.value?.trim();
  const pass = document.getElementById('password')?.value || "";
  const error = document.getElementById('error');

  if (!student || !pass) {
    if (error) { error.classList.remove('hidden'); error.textContent = "Student and password are required."; }
    return;
  }
  if (pass !== PASSWORD) {
    if (error) { error.classList.remove('hidden'); error.textContent = "Invalid password."; }
    return;
  }
  localStorage.setItem(TOKEN_KEY, "ok");
  localStorage.setItem(STUDENT_KEY, student);
  window.location.href = "dashboard.html";
}

function requireLogin() {
  const t = localStorage.getItem(TOKEN_KEY);
  if (!t) window.location.href = "index.html";
}

function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(STUDENT_KEY);
  window.location.href = "index.html";
}

document.getElementById('logoutLink')?.addEventListener('click', (e) => {
  e.preventDefault();
  logout();
});
