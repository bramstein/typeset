load('src/core/object.js');
load('src/core/array.extra.js');
load('src/core/array.js');

var infinity = 10000;

function Box(width, value) {
	this.width = width || 0;
	this.value = value;
	this.shrink = 0;
	this.stretch = 0;
};

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
Glue.prototype.computeWidth = function(ratio) {
	return this.width + r * (r < 0 ? this.shrink : this.stretch);
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
Penalty.prototype.isForcedBreak = function () {
	return this.penalty === -infinity;
};

function BreakPoint(position, line, fitnessClass, totalWidth, totalStretch, totalShrink, demerits, previous, next) {
	this.position = position;
	this.line = line;
	this.fitnessClass = fitnessClass;
	this.totalWidth = totalWidth;
	this.totalStretch = totalStretch;
	this.totalShrink = totalShrink;
	this.demerits = demerits;
	this.previous = previous;
	this.next = next;
}

BreakPoint.prototype.toString = function () {
	return '(Breakpoint: line=' + this.line /*+ ', demerits=' + this.demerits*/ + ', fitness=' + this.fitnessClass + ', position=' + this.position + ')';
}

var sumWidth = [],
	sumStretch = [],
	sumShrink = [],
	activeNodes = [];

function isLegalBreakPoint(list, index) {
	var node = list[index];

	if (node.type === 'penalty' && node.penalty < infinity) {
		return true;
	} else if (index > 0 && node.type === 'glue' && list[index - 1].type === 'box') {
		return true;
	} else {
		return false;
	}
}

function isForcedBreak(node) {
	return node.type === 'penalty' && node.penalty === -infinity;
}

function computeRatio(list, start, end, line, lineLengths) {
	var l = sumWidth[end] - sumWidth[start],
		availableLength = 0, y = 0, z = 0, ratio = 0;

	if (list[end].type === 'penalty') {
		l += list[end].width;
	}

	if (line < lineLengths.length) {
		availableLength = lineLengths[line];
	} else {
		availableLength = lineLengths.peek();
	}

	if (l < availableLength) {
		y = sumStretch[end] - sumStretch[start];

		if (y > 0) {
			ratio = (availableLength - l) / y;	
		} else {
			ratio = infinity;
		}
	} else if (l > availableLength) {
		z = sumShrink[end] - sumShrink[start];

		if (z > 0) {
			ratio = (availableLength - l) / z;
		} else {
			ratio = infinity;
		}
	}
	return ratio;
}

function computeFitnessClass(ratio) {
	if (ratio < -0.5) {
		return 0;
	} else if (ratio <= 0.5) {
		return 1;
	} else if (ratio <= 1) {
		return 2;
	} else {
		return 3;
	}
}

function addActiveNode(node) {
	var index = 0, insertIndex;

	// insert at the correct line
	while (index < activeNodes.length && activeNodes[index].line < node.line) {
		index += 1;
	}

	insertIndex = index;

	// filter out duplicates with the same position, line and fitness 
	while (index < activeNodes.length && activeNodes[index].line === node.line) {
		if (activeNodes[index].fitnessClass === node.fitnessClass && activeNodes[index].position === node.position) {
			return;
		}
		index += 1;
	}
	activeNodes.splice(insertIndex, 0, node);	
}

function sortMerge(a, b, comparison) {
	var result = [], tmp, ai = 0, bi = 0;
	while (ai < a.length && bi < b.length) {
		tmp = comparison(a[ai], b[bi]);

		if (tmp === 0) {
			result.push(a[ai]);
			ai += 1;
			bi += 1;
		} else if (tmp < 0) {
			result.push(a[ai]);
			ai += 1;
		} else if (tmp > 0) {
			result.push(b[bi]);
			bi += 1;
		}
	}
	while (ai < a.length) {
		result.push(a[ai]);
		ai += 1;
	}
	while (bi < b.length) {
		result.push(b[bi]);
		bi += 1;
	}
	//print(result);
	return result;
}

function computeBreakPoints(list, lineLengths, options) {
	var looseness = options && options.looseness || 0,
		tolerance = options && options.tolerance || 1,
		fitnessDemerit = options && options.fitnessDemerit || 100,
		flaggedDemerit = options && options.flaggedDemerit || 100,
		sum = {
			stretch: 0,
			shrink: 0,
			width: 0
		},
		penalties = [],
		flags = [],
		breaks = [],
		tmp, P;

	var c = 0;

	if (list.isEmpty()) {
		return [];
	}

	// Initialize a running sum of width, stretch and shrink. Also
	// compile a list of penalties and flags for quick look-up.
	list.forEach(function (node, index) {
		sumWidth[index] = sum.width;
		sumStretch[index] = sum.stretch;
		sumShrink[index] = sum.shrink;		

		sum.width += node.width;
		sum.stretch += node.stretch;
		sum.shrink += node.shrink;

		penalties[index] = 0;
		flags[index] = 0;

		if (node.type === 'penalty') {
			penalties[index] = node.penalty;
			flags[index] = node.flagged;
		}
	});

	// create an active node representing the beginning of the paragraph
	activeNodes.push(new BreakPoint(0, 0, 1, 0, 0, 0, 0));
	P = undefined;

	list.forEach(function (b, index) {

		// if b is a legal breakpoint
		if (isLegalBreakPoint(list, index)) {

			// initialize the feasible breaks at b to the empty set
			var breakPoints = [],
				testPoints = [[]];

			// Using a filter is more efficient since it only modifies the array once,
			// instead of N times where N is the number of deactivated breakpoints.
			// for each active node a
			activeNodes = activeNodes.filter(function (a) {
				// compute the adjustment ratio r from a to b
				var ratio = computeRatio(list, a.position, index, a.line, lineLengths),
					demerits = 0, absRatio = Math.abs(ratio);

				// if -1 <= r < p then <record a feasible break from a to b
				if (-1 <= ratio && ratio <= tolerance) {
					
					// TODO: verify this with the notes at the end of chapter 3 of "Digital Typography"
					if (penalties[index] >= 0) {
						demerits = Math.pow(1 + 100 * Math.pow(absRatio, 3) + penalties[index], 2);
					} else if (isForcedBreak(b)) {
						demerits = Math.pow(1 + 100 * Math.pow(absRatio, 3), 2) - Math.pow(penalties[index], 2);
					} else {
						demerits = Math.pow(Math.pow(1 + 100 * absRatio, 3), 2);
					}

					demerits = demerits + (flaggedDemerit * flags[index] * flags[a.position]);
					fitnessClass = computeFitnessClass(ratio);

					// Add extra demerit if the difference between fitness classes is greater than 1
					if (Math.abs(fitnessClass - a.fitnessClass) > 1) {
						demerits += fitnessDemerit;
					}

					breakPoints.push(new BreakPoint(index, a.line + 1, fitnessClass, sumWidth[index], sumStretch[index], sumShrink[index], demerits, a));
				} 

				// if r < -1 or <b is a forced break> then <deactive node a>
				if (ratio < -1 || (b.type === 'penalty' && b.isForcedBreak())) {
					return false;
				}
				return true;
			});
			// append the best such breaks as active nodes
			// TODO: verify the correctness of this
			var test = sortMerge(breakPoints, activeNodes, function (d, e) {
				if (d.line === e.line && e.fitnessClass === d.fitnessClass && d.position === e.position) {
					return 0;
				}

				if (d.line === e.line) {
					return 0;
				} else if (d.line < e.line) {
					return -1;	
				} else {
					return 1;
				}
			});
			
			//breakPoints.forEach(function (breakPoint) {
			//	addActiveNode(breakPoint);
			//});
			activeNodes = test;
		}
	});

	// choose the active node with the fewest total demerits
	tmp = activeNodes.reduce(function (a, b) {
		return a.demerits < b.demerits ? a : b;
	}, {demerits: Infinity});

	// TODO: implement looseness

	// use the chosen node to determine the optimum breakpoint sequence.
	// Follow the previous positions until we reach the start (undefined)
	while (tmp !== undefined) {
		breaks.push(tmp.position);
		tmp = tmp.previous;
	}
	return breaks.reverse();
}

/*======================================================================*/

var maxLength = 60;

var text = "You may never have thought of it, but fonts (better: typefaces) usually have a mathematical definition somehow. If a font is given as bitmap, this is often a result originating from a more compact description. Imagine the situation that you have bitmaps at 300dpi, and you buy a 600dpi printer. It wouldn't look pretty. There is then a need for a mathematical way of describing arbitrary shapes. These shapes can also be three- dimensional; in fact, a lot of the mathematics in this chapter was developed by a car manufacturer for modeling car body shapes. But let us for now only look in two dimensions, which means that the curves are lines, rather than planes.";

var words = text.split(/\s/);

var list = [];

words.forEach(function (value, index, array) {
	list.push(new Box(value.length, value));

	if (index === array.length - 1) {
		list.push(new Penalty(0, 10000, 0));
		list.push(new Glue(0, 10000, 0));
		list.push(new Penalty(0, -10000, 1));
	} else {
		list.push(new Glue(2, 1, 1));
	}
});

var before = new Date().getTime();
var b = computeBreakPoints(list, [maxLength]),
	line = 0,
	lineStart = 0,
	r = 0,
	point, j = 0, node, width, output = [];

var after = new Date().getTime();

for (var i = 1; i < b.length; i += 1) {
	point = b[i];
	r = computeRatio(list, lineStart, point, line, [maxLength]);

	for (j = lineStart; j < point; j += 1) {
		node = list[j];

		if (node.type === 'glue') {
			width = Math.floor(node.computeWidth(r));
			for (var k = 0; k < width; k += 1) {
				output.push(' ');
			}
		} else if (node.type === 'box') {
			output.push(node.value);
		}
	}
	output.push('   ' + r + '\n');
	lineStart = point + 1;
}

print(output.join(''));
print(after - before);
