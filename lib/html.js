"use strict";

var common = require('./common');
var escapeXml = common.escapeXml;
var objectAssign = common.objectAssign;


// Helper function to produce an HTML tag.
var tag = function(name, attrs, selfclosing) {
    var result = '<' + name;
    if (attrs && attrs.length > 0) {
        var i = 0;
        var attrib;
        while ((attrib = attrs[i]) !== undefined) {
            result += ' ' + attrib[0] + '="' + attrib[1] + '"';
            i++;
        }
    }
    if (selfclosing) {
        result += ' /';
    }

    result += '>';
    return result;
};

var reHtmlTag = /\<[^>]*\>/;
var reUnsafeProtocol = /^javascript:|vbscript:|file:|data:/i;
var reSafeDataProtocol = /^data:image\/(?:png|gif|jpeg|webp)/i;

var isUrlSafe = function(url) {
    return !reUnsafeProtocol.test(url) || reSafeDataProtocol.test(url);
};

var renderNodes = function(block) {

    var attrs;
    var info_words;
    var tagname;
    var walker = block.walker();
    var event, node, entering;
    var buffer = "";
    var lastOut = "\n";
    var disableTags = 0;
    var grandparent;
    var out = function(s) {
        if (disableTags > 0) {
            buffer += s.replace(reHtmlTag, '');
        } else {
            buffer += s;
        }
        lastOut = s;
    };
    var esc = this.escape;
    var cr = function() {
        if (lastOut !== '\n') {
            buffer += '\n';
            lastOut = '\n';
        }
    };

    var options = this.options;

    if (options.time) { console.time("rendering"); }

    function handleHtml(htmlNode){
        if (options.safe) {
            out(options.sanitize(htmlNode));
        } else {
            out(htmlNode.literal);
        }
    }

    while ((event = walker.next())) {
        entering = event.entering;
        node = event.node;

        attrs = [];
        if (options.sourcepos) {
            var pos = node.sourcepos;
            if (pos) {
                attrs.push(['data-sourcepos', String(pos[0][0]) + ':' +
                            String(pos[0][1]) + '-' + String(pos[1][0]) + ':' +
                            String(pos[1][1])]);
            }
        }

        switch (node.type) {
        case 'Text':
            out(esc(node.literal, false));
            break;

        case 'Softbreak':
            out(this.softbreak);
            break;

        case 'Hardbreak':
            out(tag('br', [], true));
            cr();
            break;

        case 'Emph':
            out(tag(entering ? 'em' : '/em'));
            break;

        case 'Strong':
            out(tag(entering ? 'strong' : '/strong'));
            break;

        case 'HtmlInline':
            handleHtml(node);
            break;

        case 'CustomInline':
            if (entering && node.onEnter) {
                out(node.onEnter);
            } else if (!entering && node.onExit) {
                out(node.onExit);
            }
            break;

        case 'Link':
            if (entering) {
                if (!options.safe || options.isUrlSafe(node.destination)) {
                    attrs.push(['href', esc(node.destination, true)]);
                }
                if (node.title) {
                    attrs.push(['title', esc(node.title, true)]);
                }
                out(tag('a', attrs));
            } else {
                out(tag('/a'));
            }
            break;

        case 'Image':
            if (entering) {
                if (disableTags === 0) {
                    if (options.safe && !options.isUrlSafe(node.destination)) {
                        out('<img src="" alt="');
                    } else {
                        out('<img src="' + esc(node.destination, true) +
                            '" alt="');
                    }
                }
                disableTags += 1;
            } else {
                disableTags -= 1;
                if (disableTags === 0) {
                    if (node.title) {
                        out('" title="' + esc(node.title, true));
                    }
                    out('" />');
                }
            }
            break;

        case 'Code':
            out(tag('code') + esc(node.literal, false) + tag('/code'));
            break;

        case 'Document':
            break;

        case 'Paragraph':
            grandparent = node.parent.parent;
            if (grandparent !== null &&
                grandparent.type === 'List') {
                if (grandparent.listTight) {
                    break;
                }
            }
            if (entering) {
                cr();
                out(tag('p', attrs));
            } else {
                out(tag('/p'));
                cr();
            }
            break;

        case 'BlockQuote':
            if (entering) {
                cr();
                out(tag('blockquote', attrs));
                cr();
            } else {
                cr();
                out(tag('/blockquote'));
                cr();
            }
            break;

        case 'Item':
            if (entering) {
                out(tag('li', attrs));
            } else {
                out(tag('/li'));
                cr();
            }
            break;

        case 'List':
            tagname = node.listType === 'Bullet' ? 'ul' : 'ol';
            if (entering) {
                var start = node.listStart;
                if (start !== null && start !== 1) {
                    attrs.push(['start', start.toString()]);
                }
                cr();
                out(tag(tagname, attrs));
                cr();
            } else {
                cr();
                out(tag('/' + tagname));
                cr();
            }
            break;

        case 'Heading':
            tagname = 'h' + node.level;
            if (entering) {
                cr();
                out(tag(tagname, attrs));
            } else {
                out(tag('/' + tagname));
                cr();
            }
            break;

        case 'CodeBlock':
            info_words = node.info ? node.info.split(/\s+/) : [];
            if (info_words.length > 0 && info_words[0].length > 0) {
                attrs.push(['class', 'language-' + esc(info_words[0], true)]);
            }
            cr();
            out(tag('pre') + tag('code', attrs));
            out(esc(node.literal, false));
            out(tag('/code') + tag('/pre'));
            cr();
            break;

        case 'HtmlBlock':
            cr();
            handleHtml(node);
            cr();
            break;

        case 'CustomBlock':
            cr();
            if (entering && node.onEnter) {
                out(node.onEnter);
            } else if (!entering && node.onExit) {
                out(node.onExit);
            }
            cr();
            break;

        case 'ThematicBreak':
            cr();
            out(tag('hr', attrs, true));
            cr();
            break;

        default:
            throw "Unknown node type " + node.type;
        }

    }
    if (options.time) { console.timeEnd("rendering"); }
    return buffer;
};

// The HtmlRenderer object.
function HtmlRenderer(options){
    return {
        // default options:
        softbreak: '\n', // by default, soft breaks are rendered as newlines in HTML
        // set to "<br />" to make them hard breaks
        // set to " " if you want to ignore line wrapping in source
        escape: escapeXml,
        options: objectAssign({ sanitize: function() { return '<!-- raw HTML omitted -->'; }, isUrlSafe: isUrlSafe }, options),
        render: renderNodes
    };
}

module.exports = HtmlRenderer;
