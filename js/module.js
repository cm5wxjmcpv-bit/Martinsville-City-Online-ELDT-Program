// module.js — Stable version (smooth anti-skip, full logging, all modules)

// --- Get the module id from the URL ---
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// --- YouTube Video IDs ---
const videoLinks = {
  1: "-deVMu0kyik", // Vehicle Inspection
  2: "qZkkgkMLsvI", // Basic Control Skills
  3: "5C_0X6G4ytI"  // On-Road Driving
};

// --- Module Titles ---
const titles = {
  1: "Vehicle Inspection",
  2: "Basic Control Skills",
  3: "On-Road Driving"
};

// --- Display correct title on page ---
const titleElement = document.getElementById("moduleTitle");
if (titleElement) titleElement.innerText = titles[id] || "Training Module";

// --- Hide Mark Complete button initially ---
const completeBtn = document.getElementById("completeBtn");
if (completeBtn) completeBtn.style.display = "none";

// --- Google Sheets Logger URL ---
const scriptURL =
  "https://script.google.com/macros/s/AKfycbzTygqxIMidgXjitFwwtn6QPxT1Vm8MJ_8zJ182oGvDBxC0_MipCOlCp4jalVmFILm9nA/exec";

let player;
let maxWatched = 0;

// ✅ Called when the YouTube API is ready
function onYouTubeIframeAPIReady() {
  const videoId = videoLinks[id] || videoLinks[1];
  player = new YT.Player("player", {
    height: "360",
    width: "640",
    videoId: videoId,
    playerVars: { controls: 1, disablekb: 0 },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
}

// ✅ Start tracking watch time with better smoothing
function onPlayerReady() {
  setInterval(() => {
    if (!player || !player.getCurrentTime || player.getPlayerState() !== YT.PlayerState.PLAYING) return;

    const current = player.getCurrentTime();
    const delta = current - maxWatched;

    // Only block if they clearly skip ahead more than 6 seconds and not near end
    if (delta > 6 && current < player.getDuration() - 10) {
      console.log("⏪ Skip detected — reverting to", maxWatched.toFixed(2));
      player.seekTo(maxWatched, true);
    } else if (current > maxWatched) {
      // Normal progress
      maxWatched = current;
    }
  }, 1000);
}

// ✅ Detect when the video fully ends
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    completeBtn.style.display = "inline-block";
    alert("✅ Video complete! You can now mark this module as finished.");
  }
}

// ✅ Log completion to Google Sheets
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

// --- Make functions available globally ---
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
window.completeModule = completeModule;
