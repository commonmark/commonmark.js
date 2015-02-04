/*
 * Copyright (c) 2015 John MacFarlane, 2014 Vitaly Puzrin, Alex Kocharin.
 * MIT License.  This code is derived from the markdown-it demo, and generated
 * from sources in http://github.com/jgm/commonmark.js/tree/master/dingus
 */
(function () {
  'use strict';

  /*eslint-env browser*/
  /*global $, _*/

  var parser, htmlRenderer, xmlRenderer, permalink, scrollMap, parsed;
  var hljs = window.hljs;

  var defaults = {
    // options below are for demo only
    _highlight: true,
    _strict: false,
    _view: 'html'               // html / src / debug
  };

  function setOptionClass(name, val) {
    if (val) {
      $('body').addClass('opt_' + name);
    } else {
      $('body').removeClass('opt_' + name);
    }
  }

  function setResultView(val) {
    $('body').removeClass('result-as-html');
    $('body').removeClass('result-as-src');
    $('body').removeClass('result-as-debug');
    $('body').addClass('result-as-' + val);
    defaults._view = val;
  }

  function mdInit() {
      parser = new window.commonmark.Parser({});
      htmlRenderer = new window.commonmark.HtmlRenderer({sourcepos: true});
      xmlRenderer = new window.commonmark.XmlRenderer({sourcepos: true});
  }

  function updateResult() {
    var source = $('.source').val();

    // Update only active view to avoid slowdowns
    // (debug & src view with highlighting are a bit slow)
    /*defaults._view === 'html'*/
    parsed = parser.parse(source);
    var rendered = htmlRenderer.render(parsed);
    $('.result-html').html(rendered);
    $('.result-src-content').text(rendered);
    $('.result-debug-content').text(xmlRenderer.render(parsed));
    if (defaults._highlight) {
      $('pre > code').each(function(i, block) {
        hljs.highlightBlock(block);
      });
    }

    // reset lines mapping cache on content update
    scrollMap = null;

    try {
      if (source) {
        // serialize state - source and options
        permalink.href = '#md64=' + window.btoa(JSON.stringify({
          source: source,
          defaults: _.omit(defaults, 'highlight')
        }));
      } else {
        permalink.href = '';
      }
    } catch (__) {
      permalink.href = '';
    }
  }

  // Build offsets for each line (lines can be wrapped)
  // That's a bit dirty to process each line everytime, but ok for demo.
  // Optimizations are required only for big texts.
  function buildScrollMap() {
    var i, offset, nonEmptyList, pos, a, b, lineHeightMap, linesCount,
        acc, sourceLikeDiv, textarea = $('.source'),
        _scrollMap;

    sourceLikeDiv = $('<div />').css({
      position: 'absolute',
      visibility: 'hidden',
      height: 'auto',
      width: textarea[0].clientWidth,
      'font-size': textarea.css('font-size'),
      'font-family': textarea.css('font-family'),
      'line-height': textarea.css('line-height'),
      'white-space': textarea.css('white-space')
    }).appendTo('body');

    offset = $('.result-html').scrollTop() - $('.result-html').offset().top;
    _scrollMap = [];
    nonEmptyList = [];
    lineHeightMap = [];

    acc = 0;
    textarea.val().split('\n').forEach(function(str) {
      var h, lh;

      lineHeightMap.push(acc);

      if (str.length === 0) {
        acc++;
        return;
      }

      sourceLikeDiv.text(str);
      h = parseFloat(sourceLikeDiv.css('height'));
      lh = parseFloat(sourceLikeDiv.css('line-height'));
      acc += Math.round(h / lh);
    });
    sourceLikeDiv.remove();
    lineHeightMap.push(acc);
    linesCount = acc;

    for (i = 0; i < linesCount; i++) { _scrollMap.push(-1); }

    nonEmptyList.push(0);
    _scrollMap[0] = 0;

    $('.result-html p, .result-html h1, .result-html h2, .result-html h3, .result-html h4, .result-html h5, .result-html h6, .result-html li').each(function(n, el) {
      var $el = $(el), sourcepos = $el.data('sourcepos');
      var t = sourcepos.replace(/:.*$/,'');
      t = lineHeightMap[t];
      if (t !== 0) { nonEmptyList.push(t); }
      _scrollMap[t] = Math.round($el.offset().top + offset);
    });

    nonEmptyList.push(linesCount);
    _scrollMap[linesCount] = $('.result-html')[0].scrollHeight;

    pos = 0;
    for (i = 1; i < linesCount; i++) {
      if (_scrollMap[i] !== -1) {
        pos++;
        continue;
      }

      a = nonEmptyList[pos];
      b = nonEmptyList[pos + 1];
      _scrollMap[i] = Math.round((_scrollMap[b] * (i - a) + _scrollMap[a] * (b - i)) / (b - a));
    }

    return _scrollMap;
  }

  function syncScroll() {
    var textarea = $('.source'),
        lineHeight = parseFloat(textarea.css('line-height')),
        lineNo, posTo;

    lineNo = Math.floor(textarea.scrollTop() / lineHeight);
    if (!scrollMap) { scrollMap = buildScrollMap(); }
    posTo = scrollMap[lineNo];
    $('.result-html').stop(true).animate({
      scrollTop: posTo
    }, 100, 'linear');
  }

  //////////////////////////////////////////////////////////////////////////////
  // Init on page load
  //
  $(function() {
    // highlight snippet
    if (defaults._highlight) {
      $('pre code').each(function(i, block) {
        hljs.highlightBlock(block);
      });
    }

    // Restore content if opened by permalink

    // first check for the legacy query-style permalinks, ?text=foo
    var cfg = {};
    var parts = location.search.substr(1).split("&");
    for (var i = 0; i < parts.length; i++) {
        // set 'source' with value of 'text' if found
        var item = parts[i];
        if (item.split("=")[0] === 'text') {
            $('.source').val(decodeURIComponent(item.split("=")[1]));
        }
    }
    // now check hash-style permalinks
    if (location.hash && /^(#md=|#md64=)/.test(location.hash)) {
      try {
        if (/^#md64=/.test(location.hash)) {
          cfg = JSON.parse(window.atob(location.hash.slice(6)));
        } else {
          // Legacy mode for old links. Those become broken in github posts,
          // so we switched to base64 encoding.
          cfg = JSON.parse(decodeURIComponent(location.hash.slice(4)));
        }

        if (_.isString(cfg.source)) {
          $('.source').val(cfg.source);
        }

        var opts = _.isObject(cfg.defaults) ? cfg.defaults : {};

        // copy config to defaults, but only if key exists
        // and value has the same type
        _.forOwn(opts, function (val, key) {
          if (!_.has(defaults, key)) { return; }

          // Legacy, for old links
          if (key === '_src') {
            defaults._view = val ? 'src' : 'html';
            return;
          }

          if ((_.isBoolean(defaults[key]) && _.isBoolean(val)) ||
              (_.isString(defaults[key]) && _.isString(val))) {
            defaults[key] = val;
          }
        });

        // sanitize for sure
        if ([ 'html', 'src', 'debug' ].indexOf(defaults._view) === -1) {
          defaults._view = 'html';
        }
      } catch (__) {}
    }

    // Activate tooltips
    $('._tip').tooltip({ container: 'body' });

    // Set default option values and option listeners
    _.forOwn(defaults, function (val, key) {
      if (key === 'highlight') { return; }

      var el = document.getElementById(key);

      if (!el) { return; }

      var $el = $(el);

      if (_.isBoolean(val)) {
        $el.prop('checked', val);
        $el.on('change', function () {
          var value = Boolean($el.prop('checked'));
          setOptionClass(key, value);
          defaults[key] = value;
          mdInit();
          updateResult();
        });
        setOptionClass(key, val);

      } else {
        $(el).val(val);
        $el.on('change update keyup', function () {
          defaults[key] = String($(el).val());
          mdInit();
          updateResult();
        });
      }
    });

    setResultView(defaults._view);

    mdInit();
    permalink = document.getElementById('permalink');

    // Setup listeners
    $('.source').on('keyup paste cut mouseup', _.debounce(updateResult, 50, { maxWait: 50 }));
    $('.source').on('scroll', _.debounce(syncScroll, 50, { maxWait: 50 }));

    $('.source-clear').on('click', function (event) {
      $('.source').val('');
      updateResult();
      event.preventDefault();
    });

    $(document).on('click', '[data-result-as]', function (event) {
      var view = $(this).data('resultAs');
      if (view) {
        setResultView(view);
        // only to update permalink
        updateResult();
        event.preventDefault();
      }
    });

    // Need to recalculate line positions on window resize
    $(window).on('resize', function () {
      scrollMap = null;
    });

    updateResult();
  });
})();
