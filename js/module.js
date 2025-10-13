// module.js — robust URL/ID handling + anti-skip + logging

// --- Read module id from URL ---
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// --- Put exactly what you have here (URLs OR IDs are fine) ---
const videoSources = {
  1: "https://www.youtube.com/embed/-deVMu0kyik?feature=share",
  2: "https://www.youtube.com/embed/qZkkgkMLsvI?feature=share",
  3: "https://www.youtube.com/embed/5C_0X6G4ytI?feature=share"
};

// Titles used for display & logging
const titles = {
  1: "Vehicle Inspection",
  2: "Basic Control Skills",
  3: "On-Road Driving"
};

// --- Extract a YouTube video ID from ANY common form ---
function extractVideoId(input) {
  if (!input) return null;

  // If it already looks like a clean 11-char ID (can include - and _), return it
  if (/^[A-Za-z0-9_-]{11}$/.test(input)) return input;

  // Try to pull ID from typical URL formats:
  // - https://www.youtube.com/watch?v=VIDEOID
  // - https://youtube.com/shorts/VIDEOID
  // - https://www.youtube.com/embed/VIDEOID
  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/,            // watch?v=VIDEOID
    /\/shorts\/([A-Za-z0-9_-]{11})/,        // /shorts/VIDEOID
    /\/embed\/([A-Za-z0-9_-]{11})/          // /embed/VIDEOID
  ];

  for (const re of patterns) {
    const m = input.match(re);
    if (m && m[1]) return m[1];
  }

  // Nothing matched
  return null;
}

// Resolve the module's configured value into a clean videoId
const configured = videoSources[id] || videoSources[1];
const videoId = extractVideoId(configured);

// Show title in the page
document.getElementById("moduleTitle").innerText = titles[id] || "Training Module";

// Button starts hidden
const completeBtn = document.getElementById("completeBtn");
if (completeBtn) completeBtn.style.display = "none";

// ✅ Your Google Apps Script endpoint (corrected)
const scriptURL =
  "https://script.google.com/macros/s/AKfycbzTygqxIMidgXjitFwwtn6QPxT1Vm8MJ_8zJ182oGvDBxC0_MipCOlCp4jalVmFILm9nA/exec";

// Debug logs to help verify on your end (View → Developer → Console)
console.log("[ELDT] Module id:", id);
console.log("[ELDT] Configured source:", configured);
console.log("[ELDT] Extracted videoId:", videoId);

// --- Build the YouTube player via IFrame API ---
let player;

function onYouTubeIframeAPIReady() {
  if (!videoId) {
    alert("Could not determine a valid YouTube video for this module.");
    return;
  }

  player = new YT.Player("player", {
    height: "360",
    width: "640",
    videoId: videoId,
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
}

function onPlayerReady(e) {
  // optional: autoplay (comment out if you don't want this)
  // e.target.playVideo();
}

function onPlayerStateChange(e) {
  if (e.data === YT.PlayerState.ENDED) {
    if (completeBtn) completeBtn.style.display = "inline-block";
    alert("✅ Video complete! You can now mark this module as finished.");
  }
}

// --- Log completion to Google Sheets ---
function completeModule() {
  const studentId = localStorage.getItem("studentId") || "Unknown";
  const moduleName = titles[id] || "Unknown Module";
  const payload = { studentId, module: moduleName, status: "Completed", score: "" };

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
      console.error("[ELDT] Logging failed:", err);
      alert("⚠️ Something went wrong while logging progress.");
    });
}

// Expose functions globally (required by YouTube API and button onclick)
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
window.completeModule = completeModule;
