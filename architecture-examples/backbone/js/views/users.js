/*global Backbone _ $ ENTER_KEY*/
var app = app || {};

$(function () {
  'use strict';

  // User view module

  // The DOM element for a user item...
  app.UserView = Backbone.View.extend({

    //... is a list tag.
    tagName:  'option',

    // Cache the template function for a single item.
    template: _.template($('#user-template').html()),

    events: {},

    // Re-render the titles of the user item.
    render: function () {
      this.$el.html(this.template(this.model.toJSON()));

      return this;
    }
  });
});
