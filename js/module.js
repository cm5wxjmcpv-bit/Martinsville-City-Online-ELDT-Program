// js/module.js
const API_URL = "https://script.google.com/macros/s/AKfycbyZA8eMIPHUkaECP6rqRjApA8vWNypsdZofdEdxv-41yZxlHaCh-TFKvIlKdsFBkmOj/exec";
const END_GRACE = 0.05; // last 5%

const params = new URLSearchParams(location.search);
const moduleId = (params.get("id") || "").trim();
const ytId = (params.get("vid") || moduleId || "").trim();

const student =
  localStorage.getItem("student") ||
  new URLSearchParams(location.search).get("student") ||
  "";

const moduleTitleEl = document.getElementById("moduleTitle");
const statusEl = document.getElementById("status");
const btnComplete = document.getElementById("markComplete");
const fadeOverlay = document.getElementById("fadeOverlay");
const clickBlocker = document.getElementById("clickBlocker");
const customPlayBtn = document.getElementById("customPlay");

if (moduleId && moduleTitleEl && moduleTitleEl.textContent.trim() === "Module") {
  moduleTitleEl.textContent = `Module — ${moduleId}`;
}

let player, duration = 0, lastTime = 0, completeUnlocked = false;

// YouTube API callback
window.onYouTubeIframeAPIReady = function () {
  player = new YT.Player("player", {
    videoId: ytId || "dQw4w9WgXcQ",
    playerVars: { controls: 0, disablekb: 1, rel: 0, modestbranding: 1, playsinline: 1 },
    events: { onReady, onStateChange }
  });
};
window.startModuleVideo = function () { if (player) player.playVideo(); };

function onReady() {
  duration = Math.max(1, player.getDuration() || 1);
  clickBlocker.style.pointerEvents = "auto";
  statusEl.textContent = "Press Play to begin.";
  btnComplete.disabled = true;
  customPlayBtn.style.display = "flex";

  setInterval(() => {
    if (!player || typeof player.getCurrentTime !== "function") return;
    const t = player.getCurrentTime();

    // prevent seeking
    if (t > lastTime + 2 && t < duration * (1 - END_GRACE)) {
      player.seekTo(lastTime, true);
    } else {
      lastTime = t;
    }

    // unlock near the end
    if (!completeUnlocked && t >= duration * (1 - END_GRACE)) {
      completeUnlocked = true;
      btnComplete.disabled = false;
      statusEl.textContent = "You may now mark this module complete.";
      fadeOverlay.style.opacity = "1"; // fade to black
    }
  }, 500);
}

function onStateChange(ev) {
  if (ev.data === YT.PlayerState.PLAYING) {
    statusEl.textContent = "Playing…";
    customPlayBtn.style.display = "none";
  }
}

btnComplete.addEventListener("click", async () => {
  if (!student) { alert("No student name found—please log in again."); location.replace("index.html"); return; }
  if (!completeUnlocked) { alert("Please finish the module first."); return; }

  const moduleTitle = (moduleTitleEl?.textContent || "").trim();

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student,
        moduleId,
        moduleTitle
      })
    });
    const data = await res.json();
    if (data?.ok) {
      statusEl.textContent = "Logged! Returning to dashboard…";
      setTimeout(() => { location.assign("dashboard.html"); }, 800);
    } else {
      throw new Error(data?.error || "Unknown error");
    }
  } catch (err) {
    alert("Failed to log completion: " + err.message);
  }
});
