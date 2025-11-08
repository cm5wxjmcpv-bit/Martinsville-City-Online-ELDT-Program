// js/module.js — mobile-safe Play, no-skip, fade, Sheet sync

const PROGRESS_API = 'https://script.google.com/macros/s/AKfycbznz6jjcSFq5RxRwLFVj5xn0ZU_VZEJLxyHJWzWU-vxOcjnryiRUBC7nvnFCcnL23K1Rg/exec';

const qp = new URLSearchParams(location.search);
const videoId  = qp.get('id')    || '';
const title    = qp.get('title') || 'Module';
const moduleId = qp.get('mid')   || videoId;

const titleEl       = document.getElementById('moduleTitle');
const statusEl      = document.getElementById('status');
const markBtn       = document.getElementById('markComplete');
const fadeOverlay   = document.getElementById('fadeOverlay');
const clickBlocker  = document.getElementById('clickBlocker');
const customPlayBtn = document.getElementById('customPlay');

if (titleEl) titleEl.textContent = title;

window.player = null;
let durationSec = 0, lastTime = 0, completed = false;
const FADE_BEFORE_END_SEC = 2, COMPLETE_AT_END_SEC = 1;

function getStudentId(){ return localStorage.getItem('studentId') || 'Unknown'; }

// YouTube API hook
window.onYouTubeIframeAPIReady = function () {
  if (!videoId) { if (statusEl) statusEl.textContent = 'Missing video ID.'; return; }
  window.player = new YT.Player('player', {
    videoId,
    width: '100%',
    height: '100%',
    playerVars: { controls: 0, disablekb: 1, rel: 0, modestbranding: 1, fs: 0, iv_load_policy: 3, playsinline: 1 },
    events: { onReady, onStateChange }
  });
};

function onReady() {
  try { durationSec = Math.max(0, window.player.getDuration() || 0); } catch {}
  if (customPlayBtn) customPlayBtn.style.display = 'flex';
  if (statusEl) statusEl.textContent = 'Press Play to begin.';
}

// Big Play overlay click (iOS-safe: mute → play → unmute)
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
        alert('Video is still loading—tap Play again.');
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

let tickTimer = null;
function startTick(){
  if (tickTimer) return;
  tickTimer = setInterval(() => {
    if (!window.player) return;
    let t = 0, d = durationSec;
    try { t = window.player.getCurrentTime() || 0; d = durationSec || window.player.getDuration() || 0; } catch {}

    // fade near end
    if (d > 0 && t >= d - FADE_BEFORE_END_SEC) { if (fadeOverlay) fadeOverlay.style.opacity = '1'; }
    else { if (fadeOverlay) fadeOverlay.style.opacity = '0'; }

    // light anti-skip
    if (t - lastTime > 2 && !completed) { try { window.player.seekTo(Math.max(0, lastTime), true); } catch {} }
    else { lastTime = t; }

    if (!completed && d > 0 && t >= d - COMPLETE_AT_END_SEC) handleCompletion();
  }, 250);
}
function stopTick(){ if (tickTimer){ clearInterval(tickTimer); tickTimer=null; } }

async function handleCompletion(){
  if (completed) return;
  completed = true; stopTick();
  if (fadeOverlay) fadeOverlay.style.opacity = '1';
  if (markBtn){ markBtn.disabled = false; markBtn.textContent = 'Mark Complete'; }
  if (statusEl) statusEl.textContent = 'Finished. You can mark complete.';
  if (clickBlocker) clickBlocker.style.display = 'none';
  await recordCompletion(); // auto-record
}

async function recordCompletion(){
  // Local (keeps your admin.html working)
  try{
    const key = 'mfd_eldt_records';
    const arr = JSON.parse(localStorage.getItem(key) || '[]');
    arr.push({ student: getStudentId(), title, videoId, completedAt: new Date().toISOString(), moduleId });
    localStorage.setItem(key, JSON.stringify(arr));
  }catch(e){ console.error(e); }

  // Cloud (Sheet)
  try{
    await fetch(PROGRESS_API, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ studentId: getStudentId(), module: moduleId, status: 'Completed' })
    });
  }catch(e){ console.error('Sheet sync failed:', e); }
}

if (markBtn) markBtn.addEventListener('click', recordCompletion);

// If API already ready
if (window.YT && YT.Player && !window.player) window.onYouTubeIframeAPIReady();
