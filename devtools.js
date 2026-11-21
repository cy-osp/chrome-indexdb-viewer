// devtools_page：此页面的唯一职责是注册自定义 DevTools 面板
chrome.devtools.panels.create(
  'IndexedDB',              // 面板标题（显示在 Console 旁边）
  'icons/icon16.png',       // 面板图标（相对扩展根目录；空串会显示默认占位图标）
  'panel.html',             // 面板内容页面
  (panel) => {
    // 面板创建成功回调（如需监听 onShown / onHidden 在这里挂）
  }
);
