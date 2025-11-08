document.addEventListener('DOMContentLoaded', () => {
  const student = localStorage.getItem('mfd_student_name') || 'Student';
  // Build three test modules that all use the same video ID
  const MODULES = [
    { id: '6DSvlh-zHu4', title: 'Module 1 — Test Video' },
    { id: '6DSvlh-zHu4', title: 'Module 2 — Test Video' },
    { id: '6DSvlh-zHu4', title: 'Module 3 — Test Video' },
  ];
  const list = document.getElementById('moduleList');
  MODULES.forEach((m) => {
    const card = document.createElement('div');
    card.className = 'p-4 border rounded-lg bg-white shadow-sm';
    card.innerHTML = `
      <h3 class="font-semibold text-gray-900">${m.title}</h3>
      <p class="text-sm text-gray-600">Video ID: ${m.id}</p>
      <a class="btn inline-block mt-2" href="module.html?id=${encodeURIComponent(m.id)}&title=${encodeURIComponent(m.title)}">Start Module</a>
    `;
    list.appendChild(card);
  });
});