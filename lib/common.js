"use strict";

import encode from "mdurl/encode.js";
import { decodeHTML } from "entities";

var C_BACKSLASH = 92;

var ENTITY = "&(?:#x[a-f0-9]{1,6}|#[0-9]{1,7}|[a-z][a-z0-9]{1,31});";

var TAGNAME = "[A-Za-z][A-Za-z0-9-]*";
var ATTRIBUTENAME = "[a-zA-Z_:][a-zA-Z0-9:._-]*";
var UNQUOTEDVALUE = "[^\"'=<>`\\x00-\\x20]+";
var SINGLEQUOTEDVALUE = "'[^']*'";
var DOUBLEQUOTEDVALUE = '"[^"]*"';
var ATTRIBUTEVALUE =
    "(?:" +
    UNQUOTEDVALUE +
    "|" +
    SINGLEQUOTEDVALUE +
    "|" +
    DOUBLEQUOTEDVALUE +
    ")";
var ATTRIBUTEVALUESPEC = "(?:" + "\\s*=" + "\\s*" + ATTRIBUTEVALUE + ")";
var ATTRIBUTE = "(?:" + "\\s+" + ATTRIBUTENAME + ATTRIBUTEVALUESPEC + "?)";
var OPENTAG = "<" + TAGNAME + ATTRIBUTE + "*" + "\\s*/?>";
var CLOSETAG = "</" + TAGNAME + "\\s*[>]";
var HTMLCOMMENT = "<!---->|<!--(?:-?[^>-])(?:-?[^-])*-->";
var PROCESSINGINSTRUCTION = "[<][?][\\s\\S]*?[?][>]";
var DECLARATION = "<![A-Z]+" + "\\s+[^>]*>";
var CDATA = "<!\\[CDATA\\[[\\s\\S]*?\\]\\]>";
var HTMLTAG =
    "(?:" +
    OPENTAG +
    "|" +
    CLOSETAG +
    "|" +
    HTMLCOMMENT +
    "|" +
    PROCESSINGINSTRUCTION +
    "|" +
    DECLARATION +
    "|" +
    CDATA +
    ")";
var reHtmlTag = new RegExp("^" + HTMLTAG);

var reBackslashOrAmp = /[\\&]/;

var ESCAPABLE = "[!\"#$%&'()*+,./:;<=>?@[\\\\\\]^_`{|}~-]";

var reEntityOrEscapedChar = new RegExp("\\\\" + ESCAPABLE + "|" + ENTITY, "gi");

var XMLSPECIAL = '[&<>"]';

var reXmlSpecial = new RegExp(XMLSPECIAL, "g");

var unescapeChar = function(s) {
    if (s.charCodeAt(0) === C_BACKSLASH) {
        return s.charAt(1);
    } else {
        return decodeHTML(s);
    }
};

// Replace entities and backslash escapes with literal characters.
var unescapeString = function(s) {
    if (reBackslashOrAmp.test(s)) {
        return s.replace(reEntityOrEscapedChar, unescapeChar);
    } else {
        return s;
    }
};

var normalizeURI = function(uri) {
    try {
        return encode(uri);
    } catch (err) {
        return uri;
    }
};

var replaceUnsafeChar = function(s) {
    switch (s) {
        case "&":
            return "&amp;";
        case "<":
            return "&lt;";
        case ">":
            return "&gt;";
        case '"':
            return "&quot;";
        default:
            return s;
    }
};

var escapeXml = function(s) {
    if (reXmlSpecial.test(s)) {
        return s.replace(reXmlSpecial, replaceUnsafeChar);
    } else {
        return s;
    }
};

export {
    unescapeString,
    normalizeURI,
    escapeXml,
    reHtmlTag,
    OPENTAG,
    CLOSETAG,
    ENTITY,
    ESCAPABLE
};
