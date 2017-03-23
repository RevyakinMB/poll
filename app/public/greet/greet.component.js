angular.module('greet')
	.component('greet', {
		controller: function greetController() {
			this.name = 'World';
		},
		templateUrl: 'greet/greet.template.html'
	});
