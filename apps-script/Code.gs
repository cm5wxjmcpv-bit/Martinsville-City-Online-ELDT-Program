const CORS = {
  allow: function(){
    const r = HtmlService.createHtmlOutput('OK');
    r.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    return r;
  }
};

function doGet(){
  return ContentService.createTextOutput(JSON.stringify({ ok:true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e){
  try {
    const data = JSON.parse(e.postData.contents);
    const path = e.pathInfo || '';
    if(path === '/login') return json(login(data));
    if(path === '/modules') return json(guard(data.token, modulesList));
    if(path === '/completions') return json(guard(data.token, () => completionsFor(data.username)));
    if(path === '/logCompletion') return json(guard(data.token, () => logCompletion(data.username, data.module_id)));
    return json({ ok:false, error:'Unknown path' }, 404);
  } catch(err){
    return json({ ok:false, error: String(err) }, 500);
  }
}

function json(obj, code){
  const out = ContentService.createTextOutput(JSON.stringify(obj));
  out.setMimeType(ContentService.MimeType.JSON);
  return out;
}

function sheetByName(name){
  const ss = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SHEET_ID'));
  return ss.getSheetByName(name);
}

function login({ username, password }){
  const sh = sheetByName('Users');
  if(!sh) throw new Error('Users sheet missing');
  const values = sh.getDataRange().getValues();
  const headers = values.shift();
  const UIDX = headers.indexOf('username');
  const PIDX = headers.indexOf('password');
  const DNAME = headers.indexOf('display_name');
  const row = values.find(r => String(r[UIDX]).trim() === String(username).trim());
  if(!row) throw new Error('User not found');
  if(String(row[PIDX]) !== String(password)) throw new Error('Invalid password');
  const token = Utilities.getUuid();
  cacheToken(token, username);
  return { ok:true, token, username, display_name: row[DNAME] || username };
}

function cacheToken(token, username){
  const userCache = CacheService.getScriptCache();
  userCache.put(`t:${token}`, username, 60 * 60 * 6); // 6 hours
}

function guard(token, fn){
  if(!token) throw new Error('Missing token');
  const userCache = CacheService.getScriptCache();
  const u = userCache.get(`t:${token}`);
  if(!u) throw new Error('Invalid or expired session');
  return fn(u);
}

function modulesList(){
  const sh = sheetByName('Modules');
  if(!sh) throw new Error('Modules sheet missing');
  const values = sh.getDataRange().getValues();
  const headers = values.shift();
  const ID = headers.indexOf('id');
  const TITLE = headers.indexOf('title');
  const YT = headers.indexOf('youtube_id');
  const D = headers.indexOf('duration_hint_seconds');
  const items = values.filter(r=>r[ID]).map(r => ({
    id: String(r[ID]),
    title: String(r[TITLE]),
    youtube_id: String(r[YT]),
    duration_hint_seconds: Number(r[D]||0) || undefined
  }));
  return { ok:true, items };
}

function completionsFor(username){
  const sh = sheetByName('Completions');
  if(!sh) throw new Error('Completions sheet missing');
  const values = sh.getDataRange().getValues();
  const headers = values.shift();
  const U = headers.indexOf('username');
  const MID = headers.indexOf('module_id');
  const items = values.filter(r => String(r[U]) === String(username)).map(r => ({
    module_id: String(r[MID])
  }));
  return { ok:true, items };
}

function logCompletion(username, module_id){
  if(!username || !module_id) throw new Error('Bad input');
  const sh = sheetByName('Completions');
  if(!sh) throw new Error('Completions sheet missing');
  sh.appendRow([ new Date(), username, module_id, 'webapp' ]);
  return { ok:true };
}
