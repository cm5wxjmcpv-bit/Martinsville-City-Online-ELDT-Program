// module.js — Polished version with end fade + strict skip prevention

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// --- YouTube Video IDs ---
const videoLinks = {
  1: "z5riddRK2fY",
  2: "z5riddRK2fY",
  3: "z5riddRK2fY"
};

// --- Module Titles ---
const titles = {
  1: "Vehicle Inspection",
  2: "Basic Control Skills",
  3: "On-Road Driving"
};

// --- Display correct title ---
const titleElement = document.getElementById("moduleTitle");
if (titleElement) titleElement.innerText = titles[id] || "Training Module";

// --- Hide 'Mark Complete' initially ---
const completeBtn = document.getElementById("completeBtn");
if (completeBtn) completeBtn.style.display = "none";

// --- Google Sheets logging endpoint ---
const scriptURL =
  "https://script.google.com/macros/s/AKfycbzTygqxIMidgXjitFwwtn6QPxT1Vm8MJ_8zJ182oGvDBxC0_MipCOlCp4jalVmFILm9nA/exec";

let player;
let maxWatched = 0;
let attentionTimeout = null;
let nextAttentionCheck = null;
let attentionActive = false;
let fadedOut = false;

// ✅ Create YouTube player
function onYouTubeIframeAPIReady() {
  const videoId = videoLinks[id] || videoLinks[1];
  player = new YT.Player("player", {
    height: "360",
    width: "640",
    videoId: videoId,
    playerVars: {
      controls: 1,
      disablekb: 0,
      rel: 0 // hides related videos
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
}

// ✅ Track playback & anti-skip
function onPlayerReady() {
  setInterval(() => {
    if (!player || !player.getCurrentTime || player.getPlayerState() !== YT.PlayerState.PLAYING) return;

    const current = player.getCurrentTime();
    const duration = player.getDuration();
    const delta = current - maxWatched;

    // Anti-skip: stop jumps >6s or if user tries to move near the very end (last 5%)
    if (delta > 6 || current > duration * 0.95) {
      console.log("⏪ Skip detected — returning to", maxWatched.toFixed(2));
      player.seekTo(maxWatched, true);
      return;
    }

    // Normal progress
    if (current > maxWatched) {
      maxWatched = current;
    }

    // ✅ Fade to black 3 seconds before end to hide YouTube suggestions
    if (!fadedOut && duration - current <= 3) {
      fadedOut = true;
      fadeOutVideo();
    }
  }, 1000);

  scheduleNextAttentionCheck();
}

// ✅ Random attention check every 2–5 minutes
function scheduleNextAttentionCheck() {
  const interval = Math.floor(Math.random() * (300 - 120 + 1)) + 120;
  nextAttentionCheck = setTimeout(triggerAttentionCheck, interval * 1000);
  console.log(`🕒 Next attention check in ${(interval / 60).toFixed(1)} minutes`);
}

// ✅ Pause + confirm popup
function triggerAttentionCheck() {
  if (!player) return;

  attentionActive = true;
  player.pauseVideo();

  const overlay = document.createElement("div");
  overlay.id = "attentionOverlay";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.background = "rgba(0,0,0,0.8)";
  overlay.style.display = "flex";
  overlay.style.flexDirection = "column";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.zIndex = "9999";
  overlay.style.color = "white";
  overlay.innerHTML = `
    <div class="bg-gray-800 p-6 rounded-lg text-center shadow-lg max-w-sm">
      <h2 class="text-lg font-bold mb-4">Attention Check</h2>
      <p class="mb-4">Please confirm you're still watching.</p>
      <button id="continueBtn" class="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700">
        Continue
      </button>
      <p class="mt-2 text-sm text-gray-400">(You have 60 seconds to respond)</p>
    </div>
  `;
  document.body.appendChild(overlay);

  // Timeout to restart if no response
  attentionTimeout = setTimeout(() => {
    alert("⚠️ You did not respond in time. The module will restart.");
    location.reload();
  }, 60000);

  document.getElementById("continueBtn").addEventListener("click", () => {
    clearTimeout(attentionTimeout);
    document.body.removeChild(overlay);
    attentionActive = false;
    player.playVideo();
    scheduleNextAttentionCheck();
  });
}

// ✅ Fade video to black near end
function fadeOutVideo() {
  const playerDiv = document.getElementById("player");
  const fadeOverlay = document.createElement("div");
  fadeOverlay.style.position = "absolute";
  fadeOverlay.style.top = "0";
  fadeOverlay.style.left = "0";
  fadeOverlay.style.width = "100%";
  fadeOverlay.style.height = "100%";
  fadeOverlay.style.background = "black";
  fadeOverlay.style.opacity = "0";
  fadeOverlay.style.transition = "opacity 1.5s ease";
  fadeOverlay.style.zIndex = "999";
  playerDiv.appendChild(fadeOverlay);

  setTimeout(() => {
    fadeOverlay.style.opacity = "1"; // fade to black
  }, 500);
}

// ✅ When video finishes
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED && !attentionActive) {
    clearTimeout(nextAttentionCheck);
    completeBtn.style.display = "inline-block";
    alert("✅ Video complete! You can now mark this module as finished.");
  }
}

// ✅ Log to Google Sheets
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
      console.error("Logging failed:", err);
      alert("⚠️ Something went wrong while logging progress.");
    });
}

// --- Make functions global ---
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
window.completeModule = completeModule;
