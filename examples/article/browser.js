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
