// module.js — Anti-skip + Smooth Fade + Completion Logic

let player;
let lastTime = 0;
let fadeStarted = false;
let completed = false;

function onYouTubeIframeAPIReady() {
  const params = new URLSearchParams(window.location.search);
  const videoId = params.get("id") || "dQw4w9WgXcQ"; // default fallback

  player = new YT.Player("player", {
    videoId: videoId,
    playerVars: {
      rel: 0,
      controls: 1,
      disablekb: 1,
      modestbranding: 1,
      fs: 0,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
}

function onPlayerReady() {
  const overlay = document.createElement("div");
  overlay.id = "fadeOverlay";
  overlay.style.position = "absolute";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "black";
  overlay.style.opacity = 0;
  overlay.style.transition = "opacity 1.5s ease";
  overlay.style.pointerEvents = "none";
  document.getElementById("player").appendChild(overlay);

  // Watch progress every 500ms
  setInterval(() => {
    if (player && player.getCurrentTime) {
      const currentTime = player.getCurrentTime();
      const duration = player.getDuration();

      // Block skipping ahead
      if (currentTime - lastTime > 2) {
        player.seekTo(lastTime);
      } else {
        lastTime = currentTime;
      }

      // Trigger fade-out near the end
      if (!fadeStarted && duration - currentTime <= 3) {
        fadeStarted = true;
        overlay.style.opacity = 1;
      }

      // Mark video complete
      if (!completed && duration - currentTime <= 0.5) {
        completed = true;
        document.getElementById("completeBtn").style.display = "inline-block";
      }
    }
  }, 500);
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    player.unMute();
  }
}

function completeModule() {
  alert("✅ Module completed! Returning to dashboard.");
  window.location.href = "dashboard.html";
}
