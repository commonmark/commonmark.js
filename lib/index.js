"use strict";

// commonmark.js - CommomMark in JavaScript
// Copyright (C) 2014 John MacFarlane
// License: BSD3.

// Basic usage:
//
// var commonmark = require('commonmark');
// var parser = new commonmark.Parser();
// var renderer = new commonmark.HtmlRenderer();
// console.log(renderer.render(parser.parse('Hello *world*')));
//
// With ES6 modules:
//
// import commonmark from 'commonmark';
//
// or
//
// import * as commonmark from 'commonmark';

import Node from "./node.js";
import Parser from "./blocks.js";
import Renderer from "./render/renderer.js";
import HtmlRenderer from "./render/html.js";
import XmlRenderer from "./render/xml.js";

export { Node, Parser, Renderer, HtmlRenderer, XmlRenderer };
export default { Node, Parser, Renderer, HtmlRenderer, XmlRenderer };
