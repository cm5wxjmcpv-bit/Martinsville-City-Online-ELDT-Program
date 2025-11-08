window.API = (function(){
  const base = () => window.APP_CONFIG.WEB_APP_URL.replace(/\/$/, '');
  async function jpost(path, payload){
    const res = await fetch(base()+path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if(!res.ok){
      const t = await res.text();
      throw new Error(t || `HTTP ${res.status}`);
    }
    return res.json();
  }
  return {
    login: (u,p) => jpost('/login', { username:u, password:p }),
    modules: (token) => jpost('/modules', { token }),
    completionsFor: (token, username) => jpost('/completions', { token, username }),
    logCompletion: (token, username, module_id) => jpost('/logCompletion', { token, username, module_id }),
  };
})();