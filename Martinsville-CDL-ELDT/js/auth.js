function login() {
  const id = document.getElementById("studentId").value.trim();
  const pw = document.getElementById("password").value.trim();

  // Temporary credentials; we'll replace with Google Sheets check later
  const students = {
    "1001": "test123",
    "1002": "driver123",
    "1003": "learner"
  };

  if (students[id] && students[id] === pw) {
    localStorage.setItem("studentId", id);
    window.location.href = "dashboard.html";
  } else {
    document.getElementById("error").classList.remove("hidden");
  }
}