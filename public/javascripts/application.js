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
['jquery', 'views/DocView', 'domReady!'],
function($, DocView) {
  'use strict';

  var App = new DocView({el: $('#docView')});


  // set up renderParsed
  now.renderParsed = App.parsed.render;

  window.App = App;
});
