// Prevent skipping, fade to black, and mark completion
let player, duration = 0, ended = false;
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyZA8eMIPHUkaECP6rqRjApA8vWNypsdZofdEdxv-41yZxlHaCh-TFKvIlKdsFBkmOj/exec";

function getQueryParam(key) {
  return new URLSearchParams(window.location.search).get(key) || "";
}

function onYouTubeIframeAPIReady() {
  const yt = getQueryParam('yt');
  player = new YT.Player('player', {
    videoId: yt || 'dQw4w9WgXcQ',
    playerVars: {
      controls: 0, disablekb: 1, rel: 0, modestbranding: 1, fs: 0
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

function onPlayerReady(e) {
  duration = e.target.getDuration();
  document.getElementById('moduleTitle').textContent = getQueryParam('title') || "Module";
  document.getElementById('customPlay').addEventListener('click', startModuleVideo);
  // Block pointer events on the iframe to prevent scrubbing/pausing
  const iframe = document.querySelector('#player iframe');
  if (iframe) iframe.style.pointerEvents = 'none';
}

function startModuleVideo() {
  document.getElementById('customPlay').style.display = 'none';
  player.playVideo();
  tick();
}

function tick() {
  if (!player || ended) return;
  const t = player.getCurrentTime ? player.getCurrentTime() : 0;
  const remain = Math.max(0, duration - t);

  // Fade to black for last 3 seconds to hide YouTube end screen
  if (remain <= 3) {
    document.getElementById('fadeOverlay').style.opacity = 1;
  }

  // Allow completion within last 1 second
  if (remain <= 1) {
    document.getElementById('markComplete').disabled = false;
    document.getElementById('status').textContent = "Nice work. You can mark this module complete.";
  } else {
    document.getElementById('markComplete').disabled = true;
  }

  requestAnimationFrame(tick);
}

function onPlayerStateChange(evt) {
  if (evt.data === YT.PlayerState.ENDED) {
    ended = true;
    document.getElementById('markComplete').disabled = false;
    document.getElementById('status').textContent = "Video finished. Mark complete to log.";
  }
}

document.getElementById('markComplete').addEventListener('click', async () => {
  const student = localStorage.getItem('eldt_student') || "unknown";
  const moduleId = getQueryParam('moduleId') || "unknown";
  const moduleTitle = getQueryParam('title') || "Module";

  try {
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "logCompletion",
        student,
        moduleId,
        moduleTitle,
        timestamp: new Date().toISOString()
      })
    });
    document.getElementById('status').textContent = "Logged to sheet ✅";
  } catch (e) {
    document.getElementById('status').textContent = "Tried to log, but there was an error.";
  }
});
