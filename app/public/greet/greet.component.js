angular.module('greet')
	.component('greet', {
		controller: function greetController(Testing) {
			this.testings = [];
			Testing.query({
				populate: true
			},
				function(ls) {
					console.log(ls);
					this.testings = ls.filter(function(t) {
						if (t.attempts.length < t.idGroup.students.length) {
							return true;
						}
						return !t.attempts.every(function(a) {
							return a.finishedAt;
						});
					});
				}.bind(this),
				function(err) {
					console.log(err);
				});
		},
		templateUrl: 'greet/greet.template.html'
	});
