# Chrome Web Store listing — English

Everything below is ready to paste into the Chrome Web Store developer dashboard.

---

## Name

```
IndexedDB DevTools Panel
```

(Max 45 characters. This comes from `_locales/en/messages.json` → `extName`, so it
matches what the extension reports about itself.)

## Short description

```
Browse, search, edit and export IndexedDB data in a DevTools panel.
```

67 / 132 characters. Also taken from `_locales/en/messages.json` → `extDescription`,
so the store copy and the manifest stay in sync.

## Category

```
Developer Tools
```

## Detailed description

```
A DevTools panel that turns IndexedDB into a readable, searchable table — and lets you edit and export it without leaving the browser.

Chrome's built-in Application → IndexedDB view shows your data, but you can only drill down one level at a time: no global search, no way to see all fields at once, no copy-to-JSON, and editing a record means clicking through it field by field. This panel replaces all of that with a single table view.

WHAT IT DOES

• Table view — columns are inferred automatically from your records (sampled from the first 50, up to 15 columns), with the primary key highlighted.
• Global search — type a keyword and it matches both field names and field values, case-insensitively, across every record in the store.
• Full cell inspection — click any cell to see the complete, pretty-printed JSON instead of an ellipsized preview.
• Edit and write back — open a record, change the JSON, hit Save, and it is written straight back with objectStore.put(). Byte-for-byte round-trips for dates and nested objects; Blob and ArrayBuffer fields are shown as summaries because binary data can't cross the DevTools boundary.
• Row actions — copy a row as JSON, edit it, or export just that row.
• Export store or database — dump the current object store, or every store in the database, to a single .json file.
• Origin banner — a constant reminder of which origin's data you are looking at, so you never edit the wrong context.
• Chinese + English — the interface ships in both languages, follows your browser language by default, and can be switched from a dropdown in the toolbar.

DETAILS WORTH KNOWING

• Renders at most 200 rows at a time; beyond that it asks you to narrow the search rather than freezing on a huge table.
• Dates are displayed as ISO strings and revived as real Date objects on write-back. Blobs and binary buffers can't be serialized across the DevTools boundary, so they appear as placeholders — export a backup before editing records that contain them.
• Requires Chrome 111 or newer.
• No build step, no framework, no CDN: the extension is a handful of readable source files.

PRIVACY

The extension does not collect, transmit, or share any data. There is no network request anywhere in the code — no fetch, no XHR, no WebSocket, no analytics. The only permission requested is clipboardWrite, used when you click a Copy button. It never reads browsing history, never touches your tabs, and only reads the IndexedDB of the page you are inspecting, after you open the panel yourself. Everything stays on your machine.
```

## Single purpose statement

The store dashboard gives this a 1,000-character textarea. This is 764 characters.

```
This extension adds one panel to Chrome DevTools. In that panel it displays the IndexedDB databases and object stores of the page currently open in the inspected tab as a flat table, and lets the developer search that table, open a single record as JSON, copy it, edit it and write it back, or export the current object store or the whole database to a JSON file.

It only reads and writes IndexedDB of the inspected page. It has no other function: it does not modify page content, does not inject anything into pages, does not run in the background and does not collect, transmit or sell any data. There is no network request anywhere in the code.

All functionality is reached from that single DevTools panel, and removing the panel removes the entire extension.
```

## Permission justification — `clipboardWrite`

Same 1,000-character textarea. This is 919 characters.

```
clipboardWrite is used for exactly one thing: the Copy buttons.

The panel renders each record as JSON. When the developer clicks Copy — on a row, in the cell-detail dialog, or in the edit dialog — the extension writes that JSON text to the system clipboard so it can be pasted into an editor, a bug report or a chat. Nothing else in the extension touches the clipboard.

The extension never reads the clipboard: it does not request clipboardRead and has no paste feature.

If the Clipboard API call is rejected, the code falls back to document.execCommand('copy') on a temporary hidden textarea — the same user-initiated copy through an older API. Either way the write happens only in direct response to a click, never on load, in the background, or on a timer.

This is the only permission the extension requests. There are no host permissions, no content scripts, no background service worker, and no network access.
```

Both of these mirror what the code actually does. The two clipboard call sites are
`navigator.clipboard.writeText()` in `copyText()` and the `document.execCommand('copy')`
fallback immediately below it in `panel.js` — nothing else in the extension touches
the clipboard, and `manifest.json` requests no other permission.

## Privacy practices (Data usage tab)

```
- Collects user data? No — nothing is collected, transmitted, or sold.
- Uses remote code? No — all code ships inside the package; there is no network access at runtime.
- Data handled: IndexedDB contents of the inspected page, read only in memory and only while the panel is open. Never sent anywhere.
- Certify: does not use data for purposes unrelated to the single purpose; does not use or transfer data for determining creditworthiness or for lending.
```

## Privacy policy URL

```
https://cy-osp.github.io/chrome-indexdb-viewer/privacy.html
```

---

## Asset checklist

| Asset | File | Spec |
| --- | --- | --- |
| Store icon | `docs/store/icon-128.png` | 128×128, alpha allowed |
| Screenshot 1 (hero) | `docs/store/01-overview.png` | 1280×800, no alpha |
| Screenshot 2 | `docs/store/02-table.png` | 1280×800, no alpha |
| Screenshot 3 | `docs/store/03-search.png` | 1280×800, no alpha |
| Screenshot 4 | `docs/store/04-detail.png` | 1280×800, no alpha |
| Screenshot 5 | `docs/store/05-edit.png` | 1280×800, no alpha |
| Small promo tile | `docs/store/promo-440x280.png` | 440×280, 24-bit PNG, no alpha |
| Upload package | `dist/chrome-index-db-viewer-1.1.0.zip` | built by `scripts/pack.sh` |

All screenshots use the English UI and English sample data.
