"use strict";

var Types = {
  Document: 'document',
  Text: 'text',
  Softbreak: 'softbreak',
  Hardbreak: 'hardbreak',
  Emph: 'emph',
  Strong: 'strong',
  HtmlInline: 'htmlinline',
  CustomInline: 'custominline',
  Link: 'link',
  Image: 'image',
  Code: 'code',
  Paragraph: 'paragraph',
  BlockQuote: 'blockquote',
  Item: 'item',
  List: 'list',
  Heading: 'heading',
  CodeBlock: 'codeblock',
  HtmlBlock: 'htmlblock',
  CustomBlock: 'customblock',
  ThematicBreak: 'thematicbreak'
};

function Renderer() {}

/**
 *  Walks the AST and calls member methods for each Node type.
 *
 *  @param ast {Node} The root of the abstract syntax tree.
 */
function render(ast) {
  var walker = ast.walker()
    , event
    , type;

  this.buffer = '';

  while((event = walker.next())) {
    type = event.node.type.toLowerCase();
    if(!Types[event.node.type]) {
      throw new Error('Unknown node type ' + event.node.type);
    }
    this[type](event, event.node, event.entering);
  }
  return this.buffer;
}

/**
 *  Concatenate a literal string to the buffer.
 *
 *  @param str {String} The string to concatenate.
 */
function lit(str) {
  this.buffer += str;
}

/**
 *  Concatenate a string to the buffer possibly escaping the content.
 *
 *  Concrete renderer implementations should override this method.
 *
 *  @param str {String} The string to concatenate.
 */
function out(str) {
  this.lit(str);
}

Renderer.prototype.render = render;
Renderer.prototype.out = out;
Renderer.prototype.lit = lit;

Object.keys(Types).forEach(function(type) {
  Renderer.prototype[type.toLowerCase()] = function(/* event, node, entering */) {}
})

module.exports = Renderer;
