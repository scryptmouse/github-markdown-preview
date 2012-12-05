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

  var DocView = Backbone.View.extend({
    events: {
      'keydown #text-input': 'tabHandler',
      'click #getPreview': 'sendMarkdown',
      'click #save': 'saveDocument',
      'click #destroy': 'destroyDocument',
      'change #documentSelector': 'showDocument'
    },

    initialize: function() {
      _(this).bindAll('resetDocument', 'showDocument', 'showParsed', 'saveDocument');

      this.docs = new Docs();
      this.docs.fetch();

      this.$sel = this.$('#documentSelector');

      this.configureSelect2();

      this.$el.on('keyup', '#text-input', _(this.saveDocument).debounce(1000));

      this.dispatcher = Dispatcher;

      this.on('document:reset', this.resetDocument);
      this.docs.on('remove', this.resetDocument);

      hljs.initHighlightingOnLoad();
    },

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

    getSelected: function() {
      var id;

      if (!this.$sel)
        this.$sel = this.$('#documentSelector');

      id = this.$sel.val();

      return _.isEmpty(id) ? false : this.docs.get(id);
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
      this.$('#documentTitle').val('');
      this.$('#text-input').val('');
      this.$('.dates').hide().find('time').setTime(null);
    },

    saveDocument: function(ev) {
      var $sel = $('#documentSelector')
        , id = $sel.val()
        , title = this.$('#documentTitle').val()
        , content = this.$('#text-input').val()
        , docValues = {content: content}
        , doc = !_(id).isEmpty() ? this.docs.get(id) : false;

      if (title !== '')
        docValues.title = title;

      if (doc) {
        doc.set(docValues).save();
      } else if (content.match(/\S/) === null) {
        // If just whitespace, don't create a new doc
        return;
      } else {
        doc = this.docs.create(docValues);
      }

      if (doc) {
        $sel.select2('data', doc.selector());
        this.$('.dates').show().
          find('time.created').setTime(doc.get('created')).
          siblings('time.updated').setTime(doc.get('updated'));
      } else {
        alert('Failed to create new document!');
      }

      Dispatcher.trigger('sendMarkdown');
    },

    sendMarkdown: function(ev) {
      Dispatcher.trigger('sendMarkdown');
    },

    showDocument: function(ev) {
      var $sel = $('#documentSelector')
        , doc = this.docs.get($sel.val())
      ;

      if (doc) {
        this.$('#text-input').val(doc.get('content'));
        this.$('#documentTitle').val(doc.get('title'));
        this.$('.dates').show().
          find('time.created').setTime(doc.get('created')).
          siblings('time.updated').setTime(doc.get('updated'));
      } else {
        this.resetDocument();
      }

      Dispatcher.trigger('sendMarkdown');
    },

    showParsed: function(parsed) {
      this.$('#parsed').html(parsed).find('div.highlight').each(function() {
        var $this = $(this),
            $pre  = $('pre', $this),
            lang, text, highlighted;

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
      });
    },

    tabHandler: function(ev) {
      var textArea = ev.currentTarget;

      if (ev.keyCode == 9) {
        var tab       = "\t",
            startPos  = textArea.selectionStart,
            endPos    = textArea.selectionEnd,
            scrollTop = textArea.scrollTop;

        textArea.value = textArea.value.substring(0, startPos) + tab + textArea.value.substring(endPos, textArea.value.length);
        textArea.focus();
        textArea.selectionStart = startPos + tab.length;
        textArea.selectionEnd   = startPos + tab.length;
        textArea.scrollTop      = scrollTop;

        ev.preventDefault();
      }
    }
  });

  return DocView;
});
