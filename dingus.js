"use strict";

/*eslint-env browser*/
/*global $, commonmark*/

var writer = new commonmark.HtmlRenderer();
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

// via http://stackoverflow.com/questions/499126/jquery-set-cursor-position-in-text-area
function setSelectionRange(input, selectionStart, selectionEnd) {
  if (input.setSelectionRange) {
    input.focus();
    input.setSelectionRange(selectionStart, selectionEnd);
  }
  else if (input.createTextRange) {
    var range = input.createTextRange();
    range.collapse(true);
    range.moveEnd('character', selectionEnd);
    range.moveStart('character', selectionStart);
    range.select();
  }
}
// via http://stackoverflow.com/questions/499126/jquery-set-cursor-position-in-text-area
function setCaretToPos(input, pos) {
  setSelectionRange(input, pos, pos);
}

$(document).ready(function() {
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
  var parseAndRender = function() {
    if (x) { x.abort(); } // If there is an existing XHR, abort it.
    clearTimeout(timer); // Clear the timer so we don't end up with dupes.
    timer = setTimeout(function() { // assign timer a new timeout
      var startTime = new Date().getTime();
      parsed = reader.parse($("#text").val());
      var endTime = new Date().getTime();
      var parseTime = endTime - startTime;
      $("#parsetime").text(parseTime);
      $(".timing").css('visibility', 'visible');
      /*
      var warnings = parsed.warnings;
      $("#warnings").html('');
      for (i=0; i < warnings.length; i++) {
        var w = warnings[i];
        var warning = $("#warnings").append('<li></li>');
        $("#warnings li").last().text('Line ' + w.line + ' column ' + w.column + ': ' + w.message);
      }
      */
      render();
    }, 0); // ms delay
  };
  var initial_text = getQueryVariable("text");
  if (initial_text) {
    $("#text").val(initial_text);
    // show HTML tab if text is from query
    $('#result-tabs a[href="#result"]').tab('show');
  }
  // make tab insert a tab in the text box:
  $("#text").keydown(function(e) {
    if (e.which === 9) {
      e.preventDefault();
      if (this.selectionStart !== undefined) {
        var pos = this.selectionStart;
        this.value = this.value.substring(0, pos) + "\t" + this.value.substring(pos);
        setCaretToPos(this, pos + 1);
      } else {
        this.value += "\t";
      }
    }
  });
  parseAndRender();
  $("#clear-text-box").click(function() {
    $("#text").val('');
    window.location.search = "";
    parseAndRender();
  });
  $("#permalink").click(function() {
    window.location.pathname = "/index.html";
    window.location.search = "text=" + encodeURIComponent($("#text").val());
  });
  $("#text").bind('keyup paste cut mouseup', parseAndRender);
  $(".option").change(render);
});
