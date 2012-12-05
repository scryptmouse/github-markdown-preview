/*jshint browser:true*/
/*globals now */
require({
  paths: {
    'jquery': 'lib/jquery.min',
    'backbone': 'lib/backbone',
    'underscore': 'lib/underscore',
    'underscore.string': 'lib/underscore.string',
    'moment': 'lib/moment.min',
    'select2': 'lib/select2.min',
    'hljs': 'lib/highlight.pack',
    'backbone.localStorage': 'lib/backbone.localStorage-min',

    'domReady': 'lib/domReady'
  },
  shim: {
    'hljs': {
      exports: 'hljs'
    },
    'backbone.localStorage': {
      deps: ['backbone'],
      exports: 'Backbone.LocalStorage'
    },
    'select2': {
      deps: ['jquery'],
      exports: 'jQuery.fn.select2'
    }
  }
},
['jquery', 'views/DocView', 'dispatcher', 'domReady!'],
function($, DocView, Dispatcher) {
  'use strict';

  var App = new DocView({el: $('#docView')});
  now.getParsed = App.showParsed.bind(App);

  $('.dates').hide();

  window.App = App;

  Dispatcher.on('sendMarkdown', function() {
    now.sendMarkdown($('#text-input').val());
  });
});
