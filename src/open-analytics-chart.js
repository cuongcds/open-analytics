/**
 * open-analytics-chart — renders the daily page-views line chart used by
 * the analytics dashboard. Requires Chart.js (window.Chart) to already be
 * loaded; this file only wires it to a <canvas> and a data series.
 *
 * Usage:
 *
 *   <canvas id="analyticsDailyChart" height="80"></canvas>
 *   <script>window.OPEN_ANALYTICS_DAILY_SERIES = [{ day: '2026-09-01', total: 12 }, ...];</script>
 *   <script src="open-analytics-chart.js"></script>
 *
 * Or programmatically: OpenAnalyticsChart.render('analyticsDailyChart', series).
 */
(function (window, document) {
	'use strict';

	function render(canvasId, series) {
		var canvas = document.getElementById(canvasId);
		if (!canvas || typeof window.Chart === 'undefined') return null;

		return new window.Chart(canvas, {
			type: 'line',
			data: {
				labels: series.map(function (row) { return row.day; }),
				datasets: [{
					data: series.map(function (row) { return row.total; }),
					borderColor: '#6366f1',
					backgroundColor: 'rgba(99, 102, 241, 0.1)',
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

	window.OpenAnalyticsChart = { render: render };

	document.addEventListener('DOMContentLoaded', function () {
		var series = window.OPEN_ANALYTICS_DAILY_SERIES;
		if (Array.isArray(series)) {
			render('analyticsDailyChart', series);
		}
	});
})(window, document);
