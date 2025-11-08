// ============================================
// module.js — no-skip player + Sheet logging
// ============================================

// POST endpoint (writes a row when a module finishes)
const writeURL = "https://script.google.com/macros/s/AKfycbxu7ecj9gh-Y5vPOzbM1dR3wP4Ovc001Vxma55b40kcQIBI54GR8ZLMfVveet5FviYGsA/exec";

// Params & student
const params    = new URLSearchParams(location.search);
const moduleId  = params.get("id") || "Unknown Module";
const student   = (localStorage.getItem("studentName") || "").trim() || "Unknown Student";

let player;
let videoDuration = 0;
let hasCompleted  = false;

// YouTube IFrame API callback (loaded by module.html)
function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    videoId: moduleId,
    playerVars: { rel:0, modestbranding:1, controls:0, disablekb:1, fs:0 },
    events: { onReady:onPlayerReady, onStateChange:onPlayerStateChange }
  });
}

function onPlayerReady() {
  document.getElementById("moduleTitle").textContent = "Module";
  document.getElementById("status").innerText = "Press ▶ Play to begin.";
  videoDuration = player.getDuration();
  document.getElementById("customPlay").style.display = "flex";
  document.getElementById("clickBlocker").style.display = "block";
}

window.startModuleVideo = function () {
  document.getElementById("customPlay").style.display = "none";
  document.getElementById("status").innerText = "Playing...";
  player.playVideo();
};

function onPlayerStateChange(e) {
  if (e.data === YT.PlayerState.PLAYING) monitorForFade();
  if (e.data === YT.PlayerState.ENDED && !hasCompleted) markAsComplete();
}

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

  try {
    // FORM POST (no preflight/CORS issues)
    const body = new URLSearchParams({ student, module: moduleId });
    await fetch(writeURL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body
    });
  } catch (err) {
    console.error("Sheet log error:", err);
  }
}

document.getElementById("markComplete").addEventListener("click", () => {
  if (!hasCompleted) markAsComplete();
});
