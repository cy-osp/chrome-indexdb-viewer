// devtools_page：此页面的唯一职责是注册自定义 DevTools 面板
chrome.devtools.panels.create(
  'IndexedDB',      // 面板标题（显示在 Console 旁边）
  '',               // 图标路径（可选）
  'panel.html',     // 面板内容页面
  (panel) => {
    // 面板创建成功回调（如需监听 onShown / onHidden 在这里挂）
  }
);
