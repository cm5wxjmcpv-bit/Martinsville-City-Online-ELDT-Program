// --- Load YouTube API dynamically ---
let tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
let firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// --- Variables ---
let player;
let maxWatched = 0;
let duration = 0;
const modules = [
  { title: "Module 1", videoId: "5C_0X6G4ytI" },
  { title: "Module 2", videoId: "qZkkgkMLsvI" },
  { title: "Module 3", videoId: "-deVMu0kyik" },
];

// Determine which module to load (default to first)
function getModuleIndexFromURL() {
  const params = new URLSearchParams(window.location.search);
  const mod = params.get('module');
  if (mod !== null) {
    const idx = parseInt(mod, 10) - 1;
    if (!isNaN(idx) && idx >= 0 && idx < modules.length) {
      return idx;
    }
  }
  return 0; // default
}

const moduleIndex = getModuleIndexFromURL();
const currentModule = modules[moduleIndex];

// --- Called when YouTube API is ready ---
function onYouTubeIframeAPIReady() {
  const iframe = document.getElementById('trainingVideo');
  
  // Set iframe src to correct video
  iframe.src = `https://www.youtube.com/embed/${currentModule.videoId}?enablejsapi=1&controls=1`;

  player = new YT.Player('trainingVideo', {
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

// --- When player is ready ---
function onPlayerReady(event) {
  duration = player.getDuration();
  
  // Set module title if you have an element
  const titleEl = document.getElementById('moduleTitle');
  if (titleEl) titleEl.textContent = currentModule.title;

  const btn = document.getElementById('completeBtn');
  if (btn) {
    btn.disabled = true;
    btn.classList.add('bg-gray-400');
  }
}

// --- Prevent skipping ahead + unlock complete ---
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    const timer = setInterval(() => {
      const current = player.getCurrentTime();

      // Prevent jumping ahead
      if (current - maxWatched > 2) {
        player.seekTo(maxWatched);
      } else {
        maxWatched = Math.max(maxWatched, current);
      }

      // Unlock “Mark Complete” when nearly done
      if (maxWatched >= duration * 0.98) {
        const btn = document.getElementById('completeBtn');
        if (btn) {
          btn.disabled = false;
          btn.classList.remove('bg-gray-400');
          btn.classList.add('bg-green-600', 'hover:bg-green-700');
        }
        clearInterval(timer);
      }
    }, 1000);
  }
}

// --- Called when user clicks complete ---
function completeModule() {
  // You can expand this (e.g. send data to server or Google Sheets)
  alert(`✅ You’ve completed: ${currentModule.title}`);
}
