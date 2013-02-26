/*global Backbone*/
var app = app || {};

(function () {
  'use strict';

  // user model
  
  app.User = Backbone.Model.extend({

    defaults: {
      name: '',
      filtered: false
    },

    toggle: function () {
      this.save({
        filtered: !this.get('filtered')
      });
    }
  });

}());
