angular.module('greet')
	.component('greet', {
		controller: function greetController(Testing) {
			this.testings = Testing.query(
				function() {},
				function(err) {
					console.log(err);
				});
		},
		templateUrl: 'greet/greet.template.html'
	});
