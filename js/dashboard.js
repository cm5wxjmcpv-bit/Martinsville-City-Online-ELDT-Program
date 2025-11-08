Auth.requireAuth();
Auth.attachHeader();

(async function(){
  const listEl = document.getElementById('moduleList');
  const token = Auth.token();
  const me = Auth.user();
  try {
    const [mods, comps] = await Promise.all([
      API.modules(token),
      API.completionsFor(token, me)
    ]);
    const done = new Set((comps.items||[]).map(r=>r.module_id));
    listEl.innerHTML = '';
    (mods.items||[]).forEach(m => {
      const tile = document.createElement('div');
      tile.className = 'tile';
      const h = document.createElement('h3'); h.textContent = m.title; tile.appendChild(h);
      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = done.has(m.id) ? 'Completed' : 'Not started';
      tile.appendChild(badge);
      const btn = document.createElement('button');
      btn.textContent = 'Open';
      btn.onclick = () => window.location.href = `/module.html?id=${encodeURIComponent(m.id)}`;
      tile.appendChild(btn);
      listEl.appendChild(tile);
    });
  } catch(err){
    listEl.innerHTML = `<div class="card">${err.message}</div>`;
  }
})();