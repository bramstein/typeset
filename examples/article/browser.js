jQuery(function ($) {
	function browserTypeset() {
		var original = $('#browser'),
			width = original.width(),
			copy = original.clone(),
			text = copy.text(),
			lines = [],
			ratios = [],
			words = text.split(/\s/),
			position = 0,
			stretchWidth = 0,
			spaceStretch = 0,
			html = [];

		$('body').append(copy);

		// This piece of code calculates the positions of the line breaks added
		// by the browser by adding an invisible wrapper element to each word
		// and checking when its y-position changes.
		words.forEach(function (word, index) {
            var html = words.slice(0, index),
				currentPosition = 0;

            html.push('<span>' + word + '</span>');
            Array.prototype.push.apply(html, words.slice(index + 1, words.length));

			copy.html(html.join(' '));

			currentPosition = copy.find('span').position().top;

			if (currentPosition != position) {
				lines.push([]);
				position = currentPosition;
			}

			lines[lines.length - 1].push(word);
		});

		lines = lines.map(function (line) {
			return line.join(' ');
		});

	
		// We measure the width if the text is not justified and only a 
		// single line (i.e. the optimal line length.)
		copy.empty();
		copy.css({width: 'auto', display: 'inline', textAlign: 'left'});

		// This works under the assumption that a space is 1/3 of an em, and 
		// the stretch value is 1/6. Although the actual browser value may be
		// different, the assumption is valid as it is only used to compare
		// to the ratios calculated earlier.
		stretchWidth = copy.html('&nbsp;').width() / 2;

		lines.forEach(function (line, index) {
			// This conditional is to ensure we don't calculate the ratio
			// for the last line as it is not justified.
			if (index !== lines.length - 1) {
				copy.text(line);
				ratios.push((width - copy.width()) / ((line.split(/\s/).length - 1) * stretchWidth));
			} else {
				ratios.push(0);
			}
		});

		copy.remove();


		html.push('<ul>');
		ratios.forEach(function (ratio) {
			html.push('<li>');
			html.push(ratio.toFixed(3));
			html.push('</li>');
		});
		html.push('</ul>');

		$('#browser').parent().append(html.join(''));
	}

	$('#browser').text(text);
	browserTypeset();
});

function draw(context, lines, measure, center) {
    var i = 0, point, j,
        y = 4, maxLength = 0;

    //if(center)
        lines.forEach(function(line) {
            maxLength = maxLength > line.width ? maxLength : line.width;
        });
    console.log(lines.length, maxLength);

    lines.forEach(function (line) {
        const spaceShrink = 12 / 9,
              spaceStretch = 12 / 6,
              r = line.ratio * (line.ratio < 0 ? spaceShrink : spaceStretch);
        var x = 0;

        if (center) {
            x += (maxLength - line.width) / 2;
        }

        var words = line.value.split(' ');
        words.forEach(function(w) {
            context.fillText(w, x, y);
            x += measure(w+' ') + r;
        });

        // move lower to draw the next line
        y += 21;
    });
}

jQuery(function ($) {
    function align(identifier, type, lineLengths, tolerance, center) {
        var canvas = $(identifier).get(0),
            context = canvas.getContext && canvas.getContext('2d'),
            format, nodes, breaks;
        if (!context) {
            canvas.text("Unable to render to Canvas.");
            return;
        }
        context.textBaseline = 'top';
        context.font = "14px 'times new roman', 'FreeSerif', serif";

        function measure(str) {
            return context.measureText(str).width;
        };

        var ret = typeset(text, measure, type, lineLengths, tolerance);

        if (ret.length !== 0) {
            draw(context, ret, measure, center);
        } else {
            context.fillText('Paragraph can not be set with the given tolerance.', 0, 0);
        }
    }

    var r = [],
        radius = 147;

    for (var j = 0; j < radius * 2; j += 21) {
        r.push(Math.round(Math.sqrt((radius - j / 2) * (8 * j))));
    }

    r = r.filter(function (v) {
        return v > 30;
    });

    align('#center',   'center',  [350], 3);
    align('#left',     'left',    [350], 4);
    align('#flow',     'justify', [350, 350, 350, 200, 200, 200, 200, 200, 200, 200, 350, 350], 3);
    align('#triangle', 'justify', [50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550], 3, true);
    align('#circle',   'justify', r, 3, true);
});

