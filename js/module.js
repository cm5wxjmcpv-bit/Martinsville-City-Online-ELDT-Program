// ============================================
// module.js — No-skip video + Sheet logging
// ============================================

const scriptURL = "https://script.google.com/macros/s/AKfycbyZA8eMIPHUkaECP6rqRjApA8vWNypsdZofdEdxv-41yZxlHaCh-TFKvIlKdsFBkmOj/exec";

const params      = new URLSearchParams(location.search);
const moduleId    = params.get("id") || "Unknown Module";
const moduleTitle = params.get("title") || "Module";
const student     = (localStorage.getItem("studentName") || "").trim() || "Unknown Student";

let player, videoDuration = 0, hasCompleted = false;

// YouTube IFrame API callback (loaded by module.html)
function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    videoId: moduleId,
    playerVars: { rel:0, modestbranding:1, controls:0, disablekb:1, fs:0 },
    events: { onReady:onPlayerReady, onStateChange:onPlayerStateChange }
  });
}

function onPlayerReady() {
  document.getElementById("moduleTitle").textContent = moduleTitle;
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

  const btn = document.getElementById("markComplete");
  const status = document.getElementById("status");
  btn.disabled = true;
  btn.innerText = "Completed ✅";
  status.innerHTML = "✅ <span class='text-green-600 font-semibold'>Marked Complete</span>";

  try {
    const body = new URLSearchParams({
      student,
      module: moduleId,
      title: moduleTitle
    });
    await fetch(scriptURL, {
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
