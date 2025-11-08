// ============================================
// module.js — no-skip player + Sheet logging
// ============================================

// --- Configure your Apps Script Web App URL here ---
const scriptURL = "https://script.google.com/macros/s/PASTE_YOUR_EXEC_URL_HERE/exec";

// --- Get URL/module + student name (from login) ---
const params    = new URLSearchParams(window.location.search);
const moduleId  = params.get("id") || "Unknown Module";
const student   = (localStorage.getItem("studentName") || "").trim() || "Unknown Student";

let player;
let videoDuration = 0;
let hasCompleted  = false;

// YouTube IFrame API callback (script is already loaded in module.html)
function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    videoId: moduleId,
    playerVars: {
      rel: 0,
      modestbranding: 1,
      controls: 0,
      disablekb: 1,
      fs: 0
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
}

function onPlayerReady() {
  document.getElementById("moduleTitle").textContent = `Module`;
  document.getElementById("status").innerText = "Press ▶ Play to begin.";
  videoDuration = player.getDuration();

  document.getElementById("customPlay").style.display = "flex";
  document.getElementById("clickBlocker").style.display = "block";
}

// Start playing from custom overlay button
window.startModuleVideo = function () {
  document.getElementById("customPlay").style.display = "none";
  document.getElementById("status").innerText = "Playing...";
  player.playVideo();
};

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    monitorForFade();
  }
  if (event.data === YT.PlayerState.ENDED && !hasCompleted) {
    markAsComplete();
  }
}

// Fade to black ~5 seconds before end
function monitorForFade() {
  const fadeOverlay = document.getElementById("fadeOverlay");
  const timer = setInterval(() => {
    if (!player || typeof player.getCurrentTime !== "function") return;
    const t = player.getCurrentTime();
    if (videoDuration - t <= 5) fadeOverlay.style.opacity = "1";
    if (t >= videoDuration - 0.5) clearInterval(timer);
  }, 500);
}

async function markAsComplete() {
  hasCompleted = true;

  const btn    = document.getElementById("markComplete");
  const status = document.getElementById("status");
  btn.disabled = true;
  btn.innerText = "Completed ✅";
  status.innerHTML = "✅ <span class='text-green-600 font-semibold'>Marked Complete</span>";

  // POST to Apps Script
  try {
    const res = await fetch(scriptURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student: student,
        module: moduleId
      })
    });
    // Optional: you can check res.ok, but Apps Script often returns 200 with JSON.
    // const data = await res.json();
  } catch (err) {
    console.error("Sheet log error:", err);
  }
}

// Fallback manual button (kept disabled until end, but in case you enable it)
document.getElementById("markComplete").addEventListener("click", () => {
  if (!hasCompleted) markAsComplete();
});

// Helpful warning
if (!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(scriptURL)) {
  console.warn("⚠️ Replace scriptURL with your real Apps Script Web App URL.");
}
