// module.js — strict anti-skip + fade-to-black + attention checker + logging

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// --- YouTube IDs ---
const videoLinks = {
  1: "z5riddRK2fY",
  2: "z5riddRK2fY",
  3: "z5riddRK2fY"
};
const titles = {
  1: "Vehicle Inspection",
  2: "Basic Control Skills",
  3: "On-Road Driving"
};

document.getElementById("moduleTitle").innerText = titles[id] || "Training Module";
const completeBtn = document.getElementById("completeBtn");
completeBtn.style.display = "none";

const scriptURL =
  "https://script.google.com/macros/s/AKfycbzTygqxIMidgXjitFwwtn6QPxT1Vm8MJ_8zJ182oGvDBxC0_MipCOlCp4jalVmFILm9nA/exec";

let player;
let maxWatched = 0;
let fadedOut = false;
let attentionTimeout, nextAttentionCheck, attentionActive = false;

function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    videoId: videoLinks[id] || videoLinks[1],
    playerVars: { controls: 1, disablekb: 0, rel: 0 },
    events: { onReady: onPlayerReady, onStateChange: onPlayerStateChange }
  });
}

// ----------  main playback guard  ----------
function onPlayerReady() {
  setInterval(() => {
    if (!player || player.getPlayerState() !== YT.PlayerState.PLAYING) return;

    const current = player.getCurrentTime();
    const duration = player.getDuration();

    // normal forward progress
    if (current > maxWatched + 0.25) maxWatched = current;

    // block any seek into unwatched or last 5s unless watched
    const tryingToSkip = current > maxWatched + 2;
    const nearEnd = duration - current < 5;
    const watchedEnough = maxWatched >= duration - 5;
    if (tryingToSkip && (!watchedEnough || !nearEnd)) {
      console.log("⏪ skipping blocked →", maxWatched.toFixed(2));
      player.seekTo(maxWatched, true);
      return;
    }

    // fade-to-black 3s before end
    if (!fadedOut && duration - current <= 3) {
      fadedOut = true;
      fadeOutVideo();
    }
  }, 1000);

  scheduleNextAttentionCheck();
}

// ----------  attention checks  ----------
function scheduleNextAttentionCheck() {
  const t = Math.floor(Math.random() * (300 - 120 + 1)) + 120;
  nextAttentionCheck = setTimeout(triggerAttentionCheck, t * 1000);
}
function triggerAttentionCheck() {
  if (!player) return;
  attentionActive = true;
  player.pauseVideo();

  const overlay = document.createElement("div");
  Object.assign(overlay.style, {
    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
    background: "rgba(0,0,0,0.8)", display: "flex",
    flexDirection: "column", justifyContent: "center",
    alignItems: "center", zIndex: 9999, color: "white"
  });
  overlay.innerHTML = `
    <div class="bg-gray-800 p-6 rounded-lg text-center shadow-lg max-w-sm">
      <h2 class="text-lg font-bold mb-4">Attention Check</h2>
      <p class="mb-4">Please confirm you're still watching.</p>
      <button id="continueBtn" class="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700">
        Continue
      </button>
      <p class="mt-2 text-sm text-gray-400">(You have 60 seconds to respond)</p>
    </div>`;
  document.body.appendChild(overlay);

  attentionTimeout = setTimeout(() => location.reload(), 60000);
  document.getElementById("continueBtn").onclick = () => {
    clearTimeout(attentionTimeout);
    document.body.removeChild(overlay);
    attentionActive = false;
    player.playVideo();
    scheduleNextAttentionCheck();
  };
}

// ----------  fade-to-black layer  ----------
function fadeOutVideo() {
  const playerDiv = document.getElementById("player");
  const fade = document.createElement("div");
  Object.assign(fade.style, {
    position: "absolute", top: 0, left: 0,
    width: "100%", height: "100%",
    background: "black", opacity: 0,
    transition: "opacity 1.5s ease", zIndex: 999
  });
  playerDiv.appendChild(fade);
  setTimeout(() => { fade.style.opacity = "1"; }, 200);
}

// ----------  when video truly ends  ----------
function onPlayerStateChange(e) {
  if (e.data === YT.PlayerState.ENDED && !attentionActive) {
    clearTimeout(nextAttentionCheck);
    completeBtn.style.display = "inline-block";
    alert("✅ Video complete! You can now mark this module as finished.");
  }
}

// ----------  log completion  ----------
function completeModule() {
  const studentId = localStorage.getItem("studentId") || "Unknown";
  const moduleName = titles[id] || "Unknown Module";
  const payload = { studentId, module: moduleName, status: "Completed", score: "" };

  fetch(scriptURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    mode: "no-cors"
  }).then(() => {
    alert("✅ Module logged to training record!");
    window.location.href = "dashboard.html";
  });
}

window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
window.completeModule = completeModule;
