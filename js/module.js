// ============================================
// module.js — Clean version with no-skip video,
// fade-to-black, and green check confirmation.
// ============================================

// === Extract parameters from URL ===
const params = new URLSearchParams(window.location.search);
const moduleId = params.get("id") || "Unknown Module";
const student = localStorage.getItem("studentName") || "Unknown Student";
const scriptURL = "https://script.google.com/macros/s/AKfycbzT_DwYALs_PRoAQmAdk2z2bKXP9NY3l9_3vYodDODGagEE7l5ISEy9zRmQfGtCLkRrjQ/exec"; // <-- Replace with your deployed Apps Script URL

let player;
let videoDuration = 0;
let hasCompleted = false;

// === Initialize YouTube Player ===
function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    videoId: moduleId,
    playerVars: {
      rel: 0,
      modestbranding: 1,
      controls: 0,
      disablekb: 1,
      fs: 0,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
}

// === On Player Ready ===
function onPlayerReady(event) {
  document.getElementById("status").innerText = "Press ▶ Play to begin.";
  videoDuration = player.getDuration();
  document.getElementById("customPlay").style.display = "flex";
  document.getElementById("clickBlocker").style.display = "block";
}

// === Custom Play Button Logic ===
window.startModuleVideo = function () {
  document.getElementById("customPlay").style.display = "none";
  document.getElementById("status").innerText = "Playing...";
  player.playVideo();
};

// === Handle Player State Changes ===
function onPlayerStateChange(event) {
  // When video starts
  if (event.data === YT.PlayerState.PLAYING) {
    monitorVideoProgress();
  }

  // When video ends
  if (event.data === YT.PlayerState.ENDED && !hasCompleted) {
    markAsComplete();
  }
}

// === Monitor Video Progress for Fade-to-Black ===
function monitorVideoProgress() {
  const fadeOverlay = document.getElementById("fadeOverlay");

  const check = setInterval(() => {
    if (!player || typeof player.getCurrentTime !== "function") return;

    const currentTime = player.getCurrentTime();

    // Fade to black 5 seconds before the end
    if (videoDuration - currentTime <= 5) {
      fadeOverlay.style.opacity = "1";
    }

    // Stop checking when video ends
    if (currentTime >= videoDuration - 0.5) {
      clearInterval(check);
    }
  }, 500);
}

// === Log Completion to Google Sheets ===
function markAsComplete() {
  hasCompleted = true;
  const markButton = document.getElementById("markComplete");
  const status = document.getElementById("status");

  markButton.disabled = true;
  markButton.innerText = "Completed ✅";
  status.innerHTML =
    "✅ <span class='text-green-600 font-semibold'>Marked Complete</span>";

  // Build payload
  const data = {
    student: student,
    module: moduleId,
    timestamp: new Date().toLocaleString(),
  };

  // Send to Google Apps Script
  fetch(scriptURL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  console.log("Completion logged:", data);
}

// === Allow manual "Mark Complete" (fallback) ===
document.getElementById("markComplete").addEventListener("click", () => {
  if (!hasCompleted) markAsComplete();
});

// === Debug message if scriptURL missing ===
if (scriptURL === "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE") {
  console.warn("⚠️ Remember to replace scriptURL with your real Apps Script URL.");
}
