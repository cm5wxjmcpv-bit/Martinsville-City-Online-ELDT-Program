// module.js — Final version (anti-skip + working logger)

// Get the module ID from the URL (?id=1)
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// YouTube video IDs (not full links)
const videoLinks = {
  1: "-deVMu0kyik",
  2: "qZkkgkMLsvI",
  3: "5C_0X6G4ytI"
};

// Titles for display + logging
const titles = {
  1: "Vehicle Inspection",
  2: "Basic Control Skills",
  3: "On-Road Driving"
};

// Reference the Mark Complete button and hide it initially
const completeBtn = document.getElementById("completeBtn");
if (completeBtn) completeBtn.style.display = "none";

// ✅ Correct Google Apps Script Web App endpoint
const scriptURL =
  "https://script.google.com/macros/s/AKfycbzTygqxIMidgXjitFwwtn6QPxT1Vm8MJ_8zJ182oGvDBxC0_MipCOlCp4jalVmFILm9nA/exec";

let player;

// --- YouTube Player Setup ---
function onYouTubeIframeAPIReady() {
  const videoId = videoLinks[id] || videoLinks[1];
  player = new YT.Player("player", {
    videoId: videoId,
    events: {
      onStateChange: onPlayerStateChange
    }
  });
}

// --- Detect when the video finishes ---
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    if (completeBtn) completeBtn.style.display = "inline-block";
    alert("✅ Video complete! You can now mark this module as finished.");
  }
}

// --- Send completion record to Google Sheet ---
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

// --- Make functions global ---
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
window.completeModule = completeModule;
