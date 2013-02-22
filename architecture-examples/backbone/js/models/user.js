/*global Backbone*/
var app = app || {};

(function () {
  'use strict';

  // user model
  
  app.User = Backbone.Model.extend({

    defaults: {
      name: ''
    }

  });

}());
