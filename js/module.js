// module.js - with anti-skip enabled

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// Map module IDs to YouTube embed links
const videoLinks = {
  1: "-deVMu0kyik",
  2: "qZkkgkMLsvI",
  3: "5C_0X6G4ytI"
};

// Titles for logging and display
const titles = {
  1: "Vehicle Inspection",
  2: "Basic Control Skills",
  3: "On-Road Driving"
};

// Hide the "Mark Complete" button initially
const completeBtn = document.querySelector(".btn");
completeBtn.style.display = "none";

// Create YouTube player when API is ready
let player;
function onYouTubeIframeAPIReady() {
  const videoId = videoLinks[id] || videoLinks[1];
  player = new YT.Player("player", {
    videoId: videoId,
    events: {
      onStateChange: onPlayerStateChange
    }
  });
}

// Detect when video ends
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    completeBtn.style.display = "block";
    alert("Video complete! You can now mark this module as finished.");
  }
}

// Your Google Apps Script Web App URL
const scriptURL =
  "https://script.google.com/macros/s/AKfycbz4fAjnjqfybEBRVnFhQcnAnlOfyRUlYP5f34yZMUjaaSsBwRzPmaK6tfWFsB4kha-6/exec";

// Log completion to Google Sheets
function completeModule() {
  const studentId = localStorage.getItem("studentId") || "Unknown";
  const moduleName = titles[id] || "Unknown Module";

  const payload = {
    studentId: studentId,
    module: moduleName,
    status: "Completed",
    score: ""
  };

  fetch(scriptURL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  alert("Module logged to training record!");
  window.location.href = "dashboard.html";
}

window.completeModule = completeModule;
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
