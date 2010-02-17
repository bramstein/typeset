/*global linebreak*/
/*requires ../core/object.js*/
/*requires ../core/array.js*/
/*requires linebreak.js*/

/*!
 * Knuth and Plass line breaking algorithm in JavaScript
 *
 * Licensed under the new BSD License.
 * Copyright 2009-2010, Bram Stein
 * All rights reserved.
 */
var formatter = function (measureText, options) {
	var spaceWidth = measureText(' '),
		o = Object.extend({}, formatter.defaults, options);
	//console.log(emWidth);
	//emWidth = 12;

	return {
		center: function (text) {
			var nodes = [],
				words = text.split(/\s/),
				spaceStretch = (spaceWidth * o.space.width) / o.space.stretch,
				spaceShrink = (spaceWidth * o.space.width) / o.space.shrink;

			// Although not specified in the Knuth and Plass whitepaper, this box is necessary
			// to keep the glue from disappearing.
			nodes.push(linebreak.box(0, ''));
			nodes.push(linebreak.glue(0, 12, 0));

			words.forEach(function (word, index, array) {
				nodes.push(linebreak.box(measureText(word), word));

				if (index === array.length - 1) {
					nodes.push(linebreak.glue(0, 12, 0));
					nodes.push(linebreak.penalty(0, -linebreak.defaults.infinity, 0));
				} else {
					nodes.push(linebreak.glue(0, 12, 0));
					nodes.push(linebreak.penalty(0, 0, 0));
					nodes.push(linebreak.glue(spaceWidth, -24, 0));
					nodes.push(linebreak.box(0, ''));
					nodes.push(linebreak.penalty(0, linebreak.defaults.infinity, 0));
					nodes.push(linebreak.glue(0, 12, 0));
				}
			});
			return nodes;
		},
		justify: function (text) {
			var nodes = [],
				words = text.split(/\s/),
				spaceStretch = (spaceWidth * o.space.width) / o.space.stretch,
				spaceShrink = (spaceWidth * o.space.width) / o.space.shrink;

			words.forEach(function (word, index, array) {
				nodes.push(linebreak.box(measureText(word), word));

				if (index === array.length - 1) {
					nodes.push(linebreak.glue(0, linebreak.defaults.infinity, 0));
					nodes.push(linebreak.penalty(0, -linebreak.defaults.infinity, 1)); 
				} else {
					nodes.push(linebreak.glue(spaceWidth, spaceStretch, spaceShrink));
				}
			});
			return nodes;
		},
		left: function (text) {
			var nodes = [],
				words = text.split(/\s/),
				spaceStretch = (spaceWidth * o.space.width) / o.space.stretch,
				spaceShrink = (spaceWidth * o.space.width) / o.space.shrink;

			words.forEach(function (word, index, array) {
				nodes.push(linebreak.box(measureText(word), word));

				if (index === array.length - 1) {
					nodes.push(linebreak.glue(0, linebreak.defaults.infinity, 0));
					nodes.push(linebreak.penalty(0, -linebreak.defaults.infinity, 1)); 
				} else {
					nodes.push(linebreak.glue(0, 12, 0));
					nodes.push(linebreak.penalty(0, 0, 0));
					nodes.push(linebreak.glue(spaceWidth, -12, 0)); 
				}
			});
			return nodes;
		}
	};
};

Object.extend(formatter, {
	defaults: {
		space: {
			width: 3,
			stretch: 6,
			shrink: 9
		}
	}
});
