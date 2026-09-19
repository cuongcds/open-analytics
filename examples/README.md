# Examples

Static HTML, no build step. Each page mocks `fetch`/`sendBeacon` for its
track endpoint and logs what would have been sent instead of actually
sending it — nothing here depends on a real backend.

Serve this directory with any static file server and open in a browser
(opening the file directly via `file://` also works for `local-dev.html`;
the CDN-loaded pages need `http(s)://` since jsDelivr won't load into a
`file://` page):

```bash
npx serve .
# or
python -m http.server 8080
```

## CDN examples (require the package to be published)

- **`basic.html`** — drop-in usage loaded from jsDelivr
  (`https://cdn.jsdelivr.net/npm/@cuongcds/open-analytics@0.1.0/...`), with
  `data-endpoint` pointed at a full, cross-domain URL
  (`https://example.com/analytics/track`) to demonstrate the cross-domain
  endpoint support (see the main README's "Cross-domain endpoint" section).
  The script tag's own `data-*` attributes configure it; `data-track` marks
  click targets; a form with `input[name="q"]` fires `search` instead of
  `form_submit`.
- **`dashboard-chart.html`** — same cross-domain setup, but via
  `OpenAnalytics.init()`/`.track()` (programmatic instead of `data-*`
  attributes), plus `open-analytics-chart.js` rendering a sample daily
  series (the same shape
  [`ci3-analytics`](https://github.com/cuongcds/ci3-analytics)'s
  `AnalyticsService::buildReport()` returns as `daily_page_views`).

These two load a specific published version
(`@cuongcds/open-analytics@0.1.0`) from jsDelivr — until that version is
actually published to npm, the `<script>` tag 404s and neither page will
track anything. Use `local-dev.html` until then.

## Local-dev example (works right now, no publish needed)

- **`local-dev.html`** — loads `../src/open-analytics.js` directly, so you
  can try out changes to this repo before publishing/tagging a release.

In a real app, delete the mock-fetch block and point `data-endpoint` (or
`OpenAnalytics.init({ endpoint })`) at your actual track route — see
[`ci3-analytics`](https://github.com/cuongcds/ci3-analytics) for a
CodeIgniter 3 backend that implements it.
