/*global Typeset.linebreak*/

/*!
 * Knuth and Plass line breaking algorithm in JavaScript
 *
 * Licensed under the new BSD License.
 * Copyright 2009-2010, Bram Stein
 * All rights reserved.
 */
Typeset.formatter = function (measureText, options) {
	var linebreak = Typeset.linebreak;

    var spaceWidth = measureText(' '),
        o = {
            space: {
                width: options && options.space.width || 3,
                stretch: options && options.space.stretch || 6,
                shrink: options && options.space.shrink || 9
            }
        },
        h = new Hypher(Hypher.en),
        hyphenWidth = measureText('-'),
        hyphenPenalty = 100;

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
                var hyphenated = h.hyphenate(word);
                if (hyphenated.length > 1 && word.length > 4) {
                    hyphenated.forEach(function (part, partIndex, partArray) {
                        nodes.push(linebreak.box(measureText(part), part));
                        if (partIndex !== partArray.length - 1) {
                            nodes.push(linebreak.penalty(hyphenWidth, hyphenPenalty, 1));
                        }
                    });
                } else {
                    nodes.push(linebreak.box(measureText(word), word));
                }

                if (index === array.length - 1) {
                    nodes.push(linebreak.glue(0, 12, 0));
                    nodes.push(linebreak.penalty(0, -linebreak.infinity, 0));
                } else {
                    nodes.push(linebreak.glue(0, 12, 0));
                    nodes.push(linebreak.penalty(0, 0, 0));
                    nodes.push(linebreak.glue(spaceWidth, -24, 0));
                    nodes.push(linebreak.box(0, ''));
                    nodes.push(linebreak.penalty(0, linebreak.infinity, 0));
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
                var hyphenated = h.hyphenate(word);
                if (hyphenated.length > 1 && word.length > 4) {
                    hyphenated.forEach(function (part, partIndex, partArray) {
                        nodes.push(linebreak.box(measureText(part), part));
                        if (partIndex !== partArray.length - 1) {
                            nodes.push(linebreak.penalty(hyphenWidth, hyphenPenalty, 1));
                        }
                    });
                } else {
                    nodes.push(linebreak.box(measureText(word), word));
                }
                if (index === array.length - 1) {
                    nodes.push(linebreak.glue(0, linebreak.infinity, 0));
                    nodes.push(linebreak.penalty(0, -linebreak.infinity, 1));
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
                var hyphenated = h.hyphenate(word);
                if (hyphenated.length > 1 && word.length > 4) {
                    hyphenated.forEach(function (part, partIndex, partArray) {
                        nodes.push(linebreak.box(measureText(part), part));
                        if (partIndex !== partArray.length - 1) {
                            nodes.push(linebreak.penalty(hyphenWidth, hyphenPenalty, 1));
                        }
                    });
                } else {
                    nodes.push(linebreak.box(measureText(word), word));
                }

                if (index === array.length - 1) {
                    nodes.push(linebreak.glue(0, linebreak.infinity, 0));
                    nodes.push(linebreak.penalty(0, -linebreak.infinity, 1));
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

Typeset.formatter.defaults = {
    space: {
        width: 3,
        stretch: 6,
        shrink: 9
    }
};