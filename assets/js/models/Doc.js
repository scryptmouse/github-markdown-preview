(function() {

  function generateDefaultTitle() {
    return moment().format('[Untitled -] LLL');
  }

  var Doc = Backbone.Model.extend({
    defaults: {
      category: null,
      content: '',
      title: null,
      created: null,
      updated: null
    },

    initialize: function() {
      if (!this.get('created'))
        this.set({created: Date.now()});
      if (!this.get('updated'))
        this.set({updated: Date.now()});
      if (!this.get('title'))
        this.set({title: generateDefaultTitle()});

      this.on('change:title change:content', function(doc, other) {
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
