// List of modules (id, title, YouTube video id)
const MODULES = [
  { id: "pretrip_a", title: "Pre-Trip A (Class A)", yt: "dQw4w9WgXcQ" },
  { id: "pretrip_b", title: "Pre-Trip B (Class B)", yt: "2vjPBrBU-TM" },
  { id: "brake_test", title: "Air Brake Test", yt: "E7wJTI-1dvQ" },
];

function renderModules() {
  const el = document.getElementById("moduleList");
  if (!el) return;
  el.innerHTML = "";
  MODULES.forEach(m => {
    const a = document.createElement("a");
    a.href = `module.html?moduleId=${encodeURIComponent(m.id)}&title=${encodeURIComponent(m.title)}&yt=${encodeURIComponent(m.yt)}`;
    a.className = "block border rounded-lg p-4 hover:shadow-sm";
    a.innerHTML = `<div class="font-semibold mb-1">${m.title}</div><div class="text-sm text-gray-600">Watch to complete</div>`;
    el.appendChild(a);
  });
}
renderModules();
