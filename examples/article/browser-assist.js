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
        function measure(str) {
            if (str !== ' ') {
                    return ruler.text(str).width();
            } else {
                    return ruler.html('&nbsp;').width();
            }
        };
	var ret = typeset(text, measure, 'justify', [350], 3),
            spans = gen_html(ret),
            browserAssist = $('#browser-assist').after('<ul></ul>'),
            browserAssistRatio = $('#browser-assist + ul');

	browserAssist.append(spans[0]);
	browserAssistRatio.append(spans[2].map(function(r) {
            return "<li>"+r.toFixed(3)+"</li>";
        }).join(""));
});
