//import { Hypher } from './hypher'
//import { LineBreak, BreakLines } from './linebreak'

var defaults = {
    width: 3,
    stretch: 6,
    shrink: 9
};

/*!
 * Knuth and Plass line breaking algorithm in JavaScript
 *
 * Licensed under the new BSD License.
 * Copyright 2009-2010, Bram Stein
 * All rights reserved.
 */
function formatter(measureText, options) {
    var spaceWidth = measureText(' '),
        o = {
            space: {
                width:   options && options.space.width   || defaults.width,
                stretch: options && options.space.stretch || defaults.stretch,
                shrink:  options && options.space.shrink  || defaults.shrink
            }
        },
        h = new Hypher("en-us"),
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
            nodes.push(LineBreak.box(0, ''));
            nodes.push(LineBreak.glue(0, 12, 0));

            words.forEach(function (word, index, array) {
                var hyphenated = h.hyphenate(word);
                if (hyphenated.length > 1 && word.length > 4) {
                    hyphenated.forEach(function (part, partIndex, partArray) {
                        nodes.push(LineBreak.box(measureText(part), part));
                        if (partIndex !== partArray.length - 1) {
                            nodes.push(LineBreak.penalty(hyphenWidth, hyphenPenalty, 1));
                        }
                    });
                } else {
                    nodes.push(LineBreak.box(measureText(word), word));
                }

                if (index === array.length - 1) {
                    nodes.push(LineBreak.glue(0, 12, 0));
                    nodes.push(LineBreak.penalty(0, -LineBreak.infinity, 0));
                } else {
                    nodes.push(LineBreak.glue(0, 12, 0));
                    nodes.push(LineBreak.penalty(0, 0, 0));
                    nodes.push(LineBreak.glue(spaceWidth, -24, 0));
                    nodes.push(LineBreak.box(0, ''));
                    nodes.push(LineBreak.penalty(0, LineBreak.infinity, 0));
                    nodes.push(LineBreak.glue(0, 12, 0));
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
                        nodes.push(LineBreak.box(measureText(part), part));
                        if (partIndex !== partArray.length - 1) {
                            nodes.push(LineBreak.penalty(hyphenWidth, hyphenPenalty, 1));
                        }
                    });
                } else {
                    nodes.push(LineBreak.box(measureText(word), word));
                }
                if (index === array.length - 1) {
                    nodes.push(LineBreak.glue(0, LineBreak.infinity, 0));
                    nodes.push(LineBreak.penalty(0, -LineBreak.infinity, 1));
                } else {
                    nodes.push(LineBreak.glue(spaceWidth, spaceStretch, spaceShrink));
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
                        nodes.push(LineBreak.box(measureText(part), part));
                        if (partIndex !== partArray.length - 1) {
                            nodes.push(LineBreak.penalty(hyphenWidth, hyphenPenalty, 1));
                        }
                    });
                } else {
                    nodes.push(LineBreak.box(measureText(word), word));
                }

                if (index === array.length - 1) {
                    nodes.push(LineBreak.glue(0, LineBreak.infinity, 0));
                    nodes.push(LineBreak.penalty(0, -LineBreak.infinity, 1));
                } else {
                    nodes.push(LineBreak.glue(0, 12, 0));
                    nodes.push(LineBreak.penalty(0, 0, 0));
                    nodes.push(LineBreak.glue(spaceWidth, -12, 0));
                }
            });
            return nodes;
        }
    };
};
