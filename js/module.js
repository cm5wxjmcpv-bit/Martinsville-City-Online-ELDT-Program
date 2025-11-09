// ============================================
// module.js — no-skip + Sheet logging (robust)
// ============================================

const scriptURL = "https://script.google.com/macros/s/AKfycbyZA8eMIPHUkaECP6rqRjApA8vWNypsdZofdEdxv-41yZxlHaCh-TFKvIlKdsFBkmOj/exec";

const params      = new URLSearchParams(location.search);
const moduleId    = params.get("id") || "Unknown Module";
const moduleTitle = params.get("title") || "Module";
const student     = (localStorage.getItem("studentName") || "").trim() || "Unknown Student";

let player, videoDuration = 0, hasCompleted = false;

document.addEventListener("DOMContentLoaded", () => {
  const titleEl = document.getElementById("moduleTitle");
  if (titleEl) titleEl.textContent = moduleTitle;
});

// YouTube IFrame API callback (loaded by module.html)
function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    videoId: moduleId,
    playerVars: { rel:0, modestbranding:1, controls:0, disablekb:1, fs:0 },
    events: { onReady:onPlayerReady, onStateChange:onPlayerStateChange }
  });
}

function onPlayerReady() {
  const status = document.getElementById("status");
  if (status) status.innerText = "Press ▶ Play to begin.";

  videoDuration = player.getDuration();
  const playBtn = document.getElementById("customPlay");
  const blocker = document.getElementById("clickBlocker");
  if (playBtn) playBtn.style.display = "flex";
  if (blocker) blocker.style.display = "block";
}

window.startModuleVideo = function () {
  const playBtn = document.getElementById("customPlay");
  const status = document.getElementById("status");
  if (playBtn) playBtn.style.display = "none";
  if (status) status.innerText = "Playing...";
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
    if (fadeOverlay && (videoDuration - t <= 5)) fadeOverlay.style.opacity = "1";
    if (t >= videoDuration - 0.5) clearInterval(timer);
  }, 500);
}

async function markAsComplete() {
  hasCompleted = true;
  const btn = document.getElementById("markComplete");
  const status = document.getElementById("status");
  if (btn) { btn.disabled = true; btn.innerText = "Completed ✅"; }
  if (status) status.innerHTML = "✅ <span class='text-green-600 font-semibold'>Marked Complete</span>";

  try {
    const body = new URLSearchParams({ student, module: moduleId, title: moduleTitle });
    await fetch(scriptURL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body
    });
  } catch (err) {
    console.error("Sheet log error:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("markComplete");
  if (btn) btn.addEventListener("click", () => { if (!hasCompleted) markAsComplete(); });
});
