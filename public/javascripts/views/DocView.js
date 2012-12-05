/*jshint devel:true*/
define(
[
  'jquery', 'underscore', 'backbone',
  'dispatcher', 'collections/Docs',
  'hljs', 'select2',
  'lib/jquery.fn.setTime'
],
function($, _, Backbone, Dispatcher, Docs, hljs) {
  'use strict';

  // Private helper for use with showDocument,
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

  // When pressing 'tab' inside textarea,
  // insert a tab instead of switching fields.
  function handleTabs(ev) {
    var textArea = ev.currentTarget
      , tab       = "\t"
      , startPos  = textArea.selectionStart
      , endPos    = textArea.selectionEnd
      , scrollTop = textArea.scrollTop
    ;

    textArea.value = textArea.value.substring(0, startPos) + tab + textArea.value.substring(endPos, textArea.value.length);
    textArea.focus();
    textArea.selectionStart = startPos + tab.length;
    textArea.selectionEnd   = startPos + tab.length;
    textArea.scrollTop      = scrollTop;

    ev.preventDefault();
  }

  var DocView = Backbone.View.extend({
    events: {
      'keydown #text-input': 'inputChanged',
      'click #getPreview': 'sendMarkdown',
      'click #save': 'saveDocument',
      'click #destroy': 'destroyDocument',
      'change #documentSelector': 'showDocument'
    },

    initialize: function() {
      _(this).bindAll('resetDocument', 'showDocument', 'showParsed', 'saveDocument');

      this.docs = new Docs();
      this.docs.fetch();

      // cache important selectors
      this.$sel = this.$('#documentSelector');
      this.$title = this.$('#documentTitle');
      this.$content = this.$('#text-input');

      this.configureSelect2();

      this.on('document:save', _(this.saveDocument).debounce(1000));
      this.on('document:reset', this.resetDocument);
      this.docs.on('remove', this.resetDocument);

      hljs.initHighlightingOnLoad();
    },

    // configure the select2 plugin
    configureSelect2: function() {
      var docs = this.docs;

      this.$sel.select2({
        placeholder: 'Select document',
        allowClear: true,
        minimumInputLength: 0,
        minimumResultsForSearch: 10,
        initSelection: function(el, callback) {
          var data = docs.asOptionList();
          callback(data);
        },
        formatSelection: function(doc) {
          return doc.text;
        },
        data: {results: docs.models, text: function(doc) { return doc.get('title'); }},
        query: docs.select2Query.bind(docs)
      });
    },

    // Get the currently-selected document from
    // the select2 dropdown, or return false if
    // none selected.
    getSelected: function() {
      var id;

      if (!this.$sel)
        this.$sel = this.$('#documentSelector');

      id = this.$sel.val();

      return _.isEmpty(id) ? false : this.docs.get(id);
    },

    inputChanged: function(ev) {
      if (ev.keyCode == 9)
        handleTabs(ev);

      this.trigger('document:save');
    },

    destroyDocument: function(ev) {
      var doc = this.getSelected();

      if (doc && confirm('Are you sure you want to destroy this document?')) {
        this.docs.remove(doc);
      }
    },

    resetDocument: function(doc) {
      if (doc && _.isFunction(doc.destroy))
        doc.destroy();

      this.$sel.select2('val', '');
      this.$title.val('');
      this.$content.val('');

      this.$('#parsed').empty();

      this.updateTimes(null);
    },

    saveDocument: function(ev) {
      var title = this.$title.val()
        , content = this.$content.val()
        , docValues = {content: content}
        , doc = this.getSelected()
      ;

      if (title !== '')
        docValues.title = title;

      if (doc) {
        doc.set(docValues).save();
      } else if (content.match(/\S/) !== null) {
        // If content not just whitespace, create a new document.
        doc = this.docs.create(docValues);
      } else {
        // If content is just whitespace, return now.
        return;
      }

      // If a document was updated/created
      if (doc) {
        // Set the selected option to match what is being displayed
        this.$sel.select2('data', doc.selector());
        // Update title
        this.$title.val(doc.get('title'));
        this.updateTimes(doc);
      }

      this.sendMarkdown();
    },

    // For onClick with the 'send' button.
    sendMarkdown: function(ev) {
      Dispatcher.trigger('sendMarkdown');
    },

    showDocument: function(ev) {
      var doc = this.getSelected();

      if (doc) {
        this.$content.val(doc.get('content'));
        this.$title.val(doc.get('title'));
        this.updateTimes(doc);
      } else {
        this.resetDocument();
      }

      this.sendMarkdown();
    },

    showParsed: function(parsed) {
      this.$('#parsed').html(parsed).find('div.highlight').each(highlightCodeBlocks);
    },

    // Update time fields for currently-selected document.
    updateTimes: function(doc) {
      if (doc) {
        this.$('.dates').show();
        this.$('time.created').setTime(doc.get('created'));
        this.$('time.updated').setTime(doc.get('updated'));
      } else {
        this.$('.dates').hide().find('time').setTime(null);
      }
    }
  });

  return DocView;
});
