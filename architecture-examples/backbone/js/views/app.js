/*global Backbone _ $ ENTER_KEY*/
var app = app || {};

$(function ($) {
	'use strict';

	// The Application
	// ---------------

	// Our overall **AppView** is the top-level piece of UI.
	app.AppView = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: '#todoapp',

		// Our template for the line of statistics at the bottom of the app.
		statsTemplate: _.template($('#stats-template').html()),

		// Delegated events for creating new items, and clearing completed ones.
		events: {
			'keypress #new-todo': 'createOnEnter',
			'click #clear-completed': 'clearCompleted',
			'click #toggle-all': 'toggleAllComplete',
			'change #userFilter': 'filterUser',
			'change #assignNewUser': 'toggleUserInput',
			'keyup #new-user': 'createNewUser',
			'focusout #new-user': 'listUsers'
		},

		// At initialization we bind to the relevant events on the `Todos`
		// collection, when items are added or changed. Kick things off by
		// loading any preexisting todos that might be saved in *localStorage*.
		initialize: function () {
			this.allCheckbox = this.$('#toggle-all')[0];
			this.$filtered = false;
			this.$count = 0;
			this.$new_todo = this.$('#new-todo');
			this.$new_user = this.$('#new-user');
			this.$footer = this.$('#footer');
			this.$main = this.$('#main');

			this.listenTo(app.Todos, 'add', this.addOne);
			this.listenTo(app.Todos, 'reset', this.addAll);
			this.listenTo(app.Todos, 'change:completed', this.filterOne);
			this.listenTo(app.Todos, 'filter', this.filterAll);
			this.listenTo(app.Todos, 'all', this.render);
			this.listenTo(app.Users, 'reset', this.render);
			this.listenTo(app.Users, 'add', this.render);

			app.Todos.fetch();
			app.Users.fetch();
		},

		// Re-rendering the App just means refreshing the statistics -- the rest
		// of the app doesn't change.
		render: function () {
			var completed = app.Todos.completed().length;
			var remaining = app.Todos.remaining().length;

			if (app.Todos.length) {
				this.$main.show();
				this.$footer.show();

				this.$footer.html(this.statsTemplate({
					completed: completed,
					remaining: remaining
				}));

				this.$('#filters li a')
					.removeClass('selected')
					.filter('[href="#/' + (app.TodoFilter || '') + '"]')
					.addClass('selected');
			} else {
				this.$main.hide();
				this.$footer.hide();
			}

			this.allCheckbox.checked = !remaining;

			//populate assignNewUser and userFilter fields
			this.$('#assignNewUser').html('');
			this.$('#userFilter').html('<option value="" label="Filter by user..." />');
			app.Users.each(this.addUser, this);
			this.$('#assignNewUser').append('<option value="new-user" label="Create a new user..." />');

			//if filtered by user
			if (this.$filtered) {
				//apparently it runs this.render() for each todo.
				if (this.$count < app.Todos.length) {
					this.$count++;
				} else {
					this.$filtered = false;
					this.$count = 0;
					app.Users.filtered()[0].toggle();
				}
			}

			this.toggleUserInput(); //if no user is found, prompt to create one right away.
		},

		//add a single user
		addUser: function (user) {
			var view = new app.UserView({ model: user });
			var str = view.render().el.innerHTML;

			$('#assignNewUser').append(str);

			if (user.get('filtered')) {
				var index = str.indexOf('option ');
				var len = 'option '.length; 
				str = str.substring(0, index + len) + 'selected="selected" ' + str.substring(index + len);
			}
			$('#userFilter').append(str);
		},

		// Add a single todo item to the list by creating a view for it, and
		// appending its element to the `<ul>`.
		addOne: function (todo) {
			var view = new app.TodoView({ model: todo });
			$('#todo-list').append(view.render().el);
		},

		// Add all items in the **Todos** collection at once.
		addAll: function () {
			this.$('#todo-list').html('');
			app.Todos.each(this.addOne, this);
		},

		filterOne: function (todo) {
			todo.trigger('visible');
		},

		filterAll: function () {
			app.Todos.each(this.filterOne, this);
		},

		//filter by user
		filterUser: function () {
			var filteredBy = $('#userFilter').val();

			//if username = selected filter value
			var filteredUser = app.Users.filter(function (user) {
				return user.get('name') == filteredBy;
			});
			//trigger the filtered state:
			filteredUser[0].toggle();
			
			this.$filtered = true;
		},

		// Generate the attributes for a new Todo item.
		newAttributes: function () {
			return {
				title: this.$new_todo.val().trim(),
				order: app.Todos.nextOrder(),
				completed: false,
				user: this.$('#assignNewUser').val().trim()
			};
		},

		// If you hit return in the main input field, create new **Todo** model,
		// persisting it to *localStorage*.
		createOnEnter: function (e) {
			if (e.which !== ENTER_KEY || !this.$new_todo.val().trim()) {
				return;
			}

			app.Todos.create(this.newAttributes());
			this.$new_todo.val('');
		},

		//toggle new-user input
		toggleUserInput: function () {
			if ($('#assignNewUser').val() !== "new-user") {
				$('#assignNewUser').toggleClass('hidden', false);
				$('#new-user').toggleClass('hidden', true);
			} else {
				$('#assignNewUser').toggleClass('hidden', true);
				$('#new-user').toggleClass('hidden', false);
			}
		},

		//set user to already existing user. Then, trigger 'change'
		listUsers: function () {
			this.$new_user.val('');
			$('#assignNewUser').val(app.Users.at(0).get('name'));
			$('#assignNewUser').trigger('change');
		},

		//schema for new users
		newUserSchema: function () {
			return {
				name: this.$new_user.val().trim()
			}
		},

		//create a new user.
		createNewUser: function(e) {
			if (e.which === 27) { //if escape is pressed
				this.listUsers();
			} else if (e.which !== ENTER_KEY || !this.$new_user.val().trim()) {
				return;
			} else {
				app.Users.create(this.newUserSchema());
				this.listUsers();
			} 
		},

		// Clear all completed todo items, destroying their models.
		clearCompleted: function () {
			_.invoke(app.Todos.completed(), 'destroy');
			return false;
		},

		toggleAllComplete: function () {
			var completed = this.allCheckbox.checked;

			app.Todos.each(function (todo) {
				todo.save({
					'completed': completed
				});
			});
		}
	});
});
