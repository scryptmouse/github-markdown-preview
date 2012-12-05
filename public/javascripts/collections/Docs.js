define(['underscore','backbone','models/Doc', 'backbone.localStorage'],function(_, Backbone, Doc) {
  'use strict';

  var DocumentCollection = Backbone.Collection.extend({
    localStorage: new Backbone.LocalStorage("Docs"),

    model: Doc,

    // Map collection for use with select2.
    select2Query: function(query) {
      var data = {};

      data.results = this.map(function(doc) {
        return {id: doc.id, text: doc.get('title')};
      });

      query.callback(data);
    },

    asOptionList: function() {
      return this.map(function(doc) {
        return {id: doc.id, text: doc.get('title')};
      });
    },

    comparator: function(a, b) {
      return a.get('created') > b.get('created') ? -1 : 1;
    }
  });

  return DocumentCollection;
});
