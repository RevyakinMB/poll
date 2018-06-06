angular
	.module('testProgress')
	.component('testProgress', {
		controller: function testProgressController(
			Testing, messenger, websocket,
			gettextCatalog,
			$location, $scope,
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
				return Math.floor((attempt.results.length /
					this.testing.idQuestionSet.questions.length) * 100) + '%';
			};

			this.currentQuestionNumber = function(attempt) {
				if (!this.testing.idQuestionSet || (attempt.results.length >=
					this.testing.idQuestionSet.questions.length)
				) {
					return '\u2014';
				}
				return attempt.results.length;
			};

			this.secondsToTimeSpent = function() { // attempt
				// TODO: start timer after webSocket message for the testee
				// update attempt.currentQuestionTimeSpend counters each second
				return '\u2014';
				// return 10 + ' ' + gettextCatalog.getString('sec');
			};

			this.onProgressMessage = function(message) {
				$scope.$apply(function() {
					messenger.show({
						message: message,
						title: 'Message from server'
					});
				});
			};

			this.onSocketOpen = function() {
				console.log('opened');
			};

			this.onSocketClose = function(code, reason, delay) {
				console.log('closed', code, reason, delay);
			};

			this.socket = websocket({
				host: $location.host(),
				port: 8081,
				reconnect: true,
				onMessage: this.onProgressMessage.bind(this),
				onOpen: this.onSocketOpen,
				onDisconnect: this.onSocketClose
			});
		},
		templateUrl: 'testing/test-progress/test-progress.template.html'
	});
