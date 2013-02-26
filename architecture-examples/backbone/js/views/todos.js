/*global Backbone _ $ ENTER_KEY*/
var app = app || {};

$(function () {
	'use strict';

	// Todo Item View
	// --------------

	// The DOM element for a todo item...
	app.TodoView = Backbone.View.extend({

		//... is a list tag.
		tagName:  'li',

		// Cache the template function for a single item.
		template: _.template($('#item-template').html()),

		// The DOM events specific to an item.
		events: {
			'click .toggle':	'toggleCompleted',
			'dblclick label':	'edit',
			'click .destroy':	'clear',
			'keypress .edit':	'updateOnEnter',
			'blur .edit':		'close',
			'change .user': 'assign'
		},

		// The TodoView listens for changes to its model, re-rendering. Since there's
		// a one-to-one correspondence between a **Todo** and a **TodoView** in this
		// app, we set a direct reference on the model for convenience.
		initialize: function () {
			// the line below rerenders todo obj everytime there's a change.
			// OH. It's because of the "edit" mode it has. 
			// This probably means I'll need a separate view module for users...
			this.listenTo(this.model, 'change', this.render);
			this.listenTo(this.model, 'destroy', this.remove);
			this.listenTo(this.model, 'visible', this.toggleVisible);
		},

		// Re-render the titles of the todo item.
		render: function () {
			this.$el.html(this.template(this.model.toJSON()));
			this.$el.toggleClass('completed', this.model.get('completed'));

			app.Users.each(this.addUser, this);

			this.toggleVisible();
			this.$input = this.$('.edit');
			return this;
		},

		//add a single user
		addUser: function (user) {
			var view = new app.UserView({ model: user });
			var str = view.render().el.innerHTML;
			if (this.model.get('user') == user.get('name')) {
				var index = str.indexOf('option ');
				var len = 'option '.length; 
				str = str.substring(0, index + len) + 'selected="selected" ' + str.substring(index + len);
			}
			this.$('.user').append(str);
		},

		toggleVisible: function () {
			this.$el.toggleClass('hidden',  this.isHidden());
		},

		isHidden: function () {
			var isCompleted = this.model.get('completed');
			// var assignedUser = this.model.get('user');
			var filteredUser = app.Users.filtered();

			return (// hidden cases only
				(filteredUser.length != 0 && this.model.get('user') !== filteredUser[0].get('name') && app.TodoFilter === 'user') ||
				(!isCompleted && app.TodoFilter === 'completed') ||
				(isCompleted && app.TodoFilter === 'active')
			);
		},

		assign: function () {
			this.model.assign(this.$('.user').val());
		},

		// Toggle the `"completed"` state of the model.
		toggleCompleted: function () {
			this.model.toggle();
		},

		// Switch this view into `"editing"` mode, displaying the input field.
		edit: function () {
			this.$el.addClass('editing');
			this.$input.focus();
		},

		// Close the `"editing"` mode, saving changes to the todo.
		close: function () {
			var value = this.$input.val().trim();

			if (value) {
				this.model.save({ title: value });
			} else {
				this.clear();
			}

			this.$el.removeClass('editing');
		},

		// If you hit `enter`, we're through editing the item.
		updateOnEnter: function (e) {
			if (e.which === ENTER_KEY) {
				this.close();
			}
		},

		// Remove the item, destroy the model from *localStorage* and delete its view.
		clear: function () {
			this.model.destroy();
		}
	});
});
