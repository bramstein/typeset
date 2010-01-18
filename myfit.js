/*!
 * Knuth and Plass line breaking algorithm in JavaScript  v0.12
 *
 * Licensed under the new BSD License.
 * Copyright 2009, Bram Stein
 * All rights reserved.
 */
var infinity = 10000;

function Node(type, width, options) {
	this.type = type || 'box';
	this.width = width || 0;

	options = options || {};

	this.value = options.value || '';

	this.shrink = options.shrink || 0;
	this.stretch = options.stretch || 0;

	this.penalty = options.penalty || 0;
	this.flagged = options.flagged || 0;
}

function BreakPoint(position, demerits, previous, line, total, ratio) {
	this.position = position;
	this.demerits = demerits;
	this.previous = previous;
	this.line = line || 0;
	this.total = total || {
		width: 0,
		stretch: 0,
		shrink: 0
	};
	this.ratio = ratio || 0;
}

BreakPoint.prototype.toString = function () {
	return '(Breakpoint: demerits=' + this.demerits + ', position=' + this.position + ')';
};

var activeNodes = [],
	sum = {
		width: 0,
		stretch: 0,
		shrink: 0
	};

var computeRatio = function (list, activeNode, breakPointIndex, lineLengths) {
	var l = sum.width - activeNode.total.width,
		y = 0, z = 0, ratio = 0,
		lineLength = activeNode.line < lineLengths.length ? lineLengths[activeNode.line] : lineLengths[lineLengths.length - 1];

	if (list[breakPointIndex].type === 'penalty') {
		l += list[breakPointIndex].width;
	}

	if (l < lineLength) {
		y = sum.stretch - activeNode.total.stretch;

		if (y > 0) {
			ratio = (lineLength - l) / y;	
		} else {
			ratio = infinity;
		}
	} else if (l > lineLength) {
		z = sum.shrink - activeNode.total.shrink;

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
		flaggedDemerit = options.flaggedDemerit || 100, 
		tmp = [],
		breaks = [];

	if (list.isEmpty()) {
		return [];
	}

	activeNodes.push(new BreakPoint(0, 0, undefined, 0, 0));

	list.forEach(function (breakPoint, breakPointIndex) {
		if (breakPoint.type === 'box') {
			sum.width += breakPoint.width;
		// A legal breakpoint is a box followed by glue, or a finite penalty.
		} else if ((breakPointIndex > 0 && breakPoint.type === 'glue' && list[breakPointIndex - 1].type === 'box') || 
			(breakPoint.type === 'penalty' && breakPoint.penalty !== infinity)) {
			
			// List containing potential active nodes. We keep this list
			// because we don't know which active nodes create the best
			// new active node for this feasible breakpoint until we've 
			// tried them all.
			var potentialActiveNodes = {};

			// Loop through all the active nodes and calculate the ratio
			// from the active nodes to the current word (breakpoint.)
			activeNodes = activeNodes.filter(function (activeNode) {
				var ratio = computeRatio(list, activeNode, breakPointIndex, lineLengths),
					demerits = 0,
					badness = 0,
					i = 0,
					tmpSum = {
						width: sum.width,
						stretch: sum.stretch,
						shrink: sum.shrink
					};

				// If the ratio is within an acceptable tolerance range we found a new 
				// breakpoint. 
				if (-1 <= ratio && ratio <= tolerance) {
					badness = 100 * Math.pow(Math.abs(ratio), 3);

					// Positive penalty
					if (breakPoint.penalty >= 0) {
						demerits = Math.pow(1 + badness + breakPoint.penalty, 2);
					// Negative penalty
					} else if (breakPoint.penalty !== -infinity) {
						demerits = Math.pow(1 + badness - breakPoint.penalty, 2);
					// All other cases
					} else {
						demerits = Math.pow(1 + badness, 2);
					}
					
					demerits += flaggedDemerit * breakPoint.flagged * list[activeNode.position].flagged;

					// Compute width, stretch and shrink sums
					for (i = breakPointIndex; i < list.length; i += 1) {
						if (list[i].type === 'glue') {
							tmpSum.width += list[i].width;
							tmpSum.stretch += list[i].stretch;
							tmpSum.shrink += list[i].shrink;
						} else if (list[i].type === 'box' || (list[i].penalty === -infinity && i > breakPointIndex)) {
							break;
						}
					}
				
					potentialActiveNodes[activeNode.line + 1] = [];
					potentialActiveNodes[activeNode.line + 1].push(new BreakPoint(breakPointIndex, activeNode.demerits + demerits, activeNode, activeNode.line + 1, tmpSum, ratio));
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

			if (breakPoint.type === 'glue') {
				sum.width += breakPoint.width;
				sum.stretch += breakPoint.stretch;
				sum.shrink += breakPoint.shrink;
			}
		}
	});

	if (activeNodes.isEmpty()) {
		console.log('Paragraph cannot be set.');
	}

	tmp = activeNodes.reduce(function (a, b) {
		return a.demerits < b.demerits ? a : b;
	}, {demerits: Infinity});

	while (tmp !== undefined) {
		breaks.push({position: tmp.position, ratio: tmp.ratio});
		if (tmp.previous !== undefined) {
		//	console.log(list.slice(tmp.previous.position, tmp.position));
		}
		tmp = tmp.previous;
	}
	return breaks.reverse();
};
