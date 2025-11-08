// js/module.js — Mobile-friendly start + no-skip + completion

const params = new URLSearchParams(window.location.search);
const videoId = params.get("id") || "";
const title   = params.get("title") || "Module";

const titleEl       = document.getElementById("moduleTitle");
const statusEl      = document.getElementById("status");
const markBtn       = document.getElementById("markComplete");
const fadeOverlay   = document.getElementById("fadeOverlay");
const clickBlocker  = document.getElementById("clickBlocker");
const customPlayBtn = document.getElementById("customPlay");

if (titleEl) titleEl.textContent = title;

window.player = null;
let durationSec = 0;
let lastTime = 0;
let completed = false;

const FADE_BEFORE_END_SEC = 2.0;
const COMPLETE_AT_END_SEC = 1.0;

window.onYouTubeIframeAPIReady = function () {
  if (!videoId) {
    console.error("No videoId (?id=) provided");
    if (statusEl) statusEl.textContent = "Missing video ID.";
    return;
  }
  window.player = new YT.Player("player", {
    videoId,
    width: "100%",
    height: "100%",
    playerVars: {
      controls: 0,
      disablekb: 1,
      rel: 0,
      modestbranding: 1,
      fs: 0,
      iv_load_policy: 3,
      playsinline: 1, // important for iOS
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
};

function onPlayerReady() {
  try { durationSec = Math.max(0, window.player.getDuration() || 0); } catch (_) {}
  if (customPlayBtn) customPlayBtn.style.display = "flex";
  if (statusEl) statusEl.textContent = "Press Play to begin.";
}

// Mobile-safe Play sequence (works on iOS Safari)
window.startModuleVideo = function () {
  if (customPlayBtn) customPlayBtn.style.display = "none";
  let tries = 0;

  const tryStart = setInterval(() => {
    try {
      if (window.player && typeof window.player.playVideo === "function") {
        // iOS: start muted, then unmute shortly after
        try { window.player.mute(); } catch (_) {}
        window.player.playVideo();

        setTimeout(() => {
          try { window.player.unMute(); } catch (_) {}
        }, 400);

        clearInterval(tryStart);
      } else if (++tries > 40) {
        clearInterval(tryStart);
        if (customPlayBtn) customPlayBtn.style.display = "flex";
        alert("Video is still loading—please tap Play again.");
      }
    } catch (e) {
      console.error(e);
      clearInterval(tryStart);
      if (customPlayBtn) customPlayBtn.style.display = "flex";
      alert("Could not start the video—please tap Play again.");
    }
  }, 150);
};

function onPlayerStateChange(event) {
  const state = event.data;

  if (state === YT.PlayerState.PLAYING) {
    startTick();
    if (statusEl) statusEl.textContent = "Playing… stay with the video.";
  }
  if (state === YT.PlayerState.ENDED) handleCompletion();
}

let tickTimer = null;
function startTick() {
  if (tickTimer) return;
  tickTimer = setInterval(() => {
    if (!window.player) return;
    let t = 0, d = durationSec;
    try {
      t = window.player.getCurrentTime() || 0;
      d = durationSec || window.player.getDuration() || 0;
    } catch (_) {}

    // Fade near end
    if (d > 0 && t >= d - FADE_BEFORE_END_SEC) {
      if (fadeOverlay) fadeOverlay.style.opacity = "1";
    } else {
      if (fadeOverlay) fadeOverlay.style.opacity = "0";
    }

    // Anti-skip: snap back if jump > 2s
    if (t - lastTime > 2 && !completed) {
      try { window.player.seekTo(Math.max(0, lastTime), true); } catch (_) {}
    } else {
      lastTime = t;
    }

    if (!completed && d > 0 && t >= d - COMPLETE_AT_END_SEC) handleCompletion();
  }, 250);
}
function stopTick(){ if (tickTimer){ clearInterval(tickTimer); tickTimer=null; } }

function handleCompletion() {
  if (completed) return;
  completed = true;
  stopTick();
  if (fadeOverlay) fadeOverlay.style.opacity = "1";
  if (markBtn) { markBtn.disabled = false; markBtn.textContent = "Mark Complete"; }
  if (statusEl) statusEl.textContent = "Finished. You can mark complete.";
  // allow rewatch/scrub after completion
  if (clickBlocker) clickBlocker.style.display = "none";
}

if (markBtn) {
  markBtn.addEventListener("click", () => {
    try {
      const studentId = localStorage.getItem("studentId") || "Unknown";
      const record = { student: studentId, title, videoId, completedAt: new Date().toISOString() };
      const key = "mfd_eldt_records";
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      existing.push(record);
      localStorage.setItem(key, JSON.stringify(existing));
      markBtn.disabled = true;
      markBtn.textContent = "Recorded ✓";
      if (statusEl) statusEl.textContent = "Completion recorded.";
    } catch (e) {
      console.error(e);
      if (statusEl) statusEl.textContent = "Could not save completion locally.";
    }
  });
}

// If API was already ready
if (window.YT && YT.Player && !window.player) window.onYouTubeIframeAPIReady();
