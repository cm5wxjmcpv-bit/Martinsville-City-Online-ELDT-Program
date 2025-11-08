// js/dashboard.js — modules list, checkmarks, Final Test unlock

const PROGRESS_API = 'https://script.google.com/macros/s/AKfycbznz6jjcSFq5RxRwLFVj5xn0ZU_VZEJLxyHJWzWU-vxOcjnryiRUBC7nvnFCcnL23K1Rg/exec';

// Edit your modules here
const MODULES = [
  { id: 'mod1', title: 'Module 1 — Test Video', videoId: '5C_0X6G4ytI' },
  { id: 'mod2', title: 'Module 2 — Example',    videoId: 'qZkkgkMLsvI' },
  { id: 'mod3', title: 'Module 3 — Example',    videoId: '-deVMu0kyik' }
];

function getStudentId() {
  return localStorage.getItem('studentId') || 'Unknown';
}

async function fetchProgress() {
  try {
    const id = encodeURIComponent(getStudentId());
    const res = await fetch(`${PROGRESS_API}?studentId=${id}`, { method: 'GET' });
    return await res.json(); // [{ timestamp, studentId, moduleId, status, score }]
  } catch (e) {
    console.error('Progress fetch failed:', e);
    return [];
  }
}

function hasCompleted(progress, moduleId) {
  return progress.some(r => String(r.moduleId) === String(moduleId) && String(r.status).toLowerCase() === 'completed');
}

async function render() {
  const list = document.getElementById('moduleList');
  if (!list) return;

  list.innerHTML = '';
  const progress = await fetchProgress();

  MODULES.forEach(m => {
    const done = hasCompleted(progress, m.id);
    const checkHTML = done
      ? '<span class="ml-2 inline-flex items-center text-green-600 font-semibold">✓</span>'
      : '<span class="ml-2 inline-flex items-center text-gray-400">○</span>';

    const a = document.createElement('a');
    a.href = `module.html?id=${encodeURIComponent(m.videoId)}&title=${encodeURIComponent(m.title)}&mid=${encodeURIComponent(m.id)}`;
    a.className = 'block p-4 rounded-lg border hover:shadow transition';
    a.innerHTML = `
      <div class="font-semibold text-gray-900">${m.title}${checkHTML}</div>
      <div class="text-sm text-gray-600 mt-1">${done ? 'Completed' : 'Not started'}</div>
    `;
    list.appendChild(a);
  });

  // Final Test tile
  const allDone = MODULES.every(m => hasCompleted(progress, m.id));
  const test = document.createElement('a');
  test.href = allDone ? 'test.html' : 'javascript:void(0)';
  test.className = `block p-4 rounded-lg border transition mt-2 ${allDone ? 'hover:shadow' : 'opacity-50 cursor-not-allowed'}`;
  test.innerHTML = `
    <div class="font-semibold text-gray-900">Final Test</div>
    <div class="text-sm text-gray-600 mt-1">${allDone ? 'Ready' : 'Complete all modules to unlock'}</div>
  `;
  list.appendChild(test);
}

render();
