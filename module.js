let player;
let duration = 0;
let lastAllowed = 0;
let blockSeek = false;
let faded = false;
let endFadeSeconds = 4;
const qs = new URLSearchParams(location.search);
const videoId = qs.get("id");
const moduleTitle = qs.get("title") || "Module";
const student = localStorage.getItem("mfd_student_name") || "Student";
const titleEl = document.getElementById("moduleTitle");
const studentLabel = document.getElementById("studentLabel");
const statusEl = document.getElementById("status");
const markBtn = document.getElementById("markComplete");
const fadeOverlay = document.getElementById("fadeOverlay");
if (titleEl) titleEl.textContent = moduleTitle;
if (studentLabel) studentLabel.textContent = `Signed in as: ${student}`;
window.onYouTubeIframeAPIReady = function () {
  player = new YT.Player("player", {
    videoId,
    width: "100%",
    height: "100%",
    playerVars: { controls: 1, disablekb: 1, modestbranding: 1, rel: 0, fs: 0, iv_load_policy: 3 },
    events: { onReady: onPlayerReady, onStateChange: onPlayerStateChange }
  });
};
function onPlayerReady() {
  duration = Math.floor(player.getDuration() || 0);
  lastAllowed = 0; blockSeek = false; faded = false;
  if (statusEl) statusEl.textContent = "Playing… stay with the video.";
  watchLoop();
}
function onPlayerStateChange(e) {
  if (e.data === YT.PlayerState.ENDED) allowComplete();
}
function watchLoop() {
  if (!player || typeof player.getCurrentTime !== "function") return;
  const now = player.getCurrentTime() || 0;
  if (!blockSeek && now > lastAllowed) lastAllowed = now;
  if (!faded && duration > 0 && now >= Math.max(0, duration - endFadeSeconds)) {
    faded = true; if (fadeOverlay) fadeOverlay.style.opacity = "1";
  }
  const tolerance = 1.0;
  if (now > lastAllowed + tolerance) {
    blockSeek = true;
    player.seekTo(Math.max(0, lastAllowed - 0.25), true);
    setTimeout(() => (blockSeek = false), 200);
  }
  requestAnimationFrame(watchLoop);
}
function allowComplete() {
  if (markBtn) {
    markBtn.disabled = false;
    if (statusEl) statusEl.textContent = "Nice work! You may mark this module complete.";
  }
}
markBtn?.addEventListener("click", () => {
  markBtn.disabled = true;
  const completions = JSON.parse(localStorage.getItem("mfd_completions") || "[]");
  completions.push({ student, title: moduleTitle, videoId, completedAt: new Date().toISOString() });
  localStorage.setItem("mfd_completions", JSON.stringify(completions));
  if (statusEl) statusEl.textContent = "Completion saved. Return to Dashboard.";
});