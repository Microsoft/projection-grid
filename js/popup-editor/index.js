define([
  'jquery',
  'bluebird',
  'backbone',
  'underscore',
  './index.jade',
], function ($, Promise, Backbone, _, template) {
  var PopupEditor = Backbone.View.extend({
    events: {
      'click .save': function () {
        this.trigger('save', this.model);
      },
      'click .cancel': function () {
        this.trigger('cancel');
      },
      'change .editor': function (e) {
        this.setValue(e.target.value);
      },
      'click form': function (e) {
        e.stopPropagation();
      },
      'keypress .editor': function (e) {
        if (e.key === 'Enter') {
          this.setValue(e.target.value);
          this.trigger('save', this.model);
        }
      },
    },

    initialize: function (options) {
      this.position = options.position;
      this.model = options.model;
      this.property = options.property;
    },

    getValue: function () {
      if (this.property && _.isObject(this.property)) {
        const { name, value } = this.property;
        return value(this.model)[name];
      }

      return (this.model || {})[this.property];
    },

    setValue: function (val) {
      if (this.property && _.isObject(this.property)) {
        const { name, value } = this.property;
        value(this.model)[name] = val;
      } else {
        this.model[this.property] = val;
      }
    },

    render: function () {
      var val = this.getValue();

      this.$el.html(template({ value: val }));
      this.$el.css({
        position: 'absolute',
        left: this.position.left,
        top: this.position.top,
      });

      this.dismiss = function () {
        this.trigger('cancel');
      }.bind(this);

      window.setTimeout(() => {
        $(window).on('click', this.dismiss);
      }, 0);

      return this;
    },

    remove: function () {
      $(window).off('click', this.dismiss);
      Backbone.View.prototype.remove.apply(this, arguments);
    },

    focus: function () {
      var input = this.$el.find('.editor');
      input.select();
    },

  });

  return function (options) {
    var editor = new PopupEditor(options);

    document.body.appendChild(editor.render().el);

    editor.focus();

    editor.on('save', function (model) {
      editor.remove();
      options.onSubmit && options.onSubmit(model);
    });

    editor.on('cancel', function () {
      editor.remove();
      options.onCancel && options.onCancel();
    });
  };
});
