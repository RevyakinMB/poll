angular.module('greet')
	.component('greet', {
		controller: function greetController(Testing) {
			this.testings = Testing.query();
		},
		templateUrl: 'greet/greet.template.html'
	});
