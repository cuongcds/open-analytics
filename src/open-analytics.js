/**
 * open-analytics — a small, dependency-free page-view/click/search tracker.
 *
 * Framework-agnostic: posts events to a single HTTP endpoint (whatever
 * backend receives them — see libs/ci3-analytics for a CodeIgniter 3
 * adapter that does). No cookies/consent/PII handling beyond what the
 * backend chooses to do with the visitor id it hands back.
 *
 * `endpoint` accepts either a same-origin path or a full URL on a
 * different domain (e.g. a shared analytics service for several sites).
 * For a cross-origin endpoint, the server must respond with
 * Access-Control-Allow-Credentials: true and a specific (non-wildcard)
 * Access-Control-Allow-Origin so the browser accepts the visitor cookie.
 *
 * Usage (drop-in, auto-tracks page_view/click/search):
 *
 *   <script src="open-analytics.js"
 *     data-endpoint="/analytics/track"
 *     data-track-attribute="data-track"
 *     data-search-input-selector='input[name="q"]'></script>
 *
 * Usage (programmatic, cross-domain endpoint):
 *
 *   OpenAnalytics.init({ endpoint: 'https://analytics.example.com/track' });
 *   OpenAnalytics.track('signup_click', { label: 'header-cta' });
 */
(function (window, document) {
	'use strict';

	var DEFAULTS = {
		endpoint: '/analytics/track',
		trackAttribute: 'data-track',
		searchInputSelector: 'input[name="q"]',
		autoTrackPageView: true,
		autoTrackClicks: true,
		autoTrackForms: true,
	};

	var config = null;

	function isCrossOrigin(url) {
		// A relative path (no scheme/host) is always same-origin. Resolve
		// against location.href so protocol-relative ("//host/...") and
		// absolute URLs are both classified correctly.
		try {
			return new URL(url, window.location.href).origin !== window.location.origin;
		} catch (e) {
			return false;
		}
	}

	function send(eventType, payload) {
		var body = new URLSearchParams(Object.assign({
			event_type: eventType,
			// The endpoint can be on any domain — same-origin, or a shared
			// analytics service on its own domain entirely (see "Cross-domain
			// endpoint" in the README) — so it has no reliable way to know
			// which domain actually served the tracked page from the request
			// alone. Report it explicitly; the backend should still prefer
			// the browser-set Origin header when present (can't be forged by
			// page JS, unlike this field) and use this only as a fallback.
			domain: window.location.hostname,
			path: window.location.pathname,
			referrer: document.referrer || '',
		}, payload || {}));

		if (navigator.sendBeacon) {
			// sendBeacon always includes cookies for the target origin, same-
			// or cross-origin — nothing to configure here.
			navigator.sendBeacon(config.endpoint, body);
			return;
		}
		// 'include' is required for a cross-origin endpoint to receive the
		// visitor cookie at all; the endpoint's CORS response must then
		// echo Access-Control-Allow-Credentials: true and a specific (not
		// wildcard) Access-Control-Allow-Origin for the browser to accept it.
		fetch(config.endpoint, {
			method: 'POST',
			body: body,
			keepalive: true,
			credentials: isCrossOrigin(config.endpoint) ? 'include' : 'same-origin',
		});
	}

	function trackPageView() {
		send('page_view');
	}

	function trackClicks() {
		document.addEventListener('click', function (e) {
			var el = e.target.closest('[' + config.trackAttribute + ']');
			if (!el) return;
			send('click', { label: el.getAttribute(config.trackAttribute) });
		});
	}

	function trackFormSubmits() {
		document.addEventListener('submit', function (e) {
			var form = e.target;
			if (!(form instanceof HTMLFormElement)) return;

			var keywordInput = config.searchInputSelector ? form.querySelector(config.searchInputSelector) : null;
			if (keywordInput) {
				send('search', { label: keywordInput.value || '' });
				return;
			}

			var label = form.getAttribute('data-track-form') || form.getAttribute('name') || form.getAttribute('action') || 'form';
			send('form_submit', { label: label });
		});
	}

	function readScriptConfig() {
		var currentScript = document.currentScript;
		if (!currentScript) return {};

		var attrs = {
			endpoint: 'data-endpoint',
			trackAttribute: 'data-track-attribute',
			searchInputSelector: 'data-search-input-selector',
		};
		var result = {};
		Object.keys(attrs).forEach(function (key) {
			var value = currentScript.getAttribute(attrs[key]);
			if (value !== null) result[key] = value;
		});
		return result;
	}

	function init(userConfig) {
		config = Object.assign({}, DEFAULTS, readScriptConfig(), userConfig || {});

		if (config.autoTrackPageView) trackPageView();
		if (config.autoTrackClicks) trackClicks();
		if (config.autoTrackForms) trackFormSubmits();
	}

	window.OpenAnalytics = {
		init: init,
		track: function (eventType, payload) {
			if (!config) init();
			send(eventType, payload);
		},
	};

	document.addEventListener('DOMContentLoaded', function () {
		if (!config) init();
	});
})(window, document);
