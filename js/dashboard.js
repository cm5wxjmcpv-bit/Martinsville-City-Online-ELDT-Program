document.addEventListener("DOMContentLoaded", () => {
  const modules = [
    { id: 1, title: "Vehicle Inspection", link: "module.html?id=1" },
    { id: 2, title: "Basic Control Skills", link: "module.html?id=2" },
    { id: 3, title: "On-Road Driving", link: "module.html?id=3" },
  ];

  const container = document.getElementById("moduleList");
  modules.forEach((m) => {
    const div = document.createElement("div");
    div.className = "bg-white p-4 rounded-lg shadow-md text-center hover:bg-red-50";
    div.innerHTML = `
      <h2 class="font-semibold mb-2 text-gray-800">${m.title}</h2>
      <a href="${m.link}" class="text-red-700 font-medium underline">Start Module</a>
    `;
    container.appendChild(div);
  });
});