(function() {

  var Doc = Backbone.Model.extend({
    defaults: function() {
      return {
        category: null,
        content: '',
        title: moment().format('[Untitled -] LLL'),
        created: Date.now(),
        updated: Date.now()
      };
    },

    initialize: function() {
      this.on('change:title change:content', function(doc) {
        doc.set({updated: Date.now()});
      });
    },

    selector: function() {
      return {id: this.id, text: this.get('title')};
    },

    clear: function() {
      this.destroy();
    }
  });

  window.Doc = Doc;

}).call(this);
