const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const titles = {
  1: "Vehicle Inspection",
  2: "Basic Control Skills",
  3: "On-Road Driving"
};

document.getElementById("moduleTitle").innerText = titles[id] || "Training Module";

// Replace with your real YouTube video links if desired
const placeholder = "https://www.youtube.com/embed/dQw4w9WgXcQ";
document.getElementById("videoPlayer").src = placeholder;

// 🔗 Replace with your own Apps Script Web App URL
const scriptURL = "https://script.google.com/macros/s/AKfycbzTygqxIMidgXjitFwwtn6QPxT1Vm8MJ_8zJ182oGvDBxC0_MipCOlCp4jalVmFILm9nA/exec";

// Send completion data to Google Sheets
function completeModule() {
  const studentId = localStorage.getItem("studentId") || "Unknown";
  const moduleName = titles[id] || "Unknown Module";
  const payload = {
    studentId: studentId,
    module: moduleName,
    status: "Completed",
    score: ""
  };

  fetch(scriptURL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  alert("Module logged to training record!");
  window.location.href = "dashboard.html";
}

window.completeModule = completeModule;
