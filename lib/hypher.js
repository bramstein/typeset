/**
 * @constructor
 * @param {!{patterns: !Object, leftmin: !number, rightmin: !number}} language The language pattern file. Compatible with Hyphenator.js.
 * @param {?Object=} options Options to alter Hypher's hyphenation behaviour.
 */
function Hypher(language, options) {

    /**
     * @type {!Hypher.TrieNode}
     */
    this.trie = this.createTrie(language['patterns']);

    /**
     * @type {!number}
     * @const
     */
    this.leftMin = language['leftmin'];

    /**
     * @type {!number}
     * @const
     */
    this.rightMin = language['rightmin'];

    /**
     * @type {!number}
     * @const
     */
    this.minLength = (options && options['minLength']) || 4;

    /**
     * @type {!string}
     * @const
     */
    this.anyChar = (options && options['anyChar']) || '_';

    /**
     * @type {!Array.<!string>}
     */
    this.compoundSeperators = (options && options['compoundSeperators']) || ['\\u002D', '\\u2010', '\\u2013'];

    /**
     * @type {!RegExp}
     */
    this.compoundSeperatorsRegex = new RegExp('([' + this.compoundSeperators.join('') + '])', 'g');

    /**
     * @type {!Object.<string, !Array.<string>>}
     */
    this.exceptions = {};

    if (language['exceptions']) {
        language['exceptions'].split(/,\s?/g).forEach(function (exception) {
            var hyphenationMarker = new RegExp(exception.indexOf('=') !== -1 ? '=' : '-', 'g');
            this.exceptions[exception.replace(hyphenationMarker, '')] = exception.split(hyphenationMarker);
        }, this);
    }
}

/**
 * @typedef {{_points: !Array.<number>}}
 */
Hypher.TrieNode;

/**
 * Creates a trie from a language pattern.
 * @private
 * @param {!Object} patternObject An object with language patterns.
 * @return {!Hypher.TrieNode} An object trie.
 */
Hypher.prototype.createTrie = function (patternObject) {
    var size = 0,
        tree = {
            _points: []
        },
        patterns;

    for (size in patternObject) {
        if (patternObject.hasOwnProperty(size)) {
            patterns = patternObject[size].match(new RegExp('.{1,' + (+size) + '}', 'g'));

            patterns.forEach(function (pattern) {
                var chars = pattern.replace(/[0-9]/g, '').split(''),
                    points = pattern.split(/\D/),
                    t = tree;

                chars.forEach(function (c) {
                    var codePoint = c.charCodeAt(0);

                    if (!t[codePoint]) {
                        t[codePoint] = {};
                    }
                    t = t[codePoint];
                });

                t._points = points.map(function (p) {
                    return p || 0;
                });
            });
        }
    }
    return tree;
};

/**
 * Hyphenates a text.
 *
 * @param {!string} str The text to hyphenate.
 * @return {!string} The same text with soft hyphens inserted in the right positions.
 */
Hypher.prototype.hyphenateText = function (str) {
    // TODO: add support for compound words, ZWNJ, etc here
    // instead of at the word level.
    var words = str.split(/\b/g);
    return words.map(function (word) {
        return this.hyphenate(word).join('\u00AD');
    }, this).join('');
};

/**
 * Hyphenates a word.
 *
 * @param {!string} word The word to hyphenate
 * @return {!Array.<!string>} An array of word fragments indicating valid hyphenation points.
 */
Hypher.prototype.hyphenate = function (word) {
    var characters,
        characterPoints = [],
        originalCharacters,
        i,
        j,
        k,
        node,
        points = [],
        wordLength,
        nodePoints,
        nodePointsLength,
        m = Math.max,
        trie = this.trie,
        result = [''],
        parts,
        part,
        hyphenatedParts,
        partsLength;

    if (this.exceptions[word]) {
        return this.exceptions[word];
    }

    if (word.length <= this.minLength || word.indexOf('\u00AD') !== -1) {
        return [word];
    }

    if (this.compoundSeperatorsRegex.test(word)) {
        parts = word.split(this.compoundSeperatorsRegex);
        partsLength = parts.length;

        for (i = 0; i < partsLength; i += 1) {
            part = parts[i];
            if (this.compoundSeperators.indexOf(part) === -1) {
                hyphenatedParts = this.hyphenate(part);
                for (j = 0; j < hyphenatedParts.length; j += 1) {
                    if (j === 0) {
                        result[result.length - 1] += hyphenatedParts[j];
                    } else {
                        result.push(hyphenatedParts[j]);
                    }
                }
            } else {
                result[result.length - 1] += part;
            }
        }
        return result;
    }

    word = this.anyChar + word + this.anyChar;

    characters = word.toLowerCase().split('');
    originalCharacters = word.split('');
    wordLength = characters.length;

    for (i = 0; i < wordLength; i += 1) {
        points[i] = 0;
        characterPoints[i] = characters[i].charCodeAt(0);
    }

    for (i = 0; i < wordLength; i += 1) {
        node = trie;
        for (j = i; j < wordLength; j += 1) {
            node = node[characterPoints[j]];

            if (node) {
                nodePoints = node._points;
                if (nodePoints) {
                    for (k = 0, nodePointsLength = nodePoints.length; k < nodePointsLength; k += 1) {
                        points[i + k] = m(points[i + k], nodePoints[k]);
                    }
                }
            } else {
                break;
            }
        }
    }

    for (i = 1; i < wordLength - 1; i += 1) {
        if (i > this.leftMin && i < (wordLength - this.rightMin) && points[i] % 2) {
            result.push(originalCharacters[i]);
        } else {
            result[result.length - 1] += originalCharacters[i];
        }
    }

    return result;
};

// Export Hypher for Node.js
//module.exports = {
//    Hypher: Hypher
//};

// Uncomment these lines if you run Hypher on a Web browser or through Google Closure Compiler.
window['Hypher'] = Hypher;
window['Hypher'].prototype['hyphenate'] = Hypher.prototype.hyphenate;
