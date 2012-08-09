(function() {

  var DocumentCollection = Backbone.Collection.extend({
    localStorage: new Backbone.LocalStorage("Docs"),

    model: Doc,

    initialize: function() {
    },

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

  var Docs = window.Docs = new DocumentCollection();
  Docs.fetch();

}).call(this);
