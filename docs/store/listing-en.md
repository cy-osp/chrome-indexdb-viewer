# Chrome Web Store listing — English

**This whole file is a reference sheet, not paste material.** Pasting it wholesale is
what put `# Chrome Web Store listing — English` and `## Name` into the overview field.

Rules:

1. Each `##` section below is a *label*, matching a field in the dashboard.
2. Only the text inside the ```` ``` ```` fence under a label goes into that field.
3. The prose outside the fences is commentary for whoever is filling the form — never paste it.
4. Delete whatever the dashboard pre-filled before pasting. It pre-fills the overview from
   the manifest description, which is Chinese when the dashboard is in Chinese.

---

| Dashboard field | Section in this file |
| --- | --- |
| Name | Name |
| Short description | Short description |
| Category | Category |
| Overview / Detailed description | Overview (detailed description) |
| Single purpose | Single purpose statement |
| Permission justification (clipboardWrite) | Permission justification |
| Privacy practices → Data usage | Privacy practices (Data usage tab) |
| Privacy policy URL | Privacy policy URL |

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

## Overview (detailed description)

Plain text. The dashboard does not render Markdown — no `#` headings, no `|` tables,
no `**bold**`, no links. Blank lines plus capitalised section names do the formatting.

```
Turn IndexedDB into a readable, searchable table, right inside Chrome DevTools.

Chrome's built-in Application > IndexedDB view only lets you drill down one level at a time: no global search, no way to see all fields at once, no copy to JSON, and editing a record means clicking through it field by field. This panel replaces all of that with one table.

FEATURES

- Table view: columns inferred from your records automatically, primary key highlighted.
- Global search: one keyword matches both field names and field values, case-insensitively.
- Cell inspection: click any cell for the complete, pretty-printed JSON.
- Edit and write back: change the JSON, click Save, and it is written straight back.
- Export: copy, edit, or export a single row, the current store, or the whole database.
- English and Chinese: follows your browser language, switchable from the toolbar.

GOOD TO KNOW

- Renders up to 200 rows at a time; beyond that it asks you to narrow the search.
- Dates round-trip as real Date objects. Blobs and binary buffers cannot cross the DevTools boundary and appear as placeholders, so export a backup first.
- Requires Chrome 111 or newer.

PRIVACY

No data is collected, transmitted, or shared. There is no network request anywhere in the code. The only permission is clipboardWrite, used when you click a Copy button. Only the IndexedDB of the inspected page is read, and only after you open the panel.
```

1423 characters. **Paste this over the whole field** — do not append to whatever
was already in the textarea.

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
