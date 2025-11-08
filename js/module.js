// js/module.js — stable Mark Complete + mobile-safe play + anti-skip + Sheet sync

// <<<< EDIT: Your Apps Script endpoint >>>>
const PROGRESS_API = 'https://script.google.com/macros/s/AKfycbznz6jjcSFq5RxRwLFVj5xn0ZU_VZEJLxyHJWzWU-vxOcjnryiRUBC7nvnFCcnL23K1Rg/exec';

// ---------- query params ----------
const qp       = new URLSearchParams(location.search);
const videoId  = qp.get('id')    || '';
const title    = qp.get('title') || 'Module';
const moduleId = qp.get('mid')   || videoId;

// ---------- elements ----------
const titleEl       = document.getElementById('moduleTitle');
const statusEl      = document.getElementById('status');
const markBtn       = document.getElementById('markComplete'); // exists in module.html
const fadeOverlay   = document.getElementById('fadeOverlay');
const clickBlocker  = document.getElementById('clickBlocker');
const customPlayBtn = document.getElementById('customPlay');

if (titleEl) titleEl.textContent = title;

// ---------- state ----------
window.player = null;
let durationSec = 0;
let lastTime = 0;
let completed = false;
let tickTimer = null;

const FADE_BEFORE_END_SEC = 2;
const COMPLETE_AT_END_SEC = 1;

// ---------- helpers ----------
function getStudentId(){ return localStorage.getItem('studentId') || 'Unknown'; }
function uiMsg(msg){ if (statusEl) statusEl.textContent = msg; }

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

async function recordToSheet() {
  try {
    await fetch(PROGRESS_API, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({
        studentId: getStudentId(),
        module: moduleId,           // your Sheet reads "module"
        status: 'Completed',        // match your Sheet wording
        score: ''                   // not used here
      })
    });
    return true;
  } catch (e) {
    console.error('Sheet sync failed:', e);
    return false;
  }
}

async function recordCompletionUI() {
  // Immediate UI feedback so it never feels “dead”
  if (markBtn){
    markBtn.disabled = true;
    markBtn.textContent = 'Recording…';
  }
  uiMsg('Recording completion…');

  // Always write local first (keeps Admin table working offline)
  await recordLocally();

  // Try cloud (don’t block UX if it fails)
  const ok = await recordToSheet();

  if (markBtn){
    markBtn.disabled = true;
    markBtn.textContent = ok ? 'Recorded ✓' : 'Recorded (offline) ✓';
  }
  uiMsg(ok ? 'Completion recorded.' : 'Recorded locally. Network issue syncing to Sheet.');
}

// ---------- YouTube IFrame API ----------
window.onYouTubeIframeAPIReady = function () {
  if (!videoId){
    uiMsg('Missing video ID.');
    return;
  }
  window.player = new YT.Player('player', {
    videoId,
    width: '100%',
    height: '100%',
    playerVars: {
      controls: 0,
      disablekb: 1,
      rel: 0,
      modestbranding: 1,
      fs: 0,
      iv_load_policy: 3,
      playsinline: 1
    },
    events: {
      onReady: onReady,
      onStateChange: onStateChange
    }
  });
};

function onReady(){
  try { durationSec = Math.max(0, window.player.getDuration() || 0); } catch {}
  if (customPlayBtn) customPlayBtn.style.display = 'flex';
  uiMsg('Press Play to begin.');
}

// Big Play overlay (iOS-safe: mute → play → unmute)
window.startModuleVideo = function(){
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

function onStateChange(e){
  if (e.data === YT.PlayerState.PLAYING) startTick();
  if (e.data === YT.PlayerState.ENDED) handleCompletion();
}

function startTick(){
  if (tickTimer) return;
  tickTimer = setInterval(() => {
    if (!window.player) return;
    let t = 0, d = durationSec;
    try {
      t = window.player.getCurrentTime() || 0;
      d = durationSec || window.player.getDuration() || 0;
    } catch {}

    // Fade near end (hide suggestions)
    if (d > 0 && t >= d - FADE_BEFORE_END_SEC) {
      if (fadeOverlay) fadeOverlay.style.opacity = '1';
    } else {
      if (fadeOverlay) fadeOverlay.style.opacity = '0';
    }

    // Light anti-skip: snap back on forward jumps >2s
    if (t - lastTime > 2 && !completed) {
      try { window.player.seekTo(Math.max(0, lastTime), true); } catch {}
    } else {
      lastTime = t;
    }

    // Auto-complete at last second buffer
    if (!completed && d > 0 && t >= d - COMPLETE_AT_END_SEC) {
      handleCompletion();
    }
  }, 250);
}

function stopTick(){
  if (tickTimer){
    clearInterval(tickTimer);
    tickTimer = null;
  }
}

async function handleCompletion(){
  if (completed) return;
  completed = true;

  stopTick();
  if (fadeOverlay)  fadeOverlay.style.opacity = '1';
  if (clickBlocker) clickBlocker.style.display = 'none';

  if (markBtn){
    markBtn.disabled = false;                // enable
    markBtn.textContent = 'Mark Complete';   // clear any previous text
  }
  uiMsg('Finished. You can mark complete.');

  // OPTIONAL: auto-record right away (uncomment if you want auto logging)
  // await recordCompletionUI();
}

// Button click: record completion now
if (markBtn){
  markBtn.addEventListener('click', async () => {
    await recordCompletionUI();
  });
}

// In case the IFrame API finished loading before this file
if (window.YT && YT.Player && !window.player) {
  window.onYouTubeIframeAPIReady();
}