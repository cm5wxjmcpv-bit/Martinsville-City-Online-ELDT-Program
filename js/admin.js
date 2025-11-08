document.addEventListener('DOMContentLoaded', () => {
  const body = document.getElementById('adminBody');
  const clearBtn = document.getElementById('clearAll');
  const rows = JSON.parse(localStorage.getItem('mfd_completions') || '[]');

  body.innerHTML = '';
  if (rows.length === 0) {
    body.innerHTML = '<tr><td colspan="4" class="text-gray-500 py-4">No local completion data.</td></tr>';
  } else {
    rows.sort((a,b)=> (b.completedAt||'').localeCompare(a.completedAt||''))
      .forEach(r => {
        const tr = document.createElement('tr');
        tr.className = 'border-b';
        tr.innerHTML = `<td class="py-2">${r.student||'-'}</td>
                        <td class="py-2">${r.title||'-'}</td>
                        <td class="py-2">${r.videoId||'-'}</td>
                        <td class="py-2">${r.completedAt?new Date(r.completedAt).toLocaleString():'-'}</td>`;
        body.appendChild(tr);
      });
  }

  clearBtn.addEventListener('click', () => {
    if (confirm('This clears local completion data stored in this browser only. Continue?')) {
      localStorage.removeItem('mfd_completions'); location.reload();
    }
  });
});