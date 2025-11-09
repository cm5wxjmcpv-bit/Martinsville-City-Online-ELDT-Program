// js/dashboard.js
const API_URL = "https://script.google.com/macros/s/AKfycbyZA8eMIPHUkaECP6rqRjApA8vWNypsdZofdEdxv-41yZxlHaCh-TFKvIlKdsFBkmOj/exec";

const student =
  localStorage.getItem("student") ||
  new URLSearchParams(location.search).get("student") ||
  "";

if (!student) {
  // bounce back to login if no student found
  location.replace("index.html");
}

// Define your modules here (id, title, and YouTube video id)
const MODULES = [
  { id: "intro",   title: "Introduction to CDL/ELDT", vid: "VIDEO_ID_1" },
  { id: "safety",  title: "Safety & Regulations",      vid: "VIDEO_ID_2" },
  { id: "vehicle", title: "Vehicle Basics",            vid: "VIDEO_ID_3" }
];

async function fetchCompleted() {
  try {
    const url = new URL(API_URL);
    url.searchParams.set("student", student);
    url.searchParams.set("action", "status");
    const res = await fetch(url.toString(), { method: "GET" });
    const data = await res.json();
    if (data?.ok && Array.isArray(data.completed)) {
      return new Set(data.completed);
    }
  } catch (_e) {}
  return new Set();
}

function moduleLink(m) {
  const u = new URL("module.html", location.href);
  u.searchParams.set("id", m.id);
  u.searchParams.set("vid", m.vid);
  return u.toString();
}

async function render() {
  const completed = await fetchCompleted();
  const wrap = document.getElementById("moduleList");
  wrap.innerHTML = "";

  MODULES.forEach(m => {
    const done = completed.has(m.id);
    const card = document.createElement("a");
    card.href = moduleLink(m);
    card.className = "block border rounded-lg p-4 hover:shadow";
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <div class="font-semibold">${m.title}</div>
          <div class="text-sm text-gray-600">Module ID: ${m.id}</div>
        </div>
        <div class="text-sm ${done ? 'text-green-700' : 'text-gray-500'}">
          ${done ? '✅ Completed' : '⏳ Not completed'}
        </div>
      </div>
    `;
    wrap.appendChild(card);
  });

  // Add Final Test tile
  const testA = document.createElement("a");
  testA.href = "test.html";
  testA.className = "block border rounded-lg p-4 hover:shadow";
  testA.innerHTML = `
    <div class="flex items-center justify-between">
      <div>
        <div class="font-semibold">Final ELDT Theory Quiz</div>
        <div class="text-sm text-gray-600">Must score ≥ 80%</div>
      </div>
      <div class="text-sm text-blue-700">Start ➜</div>
    </div>
  `;
  wrap.appendChild(testA);
}

render();
