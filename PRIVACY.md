# 隐私声明 / Privacy Policy

| 项目 / Item | 内容 / Value |
| --- | --- |
| 扩展名称 / Extension | IndexedDB DevTools Panel |
| 适用版本 / Applies to | 1.1.1 及以后 / 1.1.1 and later |
| 生效日期 / Effective date | 2026-11-21 |
| 最后更新 / Last updated | 2026-11-24 |

**本政策的在线版本 / Online version of this policy**：见下方「联系方式」一节的网址。
如本文件与在线版本不一致，以本文件为准。

## 中文

本扩展不收集、不上传、不共享任何用户数据。

具体说明：

- **不联网**。扩展的代码里没有任何网络请求，没有 `fetch` / `XMLHttpRequest` / WebSocket，没有埋点、没有崩溃上报。扩展的 `permissions` 只有一项 `clipboardWrite`，没有申请任何能访问网络的权限。
- **不读浏览记录、不读标签页、不注入任意页面**。扩展只在 DevTools 打开时工作，且只在你主动点击「IndexedDB」面板后，才读取**当前被检查页面**的 IndexedDB 数据，读取结果只渲染在你本机的这个面板里。
- **数据不出本机**。看数据、搜索、编辑写回、导出成 JSON 文件，全部在你本机完成。导出的文件由浏览器保存到你选择的位置，扩展不保留副本。
- **剪贴板**只在你点「复制」按钮时写入你正在看的那一段内容。
- **不存储配置、不上报统计**。扩展没有使用 `chrome.storage`，没有账号体系，没有服务器。

扩展的源码完全公开：<https://github.com/cy-osp/chrome-indexdb-viewer>。上述承诺可以直接在源码里核对——整个扩展只有 5 个源文件（`manifest.json`、`devtools.js`、`panel.html`、`panel.js`、`i18n.js`）外加两份界面文案字典，全部可读。

如果你在商店页面看到本扩展索取与上述不符的权限，请以源码里的 `manifest.json` 为准，并联系我们。

## English

This extension does not collect, transmit, or share any user data.

- **No network access.** There is no `fetch`, `XMLHttpRequest`, WebSocket, analytics, or crash reporting anywhere in the code. The only permission requested is `clipboardWrite`; no network-capable permission is requested.
- **No browsing history, no tab access, no arbitrary injection.** The extension only acts while DevTools is open, and only reads IndexedDB data of the **currently inspected page** after you click the "IndexedDB" panel yourself. Results stay in that local panel.
- **Data never leaves your machine.** Browsing, searching, writing back, and exporting to JSON all happen locally. Exported files are saved by the browser to a location you pick; the extension keeps no copy.
- **Clipboard** is written only when you click a "Copy" button, and only with the content you are looking at.
- **No stored settings, no telemetry.** The extension does not use `chrome.storage`, has no accounts, and has no backend.

Source code: <https://github.com/cy-osp/chrome-indexdb-viewer>. The extension is five readable files (`manifest.json`, `devtools.js`, `panel.html`, `panel.js`, `i18n.js`) plus two UI string dictionaries, so every claim above can be verified directly.

## 联系方式 / Contact

数据控制者与隐私事务联系人 / Data controller and privacy contact：

| 项目 / Item | 内容 / Value |
| --- | --- |
| 联系人 / Contact | yidashi33 |
| 邮箱 / Email | <yidashi33@126.com> |
| 问题反馈 / Issues | <https://github.com/cy-osp/chrome-indexdb-viewer/issues> |
| 在线版本 / Online copy | <https://cy-osp.github.io/chrome-indexdb-viewer/privacy.html> |

我们会在收到隐私相关问询后的合理期限内答复，通常不超过 30 天。
We answer privacy inquiries within a reasonable period, normally within 30 days.

## 变更记录 / Revision history

| 日期 / Date | 版本 / Version | 变更 / Change |
| --- | --- | --- |
| 2026-11-24 | 1.1.1 | 修复工具栏按钮显示为灰白占位图标的问题，补 32px 图标并重绘图标；数据处理方式未变，本政策内容除版本号与日期外无改动。 |
| 2026-11-23 | 1.1.0 | 网页版（`docs/privacy.html`）改为纯英文，联系方式改为 yidashi33@126.com。 |
| 2026-11-23 | 1.1.0 | 补充生效日期、联系方式与变更记录；措辞与 1.1.0 的双语界面一致。 |
| 2026-11-21 | 1.0.0 | 首次发布。 |
