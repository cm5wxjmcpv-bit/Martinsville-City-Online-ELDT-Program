// module.js — 2025-10-13 final build
// strict end-protection + fade-to-black + attention checker + logging

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

// --- Display title ---
const titleElement = document.getElementById("moduleTitle");
if (titleElement) titleElement.innerText = titles[id] || "Training Module";

// --- Hide button initially ---
const completeBtn = document.getElementById("completeBtn");
if (completeBtn) completeBtn.style.display = "none";

// --- Google Sheets endpoint ---
const scriptURL =
  "https://script.google.com/macros/s/AKfycbzTygqxIMidgXjitFwwtn6QPxT1Vm8MJ_8zJ182oGvDBxC0_MipCOlCp4jalVmFILm9nA/exec";

let player;
let maxWatched = 0;
let attentionTimeout = null;
let nextAttentionCheck = null;
let attentionActive = false;
let fadedOut = false;

// ✅ create YouTube player
function onYouTubeIframeAPIReady() {
  const videoId = videoLinks[id] || videoLinks[1];
  player = new YT.Player("player", {
    height: "360",
    width: "640",
    videoId: videoId,
    playerVars: {
      controls: 1,
      disablekb: 0,
      rel: 0
    },
    events: { onReady: onPlayerReady, onStateChange: onPlayerStateChange }
  });
}

// ✅ playback tracking + strict anti-skip
function onPlayerReady() {
  setInterval(() => {
    if (!player || !player.getCurrentTime || player.getPlayerState() !== YT.PlayerState.PLAYING) return;

    const current = player.getCurrentTime();
    const duration = player.getDuration();
    const delta = current - maxWatched;

    // record progress
    if (current > maxWatched) maxWatched = current;

    // --- strict skip protection ---
    const nearEnd = duration - current < 5;        // last 5 s
    const watchedEnough = maxWatched > duration - 5;
    const jumped = delta > 6 || current > maxWatched + 6;

    // block jump into un-watched zone or end
    if ((jumped && !watchedEnough) || (current >= duration - 2 && !watchedEnough)) {
      console.log("⏪ Skip detected → reverting to", maxWatched.toFixed(2));
      player.seekTo(maxWatched, true);
      return;
    }

    // --- fade-to-black 3 s before end ---
    if (!fadedOut && duration - current <= 3) {
      fadedOut = true;
      fadeOutVideo();
    }
  }, 1000);

  scheduleNextAttentionCheck();
}

// ✅ random attention check
function scheduleNextAttentionCheck() {
  const interval = Math.floor(Math.random() * (300 - 120 + 1)) + 120;
  nextAttentionCheck = setTimeout(triggerAttentionCheck, interval * 1000);
  console.log(`🕒 Next attention check in ${(interval / 60).toFixed(1)} minutes`);
}

// ✅ pause + popup
function triggerAttentionCheck() {
  if (!player) return;
  attentionActive = true;
  player.pauseVideo();

  const overlay = document.createElement("div");
  overlay.id = "attentionOverlay";
  Object.assign(overlay.style, {
    position: "fixed",
    top: "0", left: "0", width: "100%", height: "100%",
    background: "rgba(0,0,0,0.8)", display: "flex",
    flexDirection: "column", justifyContent: "center",
    alignItems: "center", zIndex: "9999", color: "white"
  });
  overlay.innerHTML = `
    <div class="bg-gray-800 p-6 rounded-lg text-center shadow-lg max-w-sm">
      <h2 class="text-lg font-bold mb-4">Attention Check</h2>
      <p class="mb-4">Please confirm you're still watching.</p>
      <button id="continueBtn" class="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700">
        Continue
      </button>
      <p class="mt-2 text-sm text-gray-400">(You have 60 seconds to respond)</p>
    </div>`;
  document.body.appendChild(overlay);

  attentionTimeout = setTimeout(() => {
    alert("⚠️ No response. Restarting module.");
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

// ✅ fade-to-black layer
function fadeOutVideo() {
  const playerDiv = document.getElementById("player");
  const fadeOverlay = document.createElement("div");
  Object.assign(fadeOverlay.style, {
    position: "absolute",
    top: "0", left: "0",
    width: "100%", height: "100%",
    background: "black",
    opacity: "0",
    transition: "opacity 1.5s ease",
    zIndex: "999"
  });
  playerDiv.appendChild(fadeOverlay);
  setTimeout(() => { fadeOverlay.style.opacity = "1"; }, 200);
}

// ✅ when video truly ends
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED && !attentionActive) {
    clearTimeout(nextAttentionCheck);
    completeBtn.style.display = "inline-block";
    alert("✅ Video complete! You can now mark this module as finished.");
  }
}

// ✅ log completion
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

window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
window.completeModule = completeModule;
