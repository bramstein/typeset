## TeX line breaking algorithm in JavaScript

This is an implementation of the [Knuth and Plass line breaking algorithm](http://www3.interscience.wiley.com/journal/113445055/abstract) using JavaScript. The goal of this project is to optimally set justified text in the browser, and ultimately provide a library for various line breaking algorithms in JavaScript.

The paragraph below is set using a JavaScript implementation of the classic Knuth and Plass algorithm as used in TeX. The numbers on the right of each line are the stretching or shrinking ratio compared to the optimal line width. This example uses a default space of 1/3 em, with a stretchability and shrink-ability of 1/6 em and 1/9 em respectively.

![](https://github.com/bramstein/typeset/raw/master/typeset-with-ratio.png)

The following paragraph is set by a browser using `text-align: justify`. Notice the lines in the paragraph have, on average, greater inter-word spacing than the Knuth and Plass version, which is successful at minimizing the inter-word spacing over all lines.

![](https://github.com/bramstein/typeset/raw/master/typeset-browser.png)

The browser also ends up with ten lines instead of the nine lines found by the Knuth and Plass line breaking algorithm. This comparison might not be completely fair since we don't know the default inter-word space used by the browser (nor its stretching and shrinking parameters.) Experimental results however indicate the values used in most browsers are either identical or very similar. The next section explains how the ratio values for the browser were calculated.

### Measuring the quality of browser line breaks

Unfortunately there is no API to retrieve the positions of the line breaks the browser inserted, so we'll have to resort to some trickery. By wrapping each word in an invisible `<span>` element and retrieving its `y` position we can find out when a new line starts. If the `y` position of the current word is different from the previous word we know a new line has started. This way a paragraph is split up in several individual lines.

The ratios are then calculated by measuring the difference between the width of each line when `text-align` is set to `justify` and when it is set to `left`. This difference is then divided by the amount of stretchability of the line: i.e. the number of spaces multiplied by the stretch width for spaces. Although we don't know the actual stretchability we can use 1/6 em, just like the Knuth and Plass algorithm, if we only use it for comparison.

### Assisted browser line breaks

The line breaking algorithm can also be used to correct the line breaks made by the browser. The easiest way to do is to split a text up into lines and adjust the CSS `word-spacing` property. Unfortunately, Webkit based browsers do not support sub-pixel word-spacing. Alternatively, we can absolute position each word or split the line into segmants with integer word spacing. You can see the latter approach in action on the [Flatland line breaking example.](examples/flatland/)

### Examples

The line breaking algorithm is not only capable of justifying text, it can perform all sorts of alignment with an appropriate selection of boxes, glue and penalties. It is also possible to give it varying line widths to flow text around illustrations, asides or quotes. Alternatively, varying line widths can be used to create interesting text shapes as demonstrated below.

#### Ragged right and centered alignment

The following example is set ragged right. Ragged right is not simply justified text with fixed width inter-word spacing. Instead the algorithm tries to minimize the amount of white space at the end of each sentence over the whole paragraph. It also attempts to reduce the number of words that are "sticking out" of the margin.

![](https://github.com/bramstein/typeset/raw/master/typeset-right.png)

Ragged left text can be achieved by using a ragged right text and aligning its line endings with the left border. The example below is set centered. Again this is not simply a centering of justified text, but instead an attempt at minimizing the line lengths over the whole paragraph.

![](https://github.com/bramstein/typeset/raw/master/typeset-centered.png)

#### Variable line width

By varying the line width for a paragraph it is possible to flow the text around illustrations, asides, quotes and such. The example below leaves a gap for an illustration by setting the line widths temporarily shorter and then reverting. You can also see that the algorithm chose to hyphenate certain words to achieve acceptable line breaking.

![](https://github.com/bramstein/typeset/raw/master/typeset-flow.png)

It is also possible to make some non-rectangular shapes, as shown in the examples below. In the first example, the text is laid out using an increasing line width and center aligning each line. This creates a triangular shape.

![](https://github.com/bramstein/typeset/raw/master/typeset-triangle.png)

Using some basic math it is also possible to set text in circles or even arbitrary polygons. Below is an example of text set inside a circle.

![](https://github.com/bramstein/typeset/raw/master/typeset-circle.png)

### To-do

The following are some extensions to the algorithm discussed in the original paper, which I intend to implement (at some point.)

* [Hanging punctuation](http://en.wikipedia.org/wiki/Hanging_punctuation). The following quote from the original paper explains how to implement it using the box, glue and penalty model:

   > Some people prefer to have the right edge of their text look ‘solid’,
   > by setting periods, commas, and other punctuation marks (including
   > inserted hyphens) in the right-hand margin. For example, this practice
   > is occasionally used in contemporary advertising.

   > It is easy to get inserted hyphens into the margin: We simply let the
   > width of the corresponding penalty item be zero. And it is almost as
   > easy to do the same for periods and other symbols, by putting every such
   > character in a box of width zero and adding the actual symbol width to
   > the glue that follows. If no break occurs at this glue, the accumulated
   > width is the same as before; and if a break does occur, the line will be
   > justified as if the period or other symbol were not present.

* Compare quality against line-breaking implemented by [Internet Explorer's `text-justify` CSS property](http://msdn.microsoft.com/en-us/library/ms534671%28VS.85%29.aspx).
* Figure out how to deal with dynamic paragraphs (i.e. paragraphs being edited) as their ratios will change during editing and thus visibly move around.

### References

These are the resources I found most useful while implementing the line breaking algorithm.

* [Digital Typography, Donald E. Knuth](http://www.amazon.com/Digital-Typography-Center-Language-Information/dp/1575860104/)
* [Breaking paragraphs into lines, Donald E. Knuth, Michael F. Plass](http://www3.interscience.wiley.com/journal/113445055/abstract)
* [Knuth & Plass line-breaking Revisited](http://defoe.sourceforge.net/folio/knuth-plass.html)
* [Wikipedia: Word wrap](http://en.wikipedia.org/w/index.php?title=Word_wrap)
