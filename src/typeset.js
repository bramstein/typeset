/* Example usage:
 *
 *   ret = typeset(text, measure_a_line, 'justify', [350], 3);
 *   spans = gen_html(ret)
 *   $('#browser-assist').append(spans[0]);
 *   $('#browser-assist + ul').append(spans[1].map(function(w) {
 *      return "<li>"+w.toFixed(3)+"</li>";
 *   }).join(""));
 *  
 */
/*import { textWidth } from '../helpers';
import { LineBreak, BreakLines } from './linebreak';
import { formatter } from './formatter';*/

function is_hyphen(node) {
    return node.type === 'penalty' && node.penalty === 100;
}

function typeset(text, wid, type, lineLengths, tolerance) {
    const nodes = formatter(wid)[type](text),
          breaks = BreakLines(nodes, lineLengths, {tolerance: tolerance});
    let   lines = [],
          lineStart = 0;

    // Iterate through the line breaks, and split the nodes at the
    // correct point.
    breaks.forEach(function(br) {
        const r     = br.ratio,
              point = br.position;
        if(point === 0) return; // skip first

        // Skip all non-box nodes.
        let span = "";
        let x = 0;
        nodes.slice(lineStart, point + 1).forEach(function(n){
            if(n.type === 'box') {
                span += n.value;
                x += n.width;
            } else if(n.type === 'glue' && span.length > 0
                      && n.width > 0) {
                span += ' ';
                x += n.width + r * (r < 0 ? n.shrink : n.stretch);
            }
        });
        span = span.trim();
        if(is_hyphen(nodes[point])) {
            span += '-';
            x += nodes[point].width;
        }
        lines.push({ ratio: r, width: x, value: span });
        lineStart = point;
    });

    return lines;
}

function gen_html(lines) {
    let spans = "";
    let widths = [];
    let ratios = [];
    // Emit spans for each line.
    lines.forEach( function(line) {
        const spaceShrink = 12 / 9,
              spaceStretch = 12 / 6,
              r = line.ratio * (line.ratio < 0 ? spaceShrink : spaceStretch);

        // REQUIRES .line { display: inline-block; white-space: nowrap; }
        spans += "<span class='line' style='word-spacing:"
        spans +=     r.toFixed(3)+"px;'>"+line.value+"</span>";
        widths.push(line.width);
        ratios.push(line.ratio);
    });

    return ["<div class='text'>"+spans+"</div>", widths, ratios];
}

