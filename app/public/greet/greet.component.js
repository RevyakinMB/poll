angular.module('greet')
	.component('greet', {
		controller: function greetController(Testing, authorizeService) {
			this.testings = [];
			Testing.query({
				populate: true
			},
				function(ls) {
					// TODO: filter out testing scheduled for any day except today
					this.testings = ls;
					// return;
					// this.testings = ls.filter(function(t) {
					//	if (t.attempts.length < t.idGroup.students.length) {
					//		return true;
					//	}
					//	return !t.attempts.every(function(a) {
					//		return a.finishedAt;
					//	});
					// });
				}.bind(this),
				function(err) {
					console.log(err);
				});

			this.isPassed = function(t) {
				if (t.idGroup) {
					return t.attempts.length === t.idGroup.students.length &&
						t.attempts.every(function(a) {
							return a.finishedAt;
						});
				}
				return t.attempts.some(function(a) {
					return a.finishedAt;
				});
			};

			this.isInProgress = function(t) {
				return t.idGroup && t.attempts.length && !this.isPassed(t);
			};

			this.progress = function(t) {
				return Math.floor(
					(t.attempts.filter(function(a) {
						return a.finishedAt;
					}).length / t.idGroup.students.length) * 100
				);
			};

			this.isLoggedIn = function() {
				return authorizeService.isLoggedIn();
			};
		},
		templateUrl: 'greet/greet.template.html'
	});
