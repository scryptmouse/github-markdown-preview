/*jshint jquery:true, devel:true*/
/*globals now, Docs, window, Backbone, _, console, dispatch, hljs, unescape */

(function() {
  'use strict';

  var DocView = Backbone.View.extend({
    el: $('#docView'),

    events: {
      'keydown #text-input': 'tabHandler',
      'click #getPreview': 'sendMarkdown',
      'click #save': 'saveDocument',
      'click #destroy': 'destroyDocument'
    },

    initialize: function() {
      _(this).bindAll('resetDocument', 'showDocument', 'showParsed', 'saveDocument');

      $('#documentSelector').select2({
        placeholder: 'Select document',
        allowClear: true,
        minimumInputLength: 0,
        minimumResultsForSearch: 10,
        initSelection: function(el, callback) {
          var data = Docs.asOptionList();
          callback(data);
        },
        formatSelection: function(doc) {
          return doc.text;
        },
        data: {results: Docs.models, text: function(doc) { return doc.get('title'); }},
        query: Docs.select2Query.bind(Docs)
      }).on('change', this.showDocument);

      this.$el.on('keyup', '#text-input', _(this.saveDocument).debounce(1000));

      window.dispatch.on('document:reset', (function() {
        this.resetDocument();
      }).bind(this));

      Docs.on('remove', function(doc) {
        doc.destroy();
        window.dispatch.trigger('document:reset');
      });

      $(function() {
        window.hljs.initHighlightingOnLoad();
      });
    },

    destroyDocument: function(ev) {
      var $sel = $('#documentSelector')
        , id = $sel.val()
        , doc = Docs.get(id);

      if (doc && confirm('Are you sure you want to destroy this document?')) {
        Docs.remove(doc);
      }
    },

    resetDocument: function() {
      $('#documentSelector').select2('val', '');
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
        , doc = !_(id).isEmpty() ? Docs.get(id) : false;


      if (title !== '')
        docValues.title = title;

      if (doc) {
        doc.set(docValues).save();
      } else if (content.match(/\S/) === null) {
        // If just whitespace, don't create a new doc
        return;
      } else {
        doc = Docs.create(docValues);
      }

      if (doc) {
        $sel.select2('data', doc.selector());
        this.$('.dates').show().
          find('time.created').setTime(doc.get('created')).
          siblings('time.updated').setTime(doc.get('updated'));
      } else {
        alert('Failed to create new document!');
      }

      window.dispatch.trigger('sendMarkdown');
    },

    sendMarkdown: function(ev) {
      window.dispatch.trigger('sendMarkdown');
    },

    showDocument: function(ev) {
      var $sel = $('#documentSelector')
        , doc = Docs.get($sel.val());

      if (doc) {
        this.$('#text-input').val(doc.get('content'));
        this.$('#documentTitle').val(doc.get('title'));
        this.$('.dates').show().
          find('time.created').setTime(doc.get('created')).
          siblings('time.updated').setTime(doc.get('updated'));
      } else {
        this.resetDocument();
      }

      window.dispatch.trigger('sendMarkdown');
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

  window.App = new DocView();

}).call(this);
