# Chrome Web Store 商品信息 — 中文

商店后台以中文填写时用这份。字段名与后台一致，可直接粘贴。

---

## 名称

```
IndexedDB 调试面板
```

对应 `_locales/zh_CN/messages.json` 的 `extName`。

## 简短说明

```
在 DevTools 中表格化浏览、搜索、编辑并导出 IndexedDB 数据。
```

40 / 132 字符。对应 `_locales/zh_CN/messages.json` 的 `extDescription`。

## 类别

```
开发者工具
```

## 详细说明

```
一个 DevTools 面板，把 IndexedDB 变成可读、可搜索的表格，并且不用离开浏览器就能编辑和导出。

Chrome 自带的 Application → IndexedDB 已经能看数据，但只能一层层点开：不能全局搜索、看不到所有字段、不能复制成 JSON，改一条记录得挨个字段点。这个面板用一个表格视图替掉这些麻烦。

功能

• 表格视图 —— 自动从记录里推断列（抽样前 50 条，最多 15 列），主键高亮显示。
• 全局搜索 —— 输一个关键字，同时对字段名和字段值做不区分大小写的匹配，覆盖该表全部记录。
• 完整单元格查看 —— 点任意单元格看完整、格式化后的 JSON，而不是截断的预览。
• 编辑并写回 —— 打开一条记录、改 JSON、点保存，直接通过 objectStore.put() 写回。日期和嵌套对象能原样往返；Blob 和 ArrayBuffer 字段只显示摘要，因为二进制数据过不了 DevTools 边界。
• 行级操作 —— 复制整行为 JSON、编辑、或只导出这一行。
• 导出表或整库 —— 把当前 object store，或整个数据库的所有 store，导出成一个 .json 文件。
• 源提示 —— 常驻显示当前看的是哪个源的数据，避免改错上下文。
• 中英双语 —— 界面同时提供中文和英文，默认跟随浏览器语言，也可以在工具栏下拉里手动切换。

值得知道的细节

• 一次最多渲染 200 行，超过会提示用搜索缩小范围，而不是在超大表上卡死。
• 日期按 ISO 字符串展示，写回时还原成真正的 Date 对象。Blob 和二进制缓冲区过不了 DevTools 边界，只能显示占位符——编辑含这些字段的记录前请先导出一份备份。
• 需要 Chrome 111 或更新版本。
• 没有构建步骤、没有框架、不引 CDN：扩展就是几个可以直接读的源文件。

隐私

本扩展不收集、不传输、不共享任何数据。代码里没有任何网络请求——没有 fetch、没有 XHR、没有 WebSocket、没有统计。唯一申请的权限是 clipboardWrite，只在你点「复制」按钮时使用。它从不读取浏览记录、从不碰你的标签页，只在你主动打开面板后读取被检查页面的 IndexedDB。所有数据都留在你自己的机器上。
```

## 单一用途说明

后台此处是 1,000 字符的文本框，这段 259 字。

```
本扩展在 Chrome DevTools 中新增一个面板。在该面板里，把当前被检查页面的 IndexedDB 数据库与 object store 以平面表格展示，并支持搜索、把单条记录作为 JSON 打开并复制、编辑后写回，以及把当前表或整个数据库导出为 JSON 文件。

它只读写被检查页面的 IndexedDB，没有其他功能：不修改页面内容、不向页面注入任何东西、不在后台运行，也不收集、传输或出售任何数据，代码中不存在任何网络请求。

全部功能都由这一个 DevTools 面板提供，删除该面板即删除整个扩展。
```

## 需请求 clipboardWrite 的理由

同上，1,000 字符文本框，这段 368 字。

```
clipboardWrite 只用于一件事：复制按钮。

面板把每条记录渲染为 JSON。当开发者点击「复制」时（行内、单元格详情弹窗或编辑弹窗中），扩展把这段 JSON 写入系统剪贴板，以便粘贴到编辑器、缺陷报告或聊天窗口。扩展的其他部分不访问剪贴板。

扩展从不读取剪贴板：没有申请 clipboardRead，也没有粘贴功能。

若 Clipboard API 调用被拒绝，代码会退回到用 document.execCommand('copy') 对一个临时隐藏的 textarea 执行复制——同样是用户主动触发的复制，只是换了旧 API。两种情况下写入都由点击直接触发，不会在页面加载时、后台或定时器里发生。

这是本扩展申请的唯一权限。没有主机权限、没有内容脚本、没有后台 Service Worker，也没有任何网络访问。
```

这两段与代码实际行为一致：剪贴板只有两个调用点，`panel.js` 里 `copyText()` 中的
`navigator.clipboard.writeText()` 和紧随其后的 `document.execCommand('copy')` 兜底；
`manifest.json` 没有申请其他权限。

## 隐私权政策网址

```
https://gitee.com/cy-open-source-project/chrome-index-db-viewer/blob/master/PRIVACY.md
```

## 素材清单

| 素材 | 文件 | 规格 |
| --- | --- | --- |
| 商店图标 | `docs/store/icon-128.png` | 128×128，允许 alpha |
| 截图 1（主图） | `docs/store/01-overview.png` | 1280×800，无 alpha |
| 截图 2 | `docs/store/02-table.png` | 1280×800，无 alpha |
| 截图 3 | `docs/store/03-search.png` | 1280×800，无 alpha |
| 截图 4 | `docs/store/04-detail.png` | 1280×800，无 alpha |
| 截图 5 | `docs/store/05-edit.png` | 1280×800，无 alpha |
| 小型宣传图块 | `docs/store/promo-440x280.png` | 440×280，24 位 PNG，无 alpha |
| 上传包 | `dist/chrome-index-db-viewer-1.1.0.zip` | 由 `scripts/pack.sh` 生成 |

注意：截图与宣传图块里的界面文案和示例数据都是英文，是为国际版商店准备的。
如果这份中文商品信息要搭配中文截图，需要用 `/tmp/store.js`（旧的中文版采集脚本）重出一套。
