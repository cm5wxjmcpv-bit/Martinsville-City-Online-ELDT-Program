// js/module.js — No-skip playback + Play overlay + completion logging

// --- Params from URL ---------------------------------------------------------
const params = new URLSearchParams(window.location.search);
const videoId = params.get("id") || "";   // e.g., "5C_0X6G4ytI"
const title   = params.get("title") || "Module";

// --- UI Elements -------------------------------------------------------------
const titleEl       = document.getElementById("moduleTitle");
const statusEl      = document.getElementById("status");
const markBtn       = document.getElementById("markComplete");
const fadeOverlay   = document.getElementById("fadeOverlay");
const clickBlocker  = document.getElementById("clickBlocker");
const customPlayBtn = document.getElementById("customPlay");

// Reflect title if provided
if (titleEl) titleEl.textContent = title;

// --- Globals for player / timing --------------------------------------------
window.player = null;           // ensure global
let durationSec = 0;
let lastTime = 0;
let completed = false;

// Thresholds
const FADE_BEFORE_END_SEC = 2.0;    // start fade 2s before end
const COMPLETE_AT_END_SEC = 1.0;    // consider complete within last 1s

// --- YouTube IFrame API bootstrap -------------------------------------------
// This function name is required by the YT API and MUST be global.
window.onYouTubeIframeAPIReady = function () {
  if (!videoId) {
    console.error("No videoId provided in ?id= param");
    if (statusEl) statusEl.textContent = "Missing video ID.";
    return;
  }

  window.player = new YT.Player("player", {
    videoId,
    width: "100%",
    height: "100%",
    playerVars: {
      // Hide controls & keyboard to discourage skipping
      controls: 0,
      disablekb: 1,
      rel: 0,
      modestbranding: 1,
      fs: 0,
      iv_load_policy: 3,
      playsinline: 1,
      // NOTE: We do NOT set autoplay here. We start on user click (customPlay).
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
};

function onPlayerReady() {
  try {
    durationSec = Math.max(0, window.player.getDuration() || 0);
  } catch (_) {}
  // Ensure the custom play button is visible (user gesture will start video)
  if (customPlayBtn) customPlayBtn.style.display = "flex";
  if (statusEl) statusEl.textContent = "Press Play to begin.";
}

// Called by your Play overlay button in module.html
window.startModuleVideo = function () {
  // Hide the button immediately to reveal the video view
  if (customPlayBtn) customPlayBtn.style.display = "none";

  // Start playback once the player is ready
  let tries = 0;
  const tryPlay = setInterval(() => {
    try {
      if (window.player && typeof window.player.playVideo === "function") {
        window.player.playVideo();
        clearInterval(tryPlay);
      } else if (++tries > 40) {
        clearInterval(tryPlay);
        if (customPlayBtn) customPlayBtn.style.display = "flex";
        alert("Video is still loading—please press Play again.");
      }
    } catch (e) {
      clearInterval(tryPlay);
      console.error(e);
      if (customPlayBtn) customPlayBtn.style.display = "flex";
      alert("Could not start the video—please try Play again.");
    }
  }, 150);
};

function onPlayerStateChange(event) {
  const state = event.data;

  if (state === YT.PlayerState.PLAYING) {
    // Start a lightweight time checker for fade + anti-skip
    startTick();
    if (statusEl) statusEl.textContent = "Playing...";
  }

  if (state === YT.PlayerState.ENDED) {
    handleCompletion();
  }
}

// --- Tick loop: handle fade + guard against big forward jumps ----------------
let tickTimer = null;

function startTick() {
  if (tickTimer) return; // already running
  tickTimer = setInterval(() => {
    if (!window.player) return;
    let t = 0;
    let d = durationSec;
    try {
      t = window.player.getCurrentTime() || 0;
      d = durationSec || window.player.getDuration() || 0;
    } catch (_) {}

    // Fading near the end (hide suggestions)
    if (d > 0 && t >= d - FADE_BEFORE_END_SEC) {
      if (fadeOverlay) fadeOverlay.style.opacity = "1";
    } else {
      if (fadeOverlay) fadeOverlay.style.opacity = "0";
    }

    // Light anti-skip: if time jumps forward > 2s, snap back
    if (t - lastTime > 2.0 && !completed) {
      const safeTime = Math.max(0, lastTime);
      try {
        window.player.seekTo(safeTime, true);
      } catch (_) {}
    } else {
      lastTime = t;
    }

    // Detect completion within last second
    if (!completed && d > 0 && t >= d - COMPLETE_AT_END_SEC) {
      handleCompletion();
    }
  }, 250);
}

function stopTick() {
  if (tickTimer) {
    clearInterval(tickTimer);
    tickTimer = null;
  }
}

function handleCompletion() {
  if (completed) return;
  completed = true;
  stopTick();

  // Ensure fully black at end
  if (fadeOverlay) fadeOverlay.style.opacity = "1";

  // Enable the button
  if (markBtn) {
    markBtn.disabled = false;
    markBtn.textContent = "Mark Complete";
  }
  if (statusEl) statusEl.textContent = "Finished. You can mark complete.";

  // OPTIONAL: allow scrubbing AFTER completion for review
  if (clickBlocker) clickBlocker.style.display = "none";
}

// --- Mark Complete: persist to local storage (as in your admin view) --------
if (markBtn) {
  markBtn.addEventListener("click", () => {
    try {
      const studentId = localStorage.getItem("studentId") || "Unknown";
      const record = {
        student: studentId,
        title,
        videoId,
        completedAt: new Date().toISOString(),
      };
      const key = "mfd_eldt_records";
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      existing.push(record);
      localStorage.setItem(key, JSON.stringify(existing));

      markBtn.disabled = true;
      markBtn.textContent = "Recorded ✓";
      if (statusEl) statusEl.textContent = "Completion recorded.";

      // Navigate back if you want:
      // window.location.href = "dashboard.html";
    } catch (e) {
      console.error(e);
      if (statusEl) statusEl.textContent = "Could not save completion locally.";
    }
  });
}

// --- Safety: if API loaded before this script executed ----------------------
if (window.YT && YT.Player && !window.player) {
  // If API is already ready, call our init manually
  window.onYouTubeIframeAPIReady();
}
