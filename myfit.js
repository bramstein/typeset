/*!
 * Knuth and Plass line breaking algorithm in JavaScript  v0.12
 *
 * Licensed under the new BSD License.
 * Copyright 2009, Bram Stein
 * All rights reserved.
 */
var infinity = 10000;

function Box(width, value) {
	this.width = width || 0;
	this.value = value;
	this.shrink = 0;
	this.stretch = 0;
}

Box.prototype.type = 'box';
Box.prototype.toString = function () {
	return "'" + this.value + "'";
};

function Glue(width, stretch, shrink) {
	this.width = width || 0;
	this.stretch = stretch || 0;
	this.shrink = shrink || 0;
}

Glue.prototype.type = 'glue';
Glue.prototype.toString = function () {
	return '(Glue: width=' + this.width + ')';
};
Glue.prototype.computeWidth = function (ratio) {
	return this.width + ratio * (ratio < 0 ? this.shrink : this.stretch);
};

function Penalty(width, penalty, flagged) {
	this.width = width || 0;
	this.penalty = penalty;
	this.flagged = flagged || 0;
	this.stretch = 0;
	this.shrink = 0;
}

Penalty.prototype.type = 'penalty';
Penalty.prototype.toString = function () {
	return '(Penalty: ' + this.penalty + ')';
};

function BreakPoint(position, demerits, previous, line) {
	this.position = position;
	this.demerits = demerits;
	this.previous = previous;
	this.line = line || 0;
}

BreakPoint.prototype.toString = function () {
	return '(Breakpoint: demerits=' + this.demerits + ', position=' + this.position + ')';
};

var sumWidth = [],
	sumStretch = [],
	sumShrink = [],
	activeNodes = [],
	penalties = [],
	flags = [];

// Initialize a running sum of width, stretch and shrink. Also
// compile a list of penalties and flags for quick look-up.
var init = function (list) {
	var sum = {
			stretch: 0,
			shrink: 0,
			width: 0
		};

	list.forEach(function (node, index) {
		penalties[index] = 0;
		flags[index] = 0;

		sumWidth[index] = sum.width;
		sumStretch[index] = sum.stretch;
		sumShrink[index] = sum.shrink;	

		sum.width += node.width;
		sum.stretch += node.stretch;
		sum.shrink += node.shrink;

		if (node.type === 'penalty') {
			penalties[index] = node.penalty;
			flags[index] = node.flagged;
		}
	});
};

var computeRatio = function (list, start, end, lineLengths, line) {
	var l = sumWidth[end] - sumWidth[start],
		availableLength = 0, y = 0, z = 0, ratio = 0,
		lineLength = line < lineLengths.length ? lineLengths[line] : lineLengths[lineLengths.length - 1];

	if (list[end].type === 'penalty') {
		l += list[end].width;
	}

	if (l < lineLength) {
		y = sumStretch[end] - sumStretch[start];

		if (y > 0) {
			ratio = (lineLength - l) / y;	
		} else {
			ratio = infinity;
		}
	} else if (l > lineLength) {
		z = sumShrink[end] - sumShrink[start];

		if (z > 0) {
			ratio = (lineLength - l) / z;
		} else {
			ratio = infinity;
		}
	}
	return ratio;
};

var computeBreakPoints = function (list, lineLengths, options) {
	var tolerance = options.tolerance || 1,
		flaggedDemerit = 100, tmp = [], breaks = [], i, lineStart;

	if (list.isEmpty()) {
		return [];
	}

	activeNodes.push(new BreakPoint(0, 0, undefined, 0));

	list.forEach(function (breakPoint, breakPointIndex) {
		// A legal breakpoint is a box followed by glue, or a finite penalty.
		if ((breakPointIndex > 0 && breakPoint.type === 'glue' && list[breakPointIndex - 1].type === 'box') || 
			(breakPoint.type === 'penalty' && breakPoint.penalty < infinity)) {
			
			// List containing potential active nodes. We keep this list
			// because we don't know which active nodes create the best
			// new active node for this feasible breakpoint until we've 
			// tried them all.
			var potentialActiveNodes = {};

			// Loop through all the active nodes and calculate the ratio
			// from the active nodes to the current word (breakpoint.)
			activeNodes = activeNodes.filter(function (activeNode) {
				var ratio = computeRatio(list, activeNode.position, breakPointIndex, lineLengths, activeNode.line),
					demerits = 0, badness = 0;

				// If the ratio is within an acceptable tolerance range we found a new 
				// breakpoint. 
				if (-1 <= ratio && ratio <= tolerance) {
					badness = 100 * Math.pow(Math.abs(ratio), 3);

					// Positive penalty
					if (penalties[breakPointIndex] >= 0) {
						demerits = Math.pow(1 + badness + penalties[breakPointIndex], 2);
					// Negative penalty
					} else if (penalties[breakPointIndex] !== -infinity) {
						demerits = Math.pow(1 + badness - penalties[breakPointIndex], 2);
					// All other cases
					} else {
						demerits = Math.pow(1 + badness, 2);
					}

					demerits += flaggedDemerit * flags[breakPointIndex] * flags[activeNode.position];

					potentialActiveNodes[activeNode.line + 1] = [];
					potentialActiveNodes[activeNode.line + 1].push(new BreakPoint(breakPointIndex, activeNode.demerits + demerits, activeNode, activeNode.line + 1));
				}

				// If the ratio is too large or the breakPoint is forced, remove the active node.
				if (ratio < -1 || (breakPoint.type === 'penalty' && breakPoint.penalty === -infinity)) {
					return false;
				}
				return true;
			});

			// Append the best feasible breaks as active nodes.
			Object.forEach(potentialActiveNodes, function (line) {
				var newActiveNode = line.reduce(function (a, b) {
					return a.demerits < b.demerits ? a : b;
				}, {demerits: Infinity});
				activeNodes.push(newActiveNode);
			});
		}
	});

	tmp = activeNodes.reduce(function (a, b) {
		return a.demerits < b.demerits ? a : b;
	}, {demerits: Infinity});

	while (tmp !== undefined) {
		breaks.push({position: tmp.position, ratio: 0});
		tmp = tmp.previous;
	}

	breaks = breaks.reverse();

	for (i = 1, lineStart = 0; i < breaks.length; i += 1) {
		breaks[i].ratio = computeRatio(list, lineStart,  breaks[i].position, lineLengths, i - 1);
		lineStart = breaks[i].position + 1;
	}
	return breaks;
};
