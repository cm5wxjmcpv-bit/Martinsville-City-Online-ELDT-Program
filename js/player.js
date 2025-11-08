Auth.requireAuth();
Auth.attachHeader();

let YT_PLAYER;
let META = null;
let lastSafeTime = 0;
let duration = 0;
let completed = false;
const ALLOW_SKIP_BACK_ONLY = true;
const BLACKOUT_LAST_SECONDS = 3;

const qs = new URLSearchParams(location.search);
const moduleId = qs.get('id');
const statusEl = document.getElementById('status');
const msgEl = document.getElementById('msg');
const markBtn = document.getElementById('markBtn');
const doneBadge = document.getElementById('done');
const titleEl = document.getElementById('title');
const blackout = document.getElementById('blackout');

async function loadMeta(){
  const mods = await API.modules(Auth.token());
  const found = (mods.items||[]).find(m => String(m.id) === String(moduleId));
  if(!found) throw new Error('Module not found');
  return found;
}

window.onYouTubeIframeAPIReady = function(){};

(async function init(){
  try {
    META = await loadMeta();
    titleEl.textContent = META.title;
    createPlayer(META.youtube_id);
  } catch(err){
    msgEl.textContent = err.message;
  }
})();

function createPlayer(videoId){
  YT_PLAYER = new YT.Player('player', {
    height: '540',
    width: '960',
    videoId,
    playerVars: {
      controls: 0,
      disablekb: 1,
      rel: 0,
      fs: 0,
      modestbranding: 1,
      iv_load_policy: 3
    },
    events: {
      'onReady': onReady,
      'onStateChange': onStateChange
    }
  });
}

function onReady(){
  duration = YT_PLAYER.getDuration();
  if(!duration && META.duration_hint_seconds) duration = META.duration_hint_seconds;
  setInterval(tick, 250);
}

function onStateChange(ev){
  const state = ev.data;
  if(state === 0){
    lastSafeTime = duration;
    completeUI();
  }
}

function tick(){
  if(!YT_PLAYER || typeof YT_PLAYER.getCurrentTime !== 'function') return;
  let t = YT_PLAYER.getCurrentTime();
  if(ALLOW_SKIP_BACK_ONLY && t > lastSafeTime + 1.5){
    YT_PLAYER.seekTo(lastSafeTime, true);
    t = lastSafeTime;
  }
  const playerState = YT_PLAYER.getPlayerState();
  if(playerState === 1 || playerState === 3){
    if(t > lastSafeTime) lastSafeTime = t;
  }
  if(duration && (duration - t) <= BLACKOUT_LAST_SECONDS){
    blackout.classList.add('on');
  } else {
    blackout.classList.remove('on');
  }
  statusEl.textContent = `${fmt(t)} / ${duration?fmt(duration):'--:--'}`;
  if(duration && !completed && lastSafeTime >= (duration - 2)){
    markBtn.disabled = false;
  }
}

function fmt(s){
  s = Math.max(0, Math.floor(s||0));
  const m = Math.floor(s/60), ss = s%60;
  return `${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
}

function completeUI(){
  completed = true;
  markBtn.disabled = false;
  doneBadge.classList.add('show');
}

markBtn.addEventListener('click', async () => {
  markBtn.disabled = true;
  msgEl.textContent = 'Recording completion…';
  try {
    const res = await API.logCompletion(Auth.token(), Auth.user(), moduleId);
    msgEl.textContent = 'Saved.';
    doneBadge.classList.add('show');
  } catch (err){
    msgEl.textContent = err.message || 'Could not save.';
    markBtn.disabled = false;
  }
});
