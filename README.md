commonmark.js
=============

CommonMark is a rationalized version of Markdown syntax,
with a [spec][the spec] and BSD3-licensed reference
implementations in C and JavaScript.

  [the spec]: http://spec.commonmark.org

For more information, see <http://commonmark.org>.

This repository contains the JavaScript reference implementation.
It provides a library with functions for parsing CommonMark
documents to an abstract syntax tree (AST), manipulating the AST,
and rendering the document to HTML or to an XML representation of the
AST.

To play with this library without installing it, see
the live dingus at <http://spec.commonmark.org/dingus.html>.

Installing
----------

You can install the library using `npm`:

    npm install commonmark

This package includes the commonmark library and a
command-line executable, `commonmark`.

For client-side use, you can do `make dist` to produce
a standalone JavaScript file `js/dist/commonmark.js`,
suitable for linking into a web page, or just fetch
<http://spec.commonmark.org/js/commonmark.js>.

To run tests for the JavaScript library:

    make test

To run benchmarks against some other JavaScript converters:

    npm install benchmark showdown marked markdown-it
    make bench

To start an interactive dingus that you can use to try out
the library:

    make dingus

Usage
-----

Instead of converting Markdown directly to HTML, as most converters
do, `commonmark.js` parses Markdown to an AST (abstract syntax tree),
and then renders this AST as HTML.  This opens up the possibility of
manipulating the AST between parsing and rendering.  For example, one
could transform emphasis into ALL CAPS.

Here's a basic usage example:

    var reader = new commonmark.Parser();
    var writer = new commonmark.HtmlRenderer();
    var parsed = reader.parse("Hello *world*"); // parsed is a 'Node' tree
    // transform parsed if you like...
    var result = writer.render(parsed);  // result is a string

<!-- TODO

Public API
----------

### Parser

constructor takes options param
explain what can go into options

public
properties: options
methods:  parse

?? should we add a filters [] option?
a filter could be a function that transforms a node,
and the parser could automatically run a walker with
each filter

### Node

getters:  type, firstChild, lastChild,,
  next, prev, parent, sourcepos, isContainer
getters+setters: literal, destination, title,
  info, level, listType, listTight, listStart,
  listDelimiter
methods: appendChild(child),
  prependChild(child),
  unlink(),
  insertAfter(sibling),
  insertBefore(sibling),
  walker()

walker returns NodeWalker object with methods:
  resumeAt(node, entering)
  next() - returns an objcet with properties 'entering' and 'node'

examples:
  capitalize every string
  changing emphasis to ALL CAPS
  de-linkifying
  running all the code samples through a highlighter or other
  transform (svg?)

?? would it be better to include NodeWalker in the API
and have people do walker = new NodeWalker(node)?
probably.

### HtmlRenderer

constructor takes options param
document relevant options

methods:
  escapeXml(string, isAttribute)
  render(node)
properties:
  options


### XmlRenderer

constructor takes options param
document relevant options

methods:
  escapeXml(string, isAttribute)
  render(node)
properties:
  options

-->

Performance
-----------

Performance is excellent, roughly on par with `marked`.  On a benchmark
converting an 11 MB Markdown file built by concatenating the Markdown
sources of all localizations of the first edition of
[*Pro Git*](https://github.com/progit/progit/tree/master/en) by Scott
Chacon, the command-line tool, `commonmark` is just a bit slower than
the C program `discount`, roughly ten times faster than PHP Markdown,
a hundred times faster than Python Markdown, and more than
a thousand times faster than `Markdown.pl`.

Here are some focused benchmarks of four JavaScript libraries
(using versions available on 24 Jan 2015). They test performance
on different kinds of Markdown texts.  (Most of these samples
are taken from the
[markdown-it](https://github.com/markdown-it/markdown-it)
repository.)  Results show a ratio of ops/second (higher is better)
against the slowest implementation (always showdown).

| Sample                 |showdown  |commonmark|marked    |markdown-it|
|------------------------|---------:|---------:|---------:|----------:|
|README.md               |         1|       3.3|       3.1|        4.3|
|block-bq-flat.md        |         1|       9.3|      13.6|       13.7|
|block-bq-nested.md      |         1|      12.5|      10.6|       13.2|
|block-code.md           |         1|      28.8|      64.7|       95.4|
|block-fences.md         |         1|      20.7|      67.9|       72.9|
|block-heading.md        |         1|      11.1|      11.8|       19.6|
|block-hr.md             |         1|      15.0|      16.0|       41.4|
|block-html.md           |         1|       8.2|       3.0|       15.9|
|block-lheading.md       |         1|      15.3|      19.2|       16.8|
|block-list-flat.md      |         1|       4.6|       4.4|       10.7|
|block-list-nested.md    |         1|       7.7|       6.0|       19.3|
|block-ref-flat.md       |         1|       2.0|       1.3|        1.7|
|block-ref-nested.md     |         1|       1.7|       1.6|        2.9|
|inline-autolink.md      |         1|       4.4|       7.4|        4.7|
|inline-backticks.md     |         1|      16.3|      14.3|       30.5|
|inline-em-flat.md       |         1|       4.1|       3.5|        9.2|
|inline-em-nested.md     |         1|       5.2|       5.1|        7.9|
|inline-em-worst.md      |         1|       5.7|       5.4|        3.7|
|inline-entity.md        |         1|       5.3|      10.5|        8.5|
|inline-escape.md        |         1|       4.8|       3.1|       13.1|
|inline-html.md          |         1|       3.6|       5.4|        5.1|
|inline-links-flat.md    |         1|       3.5|       4.2|        4.1|
|inline-links-nested.md  |         1|       4.1|       1.1|        1.6|
|inline-newlines.md      |         1|       7.6|       7.3|       15.3|
|lorem1.md               |         1|       8.9|       5.1|        5.7|
|rawtabs.md              |         1|       9.7|      10.6|       15.4|

To generate this table,

    npm install showdown marked markdown-it benchmark
    make bench-detailed

Authors
-------

John MacFarlane wrote the first version of the JavaScript
implementation.  The block parsing algorithm was worked out together
with David Greenspan.  Kārlis Gaņģis helped work out a better parsing
algorithm for links and emphasis, eliminating several worst-case
performance issues.  Vitaly Puzrin has offered much good advice
about optimization and other issues.
