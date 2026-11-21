/* DevTools 面板逻辑
 * 关键点：chrome.devtools.inspectedWindow.eval() 不会 await Promise（它只返回同步可序列化的值），
 * 所以异步收集数据必须"发起 → 挂到页面全局变量 → 轮询取值"三步走。
 *
 * 所有面向用户的文案都走 i18n.js 的 t()，默认跟随浏览器语言，顶部下拉可手动切换并记住。
 */

const $ = (id) => document.getElementById(id);
const MAX_ROWS = 200; // 面板内单次最多渲染行数，避免超大表卡死

let records = [];
let DB_LIST = [];
let dbCount = -1;         // 最近一次读到的数据库数量，供切换语言时重刷顶栏计数
let curDb = '';
let curStore = '';
let lastSlice = [];      // 当前渲染出来的行（用于行级操作）
let detailCtx = null;    // 编辑上下文 { key, keyPath }

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------------- 同步 eval ---------------- */
const evalSync = (expr) => new Promise((resolve) => {
  chrome.devtools.inspectedWindow.eval(expr, (result, err) => {
    if (err) return resolve({ __err: err.value || err.description || String(err) });
    resolve(result);
  });
});

/* ---------------- 异步 eval（Promise → 轮询取值） ---------------- */
let seq = 0;
const evalAsync = async (promiseExpr, timeout = 8000) => {
  const slot = '__wb_idb_slot_' + Date.now() + '_' + (++seq);

  const kick = `(function(){
    window['${slot}'] = { done: false };
    Promise.resolve(${promiseExpr}).then(
      function(d){ window['${slot}'] = { done: true, data: d }; },
      function(e){ window['${slot}'] = { done: true, err: String((e && e.message) || e) }; }
    );
    return 'started';
  })()`;
  const started = await evalSync(kick);
  if (started && started.__err) return { err: t('errInjection', { err: started.__err }) };

  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 60));
    const raw = await evalSync(`(function(){
      var s = window['${slot}'];
      if (!s) return JSON.stringify({ missing: true });
      try { return JSON.stringify(s); } catch (e) { return JSON.stringify({ unserializable: String(e) }); }
    })()`);
    if (!raw || raw.__err) continue;
    let box;
    try { box = JSON.parse(raw); } catch { continue; }
    if (box.missing) return { err: t('errContextLost') };
    if (box.unserializable) return { err: t('errSerializable', { err: box.unserializable }) };
    if (!box.done) continue;
    evalSync(`try{delete window['${slot}']}catch(e){}`);
    return box.err ? { err: box.err } : { data: box.data };
  }
  evalSync(`try{delete window['${slot}']}catch(e){}`);
  return { err: t('errTimeout') };
};

/* ---------------- 页面内执行的收集代码 ---------------- */
// 深层嵌套占位串随语言变化，用 JSON.stringify 安全内联
const DEEP = JSON.stringify(t('deepNested'));

const P_COLLECT_DBS = `(async function(){
  if (!indexedDB.databases) return { err: 'indexedDB.databases() is not available in this context' };
  var dbs = await indexedDB.databases();
  var out = [];
  for (var i = 0; i < dbs.length; i++) {
    var d = dbs[i];
    var db = await new Promise(function(res){ var q = indexedDB.open(d.name); q.onsuccess = function(){ res(q.result); }; q.onerror = function(){ res(null); }; });
    if (!db) continue;
    var stores = Array.prototype.slice.call(db.objectStoreNames);
    db.close();
    out.push({ name: d.name, version: d.version, stores: stores });
  }
  return out;
})()`;

// 收集一个 store 的记录；额外返回 keyPath（编辑写回时需要判断主键形式）
const pCollectRecords = (dbName, storeName) => `(async function(){
  function norm(v, depth){
    depth = depth || 0;
    if (v === null || v === undefined) return v;
    if (v instanceof Date) return { __t: 'date', v: v.toISOString() };
    if (typeof Blob !== 'undefined' && v instanceof Blob) return { __t: 'blob', v: (v.type || 'blob') + ' ' + v.size + 'B' };
    if (typeof ArrayBuffer !== 'undefined' && (v instanceof ArrayBuffer || ArrayBuffer.isView(v))) {
      var n = v.byteLength !== undefined ? v.byteLength : v.length;
      return { __t: 'buffer', v: n + ' bytes' };
    }
    if (typeof v === 'function') return '[Function]';
    if (typeof v === 'object') {
      if (depth > 4) return ${DEEP};
      if (Array.isArray(v)) return v.slice(0, 200).map(function(x){ return norm(x, depth + 1); });
      var o = {}; var ks = Object.keys(v);
      for (var i = 0; i < ks.length; i++) o[ks[i]] = norm(v[ks[i]], depth + 1);
      return o;
    }
    return v;
  }
  var db = await new Promise(function(res, rej){ var q = indexedDB.open(${JSON.stringify(dbName)}); q.onsuccess = function(){ res(q.result); }; q.onerror = function(){ rej(q.error); }; });
  var stores = Array.prototype.slice.call(db.objectStoreNames);
  if (stores.indexOf(${JSON.stringify(storeName)}) === -1) { db.close(); return { rows: [], total: 0, keyPath: null }; }
  var tx = db.transaction(${JSON.stringify(storeName)}, 'readonly');
  var os = tx.objectStore(${JSON.stringify(storeName)});
  var keyPath = os.keyPath;
  var allReq = os.getAll(), keyReq = os.getAllKeys();
  var got = await new Promise(function(res){
    tx.oncomplete = function(){ res({ v: allReq.result, k: keyReq.result }); };
    tx.onerror = function(){ res(null); };
    tx.onabort = function(){ res(null); };
  });
  db.close();
  if (!got) return { rows: [], total: 0, keyPath: keyPath === null ? null : (Array.isArray(keyPath) ? keyPath : String(keyPath)) };
  var out = [];
  for (var i = 0; i < got.v.length; i++) out.push({ key: norm(got.k[i]), value: norm(got.v[i]) });
  return { rows: out, total: out.length, keyPath: keyPath === null ? null : (Array.isArray(keyPath) ? keyPath : String(keyPath)) };
})()`;

// 编辑写回：valueText 是面板 textarea 里的 JSON 字符串，keyNorm 是归一化后的主键
const pPutRecord = (dbName, storeName, keyPath, keyNorm, valueText) => `(async function(){
  var val = JSON.parse(${JSON.stringify(valueText)});
  function revive(v, depth){
    depth = depth || 0;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      if (v.__t === 'date') return new Date(v.v);
      if (v.__t === 'blob') return { __blobLost: true, info: v.v };
      if (v.__t === 'buffer') return { __bufferLost: true, info: v.v };
      if (depth < 6) { var o = {}; for (var k in v) o[k] = revive(v[k], depth + 1); return o; }
    }
    if (Array.isArray(v) && depth < 6) return v.map(function(x){ return revive(x, depth + 1); });
    return v;
  }
  var db = await new Promise(function(res, rej){ var q = indexedDB.open(${JSON.stringify(dbName)}); q.onsuccess = function(){ res(q.result); }; q.onerror = function(){ rej(q.error); }; });
  var tx = db.transaction(${JSON.stringify(storeName)}, 'readwrite');
  var os = tx.objectStore(${JSON.stringify(storeName)});
  var kp = os.keyPath;
  var req;
  if (kp === null || kp === undefined) {
    // 外置主键：显式传入 key
    var keyJson = ${JSON.stringify(JSON.stringify(keyNorm))};
    req = os.put(val, revive(JSON.parse(keyJson), 0));
  } else {
    // 内联主键：key 在 value 里
    req = os.put(val);
  }
  await new Promise(function(res, rej){ req.onsuccess = res; req.onerror = function(){ rej(req.error); }; });
  db.close();
  return 'ok';
})()`;

// 导出整库：所有 store 的原始记录（Date 自动转 ISO 字符串；Blob/二进制无法跨 JSON 传输，导出为占位对象）
const pExportDb = (dbName, stores) => `(async function(){
  function norm(v, depth){
    depth = depth || 0;
    if (v === null || v === undefined) return v;
    if (v instanceof Date) return { __t: 'date', v: v.toISOString() };
    if (typeof Blob !== 'undefined' && v instanceof Blob) return { __t: 'blob', v: (v.type || 'blob') + ' ' + v.size + 'B' };
    if (typeof ArrayBuffer !== 'undefined' && (v instanceof ArrayBuffer || ArrayBuffer.isView(v))) {
      var n = v.byteLength !== undefined ? v.byteLength : v.length;
      return { __t: 'buffer', v: n + ' bytes' };
    }
    if (typeof v === 'function') return '[Function]';
    if (typeof v === 'object') {
      if (depth > 4) return ${DEEP};
      if (Array.isArray(v)) return v.slice(0, 200).map(function(x){ return norm(x, depth + 1); });
      var o = {}; var ks = Object.keys(v);
      for (var i = 0; i < ks.length; i++) o[ks[i]] = norm(v[ks[i]], depth + 1);
      return o;
    }
    return v;
  }
  var out = { database: ${JSON.stringify(dbName)}, exportedAt: new Date().toISOString(), stores: {} };
  var names = ${JSON.stringify(stores)};
  for (var s = 0; s < names.length; s++) {
    var name = names[s];
    var db = await new Promise(function(res, rej){ var q = indexedDB.open(${JSON.stringify(dbName)}); q.onsuccess = function(){ res(q.result); }; q.onerror = function(){ rej(q.error); }; });
    var tx = db.transaction(name, 'readonly');
    var os = tx.objectStore(name);
    var allReq = os.getAll(), keyReq = os.getAllKeys();
    var got = await new Promise(function(res){ tx.oncomplete = function(){ res({ v: allReq.result, k: keyReq.result }); }; tx.onerror = function(){ res(null); }; tx.onabort = function(){ res(null); }; });
    db.close();
    var rows = [];
    if (got) for (var i = 0; i < got.v.length; i++) rows.push({ key: norm(got.k[i]), value: norm(got.v[i]) });
    out.stores[name] = rows;
  }
  return out;
})()`;

/* ---------------- 剪贴板 / 下载 / 提示 ---------------- */
const toast = (msg) => {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el.__t);
  el.__t = setTimeout(() => el.classList.remove('show'), 1600);
};

const copyText = async (t_) => {
  try {
    await navigator.clipboard.writeText(t_);
    toast(t('copied'));
  } catch {
    const ta = document.createElement('textarea');
    ta.value = t_;
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    toast(ok ? t('copied') : t('copyFailed'));
  }
};

const download = (name, text) => {
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast(t('exported', { name }));
};

const safeName = (s) => String(s).replace(/[^\w.-]+/g, '_').slice(0, 60) || 'data';

/* ---------------- UI：加载 ---------------- */
// 读不到数据时要把上一份记录也丢掉，否则切语言/切目标页后 render() 会画出过期数据
const clearRecords = () => {
  records = [];
  lastSlice = [];
  curDb = '';
  curStore = '';
  curKeyPath = null;
  $('cnt').textContent = '';
};

const loadDbs = async () => {
  $('body').innerHTML = `<div class="empty">${esc(t('reading'))}</div>`;
  showInfo('');
  const [origin, res] = await Promise.all([
    evalSync('location.origin'),
    evalAsync(P_COLLECT_DBS),
  ]);
  const originText = typeof origin === 'string' ? origin : t('unknown');
  $('origin').textContent = originText;

  if (res.err) {
    DB_LIST = []; dbCount = 0;
    clearRecords();
    $('db').innerHTML = `<option>${esc(t('readFailedOption'))}</option>`;
    $('store').innerHTML = '<option>—</option>';
    $('body').innerHTML = `<div class="empty">${esc(t('readFailed', { err: res.err }))}<br><br>${esc(t('readFailedHint'))}</div>`;
    return;
  }

  const dbs = Array.isArray(res.data) ? res.data : [];
  DB_LIST = dbs;
  dbCount = dbs.length;
  showInfo(t('dbCount', { n: dbs.length }));

  if (!dbs.length) {
    clearRecords();
    $('db').innerHTML = `<option>${esc(t('noDbOption'))}</option>`;
    $('store').innerHTML = '<option>—</option>';
    $('body').innerHTML = `<div class="empty">${esc(t('noDbMsg', { origin: originText }))}<br><br>
      ${esc(t('noDbReasonsTitle'))}<br>
      ${t('noDbReasons').map((r, i) => `${i + 1}. ${esc(r)}`).join('<br>\n      ')}</div>`;
    return;
  }
  $('db').innerHTML = dbs.map((d) => `<option value="${esc(d.name)}">${esc(t('dbOption', { name: d.name, version: d.version }))}</option>`).join('');
  loadStores(dbs[0]);
};

let curKeyPath = null;
const loadStores = (dbInfo) => {
  if (!dbInfo.stores.length) {
    clearRecords();
    $('store').innerHTML = `<option>${esc(t('noStoreOption'))}</option>`;
    $('body').innerHTML = `<div class="empty">${esc(t('noStoreMsg'))}</div>`;
    return;
  }
  $('store').innerHTML = dbInfo.stores.map((n) => `<option value="${esc(n)}">${esc(n)}</option>`).join('');
  loadRecords(dbInfo.name, dbInfo.stores[0]);
};

const loadRecords = async (dbName, storeName) => {
  curDb = dbName;
  curStore = storeName;
  curKeyPath = null;
  $('body').innerHTML = `<div class="empty">${esc(t('loadingStore', { name: storeName }))}</div>`;
  const res = await evalAsync(pCollectRecords(dbName, storeName), 15000);
  if (res.err) {
    clearRecords();
    $('body').innerHTML = `<div class="empty">${esc(t('loadStoreFailed', { err: res.err }))}</div>`;
    return;
  }
  records = (res.data && res.data.rows) || [];
  curKeyPath = (res.data && res.data.keyPath) || null;
  render();
};

/* ---------------- UI：渲染 ---------------- */
const fieldsOf = (r) => {
  const out = { __key__: r.key };
  const v = r.value && r.value.__t ? r.value.v : r.value;
  if (v && typeof v === 'object' && !Array.isArray(v)) Object.assign(out, v);
  else out.__value__ = v;
  return out;
};

const toText = (val) => {
  if (val && typeof val === 'object' && val.__t) return String(val.v);
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') { try { return JSON.stringify(val); } catch { return t('objectPlaceholder'); } }
  return String(val);
};

const render = () => {
  const kw = $('q').value.trim().toLowerCase();
  let list = records;
  if (kw) list = records.filter((r) => {
    const f = fieldsOf(r);
    return Object.entries(f).some(([k, v]) => String(k).toLowerCase().includes(kw) || toText(v).toLowerCase().includes(kw));
  });
  const slice = list.slice(0, MAX_ROWS);
  lastSlice = slice;
  $('cnt').textContent = list.length === records.length
    ? t('rowsAll', { n: records.length })
    : t('rowsFiltered', { shown: list.length, total: records.length });

  const body = $('body');
  if (!slice.length) { body.innerHTML = `<div class="empty">${esc(t('noMatch'))}</div>`; return; }

  const fieldSet = [];
  slice.slice(0, 50).forEach((r) => Object.keys(fieldsOf(r)).forEach((f) => { if (!fieldSet.includes(f)) fieldSet.push(f); }));
  const fields = fieldSet.slice(0, 15);

  body.innerHTML = `<table><thead><tr><th>${esc(t('colActions'))}</th>${fields.map((f) => `<th>${esc(f)}</th>`).join('')}</tr></thead><tbody>${
    slice.map((r, idx) => {
      const f = fieldsOf(r);
      return `<tr><td class="act"><a data-op="copy" data-idx="${idx}">${esc(t('actCopy'))}</a><a data-op="edit" data-idx="${idx}">${esc(t('actEdit'))}</a><a data-op="export" data-idx="${idx}">${esc(t('actExport'))}</a></td>${
        fields.map((fd) => {
          const tx = toText(f[fd]);
          return `<td class="cell ${fd === '__key__' ? 'key' : ''}" title="${esc(tx.slice(0, 300))}" data-full="${esc(tx)}">${esc(tx)}</td>`;
        }).join('')
      }</tr>`;
    }).join('')
  }</tbody></table>${list.length > MAX_ROWS ? `<div class="empty">${esc(t('truncated', { max: MAX_ROWS, total: list.length }))}</div>` : ''}`;
};

/* 行级操作 / 单元格查看 —— 事件委托 */
$('body').addEventListener('click', (e) => {
  const a = e.target.closest('a[data-op]');
  if (a) {
    const r = lastSlice[+a.dataset.idx];
    if (!r) return;
    const json = JSON.stringify(r.value, null, 2);
    const keyText = toText(r.key) || String(r.key);
    if (a.dataset.op === 'copy') return copyText(json);
    if (a.dataset.op === 'export') return download(`${safeName(curStore)}_${safeName(keyText)}.json`, json);
    // 标题走 textContent，不能再 esc()，否则 key 里的 & < > 会被二次转义
    if (a.dataset.op === 'edit') return openDetail(r.value, t('editTitle', { store: curStore, key: keyText }), { key: r.key }, true);
    return;
  }
  const td = e.target.closest('td.cell');
  if (td) {
    const raw = td.dataset.full;
    let pretty = raw;
    try { pretty = JSON.stringify(JSON.parse(raw), null, 2); } catch { }
    openDetailText(pretty, t('detailReadonly'));
  }
});

/* ---------------- 详情弹窗：查看 / 编辑 / 复制 / 保存 ---------------- */
const openDetailText = (text, title) => {
  detailCtx = null;
  $('detail-title').textContent = title;
  $('detail-pre').value = text;
  $('detail-pre').readOnly = true;
  $('detail-save').style.display = 'none';
  $('detail').style.display = 'flex';
};

const openDetail = (value, title, ctx, editable) => {
  detailCtx = ctx || null;
  let text;
  try { text = JSON.stringify(value, null, 2); } catch { text = toText(value); }
  $('detail-title').textContent = title;
  $('detail-pre').value = text;
  $('detail-pre').readOnly = !editable;
  $('detail-save').style.display = editable ? '' : 'none';
  $('detail').style.display = 'flex';
};

$('detail-copy').addEventListener('click', () => copyText($('detail-pre').value));

$('detail-save').addEventListener('click', async () => {
  if (!detailCtx) return;
  const text = $('detail-pre').value;
  try { JSON.parse(text); } catch (e) {
    toast(t('invalidJson', { err: e.message }));
    return;
  }
  $('detail-save').disabled = true;
  $('detail-save').textContent = t('saving');
  const res = await evalAsync(pPutRecord(curDb, curStore, curKeyPath, detailCtx.key, text), 10000);
  $('detail-save').disabled = false;
  $('detail-save').textContent = t('save');
  if (res.err) { toast(t('savingFailed', { err: res.err })); return; }
  toast(t('savedBack'));
  $('detail').style.display = 'none';
  loadRecords(curDb, curStore);
});

$('detail-close').addEventListener('click', () => { $('detail').style.display = 'none'; });
$('detail').addEventListener('click', (e) => { if (e.target.id === 'detail') $('detail').style.display = 'none'; });

/* ---------------- 库 / 表级导出 ---------------- */
$('export-store').addEventListener('click', async () => {
  if (!records.length) { toast(t('noRecordsToExport')); return; }
  const out = { database: curDb, store: curStore, exportedAt: new Date().toISOString(), count: records.length, records };
  download(`${safeName(curDb)}_${safeName(curStore)}.json`, JSON.stringify(out, null, 2));
});

$('export-db').addEventListener('click', async () => {
  const dbInfo = DB_LIST.find((d) => d.name === curDb);
  if (!dbInfo || !dbInfo.stores.length) { toast(t('noStoresToExport')); return; }
  toast(t('exportingDb'));
  const res = await evalAsync(pExportDb(dbInfo.name, dbInfo.stores), 30000);
  if (res.err) { toast(t('exportFailed', { err: res.err })); return; }
  download(`${safeName(dbInfo.name)}.json`, JSON.stringify(res.data, null, 2));
});

/* ---------------- 顶部控件 ---------------- */
const showInfo = (msg) => {
  const el = $('info');
  el.textContent = msg;
  el.style.display = msg ? 'inline' : 'none';
};

/* ---------------- 语言切换 ---------------- */
// 把 HTML 里写死的中文/英文文案换成当前语言；工具栏静态标签与弹窗按钮都在这儿
const applyLang = () => {
  const ro = document.documentElement;
  ro.lang = LANG === 'zh' ? 'zh-CN' : 'en';

  $('q').placeholder = t('searchPlaceholder');
  $('export-store').textContent = t('exportStore');
  $('export-store').title = t('exportStoreTitle');
  $('export-db').textContent = t('exportDb');
  $('export-db').title = t('exportDbTitle');
  $('refresh').textContent = t('refresh');
  $('origin-label').textContent = t('originLabel');
  $('detail-title').textContent = t('detailTitle');
  $('detail-copy').textContent = t('copy');
  $('detail-save').textContent = t('save');
  $('detail-close').textContent = t('close');

  const sel = $('lang');
  sel.title = t('langTitle');
  sel.innerHTML = '<option value="zh">中文</option><option value="en">English</option>';
  sel.value = LANG;

  // 已读到的数据库数量也要用新语言重写
  if (dbCount >= 0) showInfo(t('dbCount', { n: dbCount }));

  // 数据库下拉里的「（v1）」跟着语言变；正被选中的值保持不变
  if (DB_LIST.length) {
    const keep = $('db').value;
    $('db').innerHTML = DB_LIST.map((d) => `<option value="${esc(d.name)}">${esc(t('dbOption', { name: d.name, version: d.version }))}</option>`).join('');
    $('db').value = keep;
  }
};

// 语言变了：静态文案换掉，表格按新语言重渲染（有数据时不需要重新读取）
$('lang').addEventListener('change', (e) => {
  setLang(e.target.value);
  applyLang();
  if (records.length) render();
  else if (DB_LIST.length && curStore) loadRecords(curDb, curStore); // 空表/空态提示也要换语言
  else loadDbs();
});

$('db').addEventListener('change', (e) => {
  const d = DB_LIST.find((x) => x.name === e.target.value);
  if (d) loadStores(d);
});
$('store').addEventListener('change', (e) => loadRecords(curDb, e.target.value));
$('refresh').addEventListener('click', loadDbs);
$('q').addEventListener('input', render);

applyLang();
$('body').innerHTML = `<div class="empty">${esc(t('loading'))}</div>`;
loadDbs();
