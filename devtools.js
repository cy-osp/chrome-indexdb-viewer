// devtools_page：此页面的唯一职责是注册自定义 DevTools 面板
// 面板标题走 chrome.i18n，按浏览器语言取 _locales/{en,zh_CN}/messages.json 里的 panelTitle；
// 面板内部的界面语言由 panel.html 顶部下拉控制（见 i18n.js）。
const title = (chrome.i18n && chrome.i18n.getMessage('panelTitle')) || 'IndexedDB';

chrome.devtools.panels.create(
  title,                    // 面板标题（显示在 Console 旁边）
  'icons/icon16.png',       // 面板图标（相对扩展根目录；空串会显示默认占位图标）
  'panel.html',             // 面板内容页面
  (panel) => {
    // 面板创建成功回调（如需监听 onShown / onHidden 在这里挂）
  }
);
