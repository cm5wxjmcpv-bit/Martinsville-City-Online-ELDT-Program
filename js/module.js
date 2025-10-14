// module.js — Anti-skip + Attention Checker + Logging

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// --- Video List ---
const videoLinks = {
  1: "https://youtu.be/z5riddRK2fY",
  2: "https://youtu.be/z5riddRK2fY",
  3: "5C_0X6G4ytI"
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

const completeBtn = document.getElementById("completeBtn");
if (completeBtn) completeBtn.style.display = "none";

const scriptURL =
  "https://script.google.com/macros/s/AKfycbzTygqxIMidgXjitFwwtn6QPxT1Vm8MJ_8zJ182oGvDBxC0_MipCOlCp4jalVmFILm9nA/exec";

let player;
let maxWatched = 0;
let attentionTimeout = null;
let nextAttentionCheck = null;
let attentionActive = false;

// ✅ Create player
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

// ✅ Start tracking playback
function onPlayerReady() {
  // Start anti-skip check
  setInterval(() => {
    if (!player || !player.getCurrentTime || player.getPlayerState() !== YT.PlayerState.PLAYING) return;

    const current = player.getCurrentTime();
    const delta = current - maxWatched;

    if (delta > 6 && current < player.getDuration() - 10) {
      console.log("⏪ Skip detected, reverting to", maxWatched.toFixed(2));
      player.seekTo(maxWatched, true);
    } else if (current > maxWatched) {
      maxWatched = current;
    }
  }, 1000);

  // Start attention check loop
  scheduleNextAttentionCheck();
}

// ✅ Schedule a random attention check between 2–5 minutes
function scheduleNextAttentionCheck() {
  const interval = Math.floor(Math.random() * (300 - 120 + 1)) + 120; // seconds
  nextAttentionCheck = setTimeout(triggerAttentionCheck, interval * 1000);
  console.log(`🕒 Next attention check in ${interval / 60} minutes`);
}

// ✅ Trigger attention check popup
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
    <div class="bg-gray-800 p-6 rounded-lg text-center shadow-lg">
      <h2 class="text-lg font-bold mb-4">Attention Check</h2>
      <p class="mb-4">Please confirm you're still watching.</p>
      <button id="continueBtn" class="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700">Continue</button>
      <p class="mt-2 text-sm text-gray-400">(You have 60 seconds to respond)</p>
    </div>
  `;
  document.body.appendChild(overlay);

  // Timer — if no response in 60s, reset module
  attentionTimeout = setTimeout(() => {
    alert("⚠️ You did not respond in time. The module will restart.");
    location.reload();
  }, 60000);

  document.getElementById("continueBtn").addEventListener("click", () => {
    clearTimeout(attentionTimeout);
    document.body.removeChild(overlay);
    attentionActive = false;
    player.playVideo();
    scheduleNextAttentionCheck(); // reschedule next random check
  });
}

// ✅ Detect when video ends
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED && !attentionActive) {
    clearTimeout(nextAttentionCheck);
    completeBtn.style.display = "inline-block";
    alert("✅ Video complete! You can now mark this module as finished.");
  }
}

// ✅ Log completion
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
