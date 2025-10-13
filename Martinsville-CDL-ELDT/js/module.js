const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const titles = {
  1: "Vehicle Inspection",
  2: "Basic Control Skills",
  3: "On-Road Driving"
};

document.getElementById("moduleTitle").innerText = titles[id] || "Training Module";

// Placeholder YouTube video (replace with your real video IDs)
const placeholder = "https://www.youtube.com/embed/dQw4w9WgXcQ";
document.getElementById("videoPlayer").src = placeholder;

function completeModule() {
  alert("Module marked complete (this will log to Google Sheets later).");
  window.location.href = "dashboard.html";
}
window.completeModule = completeModule;