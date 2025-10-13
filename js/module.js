// --- Load YouTube API dynamically ---
let tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
let firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// --- Variables ---
let player;
let maxWatched = 0;
let duration = 0;
let intervalId = null;

// --- Module Data ---
const modules = [
  { title: "Module 1 - Pre-Trip Inspection", videoId: "5C_0X6G4ytI" },
  { title: "Module 2 - Air Brakes", videoId: "qZkkgkMLsvI" },
  { title: "Module 3 - Hours of Service", videoId: "-deVMu0kyik" },
];

// --- Get current module from URL (?module=1,2,3...) ---
function getModuleIndexFromURL() {
  const params = new URLSearchParams(window.location.search);
  const mod = params.get("module");
  const idx = parseInt(mod, 10) - 1;
  if (!isNaN(idx) && idx >= 0 && idx < modules.length) return idx;
  return 0; // default
}
const moduleIndex = getModuleIndexFromURL();
const currentModule = modules[moduleIndex];

// --- Inject Back button and update title ---
window.addEventListener("DOMContentLoaded", () => {
  const titleEl = document.getElementById("moduleTitle");
  if (titleEl) titleEl.textContent = currentModule.title;

  // Add a back button if not already there
  const card = titleEl.closest(".card") || document.body;
  const backBtn = document.createElement("a");
  backBtn.textContent = "← Back to Homepage";
  backBtn.href = "index.html";
  backBtn.className =
    "inline-block mb-4 text-blue-600 hover:underline font-semibold";
  card.prepend(backBtn);
});

// --- Called automatically when YouTube API is ready ---
function onYouTubeIframeAPIReady() {
  player = new YT.Player("trainingVideo", {
    videoId: currentModule.videoId,
    playerVars: { controls: 1, rel: 0, modestbranding: 1 },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
}

// --- Player ready handler ---
function onPlayerReady(event) {
  duration = player.getDuration();
  const btn = document.getElementById("completeBtn");
  btn.disabled = true;
  btn.classList.add("bg-gray-400");
}

// --- Handle video state changes ---
function onPlayerStateChange(event) {
  const btn = document.getElementById("completeBtn");

  if (event.data === YT.PlayerState.PLAYING) {
    if (!intervalId) {
      intervalId = setInterval(() => {
        const current = player.getCurrentTime();
        const newDuration = player.getDuration(); // ensure it updates
        if (newDuration > 0) duration = newDuration;

        // --- Prevent skipping ahead ---
        if (current - maxWatched > 2) {
          player.seekTo(maxWatched);
        } else {
          maxWatched = Math.max(maxWatched, current);
        }

        // --- Unlock when 98% complete ---
        if (maxWatched >= duration * 0.98 && duration > 0) {
          btn.disabled = false;
          btn.classList.remove("bg-gray-400");
          btn.classList.add("bg-green-600", "hover:bg-green-700");
          clearInterval(intervalId);
          intervalId = null;
        }
      }, 1000);
    }
  } else if (
    event.data === YT.PlayerState.PAUSED ||
    event.data === YT.PlayerState.ENDED
  ) {
    // stop timer when paused or ended
    clearInterval(intervalId);
    intervalId = null;
  }
}

// --- Mark module complete ---
function completeModule() {
  const now = new Date().toLocaleString();
  alert(`✅ ${currentModule.title} completed on ${now}`);
  // later we'll add Google Sheets logging here
}
