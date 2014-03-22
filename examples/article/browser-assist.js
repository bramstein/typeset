jQuery(function ($) {
	var ruler = $('<div class="example"></div>').css({
			visibility: 'hidden',
			position: 'absolute',
			top: '-8000px',
			width: 'auto',
			display: 'inline',
			left: '-8000px'
		}),
		format;

	$('body').append(ruler);

	format = Typeset.formatter(function (str) {
		if (str !== ' ') {
			return ruler.text(str).width();
		} else {
			return ruler.html('&nbsp;').width();
		}
	});

	function browserAssistTypeset(identifier, text, type, lineLengths, tolerance) {
		var nodes = format[type](text),
			breaks = Typeset.linebreak(nodes, lineLengths, {tolerance: tolerance}),
			lines = [],
			i, point, r, lineStart,
			browserAssist = $(identifier).after('<ul></ul>'),
			browserAssistRatio = $(identifier + ' + ul');

		// Iterate through the line breaks, and split the nodes at the
		// correct point.
		for (i = 1; i < breaks.length; i += 1) {
			point = breaks[i].position,
			r = breaks[i].ratio;

			for (var j = lineStart; j < nodes.length; j += 1) {
				// After a line break, we skip any nodes unless they are boxes or forced breaks.
				if (nodes[j].type === 'box' || (nodes[j].type === 'penalty' && nodes[j].penalty === -Typeset.linebreak.infinity)) {
					lineStart = j;
					break;
				}
			}
			lines.push({ratio: r, nodes: nodes.slice(lineStart, point + 1), position: point});
			lineStart = point;
		}

		lines = lines.map(function (line) {
			var spaceShrink = 1 / 9 * 12,
				spaceStretch = 1 / 6 * 12,
				ratio = line.ratio * (line.ratio < 0 ? spaceShrink : spaceStretch);

			var output = '<span style="word-spacing: ' + ratio.toFixed(3) + 'px; display: inline-block; white-space: nowrap;">' + line.nodes.filter(function (n) {
				return n.type === 'box';
			}).map(function (n) {
				return n.value;
			}).join(' ') + '</span>';
			browserAssist.append(output);
			browserAssistRatio.append('<li>' + line.ratio.toFixed(3) + '</li>');
		});
	}
	browserAssistTypeset('#browser-assist', text, 'justify', [350], 3);
});
