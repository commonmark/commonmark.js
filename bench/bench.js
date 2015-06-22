"use strict";

var Benchmark = require('benchmark').Benchmark;
var suite = new Benchmark.Suite();
var fs = require('fs');
var commonmark = require('../lib/index.js');
// npm install showdown
var Showdown = require('showdown');
// npm install marked
var marked = require('marked');
// npm install markdown-it
var markdownit = require('markdown-it')('commonmark');
// disable expensive IDNa links encoding:
var markdownit_encode = markdownit.utils.lib.mdurl.encode;
markdownit.normalizeLink = function(url) { return markdownit_encode(url); };
markdownit.normalizeLinkText = function(str) { return str; };

var showdown = new Showdown.Converter();
var parser = new commonmark.Parser();
var parserSmart = new commonmark.Parser({smart: true});
var renderer = new commonmark.HtmlRenderer();

var benchfile = process.argv[2];

var contents = fs.readFileSync(benchfile, 'utf8');

suite.add('commonmark.js', function() {
  renderer.render(parser.parse(contents));
})

.add('showdown.js', function() {
  showdown.makeHtml(contents);
})

.add('marked.js', function() {
  marked(contents);
})

.add('markdown-it', function() {
  markdownit.render(contents);
})

.on('cycle', function(event) {
  console.log(String(event.target));
})
.run();
