# chrome-indexDB-viewer

A Chrome DevTools extension that adds an **IndexedDB** panel to DevTools, letting you browse, search, edit, and export the inspected page's IndexedDB data as a table.

![manifest v3](https://img.shields.io/badge/manifest-v3-blue) ![chrome](https://img.shields.io/badge/Chrome-DevTools-4285f4) ![license](https://img.shields.io/badge/license-unlicensed-lightgrey)

## Why another IndexedDB viewer

Chrome's built-in Application → IndexedDB works, but:

- No cross-field keyword search — you drill down level by level
- You can't see all fields at once; long values need one-by-one expansion
- No way to copy or export a single record as JSON
- Editing means clicking cell by cell, and Date / nested objects are painful

This panel turns those into single clicks: a flat table view, keyword filtering, JSON edit-and-write-back, and one-click export.

## Features

| Feature | Description |
|---|---|
| DB / store switching | Two dropdowns list every database under the current origin (with version) and every object store |
| Table view | Columns are inferred from records (sampled from the first 50, up to 15 columns); key column highlighted |
| Global search | Case-insensitive match against both **field names** and **field values** |
| Cell inspection | Click any cell for the full pretty-printed JSON (no more `ellipsis` truncation) |
| Row actions | Copy row JSON / edit and write back / export the row as `.json` |
| Write-back | Edit JSON in the modal; saving calls `objectStore.put()` on the page's database |
| Export store | Dump every record of the current store as JSON |
| Export database | Dump every store of the current database as one JSON file |
| Origin banner | Shows `location.origin` so you never inspect the wrong context |

Rendering is capped at **200 rows** (`MAX_ROWS`); beyond that the panel asks you to narrow the search instead of freezing on a huge table.

## Install

1. Open `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked" and pick this repository root
4. Open any page → F12 → an **IndexedDB** tab appears in the DevTools tab bar (next to Console / Sources; it may be tucked under `»`)

No build step: source is the artifact. After editing, hit ⟳ on the extension card and reopen DevTools.

## Usage

1. In DevTools, make sure the execution context is the **page's own frame** (not the extension, and not an iframe unless that's where the data lives)
2. Pick a database, then a store — the table loads automatically
3. Type in the search box to filter; click a cell to inspect the full value
4. "编辑" (edit) → modify JSON → "保存" (save) writes back; "导出表 / 导出库" downloads JSON

The UI is currently Chinese-only.

### Type handling

Values are normalized (`norm()` in `panel.js`) before crossing `eval`:

| Original type | Shown in panel | On write-back |
|---|---|---|
| `Date` | `{"__t":"date","v":"<ISO>"}` | Revived as a `Date` |
| `Blob` | `{"__t":"blob","v":"image/png 128B"}` | **Cannot be revived** — becomes a placeholder object |
| `ArrayBuffer` / TypedArray | `{"__t":"buffer","v":"12 bytes"}` | **Cannot be revived** — becomes a placeholder object |
| Functions | `"[Function]"` | Kept as a string |
| Nesting deeper than 4 | `"[深层嵌套]"` | — |
| Arrays | First 200 elements only | — |

> Blob / binary payloads can't cross the JSON boundary into the DevTools panel, so only a summary is exported. **Editing and saving a record with Blob fields replaces them with a placeholder** — export a backup first.

## Testing

The repo ships `test-page.html`:

1. Open it in Chrome, click "创建测试数据" (create test data) — it builds the `shop-demo` database with 300 `products` + 20 `orders` (Date, Blob, nested objects, and array fields included)
2. F12 → IndexedDB panel → you should see `shop-demo（v1）` with `products` / `orders`
3. Searching `iphone` should leave ~42 rows (every 7th product)
4. Click a cell for full JSON; "编辑" a `stock` value, save, reload the page to verify

"清空数据库" deletes the database so you can start over.

## How it works

`chrome.devtools.inspectedWindow.eval()` **does not await Promises** — it only returns synchronously serializable values. Async reads therefore take three steps:

```
inject a kick script → the Promise's then-handler stores its result on window.__wb_idb_slot_<ts>_<seq>
                     → poll that slot every 60ms until done
                     → delete the slot after reading it
```

See `evalSync()` / `evalAsync()` in `panel.js`. Default timeout is 8s (15s for reading a store, 30s for a full-DB export); a page reload or navigation is detected as a missing slot and reported.

File responsibilities:

| File | Role |
|---|---|
| `manifest.json` | MV3 manifest; `devtools_page` points at `devtools.html`; only permission is `clipboardWrite` |
| `devtools.html` / `devtools.js` | Does one thing: `chrome.devtools.panels.create('IndexedDB', '', 'panel.html')` |
| `panel.html` | Panel UI and styles (no framework, no CDN) |
| `panel.js` | Panel logic: injected collect/write/export scripts + table rendering + modal interactions |
| `test-page.html` | Local fixture page for generating test data |

## Known limitations

- Only reads/writes the inspected page's current context; special origins like `chrome-extension://` and `devtools://` are unreachable
- Data inside an iframe requires switching the execution context manually (the panel does not enumerate frames)
- Uses `getAll()` with no cursor pagination, so a very large store (hundreds of thousands of rows) is slow on first load
- No object store creation/deletion, index maintenance, or key-range queries
- The page's own caches are not invalidated after a write-back; the page must re-read

## Contributing

1. Fork the repository
2. Create a `Feat_xxx` branch
3. Commit your code
4. Open a Pull Request

Code style: no build, no dependencies, plain ES2020 + native DOM. After touching `panel.js`, run `node --check panel.js`.

## License

No license has been specified for this repository yet.
