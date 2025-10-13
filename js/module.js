// module.js — universal anti-skip + smoother playback + logging

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// YouTube IDs for all modules
const videoLinks = {
  1: "-deVMu0kyik",
  2: "qZkkgkMLsvI",
  3: "5C_0X6G4ytI"
};

// Titles for logging and UI
const titles = {
  1: "Vehicle Inspection",
  2: "Basic Control Skills",
  3: "On-Road Driving"
};

// Display correct title
const titleElement = document.getElementById("moduleTitle");
if (titleElement) titleElement.innerText = titles[id] || "Training Module";

// Hide completion button initially
const completeBtn = document.getElementById("completeBtn");
if (completeBtn) completeBtn.style.display = "none";

// Google Sheet Logger URL
const scriptURL =
  "https://script.google.com/macros/s/AKfycbzTygqxIMidgXjitFwwtn6QPxT1Vm8MJ_8zJ182oGvDBxC0_MipCOlCp4jalVmFILm9nA/exec";

let player;
let maxWatched = 0;
let lastCheckedTime = 0;

// ✅ Create the player when API is ready
function onYouTubeIframeAPIReady() {
  const videoId = videoLinks[id] || videoLinks[1];
  player = new YT.Player("player", {
    videoId,
    height: "360",
    width: "640",
    playerVars: { controls: 1, disablekb: 0 },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
}

// ✅ Start tracking watch time smoothly
function onPlayerReady() {
  setInterval(() => {
    if (!player || !player.getCurrentTime) return;
    const current = player.getCurrentTime();

    // Allow a small 3-second drift tolerance to prevent jump-backs from buffering
    if (current > maxWatched + 3) {
      // Only trigger if they jumped forward more than 3 seconds
      console.log("⏪ Jump detected, returning to", maxWatched.toFixed(2));
      player.seekTo(maxWatched, true);
    } else if (current > maxWatched) {
      // Normal watching, update progress
      maxWatched = current;
    }

    lastCheckedTime = current;
  }, 1000);
}

// ✅ Show button only after full completion
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    completeBtn.style.display = "inline-block";
    alert("✅ Video complete! You can now mark this module as finished.");
  }
}

// ✅ Log completion to Google Sheet
function completeModule() {
  const studentId = localStorage.getItem("studentId") || "Unknown";
  const moduleName = titles[id] || "Unknown Module";

  const payload = {
    studentId,
    module: moduleName,
    status: "Completed",
    score: ""
  };

  fetch(scriptURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    mode: "no-cors"
  })
    .then(() => {
      alert("✅ Module logged to training record!");
      window.location.href = "dashboard.html";
    })
    .catch((err) => {
      console.error("Logging failed:", err);
      alert("⚠️ Something went wrong while logging progress.");
    });
}

window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
window.completeModule = completeModule;
