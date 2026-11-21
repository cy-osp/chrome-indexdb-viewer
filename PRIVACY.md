# 隐私声明 / Privacy Policy

**扩展名称**：IndexedDB DevTools Panel
**最后更新**：2026-11-21

## 中文

本扩展不收集、不上传、不共享任何用户数据。

具体说明：

- **不联网**。扩展的代码里没有任何网络请求，没有 `fetch` / `XMLHttpRequest` / WebSocket，没有埋点、没有崩溃上报。扩展的 `permissions` 只有一项 `clipboardWrite`，没有申请任何能访问网络的权限。
- **不读浏览记录、不读标签页、不注入任意页面**。扩展只在 DevTools 打开时工作，且只在你主动点击「IndexedDB」面板后，才读取**当前被检查页面**的 IndexedDB 数据，读取结果只渲染在你本机的这个面板里。
- **数据不出本机**。看数据、搜索、编辑写回、导出成 JSON 文件，全部在你本机完成。导出的文件由浏览器保存到你选择的位置，扩展不保留副本。
- **剪贴板**只在你点「复制」按钮时写入你正在看的那一段内容。
- **不存储配置、不上报统计**。扩展没有使用 `chrome.storage`，没有账号体系，没有服务器。

扩展的源码完全公开：<https://gitee.com/cy-open-source-project/chrome-index-db-viewer>。上述承诺可以直接在源码里核对——整个扩展只有 5 个源文件（`manifest.json`、`devtools.js`、`panel.html`、`panel.js`、`i18n.js`）外加两份界面文案字典，全部可读。

如果你在商店页面看到本扩展索取与上述不符的权限，请以源码里的 `manifest.json` 为准，并联系我们。

## English

This extension does not collect, transmit, or share any user data.

- **No network access.** There is no `fetch`, `XMLHttpRequest`, WebSocket, analytics, or crash reporting anywhere in the code. The only permission requested is `clipboardWrite`; no network-capable permission is requested.
- **No browsing history, no tab access, no arbitrary injection.** The extension only acts while DevTools is open, and only reads IndexedDB data of the **currently inspected page** after you click the "IndexedDB" panel yourself. Results stay in that local panel.
- **Data never leaves your machine.** Browsing, searching, writing back, and exporting to JSON all happen locally. Exported files are saved by the browser to a location you pick; the extension keeps no copy.
- **Clipboard** is written only when you click a "Copy" button, and only with the content you are looking at.
- **No stored settings, no telemetry.** The extension does not use `chrome.storage`, has no accounts, and has no backend.

Source code: <https://gitee.com/cy-open-source-project/chrome-index-db-viewer>. The extension is five readable files (`manifest.json`, `devtools.js`, `panel.html`, `panel.js`, `i18n.js`) plus two UI string dictionaries, so every claim above can be verified directly.

## 联系方式 / Contact

Issues: <https://gitee.com/cy-open-source-project/chrome-index-db-viewer/issues>
