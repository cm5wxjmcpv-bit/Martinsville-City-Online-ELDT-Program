// module.js

// Get the module ID from the page URL (e.g. module.html?id=1)
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// Map module IDs to YouTube embed links
const videoLinks = {
  1: "https://www.youtube.com/embed/-deVMu0kyik?feature=share",
  2: "https://www.youtube.com/embed/qZkkgkMLsvI?feature=share",
  3: "https://www.youtube.com/embed/5C_0X6G4ytI?feature=share"
};

// Friendly titles for logging and display
const titles = {
  1: "Vehicle Inspection",
  2: "Basic Control Skills",
  3: "On-Road Driving"
};

// Set the module title and video based on the module id
document.getElementById("moduleTitle").innerText = titles[id] || "Training Module";
document.getElementById("videoPlayer").src = videoLinks[id] || videoLinks[1];

// Your Google Apps Script Web App URL for logging
const scriptURL = "https://script.google.com/macros/s/AKfycbz4fAjnjqfybEBRVnFhQcnAnlOfyRUlYP5f34yZMUjaaSsBwRzPmaK6tfWFsB4kha-6/exec";

// Function to call when the student marks a module complete
function completeModule() {
  const studentId = localStorage.getItem("studentId") || "Unknown";
  const moduleName = titles[id] || "Unknown Module";
  
  const payload = {
    studentId: studentId,
    module: moduleName,
    status: "Completed",
    score: ""
  };

  // Send data to your Google Sheet
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

// Make the function globally accessible so your button can call it
window.completeModule = completeModule;
