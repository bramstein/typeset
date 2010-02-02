/*!
 * Knuth and Plass line breaking algorithm in JavaScript  v0.12
 *
 * Licensed under the new BSD License.
 * Copyright 2009, Bram Stein
 * All rights reserved.
 */
/*global console*/
var infinity = 10000,
	debug = false;

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

function BreakPoint(position, demerits, line, ratio, total, previous, link) {
	this.position = position;
	this.demerits = demerits;
	this.line = line || 0;
	this.total = total || {
		width: 0,
		stretch: 0,
		shrink: 0
	};
	this.ratio = ratio || 0;
	this.previous = previous || undefined;
	this.link = link || undefined;
}

var activeNodes = [],
	sum = {
		width: 0,
		stretch: 0,
		shrink: 0
	};

var computeRatio = function (list, activeNode, breakPointIndex, lineLengths) {
	var l = sum.width - activeNode.total.width,
		y = 0, z = 0, ratio = 0,
		lineLength = activeNode.line + 1 < lineLengths.length ? lineLengths[activeNode.line + 1] : lineLengths[lineLengths.length - 1];

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

var computeSum = function (list, breakPointIndex) {
	var result = {
			width: sum.width,
			stretch: sum.stretch,
			shrink: sum.shrink
		},
		i = 0;

	for (i = breakPointIndex; i < list.length; i += 1) {
		if (list[i].type === 'box') {
			break;
		}
		if (list[i].type === 'glue') {
			result.width += list[i].width;
			result.stretch += list[i].stretch;
			result.shrink += list[i].shrink;
		} else if (list[i].type === 'penalty' && list[i].penalty === -infinity && i > breakPointIndex) {
			break;
		}
	}
	return result;
};

var printList = function (node) {
	var a = node, result = [];

	while (a !== undefined) {
		result.push(a);
		a = a.link;
	}
	console.log(result);
};

var computeBreakPoints = function (list, lineLengths, options) {
	var tolerance = options.tolerance || 1,
		flaggedDemerit = options.flaggedDemerit || 100, 
		tmp = [],
		breaks = [],

		// Create an active node representing the beginning of the paragraph. Active nodes
		// are stored in a linked-list like structure with the link property point to the
		// next active node in the list. The previous property is not to be confused with
		// the previous node in a double linked list, as it is used to keep track of the
		// active nodes leading to the active nodes with the least total demerits.
		activeFirst = new BreakPoint(0, 0, 0, 0, undefined, undefined, undefined),
		
		// Pointer to the first node in the passive list. Consists of a linked list of deactivated
		// nodes.
		passiveFirst = undefined,

		mainLoop = function (breakPoint, breakPointIndex) {
			var active = activeFirst,
				bestActive = undefined,
				previousActive = undefined,
				nextActive = undefined,
				ratio = 0,
				demerits = 0,
				bestDemerits = 0,
				bestRatio = 0,
				badness = 0,
				s, 
				minimumDemerits = infinity,
				j,
				classes = [],
				c,
				tmpSum;

			minimumDemerits = infinity;

			classes = [
				{node: undefined, demerits: infinity, ratio: infinity},
				{node: undefined, demerits: infinity, ratio: infinity},
				{node: undefined, demerits: infinity, ratio: infinity},
				{node: undefined, demerits: infinity, ratio: infinity}	
			];

			// while current node is not undefined
			while (active !== undefined) {
				nextActive = active.link;

				// compute the adjustment ratio from active to breakPointIndex
				ratio = computeRatio(list, active, breakPointIndex, lineLengths);
				j = active.line + 1;

				if (ratio < -1 || (breakPoint.type === 'penalty' && breakPoint.penalty === -infinity)) {
					// Deactive the active node, at this point the active list contains:
					// (node a).link -> (node x).link --> ... --> (node 0).link -> undefined 
					if (previousActive === undefined) {
						activeFirst = nextActive;
					} else {
						previousActive.link = nextActive;
					}
					active.link = passiveFirst;
					passiveFirst = active;
				} else {
					previousActive = active;
				}

				if (-1 <= ratio && ratio <= tolerance) {
					// Compute demerits and fitness class
					badness = 100 * Math.pow(Math.abs(ratio), 3);

					// Positive penalty
					if (breakPoint.type === 'penalty' && breakPoint.penalty >= 0) {
						demerits = Math.pow(1 + badness + breakPoint.penalty, 2);
					// Negative penalty
					} else if (breakPoint.type === 'penalty' && breakPoint.penalty !== -infinity) {
						demerits = Math.pow(1 + badness - breakPoint.penalty, 2);
					// All other cases
					} else {
						demerits = Math.pow(1 + badness, 2);
					}

					if (breakPoint.type === 'penalty' && active.type === 'penalty') {
						demerits += flaggedDemerit * breakPoint.flagged * active.flagged;
					}

					if (ratio < -0.5) {
						c = 0;
					} else if (ratio <= 0.5) {
						c = 1;
					} else if (ratio <= 1) {
						c = 2;
					} else {
						c = 3;
					}

					demerits += active.demerits;

					if (demerits < classes[c].demerits) {
						classes[c].demerits = demerits;
						classes[c].node = active;
						classes[c].ratio = ratio;
						if (demerits < minimumDemerits) {
							minimumDemerits = demerits;
						}
					}
				}
				active = nextActive;

				if (active === undefined) {
					break;
				}

				if (active !== undefined && active.line <= j && j <= lineLengths[0]) {
					break;
				}
			}
			//console.log(classes);
			// Append the best feasible breaks as active nodes.
			if (minimumDemerits < infinity) {
				// Compute width, stretch and shrink sums
				tmpSum = computeSum(list, breakPointIndex);

				for (c = 0; c < 4; c += 1) {
					if (classes[c].node !== undefined && classes[c].demerits <= minimumDemerits + flaggedDemerit) {
						// Insert new active nodes for breaks from the best active node to b
						s = new BreakPoint(breakPointIndex, classes[c].demerits, classes[c].node.line + 1, classes[c].ratio, tmpSum, classes[c].node, active);

						if (previousActive === undefined) {
							activeFirst = s;
						} else {
							previousActive.link = s;
						}
						previousActive = s;
					}
				}
			}
		};

	if (list.isEmpty()) {
		return [];
	}

	list.forEach(function (breakPoint, breakPointIndex) {
		if (breakPoint.type === 'box') {
			sum.width += breakPoint.width;
		// A legal breakpoint is a box followed by glue
		} else if (breakPoint.type === 'glue') {
			if (breakPointIndex > 0 && list[breakPointIndex - 1].type === 'box') {
				mainLoop(breakPoint, breakPointIndex);
			}
			sum.width += breakPoint.width;
			sum.stretch += breakPoint.stretch;
			sum.shrink += breakPoint.shrink;
		} else if (breakPoint.type === 'penalty' && breakPoint.penalty !== infinity) {
			mainLoop(breakPoint, breakPointIndex);
		}
	});

	console.log('----------------------');
	printList(activeFirst);
	printList(passiveFirst);
	// TODO: select the active node with the least total demerits
	/*tmp = activeNodes.reduce(function (a, b) {
		return a.demerits < b.demerits ? a : b;
	}, {demerits: Infinity});
*/
	tmp = activeFirst;

	while (tmp !== undefined) {
		breaks.push({position: tmp.position, ratio: tmp.ratio});
		tmp = tmp.previous;
	}
	return breaks.reverse();
};
