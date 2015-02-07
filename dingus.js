"use strict";

/*eslint-env browser*/
/*global $,_ */

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
  var syncScroll = function() {
    var textarea = $("#text");
    var lineHeight = parseFloat(textarea.css('line-height'));
    var lineNumber = Math.floor(textarea.scrollTop() / lineHeight);
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
      render();
    }, 0); // ms delay
  };
  var initial_text = getQueryVariable("text");
  if (initial_text) {
    $("#text").val(initial_text);
    // show HTML tab if text is from query
    $('#result-tabs a[href="#result"]').tab('show');
  }

  parseAndRender();
  $("#clear-text-box").click(function() {
    $("#text").val("");
    parseAndRender();
  });
  $("#permalink").click(function() {
    window.location.pathname = "/index.html";
    window.location.search = "text=" + encodeURIComponent($("#text").val());
  });
  $("#text").on('keyup paste cut mouseup', _.debounce(parseAndRender, 50, {maxwait: 50}));
  $("#text").on('scroll', _.debounce(syncScroll, 50, {maxwait: 50}));
  $(".option").change(render);
});
