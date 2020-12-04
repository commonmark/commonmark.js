"use strict";

var benchmark = require("benchmark");
var fs = require("fs");
var commonmark = require("commonmark");
var Showdown = require("showdown");
var marked = require("marked");
var _markdownit = require("markdown-it");

var suite = new benchmark.Suite();
var markdownit = _markdownit("commonmark");

// disable expensive IDNa links encoding:
var markdownit_encode = markdownit.utils.lib.mdurl.encode;
markdownit.normalizeLink = function(url) {
    return markdownit_encode(url);
};
markdownit.normalizeLinkText = function(str) {
    return str;
};

var showdown = new Showdown.Converter();
var parser = new commonmark.Parser();
var renderer = new commonmark.HtmlRenderer();

var benchfile = process.argv[2];

var contents = fs.readFileSync(benchfile, "utf8");

suite
    .add("commonmark.js", function() {
        renderer.render(parser.parse(contents));
    })

    .add("showdown.js", function() {
        showdown.makeHtml(contents);
    })

    .add("marked.js", function() {
        marked(contents);
    })

    .add("markdown-it", function() {
        markdownit.render(contents);
    })

    .on("cycle", function(event) {
        console.log(String(event.target));
    })
    .run();
