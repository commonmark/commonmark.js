"use strict";

function Renderer() {}

/**
 *  Walks the AST and calls member methods for each Node type.
 *
 *  @param ast {Node} The root of the abstract syntax tree.
 */
function render(ast) {
    var walker = ast.walker(),
        event,
        type;

    this.buffer = "";
    this.lastOut = "\n";

    while ((event = walker.next())) {
        type = event.node.type;
        if (this[type]) {
            this[type](event.node, event.entering);
        }
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
    this.lastOut = str;
}

/**
 *  Output a newline to the buffer.
 */
function cr() {
    if (this.lastOut !== "\n") {
        this.lit("\n");
    }
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

/**
 *  Escape a string for the target renderer.
 *
 *  Abstract function that should be implemented by concrete
 *  renderer implementations.
 *
 *  @param str {String} The string to escape.
 */
function esc(str) {
    return str;
}

Renderer.prototype.render = render;
Renderer.prototype.out = out;
Renderer.prototype.lit = lit;
Renderer.prototype.cr = cr;
Renderer.prototype.esc = esc;

export default Renderer;
