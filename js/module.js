// module.js — anti-skip + fixed logging + button visibility

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// ✅ Your YouTube video IDs (no "embed" or full URLs needed here)
const videoLinks = {
  1: "-deVMu0kyik",
  2: "qZkkgkMLsvI",
  3: "5C_0X6G4ytI"
};

// ✅ Module titles for display and logging
const titles = {
  1: "Vehicle Inspection",
  2: "Basic Control Skills",
  3: "On-Road Driving"
};

// Hide the button until video ends
const completeBtn = document.getElementById("completeBtn");
if (completeBtn) completeBtn.style.display = "none";

// Load the YouTube video player dynamically
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

// When video ends → show button
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    if (completeBtn) completeBtn.style.display = "block";
    alert("Video complete! You can now mark this module as finished.");
  }
}

// ✅ Your Google Apps Script Web App URL
const scriptURL = "https://script.google.com/macros/s/AKfycbz4fAjnjqfybEBRVnFhQcnAnlOfyRUlYP5f34yZMUjaaSsBwRzPmaK6tfWFsB4kha-6/exec";

// ✅ Send log to Google Sheet
function completeModule() {
  const studentId = localStorage.getItem("studentId") || "Unknown";
  const moduleName = titles[id] || "Unknown Module";

  const payload = {
    studentId: studentId,
    module: moduleName,
    status: "Completed",
    score: ""
  };

  // Send data to your sheet via Apps Script
  fetch(scriptURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    mode: "no-cors"
  })
    .then(() => {
      alert("Module logged to training record!");
      window.location.href = "dashboard.html";
    })
    .catch((err) => {
      console.error("Logging failed:", err);
      alert("Something went wrong while logging progress.");
    });
}

// Expose functions globally
window.completeModule = completeModule;
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
