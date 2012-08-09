/*jshint jquery:true */
/*globals now,Docs,window,moment */
//= require ./lib/jquery.min
//= require ./lib/moment.min
//= require ./lib/underscore
//= require ./lib/backbone
//= require ./lib/select2.min
//= require ./lib/highlight.pack
//= require ./dispatcher
//= require ./models/Doc
//= require ./collections/Docs
//= require ./views/DocView

(function($) {
  $.fn.setTime = function(d) {
    var $this = $(this)
      , m;

    if ($this.is(':not(time)'))
      return this;

    if (d === null) {
      $this.removeAttr('datetime').empty();
    } else if (typeof d === 'number') {
      try {
        m = moment(d);
        $this.attr('datetime', m.format()).text(m.fromNow());
      } catch(e) {
        console.log('problem parsing date', e);
      }
    }

    return this;
  };
}).call(this, window.jQuery);

$(document).ready(function() {
  'use strict';

  $('.dates').hide();

  now.getParsed = window.App.showParsed.bind(window.App);

  window.dispatch.on('sendMarkdown', function() {
    now.sendMarkdown($('#text-input').val());
  });
});
