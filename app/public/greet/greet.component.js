angular.module('greet')
	.component('greet', {
		controller: function greetController(Group) {
			this.name = 'World';
			this.groups = Group.query();
		},
		templateUrl: 'greet/greet.template.html'
	});
