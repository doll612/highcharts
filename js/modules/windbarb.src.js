/**
 * Wind barb series module
 *
 * (c) 2010-2017 Torstein Honsi
 *
 * License: www.highcharts.com/license
 */
'use strict';
import H from '../parts/Globals.js';
import onSeriesMixin from '../mixins/on-series.js';

var each = H.each,
	seriesType = H.seriesType;


/*
 Wind barb series
 @todo
 - Hover effects (line width, hover color etc from pointAttribs)
 - Initial animation
 - Use it in meteogram
 */

seriesType('windbarb', 'column', {
	arrowLength: 20,
	lineWidth: 2,
	onSeries: null,
	tooltip: {
		pointFormat: '<b>{series.name}</b>: {point.value} ({point.beaufort})<br/>'
	},
	yOffset: -20
}, {
	pointArrayMap: ['value', 'rotation'],
	parallelArrays: ['x', 'value', 'rotation'],
	beaufortName: ['Calm', 'Light air', 'Light breeze',
		'Gentle breeze', 'Moderate breeze', 'Fresh breeze',
		'Strong breeze', 'Near gale', 'Gale', 'Strong gale', 'Storm',
		'Violent storm', 'Hurricane'],
	beaufortFloor: [0, 0.3, 1.6, 3.4, 5.5, 8.0, 10.8, 13.9, 17.2, 20.8,
		24.5, 28.5, 32.7],
	trackerGroups: ['markerGroup'],

	/**
	 * Get presentational attributes.
	 */
	pointAttribs: function () {
		return {
			'stroke': this.color,
			'stroke-width': this.options.lineWidth
		};
	},
	markerAttribs: function () {
		return undefined;
	},
	/**
	 * Create a single wind arrow. It is later rotated around the zero
	 * centerpoint.
	 */
	windArrow: function (point) {
		var level = point.beaufortLevel,
			path,
			u = this.options.arrowLength / 20;

		// The stem and the arrow head
		path = [
			'M', 0, 7 * u, // base of arrow
			'L', -1.5 * u, 7 * u,
			0, 10 * u,
			1.5 * u, 7 * u,
			0, 7 * u,
			0, -10 * u// top
		];

		if (level === 0) {
			path = [];
		}

		if (level === 2) {
			path.push('M', 0, -8 * u, 'L', 4 * u, -8 * u); // short line
		} else if (level >= 3) {
			path.push(0, -10 * u, 7 * u, -10 * u); // long line
		}

		if (level === 4) {
			path.push('M', 0, -7 * u, 'L', 4 * u, -7 * u);
		} else if (level >= 5) {
			path.push('M', 0, -7 * u, 'L', 7 * u, -7 * u);
		}

		if (level === 5) {
			path.push('M', 0, -4 * u, 'L', 4 * u, -4 * u);
		} else if (level >= 6) {
			path.push('M', 0, -4 * u, 'L', 7 * u, -4 * u);
		}

		if (level === 7) {
			path.push('M', 0, -1 * u, 'L', 4 * u, -1 * u);
		} else if (level >= 8) {
			path.push('M', 0, -1 * u, 'L', 7 * u, -1 * u);
		}

		return path;
	},

	translate: function () {
		var beaufortFloor = this.beaufortFloor,
			beaufortName = this.beaufortName;

		onSeriesMixin.translate.call(this);

		each(this.points, function (point) {
			// Find the beaufort level (zero based)
			for (var level = 0; level < beaufortFloor.length; level++) {
				if (beaufortFloor[level] > point.value) {
					point.beaufortLevel = level;
					point.beaufort = beaufortName[level];	
					break;
				}
			}
		});

	},

	drawPoints: function () {
		var chart = this.chart,
			yAxis = this.yAxis;
		each(this.points, function (point) {
			var plotX = point.plotX,
				plotY = point.plotY;
			if (!point.graphic) {
				point.graphic = this.chart.renderer
					.path()
					.add(this.markerGroup);
			}
			point.graphic
				.attr({
					d: this.windArrow(point),
					translateX: plotX,
					translateY: plotY + this.options.yOffset,
					rotation: point.rotation
				})
				.attr(this.pointAttribs(point));

			// Set the tooltip anchor position
			point.tooltipPos = chart.inverted ? 
			[
				yAxis.len + yAxis.pos - chart.plotLeft - plotY,
				this.xAxis.len - plotX
			] :
			[
				plotX,
				plotY + yAxis.pos - chart.plotTop + this.options.yOffset -
					this.options.arrowLength / 2
			]; // #6327
		}, this);
	}
});
