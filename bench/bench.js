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

var showdown = new Showdown.converter();
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
