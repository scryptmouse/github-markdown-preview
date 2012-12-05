/*globals now*/
define(['jquery', 'underscore', 'backbone', 'dispatcher', 'hljs'], function($, _, Backbone, Dispatcher, hljs) {
  'use strict';

  // Private helper for use with render,
  // when iterating over div.highlight > pre tags.
  function highlightCodeBlocks() {
    /*jshint validthis:true*/
    var $this = $(this)
      , $pre  = $('pre', $this)
      , lang, text, highlighted
    ;

    if ($pre.length === 0)
      return;
    else {
      text = $pre.text();
      if (!!(lang = $pre.attr('lang'))) {
        highlighted = hljs.highlight(lang, text);
      } else {
        highlighted = hljs.highlightAuto(text);
      }
      $pre.html(highlighted.value);
    }
  }

  var ParsedView = Backbone.View.extend({
    initialize: function() {
      _.bindAll(this);
    },

    clear: function() {
      this.$el.empty();
    },

    render: function(parsed) {
      this.$el.html(parsed).find('div.highlight').each(highlightCodeBlocks);
    }
  });

  return ParsedView;
});
