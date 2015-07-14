commonmark.js
=============

[![Build Status](https://img.shields.io/travis/jgm/commonmark.js/master.svg?style=flat)](https://travis-ci.org/jgm/commonmark.js)
[![NPM version](https://img.shields.io/npm/v/commonmark.svg?style=flat)](https://www.npmjs.org/package/commonmark)


CommonMark is a rationalized version of Markdown syntax,
with a [spec][the spec] and BSD-licensed reference
implementations in C and JavaScript.

  [the spec]: http://spec.commonmark.org

For more information, see <http://commonmark.org>.

This repository contains the JavaScript reference implementation.
It provides a library with functions for parsing CommonMark
documents to an abstract syntax tree (AST), manipulating the AST,
and rendering the document to HTML or to an XML representation of the
AST.

To play with this library without installing it, see
the live dingus at <http://try.commonmark.org/>.

Installing
----------

You can install the library using `npm`:

    npm install commonmark

This package includes the commonmark library and a
command-line executable, `commonmark`.

For client-side use, you can do `make dist` to produce
a standalone JavaScript file `js/dist/commonmark.js`,
suitable for linking into a web page, or fetch the latest
from <http://spec.commonmark.org/js/commonmark.js>, or
`bower install commonmark`.

To run tests for the JavaScript library:

    npm install # if needed to fetch dependencies
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

``` js
var reader = new commonmark.Parser();
var writer = new commonmark.HtmlRenderer();
var parsed = reader.parse("Hello *world*"); // parsed is a 'Node' tree
// transform parsed if you like...
var result = writer.render(parsed); // result is a String
```

The constructors for `Parser` and `HtmlRenderer` take an optional
`options` parameter:

``` js
var writer = new commonmark.HtmlRenderer({sourcepos: true});
```

The following options are currently supported:

- `sourcepos`:  if `true`, source position information for block-level
  elements will be rendered in the `data-sourcepos` attribute (for
  HTML) or the `sourcepos` attribute (for XML).
- `smart`:  if `true`, straight quotes will be made curly, `--` will
  be changed to an en dash, `---` will be changed to an em dash, and
  `...` will be changed to ellipses.
- `safe`: if `true`, raw HTML will not be passed through to HTML
  output (it will be replaced by comments), and potentially unsafe
  URLs in links and images (those beginning with `javascript:`,
  `vbscript:`, `file:`, and with a few exceptions `data:`) will
  be replaced with empty strings.

It is also possible to override the `escape` and `softbreak`
properties of a renderer.  So, to make soft breaks render as hard
breaks in HTML:

``` js
var writer = new commonmark.HtmlRenderer;
writer.softbreak = "<br />";
```

To make them render as spaces:

``` js
writer.softbreak = " ";
```

To override `escape`, pass it a function with two parameters:
the first is the string to be escaped, the second is a boolean
that is `true` if the escaped string is to be included in an
attribute.

In addition to the `HtmlRenderer`, there is an `XmlRenderer`, which
will produce an XML representation of the AST:

``` js
var writer = new commonmark.XmlRenderer({sourcepos: true});
```

The parser returns a Node.  The following public properties are defined
(those marked "read-only" have only a getter, not a setter):

- `type` (read-only):  a String, one of
  `Text`, `Softbreak`, `Hardbreak`, `Emph`, `Strong`,
  `Html`, `Link`, `Image`, `Code`, `Document`, `Paragraph`,
  `BlockQuote`, `Item`, `List`, `Header`, `CodeBlock`,
  `HtmlBlock` `HorizontalRule`.
- `firstChild` (read-only):  a Node or null.
- `lastChild` (read-only): a Node or null.
- `next` (read-only): a Node or null.
- `prev` (read-only): a Node or null.
- `parent` (read-only): a Node or null.
- `sourcepos` (read-only): an Array with the following form:
  `[[startline, startcolumn], [endline, endcolumn]]`.
- `isContainer` (read-only): `true` if the Node can contain other
   Nodes as children.
- `literal`: the literal String content of the node or null.
- `destination`: link or image destination (String) or null.
- `title`: link or image title (String) or null.
- `info`: fenced code block info string (String) or null.
- `level`: header level (Number).
- `listType`: a String, either `Bullet` or `Ordered`.
- `listTight`: `true` if list is tight.
- `listStart`: a Number, the starting number of an ordered list.
- `listDelimiter`: a String, either `)` or `.` for an ordered list.

Nodes have the following public methods:

- `appendChild(child)`:  Append a Node `child` to the end of the
  Node's children.
- `prependChild(child)`:  Prepend a Node `child` to the end of the
  Node's children.
- `unlink()`:  Remove the Node from the tree, severing its links
  with siblings and parents, and closing up gaps as needed.
- `insertAfter(sibling)`: Insert a Node `sibling` after the Node.
- `insertBefore(sibling)`: Insert a Node `sibling` before the Node.
- `walker()`: Returns a NodeWalker that can be used to iterate through
  the Node tree rooted in the Node.

The NodeWalker returned by `walker()` has two methods:

- `next()`: Returns an object with properties `entering` (a boolean,
  which is `true` when we enter a Node from a parent or sibling, and
  `false` when we reenter it from a child).  Returns `null` when
  we have finished walking the tree.
- `resumeAt(node, entering)`: Resets the iterator to resume at the
  specified node and setting for `entering`.  (Normally this isn't
  needed unless you do destructive updates to the Node tree.)

Here is an example of the use of a NodeWalker to iterate through
the tree, making transformations.  This simple example converts
the contents of all `Text` nodes to ALL CAPS:

``` js
var walker = parsed.walker();
var event, node;

while ((event = walker.next())) {
  node = event.node;
  if (event.entering && node.type === 'Text') {
    node.literal = node.literal.toUpperCase();
  }
}
```

This more complex example converts emphasis to ALL CAPS:

``` js
var walker = parsed.walker();
var event, node;
var inEmph = false;

while ((event = walker.next())) {
  node = event.node;
  if (node.type === 'Emph') {
    if (event.entering) {
      inEmph = true;
    } else {
      inEmph = false;
      // add Emph node's children as siblings
      while (node.firstChild) {
        node.insertBefore(node.firstChild);
      }
      // remove the empty Emph node
      node.unlink()
    }
  } else if (inEmph && node.type === 'Text') {
      node.literal = node.literal.toUpperCase();
  }
}
```

Exercises for the reader:  write a transform to

1. De-linkify a document, transforming links to regular text.
2. Remove all raw HTML (`Html` and `HtmlBlock` nodes).
3. Run fenced code blocks marked with a language name through
   a syntax highlighting library, replacing them with an `HtmlBlock`
   containing the highlighted code.
4. Print warnings to the console for images without image
   descriptions or titles.

A note on security
------------------

The library does not attempt to sanitize link attributes or
raw HTML.  If you use this library in applications that accept
untrusted user input, you should either enable the `safe` option
(see above) or run the output through an HTML sanitizer to protect against
[XSS attacks](http://en.wikipedia.org/wiki/Cross-site_scripting).

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
against showdown (which is usually the slowest implementation).
Versions:  commonmark.js 0.21.0, markdown-it 4.3.0,
showdown 1.2.0, marked 0.3.3, with node 0.10.25.

| Sample                   |showdown  |commonmark|marked    |markdown-it|
|--------------------------|---------:|---------:|---------:|----------:|
|[block-bq-flat.md]        |         1|       4.2|       4.9|        4.9|
|[block-bq-nested.md]      |         1|      10.0|       7.6|       11.1|
|[block-code.md]           |         1|       3.8|      10.0|       14.5|
|[block-fences.md]         |         1|       6.0|      16.5|       14.3|
|[block-heading.md]        |         1|       3.9|       4.6|        5.5|
|[block-hr.md]             |         1|       2.6|       3.0|        3.8|
|[block-html.md]           |         1|       1.7|       0.8|        3.9|
|[block-lheading.md]       |         1|       3.6|       4.6|        3.1|
|[block-list-flat.md]      |         1|       4.3|       4.6|        6.5|
|[block-list-nested.md]    |         1|       7.1|       6.1|       13.2|
|[block-ref-flat.md]       |         1|       0.6|       0.4|        0.5|
|[block-ref-nested.md]     |         1|       0.5|       0.5|        0.7|
|[inline-autolink.md]      |         1|       2.0|       3.4|        2.5|
|[inline-backticks.md]     |         1|       5.6|       4.6|        7.9|
|[inline-em-flat.md]       |         1|       1.0|       1.0|        1.5|
|[inline-em-nested.md]     |         1|       1.2|       1.2|        1.4|
|[inline-em-worst.md]      |         1|       1.5|       1.3|        0.9|
|[inline-entity.md]        |         1|       1.0|       3.7|        2.5|
|[inline-escape.md]        |         1|       2.0|       1.3|        4.3|
|[inline-html.md]          |         1|       2.0|       3.7|        3.0|
|[inline-links-flat.md]    |         1|       2.4|       2.5|        2.4|
|[inline-links-nested.md]  |         1|       1.8|       0.5|        0.3|
|[inline-newlines.md]      |         1|       1.8|       1.8|        2.4|
|[lorem1.md]               |         1|       6.3|       3.4|        3.6|
|[rawtabs.md]              |         1|       4.3|       4.2|        4.9|
|[README.md]               |         1|       3.6|       3.3|        4.1|

[block-lheading.md]: bench/samples/block-lheading.md
[block-heading.md]: bench/samples/block-heading.md
[inline-html.md]: bench/samples/inline-html.md
[lorem1.md]: bench/samples/lorem1.md
[block-list-flat.md]: bench/samples/block-list-flat.md
[block-hr.md]: bench/samples/block-hr.md
[block-fences.md]: bench/samples/block-fences.md
[block-ref-flat.md]: bench/samples/block-ref-flat.md
[block-bq-flat.md]: bench/samples/block-bq-flat.md
[inline-escape.md]: bench/samples/inline-escape.md
[rawtabs.md]: bench/samples/rawtabs.md
[block-list-nested.md]: bench/samples/block-list-nested.md
[block-ref-nested.md]: bench/samples/block-ref-nested.md
[block-bq-nested.md]: bench/samples/block-bq-nested.md
[inline-entity.md]: bench/samples/inline-entity.md
[README.md]: bench/samples/README.md
[block-html.md]: bench/samples/block-html.md
[inline-newlines.md]: bench/samples/inline-newlines.md
[inline-links-flat.md]: bench/samples/inline-links-flat.md
[inline-em-flat.md]: bench/samples/inline-em-flat.md
[inline-backticks.md]: bench/samples/inline-backticks.md
[block-code.md]: bench/samples/block-code.md
[inline-autolink.md]: bench/samples/inline-autolink.md
[inline-links-nested.md]: bench/samples/inline-links-nested.md
[inline-em-worst.md]: bench/samples/inline-em-worst.md
[inline-em-nested.md]: bench/samples/inline-em-nested.md

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
