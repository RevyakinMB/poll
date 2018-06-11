angular
	.module('testProgress')
	.component('testProgress', {
		controller: function testProgressController(
			Testing, messenger, websocket,
			gettextCatalog,
			$location, $scope, $timeout, $interval,
			$routeParams
		) {
			this.students = {};
			// TODO: test and fix module for a `Poll` type testing
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

			this.attemptRemove = function(attempt) {
				attempt.deleting = true;
				this.testing.$delete({
					testingId: this.testing._id,
					idStudent: attempt.idStudent
				}, function() {
					this.testing.attempts = this.testing.attempts.filter(function(a) {
						return a.idStudent !== attempt.idStudent;
					});
					messenger.show({
						message: gettextCatalog.getString('Attempt successfully deleted')
					});
				}.bind(this), function(err) {
					console.log(err);
					delete attempt.deleting;
					messenger.show({
						message: gettextCatalog.getString('Error while testing attempt deleting'),
						isError: true
					});
				});
			};

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
				return attempt.results.length + 1;
			};

			this.secondsToTimeSpent = function(attempt) {
				var sec, min;
				if (attempt.timeSpent === undefined) {
					return '\u2014';
				}
				sec = attempt.timeSpent % 60;
				min = Math.floor(attempt.timeSpent / 60);
				if (min > 59) {
					return gettextCatalog.getString('more then hour');
				}
				if (sec < 10) {
					sec = '0' + sec;
				}
				return min + ':' + sec;
			};

			this.disconnectedLabel = function() {
				return gettextCatalog.getString('No connection to server. Reconnect in') +
					' ' + (this.reconnectIn || 0) +
					' ' + gettextCatalog.getString('seconds...');
			};

			this.timerStart = function() {
				if (this.timeSpentTimer) {
					return;
				}
				if (!this.testing.attempts) {
					return;
				}
				this.timeSpentTimer = $interval(function() {
					this.testing.attempts.forEach(function(a) {
						if (a.timeSpent !== undefined) {
							a.timeSpent += 1;
						}
					});
				}.bind(this), 1000);
			};

			// update model with dummy data to force view update
			this.testingProgressUpdate = function(msg) {
				var attempt;
				console.log(msg);
				if (!msg.idStudent ||
					msg.nextQuestionNumber === undefined ||
					msg.nextQuestionNumber > 9999
				) {
					console.log('Broken message from server');
					return;
				}
				attempt = this.testing.attempts.filter(function(a) {
					return a.idStudent === msg.idStudent;
				});
				if (!attempt.length) {
					this.testing.attempts.push({
						idStudent: msg.idStudent,
						results: [],
						timeSpent: 0
					});
					return;
				}
				attempt = attempt[0];
				while (attempt.results.length < msg.nextQuestionNumber) {
					attempt.results.push({});
				}
				// time spent counter
				attempt.timeSpent = 0;
				this.timerStart();

				// animation triggering
				attempt.updated = true;
				if (attempt.updateTimeout) {
					$timeout.cancel(attempt.updateTimeout);
				}
				attempt.updateTimeout = $timeout(function() {
					delete attempt.updated;
				}, 500);
			};

			this.onProgressMessage = function(message) {
				var msg;
				try {
					msg = JSON.parse(message);
				} catch (err) {
					console.log(err);
					return;
				}

				$scope.$apply(function() {
					this.testingProgressUpdate(msg);
				}.bind(this));
			};

			this.onSocketOpen = function() {
				console.log('opened');
				if (this.reconnectionDelayTimer) {
					$interval.cancel(this.reconnectionDelayTimer);
				}
				delete this.disconnected;
			};

			this.onSocketClose = function(code, reason, delay) {
				console.log('closed', code, reason, delay);
				if (code === 1008 && reason === 'Unauthorized') {
					$scope.$apply(function() {
						messenger({
							message: gettextCatalog.getString('You are unauthorized'),
							isError: true
						});
					});
					return;
				}
				if (!delay) {
					return;
				}
				this.disconnected = true;
				this.reconnectIn = delay;
				if (this.reconnectionDelayTimer) {
					$interval.cancel(this.reconnectionDelayTimer);
				}
				// TODO: more friendly message (delay) on immediate reconnection failure
				this.reconnectionDelayTimer = $interval(function() {
					this.reconnectIn -= 1;
				}.bind(this), 1000);
			};

			this.socket = websocket({
				host: $location.host(),
				port: 8081,
				reconnect: true,
				onMessage: this.onProgressMessage.bind(this),
				onOpen: this.onSocketOpen.bind(this),
				onDisconnect: this.onSocketClose.bind(this)
			});

			this.reconnectNow = function() {
				this.socket.forceConnect();
			};
		},
		templateUrl: 'testing/test-progress/test-progress.template.html'
	});
