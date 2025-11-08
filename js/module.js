// js/module.js — no-skip + mobile Play + fade + "Mark Complete" + Sheet sync (no-cors form post)

// ===== Your Apps Script endpoint (public /exec URL) =====
const PROGRESS_API =
  'https://script.google.com/macros/s/AKfycbzT_DwYALs_PRoAQmAdk2z2bKXP9NY3l9_3vYodDODGagEE7l5ISEy9zRmQfGtCLkRrjQ/exec';

// ===== Query params (module.html?id=YTVIDEOID&title=...&mid=...) =====
const qp       = new URLSearchParams(location.search);
const videoId  = qp.get('id')    || '';
const title    = qp.get('title') || 'Module';
const moduleId = qp.get('mid')   || videoId; // stable ID used for checkmarks

// ===== Elements =====
const titleEl       = document.getElementById('moduleTitle');
const statusEl      = document.getElementById('status');
const markBtn       = document.getElementById('markComplete');
const fadeOverlay   = document.getElementById('fadeOverlay');
const clickBlocker  = document.getElementById('clickBlocker');
const customPlayBtn = document.getElementById('customPlay');
if (titleEl) titleEl.textContent = title;

// ===== State =====
window.player = null; // global for YouTube API and Play overlay
let durationSec = 0;
let lastTime = 0;
let completed = false;
let tickTimer = null;

const FADE_BEFORE_END_SEC = 2; // start fade slightly before end
const COMPLETE_AT_END_SEC = 1; // count as complete in last second buffer

// ===== Helpers =====
const getStudentId = () => localStorage.getItem('studentId') || '1001'; // fallback for testing
const uiMsg = (msg) => { if (statusEl) statusEl.textContent = msg; };

// Local log (keeps Admin page working even when offline)
async function recordLocally() {
  try {
    const key = 'mfd_eldt_records';
    const arr = JSON.parse(localStorage.getItem(key) || '[]');
    arr.push({
      student: getStudentId(),
      title,
      videoId,
      moduleId,
      completedAt: new Date().toISOString()
    });
    localStorage.setItem(key, JSON.stringify(arr));
  } catch (e) {
    console.error('Local save failed:', e);
  }
}

// Cloud log (Google Sheet) — form-encoded + no-cors so it always reaches Apps Script
async function recordToSheet() {
  try {
    const body = new URLSearchParams({
      studentId: getStudentId(),
      module: moduleId,     // matches your Sheet's "Module" column
      status: 'Completed',  // matches your Sheet wording
      score: ''             // unused for modules
    });
    await fetch(PROGRESS_API, { method: 'POST', mode: 'no-cors', body });
    return true; // we can’t read response in no-cors; assume success if no exception
  } catch (e) {
    console.error('Sheet sync failed:', e);
    return false;
  }
}

// Single call that updates UI, logs local, then tries cloud
async function recordCompletionUI() {
  if (markBtn) {
    markBtn.disabled = true;
    markBtn.textContent = 'Recording…';
  }
  uiMsg('Recording completion…');

  await recordLocally();
  const ok = await recordToSheet();

  if (markBtn) {
    markBtn.disabled = true;
    markBtn.textContent = ok ? 'Recorded ✓' : 'Recorded (offline) ✓';
  }
  uiMsg(ok ? 'Completion recorded.' : 'Recorded locally. Network issue syncing to Sheet.');
}

// ===== YouTube IFrame API =====
window.onYouTubeIframeAPIReady = function () {
  if (!videoId) {
    uiMsg('Missing video ID.');
    return;
  }
  window.player = new YT.Player('player', {
    videoId,
    width: '100%',
    height: '100%',
    playerVars: {
      controls: 0,        // hide controls (we block interaction with overlay anyway)
      disablekb: 1,       // disable keyboard seeking
      rel: 0,
      modestbranding: 1,
      fs: 0,
      iv_load_policy: 3,
      playsinline: 1      // critical for iOS inline playback
    },
    events: {
      onReady: onReady,
      onStateChange: onStateChange
    }
  });
};

function onReady() {
  try { durationSec = Math.max(0, window.player.getDuration() || 0); } catch {}
  if (customPlayBtn) customPlayBtn.style.display = 'flex';
  uiMsg('Press Play to begin.');
}

// Big Play overlay (mobile/iOS-safe: mute → play → unmute)
window.startModuleVideo = function () {
  if (customPlayBtn) customPlayBtn.style.display = 'none';
  let tries = 0;
  const t = setInterval(() => {
    try {
      if (window.player && typeof window.player.playVideo === 'function') {
        try { window.player.mute(); } catch {}
        window.player.playVideo();
        setTimeout(() => { try { window.player.unMute(); } catch {} }, 400);
        clearInterval(t);
      } else if (++tries > 40) {
        clearInterval(t);
        if (customPlayBtn) customPlayBtn.style.display = 'flex';
        alert('Video is loading—tap Play again.');
      }
    } catch (e) {
      console.error(e);
      clearInterval(t);
      if (customPlayBtn) customPlayBtn.style.display = 'flex';
      alert('Could not start the video—try again.');
    }
  }, 150);
};

function onStateChange(e) {
  if (e.data === YT.PlayerState.PLAYING) startTick();
  if (e.data === YT.PlayerState.ENDED) handleCompletion();
}

function startTick() {
  if (tickTimer) return;
  tickTimer = setInterval(() => {
    if (!window.player) return;

    let t = 0, d = durationSec;
    try {
      t = window.player.getCurrentTime() || 0;
      d = durationSec || window.player.getDuration() || 0;
    } catch {}

    // Fade to black right before the end (hide YT suggestions)
    if (d > 0 && t >= d - FADE_BEFORE_END_SEC) {
      if (fadeOverlay) fadeOverlay.style.opacity = '1';
    } else {
      if (fadeOverlay) fadeOverlay.style.opacity = '0';
    }

    // Light anti-skip: snap back if forward jump > 2s
    if (t - lastTime > 2 && !completed) {
      try { window.player.seekTo(Math.max(0, lastTime), true); } catch {}
    } else {
      lastTime = t;
    }

    // Auto-detect completion at end buffer
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

async function handleCompletion() {
  if (completed) return;
  completed = true;

  stopTick();
  if (fadeOverlay)  fadeOverlay.style.opacity = '1';
  if (clickBlocker) clickBlocker.style.display = 'none';

  if (markBtn) {
    markBtn.disabled = false;               // allow the click
    markBtn.textContent = 'Mark Complete';  // show action
  }
  uiMsg('Finished. You can mark complete.');
  // If you want auto-recording without requiring the click, uncomment:
  // await recordCompletionUI();
}

// Button → record completion (UI + local + cloud)
if (markBtn) {
  markBtn.addEventListener('click', async () => {
    await recordCompletionUI();
  });
}

// If the IFrame API was ready before this script loaded
if (window.YT && YT.Player && !window.player) {
  window.onYouTubeIframeAPIReady();
}
