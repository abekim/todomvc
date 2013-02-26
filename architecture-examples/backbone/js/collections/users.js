/*global Backbone Store*/
var app = app || {};

(function () {
  'use strict';

  // user collection
  var UserList = Backbone.Collection.extend({

    // Reference to this collection's model.
    model: app.User,

    // Save all of the user objects under the "users" namespace.
    localStorage: new Store('users-backbone'),

    //get the user we want to filter by
    filtered: function () {
      return this.filter(function (user) {
        return user.get('filtered');
      });
    },

    // Users are sorted alphabetically
    comparator: function (user) {
      return user.get('name');
    }
  });

  // Create our global collection of **Users**.
  // initializing a temporary list of users

  app.Users = new UserList();

  app.Users.create({name: "Nathan"});
  app.Users.create({name: "Abe"});
  app.Users.create({name: "Alex"});
  app.Users.create({name: "David"});
  app.Users.create({name: "Murphy"});

}());
