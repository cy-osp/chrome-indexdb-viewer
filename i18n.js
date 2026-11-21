/* 面板文案国际化
 *
 * 为什么不用 chrome.i18n：chrome.i18n.getMessage() 只暴露「当前浏览器语言」对应的那
 * 一套消息，运行时没法切到另一种语言。而这个面板需要「自动跟随浏览器语言 + 顶部下拉
 * 手动切换」，所以自带中英两份字典。
 *
 * manifest 的 name / description 和 DevTools 面板标题仍然走 chrome.i18n，
 * 见 _locales/{en,zh_CN}/messages.json —— 那几项由 Chrome 自己按浏览器语言取。
 */

const I18N_KEY = 'idb_panel_lang';

const I18N = {
  zh: {
    /* 顶栏 */
    searchPlaceholder: '搜索全部字段…',
    exportStore: '导出表',
    exportStoreTitle: '导出当前表全部记录为 JSON',
    exportDb: '导出库',
    exportDbTitle: '导出整个数据库（全部表）为 JSON',
    refresh: '刷新',
    langTitle: '面板语言',
    originLabel: '源：',

    /* 详情弹窗 */
    detailTitle: '完整值',
    detailReadonly: '完整值（只读）',
    copy: '复制',
    save: '保存',
    saving: '保存中…',
    close: '关闭',
    editTitle: ({ store, key }) => `编辑 · ${store} · key=${key}`,

    /* 状态 / 提示 */
    loading: '加载中…',
    reading: '读取中…',
    loadingStore: ({ name }) => `加载 ${name} …`,
    unknown: '(未知)',
    copied: '已复制到剪贴板',
    copyFailed: '复制失败',
    exported: ({ name }) => `已导出 ${name}`,
    savedBack: '已写回 IndexedDB',
    savingFailed: ({ err }) => `保存失败：${err}`,
    invalidJson: ({ err }) => `不是合法的 JSON：${err}`,

    /* 读取失败 */
    readFailedOption: '（读取失败）',
    readFailed: ({ err }) => `读取失败：${err}`,
    readFailedHint: '请确认：DevTools 顶部选中的是页面本身的 frame；页面已加载完成；没有被 CSP 阻止。',
    loadStoreFailed: ({ err }) => `读取 store 失败：${err}`,

    /* 无数据 */
    dbCount: ({ n }) => `共 ${n} 个数据库`,
    dbOption: ({ name, version }) => `${name}（v${version}）`,
    noDbOption: '（无数据库）',
    noDbMsg: ({ origin }) => `${origin} 这个源下没有 IndexedDB 数据库。`,
    noDbReasonsTitle: '常见原因：',
    noDbReasons: [
      '该网站把数据存在 localStorage / Cookie / Cache Storage 里，没用 IndexedDB',
      '数据在 iframe 中，需要在 Console 左上角的执行上下文下拉切换到对应 iframe',
      '属于扩展自身（chrome-extension://），本面板访问不到',
      '页面还没初始化数据库（先操作一下页面再点「刷新」）',
    ],
    noStoreOption: '（无 store）',
    noStoreMsg: '该数据库没有 object store',
    noMatch: '没有匹配数据',

    /* 表格 */
    colActions: '操作',
    actCopy: '复制',
    actEdit: '编辑',
    actExport: '导出',
    rowsAll: ({ n }) => `${n} 条`,
    rowsFiltered: ({ shown, total }) => `${shown} / ${total} 条`,
    truncated: ({ max, total }) => `仅显示前 ${max} 条（共 ${total} 条），用搜索框缩小范围`,

    /* 导出 */
    noRecordsToExport: '当前表没有数据',
    noStoresToExport: '没有可导出的表',
    exportingDb: '正在导出整个库…',
    exportFailed: ({ err }) => `导出失败：${err}`,

    /* 跨 eval 传输 */
    objectPlaceholder: '[对象]',
    deepNested: '[深层嵌套]',
    errInjection: ({ err }) => `注入失败: ${err}`,
    errSerializable: ({ err }) => `结果无法序列化: ${err}`,
    errContextLost: '页面上下文丢失（页面可能已刷新或跳转）',
    errTimeout: '超时：页面没有响应（可能被 CSP 或长任务阻塞）',
  },

  en: {
    /* Top bar */
    searchPlaceholder: 'Search all fields…',
    exportStore: 'Export store',
    exportStoreTitle: 'Export all records of the current store as JSON',
    exportDb: 'Export DB',
    exportDbTitle: 'Export the whole database (all stores) as JSON',
    refresh: 'Refresh',
    langTitle: 'Panel language',
    originLabel: 'Origin: ',

    /* Detail dialog */
    detailTitle: 'Full value',
    detailReadonly: 'Full value (read-only)',
    copy: 'Copy',
    save: 'Save',
    saving: 'Saving…',
    close: 'Close',
    editTitle: ({ store, key }) => `Edit · ${store} · key=${key}`,

    /* Status / toast */
    loading: 'Loading…',
    reading: 'Reading…',
    loadingStore: ({ name }) => `Loading ${name} …`,
    unknown: '(unknown)',
    copied: 'Copied to clipboard',
    copyFailed: 'Copy failed',
    exported: ({ name }) => `Exported ${name}`,
    savedBack: 'Written back to IndexedDB',
    savingFailed: ({ err }) => `Save failed: ${err}`,
    invalidJson: ({ err }) => `Not valid JSON: ${err}`,

    /* Read failures */
    readFailedOption: '(read failed)',
    readFailed: ({ err }) => `Failed to read: ${err}`,
    readFailedHint: 'Check that the page frame itself is selected at the top of DevTools, that the page has finished loading, and that nothing is blocked by CSP.',
    loadStoreFailed: ({ err }) => `Failed to read store: ${err}`,

    /* No data */
    dbCount: ({ n }) => (n === 1 ? '1 database' : `${n} databases`),
    dbOption: ({ name, version }) => `${name} (v${version})`,
    noDbOption: '(no databases)',
    noDbMsg: ({ origin }) => `No IndexedDB databases under ${origin}.`,
    noDbReasonsTitle: 'Common causes:',
    noDbReasons: [
      'The site stores its data in localStorage / cookies / Cache Storage instead of IndexedDB',
      'The data lives in an iframe — switch the execution-context dropdown above Console to that iframe',
      'The data belongs to an extension itself (chrome-extension://), which this panel cannot reach',
      'The page has not initialized the database yet — interact with the page, then click Refresh',
    ],
    noStoreOption: '(no stores)',
    noStoreMsg: 'This database has no object stores',
    noMatch: 'No matching records',

    /* Table */
    colActions: 'Actions',
    actCopy: 'Copy',
    actEdit: 'Edit',
    actExport: 'Export',
    rowsAll: ({ n }) => (n === 1 ? '1 row' : `${n} rows`),
    rowsFiltered: ({ shown, total }) => `${shown} / ${total} rows`,
    truncated: ({ max, total }) => `Showing the first ${max} of ${total} rows — narrow it down with the search box`,

    /* Export */
    noRecordsToExport: 'The current store has no records',
    noStoresToExport: 'No stores to export',
    exportingDb: 'Exporting the whole database…',
    exportFailed: ({ err }) => `Export failed: ${err}`,

    /* Cross-eval transport */
    objectPlaceholder: '[Object]',
    deepNested: '[nested deeper than 4 levels]',
    errInjection: ({ err }) => `Injection failed: ${err}`,
    errSerializable: ({ err }) => `Result is not serializable: ${err}`,
    errContextLost: 'Page context lost (the page may have been reloaded or navigated)',
    errTimeout: 'Timed out: the page did not respond (blocked by CSP or a long task)',
  },
};

/* 语言判定：手动选择优先，其次浏览器语言；非中文一律归到英文 */
const detectLang = () => {
  try {
    const saved = localStorage.getItem(I18N_KEY);
    if (saved === 'zh' || saved === 'en') return saved;
  } catch (e) { /* localStorage 不可用时忽略，退回浏览器语言 */ }
  const nav = (navigator.languages && navigator.languages[0]) || navigator.language || 'en';
  return /^zh\b|^zh[-_]/i.test(nav) ? 'zh' : 'en';
};

let LANG = detectLang();

const t = (key, subs) => {
  const dict = I18N[LANG] || I18N.en;
  const v = dict[key];
  if (v === undefined) return key;
  return typeof v === 'function' ? v(subs || {}) : v;
};

const setLang = (l) => {
  LANG = l === 'zh' ? 'zh' : 'en';
  try { localStorage.setItem(I18N_KEY, LANG); } catch (e) { /* 记不住就算了，不影响本次会话 */ }
};
