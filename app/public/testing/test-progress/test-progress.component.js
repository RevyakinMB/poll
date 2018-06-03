angular
	.module('testProgress')
	.component('testProgress', {
		controller: function testProgressController(
			Testing, messenger, gettextCatalog,
			$routeParams
		) {
			this.students = {};
			this.testing = Testing.get({
				testingId: $routeParams.testingId
			}, function(testing) {
				testing.idGroup.students.forEach(function(student) {
					this.students[student._id] =
						student.lastName + ' ' +
						student.firstName;
					if (student.patronymic) {
						this.students[student._id] += ' ' + student.patronymic;
					}
				}, this);
			}.bind(this), function(err) {
				console.log('Error:', err);
				if (err.status === 404) {
					messenger.show({
						message: gettextCatalog.getString('Testing not found'),
						isError: true
					});
				} else {
					messenger.show({
						message: gettextCatalog.getString('Error while testing loading'),
						isError: true
					});
				}
			});

			// view helper funcs
			this.startedLabel = function() {
				if (!this.testing.attempts || !this.testing.idGroup) {
					return 0;
				}
				return this.testing.attempts.length + ' / ' +
					this.testing.idGroup.students.length;
			};

			this.absentLabel = function() {
				if (!this.testing.attempts || !this.testing.idGroup) {
					return 0;
				}
				if (this.testing.attempts.length >= this.testing.idGroup.students.length) {
					return 0;
				}
				return (this.testing.idGroup.students.length -
					this.testing.attempts.length) + ' / ' +
					this.testing.idGroup.students.length;
			};

			this.progress = function(attempt) {
				console.log(attempt.results, this.testing.idQuestionSet.questions.length);
				return Math.floor(attempt.results.length /
					this.testing.idQuestionSet.questions.length * 100) + '%';
			};

		},
		templateUrl: 'testing/test-progress/test-progress.template.html'
	});
