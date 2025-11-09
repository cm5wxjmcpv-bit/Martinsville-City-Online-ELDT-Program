// js/auth.js
const API_URL = "https://script.google.com/macros/s/AKfycbyZA8eMIPHUkaECP6rqRjApA8vWNypsdZofdEdxv-41yZxlHaCh-TFKvIlKdsFBkmOj/exec";

function login() {
  const student = (document.getElementById("studentId").value || "").trim();
  const pwd = (document.getElementById("password").value || "").trim();

  if (!student) {
    const err = document.getElementById("error");
    if (err) { err.textContent = "Please enter your name/ID."; err.classList.remove("hidden"); }
    return;
  }

  // (optional) simple password check: leave blank to allow anyone
  // if (pwd !== "yourPassword") { ... }

  localStorage.setItem("student", student);
  localStorage.setItem("studentId", student);

  // go to dashboard with student in query too
  const url = new URL("dashboard.html", location.href);
  url.searchParams.set("student", student);
  location.assign(url.toString());
}
