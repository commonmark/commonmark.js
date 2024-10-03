"use strict";

/*eslint-env browser*/
/*global $, _ */

var commonmark = window.commonmark;
var writer = new commonmark.HtmlRenderer({ sourcepos: true });
var htmlwriter = new commonmark.HtmlRenderer({ sourcepos: false });
var xmlwriter = new commonmark.XmlRenderer({ sourcepos: false });
var reader = new commonmark.Parser();

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] === variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    return null;
}

var render = function(parsed) {
    if (parsed === undefined) {
        return;
    }
    var startTime = new Date().getTime();
    var result = writer.render(parsed);
    var endTime = new Date().getTime();
    var renderTime = endTime - startTime;
    var preview = $("#preview iframe")
        .contents()
        .find("body");
    preview.get(0).innerHTML = result;
    $("#html").text(htmlwriter.render(parsed));
    $("#ast").text(xmlwriter.render(parsed));
    $("#rendertime").text(renderTime);
};

var syncScroll = function() {
    var textarea = $("#text");
    var preview = $("#preview iframe")
        .contents()
        .find("body");
    var lineHeight = parseFloat(textarea.css("line-height"));
    // NOTE this assumes we don't have wrapped lines,
    // so we have set white-space:nowrap on the textarea:
    var lineNumber = Math.floor(textarea.scrollTop() / lineHeight) + 1;
    var elt = preview.find("*[data-sourcepos^='" + lineNumber + ":']").last();
    if (elt.length > 0) {
        if (elt.offset()) {
            preview.animate(
                {
                    scrollTop: elt.offset().top - 100
                },
                50
            );
        }
    }
};

var markSelection = function() {
    var cursorPos = $("#text").prop("selectionStart");
    // now count newline up to this pos
    var textval = $("#text").val();
    var lineNumber = 1;
    for (var i = 0; i < cursorPos; i++) {
        if (textval.charAt(i) === "\n") {
            lineNumber++;
        }
    }
    var preview = $("#preview iframe")
        .contents()
        .find("body");
    var elt = preview.find("[data-sourcepos^='" + lineNumber + ":']").last();
    if (elt.length > 0) {
        preview.find(".selected").removeClass("selected");
        elt.addClass("selected");
    }
    syncScroll();
};

var parseAndRender = function() {
    var textarea = $("#text");
    var startTime = new Date().getTime();
    var parsed = reader.parse(textarea.val());
    var endTime = new Date().getTime();
    var parseTime = endTime - startTime;
    $("#parsetime").text(parseTime);
    $(".timing").css("visibility", "visible");
    render(parsed);
    markSelection();
};

var onIframeLoad = function() {
    var textarea = $("#text");
    var initial_text = getQueryVariable("text");
    var smartSelected = getQueryVariable("smart") === "1";
    $("#smart").prop("checked", smartSelected);
    reader.options.smart = smartSelected;
    if (initial_text) {
        textarea.val(initial_text);
    }

    parseAndRender();

    $("#clear-text-box").click(function() {
        textarea.val("");
        parseAndRender();
    });

    $("#permalink").click(function() {
        var smart = $("#smart").prop("checked");
        window.location.pathname = "/index.html";
        window.location.search =
            "text=" +
            encodeURIComponent(textarea.val()) +
            (smart ? "&smart=1" : "");
    });

    textarea.bind(
        "input propertychange",
        _.debounce(parseAndRender, 50, { maxWait: 100 })
    );
    //textarea.on('scroll', _.debounce(syncScroll, 50, { maxWait: 50 }));
    textarea.on("scroll", syncScroll);
    textarea.on(
        "keydown click focus",
        _.debounce(markSelection, 50, { maxWait: 100 })
    );

    $("#smart").click(function() {
        reader.options.smart = $("#smart").prop("checked");
        parseAndRender();
    });
};

var iframeLoaded = false;

$("iframe").on("load", function() {
    iframeLoaded = true;
});

$(document).ready(function() {
    if (iframeLoaded) {
        onIframeLoad();
    } else {
        $("iframe").on("load", onIframeLoad);
    }
});

// From: https://stackoverflow.com/a/45396754/77002
$(function() { 
	var enabled = true;
	$("textarea").keydown(function(e) {

		// Escape key toggles tab on/off
		if (e.keyCode==27)
		{
			enabled = !enabled;
			return false;
		}

		// Enter Key?
		if (e.keyCode === 13 && enabled)
		{
			// selection?
			if (this.selectionStart == this.selectionEnd)
			{
				// find start of the current line
				var sel = this.selectionStart;
				var text = $(this).val();
				while (sel > 0 && text[sel-1] != '\n')
				sel--;

				var lineStart = sel;
				while (text[sel] == ' ' || text[sel]=='\t')
				sel++;

				if (sel > lineStart)
				{
					// Insert carriage return and indented text
					document.execCommand('insertText', false, "\n" + text.substr(lineStart, sel-lineStart));

					// Scroll caret visible
					this.blur();
					this.focus();
					return false;
				}
			}
		}

		// Tab key?
		if(e.keyCode === 9 && enabled) 
		{
			// selection?
			if (this.selectionStart == this.selectionEnd)
			{
				// These single character operations are undoable
				if (!e.shiftKey)
				{
					document.execCommand('insertText', false, "\t");
				}
				else
				{
					var text = this.value;
					if (this.selectionStart > 0 && text[this.selectionStart-1]=='\t')
					{
						document.execCommand('delete');
					}
				}
			}
			else
			{
				// Block indent/unindent trashes undo stack.
				// Select whole lines
				var selStart = this.selectionStart;
				var selEnd = this.selectionEnd;
				var text = $(this).val();
				while (selStart > 0 && text[selStart-1] != '\n')
					selStart--;
				while (selEnd > 0 && text[selEnd-1]!='\n' && selEnd < text.length)
					selEnd++;

				// Get selected text
				var lines = text.substr(selStart, selEnd - selStart).split('\n');

				// Insert tabs
				for (var i=0; i<lines.length; i++)
				{
					// Don't indent last line if cursor at start of line
					if (i==lines.length-1 && lines[i].length==0)
						continue;

					// Tab or Shift+Tab?
					if (e.shiftKey)
					{
						if (lines[i].startsWith('\t'))
							lines[i] = lines[i].substr(1);
						else if (lines[i].startsWith("    "))
							lines[i] = lines[i].substr(4);
					}
					else
						lines[i] = "\t" + lines[i];
				}
				lines = lines.join('\n');

				// Update the text area
				this.value = text.substr(0, selStart) + lines + text.substr(selEnd);
				this.selectionStart = selStart;
				this.selectionEnd = selStart + lines.length; 
			}

            parseAndRender();
			return false;
		}

		enabled = true;
		return true;
	});
});