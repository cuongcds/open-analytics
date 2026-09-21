/**
 * open-analytics-chart — renders the daily line charts used by the
 * analytics dashboard (page views, DAU, and any custom series). Requires
 * Chart.js (window.Chart) to already be loaded; this file only wires it
 * to a <canvas> and a data series.
 *
 * Usage:
 *
 *   <canvas id="analyticsDailyChart" height="80"></canvas>
 *   <script>window.OPEN_ANALYTICS_DAILY_SERIES = [{ day: '2026-09-01', total: 12 }, ...];</script>
 *   <script src="open-analytics-chart.js"></script>
 *
 * DAU chart (rendered automatically when present, same as page views):
 *
 *   <canvas id="analyticsDauChart" height="80"></canvas>
 *   <script>window.OPEN_ANALYTICS_DAU_SERIES = [{ day: '2026-09-01', total: 4 }, ...];</script>
 *
 * Or programmatically, for any other canvas/series pair:
 * OpenAnalyticsChart.render('someCanvasId', series, '#6366f1').
 */
(function (window, document) {
	'use strict';

	function render(canvasId, series, color) {
		var canvas = document.getElementById(canvasId);
		if (!canvas || typeof window.Chart === 'undefined' || !Array.isArray(series)) return null;

		color = color || '#6366f1';

		return new window.Chart(canvas, {
			type: 'line',
			data: {
				labels: series.map(function (row) { return row.day; }),
				datasets: [{
					data: series.map(function (row) { return row.total; }),
					borderColor: color,
					backgroundColor: hexToRgba(color, 0.1),
					fill: true,
					tension: 0.3,
					pointRadius: 2,
				}],
			},
			options: {
				plugins: { legend: { display: false } },
				scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
			},
		});
	}

	function hexToRgba(hex, alpha) {
		var match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		if (!match) return hex;
		var r = parseInt(match[1], 16);
		var g = parseInt(match[2], 16);
		var b = parseInt(match[3], 16);
		return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
	}

	window.OpenAnalyticsChart = { render: render };

	document.addEventListener('DOMContentLoaded', function () {
		render('analyticsDailyChart', window.OPEN_ANALYTICS_DAILY_SERIES, '#6366f1');
		render('analyticsDauChart', window.OPEN_ANALYTICS_DAU_SERIES, '#10b981');
	});
})(window, document);
