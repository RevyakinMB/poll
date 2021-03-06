angular
	.module('testPassing')
	.component('testPassing', {
		templateUrl: 'testing/test-passing/test-passing.template.html',
		controller: function testPassingController(
			$routeParams,
			Testing, messenger, gettextCatalog) {
			var testingAttemptRetrieve, testingProceed, answerPost,
				timeElapsedCalc,
				onTestingLoadSuccess, onTestingLoadError;

			onTestingLoadSuccess = function(t) {
				var tempId;
				this.group = t.idGroup;
				this.questionSet = t.idQuestionSet;
				if (this.group) {
					return;
				}

				// if there's no group, this.testing is `Poll`, available for any testee
				tempId = Math.random().toString(16).substr(2, 12);
				// ObjectId `must be a single String of 12 bytes or a string of 24 hex characters`
				tempId += tempId;
				t.$save({
					idStudent: tempId,
					testingId: $routeParams.testingId
				}, function() {
					this.session.student = { _id: tempId };
					this.session.attempt = testingAttemptRetrieve(
						this.testing, tempId);
					testingProceed(this);
				}.bind(this), function(err) {
					console.log(err);
				});
			}.bind(this);

			onTestingLoadError = function(err) {
				messenger.show({
					message: gettextCatalog.getString('Error while testing loading'),
					isError: true
				});
				console.log('error while testing loading:', err.message);
			};

			this.testing = Testing.get(
				{
					testingId: $routeParams.testingId
				},
				onTestingLoadSuccess,
				onTestingLoadError
			);

			this.testingId = $routeParams.testingId;

			this.session = {};
			// .student: Object
			// .attempt: Object
			// .questionList: Array, testing questions without answer yet
			// .currentQuestion: Object
			// .answerSelected: Number

			this.localeSensitiveComparator = function(v1, v2) {
				return v1.value.localeCompare(v2.value);
			};

			testingAttemptRetrieve = function(testing, idStudent) {
				var attempt = testing.attempts.filter(function(a) {
					return a.idStudent === idStudent;
				}, this);

				if (attempt.length !== 1) {
					messenger.show({
						message: gettextCatalog.getString('Internal server error'),
						isError: true
					});
					throw new Error('Server error: no or too much attempts');
				}

				return attempt[0];
			};

			testingProceed = function(that) {
				var answeredAlready = {};

				that.session.timeElapsed = timeElapsedCalc(that.session.attempt);

				if (that.session.attempt.results.length === 0) {
					that.session.questionList = that.questionSet.questions.slice();
					that.session.currentQuestion = that.session.questionList.shift();
					return;
				}

				that.session.attempt.results.forEach(function(r) {
					answeredAlready[r.idQuestion] = true;
				});

				that.session.questionList = that.questionSet.questions.filter(function(q) {
					return !answeredAlready[q._id];
				});
				that.session.currentQuestion = that.session.questionList.shift();
			};

			timeElapsedCalc = function(attempt) {
				var finish = attempt.finishedAt ? new Date(attempt.finishedAt) : new Date(),
					start = new Date(attempt.startedAt),
					diff = finish - start,
					d, h, m;

				d = Math.floor(diff / 1000 / 60 / 60 / 24);
				diff -= d * 1000 * 60 * 60 * 24;

				h = Math.floor(diff / 1000 / 60 / 60);
				diff -= h * 1000 * 60 * 60;

				m = Math.floor(diff / 1000 / 60);

				return {
					days: d,
					hours: h,
					minutes: m
				};
			};

			this.studentSelect = function(s) {
				messenger.hide();
				this.testing.$save({
					idStudent: s._id,
					testingId: $routeParams.testingId,
					restartConfirmed: this.session.restartConfirmed
				}, function() {
					this.session.attempt = testingAttemptRetrieve(
						this.testing, s._id);
					this.session.student = s;

					testingProceed(this);
				}.bind(this), function(err) {
					if (err.data.error === 'Session exists error') {
						// TODO: disable page controls for a moment
						messenger.show({
							message: s.lastName + ' ' + s.firstName + ' ' + s.patronymic + ' ' +
								gettextCatalog.getString('started testing earlier. ' +
									'Are you sure you want to proceed? ' +
									'Please click on a name again or call examiner.'),
							isError: true
						});

						this.session.restartConfirmed = true;
					} else if (err.data.error === 'Session changed error') {
						this.session = {};

					} else if (err.data.error === 'Test passed already error') {
						messenger.show({
							message: gettextCatalog.getString('Selected user have passed test already'),
							isError: true
						});

					} else {
						messenger.show({
							message: err.data.error,
							isError: true
						});
						console.log('error while testing processing:', err);
					}
				}.bind(this));
			};

			this.answerMove = function(a, direction) {
				var q = this.session.currentQuestion,
					idx, replaceMe;

				if (!q) {
					console.error('Error: there is no testing right now');
					return;
				}

				idx = q.answers.indexOf(a);

				if ((direction === 'up' && idx === 0) ||
					(direction === 'down' && idx >= q.answers.length - 1)) {
					return;
				}

				replaceMe = q.answers.splice(idx, 1)[0];

				q.answers.splice(
					direction === 'up' ? idx - 1 : idx + 1,
					0,
					replaceMe);
			};

			this.next = function() {
				answerPost(this);
			};

			answerPost = function(that) {
				var q = that.session.currentQuestion,
					answers = [];
				messenger.hide();

				if (q.qType === 'Alternative' ||
					q.qType === 'Cattell' ||
					q.qType === 'Poll'
				) {
					if (that.session.answerSelected !== undefined) {
						answers.push(q.answers[that.session.answerSelected]._id);
					}

				} else if (q.qType === 'Multiple') {
					answers = q.answers
						.filter(function(a) {
							return a.weight === 1;
						})
						.map(function(a) {
							return a._id;
						});

				} else if (q.qType === 'Sequencing') {
					answers = q.answers
						.map(function(a) {
							return a._id;
						});
				}

				if (!answers.length) {
					messenger.show({
						message: gettextCatalog.getString('No answer selected'),
						isError: true
					});
					return;
				}

				that.testing.$save({
					idStudent: that.session.student._id,
					idQuestion: q._id,
					answers: answers,
					session: that.session.attempt.session,
					testingId: $routeParams.testingId
				}, function() {
					that.session.answerSelected = undefined;
					that.session.currentQuestion = that.session.questionList.shift();
					that.session.attempt = testingAttemptRetrieve(
						that.testing, that.session.student._id);

					that.session.timeElapsed = timeElapsedCalc(that.session.attempt);
				}, function(err) {
					if (err.data.error === 'Session changed error') {
						that.session = {};
						messenger.show({
							message: gettextCatalog.getString(
								'Session changed. Please, call examiner'),
							isError: true
						});
						return;
					}
					messenger.show({
						message: gettextCatalog.getString('An error occurred while saving answer'),
						isError: true
					});
				});
			};
		}
	});
