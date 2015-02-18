"use strict";

/*eslint-env browser*/
/*global $, _ */

var commonmark = window.commonmark;
var writer = new commonmark.HtmlRenderer({ sourcepos: true });
var xmlwriter = new commonmark.XmlRenderer({ sourcepos: true });
var reader = new commonmark.Parser();

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] === variable){
      return decodeURIComponent(pair[1]);
    }
  }
  return null;
}

$(document).ready(function() {
  var editor = window.ace.edit("text");
  editor.getSession().setUseWrapMode(true);
  editor.renderer.setShowGutter(false);
  // editor.setBehavioursEnabled(false);
  var timer;
  var x;
  var parsed;
  var render = function() {
    if (parsed === undefined) {
      return;
    }
    var startTime = new Date().getTime();
    var result = writer.render(parsed);
    var endTime = new Date().getTime();
    var renderTime = endTime - startTime;
    $("#preview").html(result);
    $("#html").text(result);
    $("#ast").text(xmlwriter.render(parsed));
    $("#rendertime").text(renderTime);
  };
  var syncScroll = function(e) {
    var lineHeight = editor.renderer.lineHeight;
    var lineNumber = editor.getSession().screenToDocumentRow(Math.floor(e / lineHeight) + 1);
    var elt = $("#preview [data-sourcepos^='" + lineNumber + ":']").last();
    if (elt.length > 0) {
        if (elt.offset()) {
            var curTop = $("#preview").scrollTop();
            $("#preview").animate({
                scrollTop: curTop + elt.offset().top - 100
            }, 50);
        }
    }
  };
  var markSelection = function() {
    var lineNumber = editor.selection.getCursor().row + 1;
    var elt = $("#preview [data-sourcepos^='" + lineNumber + ":']").last();
    if (elt.length > 0) {
        $("#preview .selected").removeClass("selected");
        elt.addClass("selected");
        syncScroll(editor.getSession().getScrollTop());
    }
  };
  var parseAndRender = function() {
    if (x) { x.abort(); } // If there is an existing XHR, abort it.
    clearTimeout(timer); // Clear the timer so we don't end up with dupes.
    timer = setTimeout(function() { // assign timer a new timeout
      var startTime = new Date().getTime();
      parsed = reader.parse(editor.getValue());
      var endTime = new Date().getTime();
      var parseTime = endTime - startTime;
      $("#parsetime").text(parseTime);
      $(".timing").css('visibility', 'visible');
      render();
      markSelection();
    }, 0); // ms delay
  };
  var initial_text = getQueryVariable("text");
  if (initial_text) {
    editor.setValue(initial_text);
    // show HTML tab if text is from query
    $('#result-tabs a[href="#result"]').tab('show');
  }

  parseAndRender();
  $("#clear-text-box").click(function() {
    editor.setValue('');
    parseAndRender();
  });
  $("#permalink").click(function() {
    window.location.pathname = "/index.html";
    window.location.search = "text=" + encodeURIComponent(editor.getValue());
  });
  editor.getSession().on('change', _.debounce(parseAndRender, 50, { maxWait: 100 }));
  editor.getSession().on('changeScrollTop', _.debounce(syncScroll, 50, { maxWait: 50 }));
  editor.getSession().selection.on('changeCursor', _.debounce(markSelection, 50, { maxWait: 100}));
  $("#smart").click(function() {
      reader = new commonmark.Parser({smart: $("#smart").is(":checked")});
      parseAndRender();
  });
});
