window.Auth = (function(){
  function saveSession(token, username, display_name){
    localStorage.setItem('eldt_token', token);
    localStorage.setItem('eldt_user', username);
    localStorage.setItem('eldt_name', display_name||username);
  }
  function clear(){
    localStorage.removeItem('eldt_token');
    localStorage.removeItem('eldt_user');
    localStorage.removeItem('eldt_name');
  }
  function token(){ return localStorage.getItem('eldt_token'); }
  function user(){ return localStorage.getItem('eldt_user'); }
  function name(){ return localStorage.getItem('eldt_name'); }
  function requireAuth(){
    if(!token()) window.location.href = '/index.html';
  }
  function redirectIfAuthed(path){ if(token()) window.location.href = path; }
  function attachHeader(){
    const who = document.getElementById('who');
    if(who) who.textContent = name() ? `Hello, ${name()}` : '';
    const btn = document.getElementById('logoutBtn');
    if(btn) btn.onclick = () => { clear(); window.location.href = '/index.html'; };
  }
  return { saveSession, clear, token, user, name, requireAuth, redirectIfAuthed, attachHeader };
})();