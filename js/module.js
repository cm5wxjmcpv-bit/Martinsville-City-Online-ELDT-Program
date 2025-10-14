// module.js — Anti-skip + Attention Checker + Logging (Stable 2025-10-13)

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// --- YouTube Video IDs ---
// ✅ Use only the ID part (the characters after "v=" or after the last "/")
const videoLinks = {
  1: "z5riddRK2fY", // Vehicle Inspection
  2: "z5riddRK2fY", // Basic Control Skills
  3: "z5riddRK2fY"  // On-Road Driving
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

// ✅ Create YouTube player
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

// ✅ Track watch progress + anti-skip
function onPlayerReady() {
  // Anti-skip every second
  setInterval(() => {
    if (!player || !player.getCurrentTime || player.getPlayerState() !== YT.PlayerState.PLAYING) return;

    const current = player.getCurrentTime();
    const delta = current - maxWatched;

    // Only block large jumps (skip ahead > 6s)
    if (delta > 6 && current < player.getDuration() - 10) {
      console.log("⏪ Skip detected — returning to", maxWatched.toFixed(2));
      player.seekTo(maxWatched, true);
    } else if (current > maxWatched) {
      maxWatched = current;
    }
  }, 1000);

  // Start attention checker
  scheduleNextAttentionCheck();
}

// ✅ Random attention check every 2–5 minutes
function scheduleNextAttentionCheck() {
  const interval = Math.floor(Math.random() * (300 - 120 + 1)) + 120; // seconds
  nextAttentionCheck = setTimeout(triggerAttentionCheck, interval * 1000);
  console.log(`🕒 Next attention check in ${(interval / 60).toFixed(1)} minutes`);
}

// ✅ Pause + prompt for attention confirmation
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

  // Timer — if no response in 60s, reset page
  attentionTimeout = setTimeout(() => {
    alert("⚠️ You did not respond in time. The module will restart.");
    location.reload();
  }, 60000);

  document.getElementById("continueBtn").addEventListener("click", () => {
    clearTimeout(attentionTimeout);
    document.body.removeChild(overlay);
    attentionActive = false;
    player.playVideo();
    scheduleNextAttentionCheck(); // schedule next one
  });
}

// ✅ Detect when the video ends
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED && !attentionActive) {
    clearTimeout(nextAttentionCheck);
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

// --- Make functions global ---
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
window.completeModule = completeModule;
