angular
	.module('testResults')
	.component('testResults', {
		templateUrl: 'testing/test-results/test-results.template.html',
		controller: function testResultsController(
			$routeParams,
			$timeout, $window,
			gettextCatalog, messenger,
			Testing, FactorSet,
			EduForm, Specialty
		) {
			var collectionsPopulate, resultsCalculate;

			this.results = [];
			this.passedMap = {};
			this.eduForms = {};
			this.specialties = {};
			this.printMode = 'full';
			// used in template
			this.studentId = $routeParams.studentId;

			this.reportPrint = function(mode) {
				this.printMode = mode;
				$timeout(function() {
					$window.print();
				}, 50, false);
			};
			this.fullPrint = function() {
				this.reportPrint('full');
			};
			this.paperPrint = function() {
				this.reportPrint('paper');
			};

			// data requests
			EduForm.query(function(forms) {
				forms.forEach(function(f) {
					this.eduForms[f._id] = f.name;
				}, this);
			}.bind(this), function(err) {
				console.log(err);
			});

			Specialty.query(function(specialties) {
				specialties.forEach(function(s) {
					this.specialties[s._id] = s.name;
				}, this);
			}.bind(this), function(err) {
				console.log(err);
			});

			this.factorSet = FactorSet.get({ factorSetName: 'Cattell' });
			this.testing = Testing.get({
				testingId: $routeParams.testingId,
				weightsLoad: true

			}, function(testing) {
				var maps;
				testing.attempts.forEach(function(a) {
					this.passedMap[a.idStudent] = !!a.finishedAt;
				}, this);

				maps = collectionsPopulate(testing);
				this.factorSet.$promise.then(function(factorSet) {
					this.results = resultsCalculate(
						testing,
						maps.students,
						maps.questions,
						factorSet.factors);
					this.quickSearchAvailable = this.results.some(function(r) {
						return r.name;
					});
				}.bind(this));

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

			// helper calculation functions
			collectionsPopulate = function(testing) {
				var maps = {
					students: {},
					questions: {}
				};

				if (testing.idGroup) {
					testing.idGroup.students.forEach(function(s) {
						maps.students[s._id] = s.lastName + ' ' + s.firstName + ' ' + s.patronymic;
					});
				}
				testing.idQuestionSet.questions.forEach(function(q) {
					maps.questions[q._id] = q;
				});
				return maps;
			};

			resultsCalculate = function(testing, students, questions, factors) {
				var results = [],
					attempts = testing.attempts;

				if ($routeParams.studentId) {
					attempts = attempts.filter(function(a) {
						return a.idStudent === $routeParams.studentId;
					});
				}

				attempts.forEach(function(a) {
					var studentResult = {
						name: students[a.idStudent],
						attempt: a,
						sumByFactor: {},
						stenByFactor: {},
						questionsProcessed: [],

						// takes into account non-Cattell questions only
						correctCount: 0,
						questionsCount: 0
					};

					a.results.forEach(function(r) {
						var q = questions[r.idQuestion],
							allQuestionAnswersMap = {},
							isCorrect = true,
							questionProcessed = {
								type: q.qType,
								text: q.text,
								correctAnswers: [],
								incorrectAnswers: []
							}, qAnswer, i, j;

						// preparation
						if (q.qType === 'Sequencing' || q.qType === 'Poll') {
							q.answers.forEach(function(answer) {
								allQuestionAnswersMap[answer._id] = answer;
							});
						}

						// calculation
						if (q.qType === 'Cattell') {
							if (!studentResult.sumByFactor[q.idFactor]) {
								studentResult.sumByFactor[q.idFactor] = 0;
							}
							qAnswer = q.answers.filter(function(answer) {
								return answer._id === r.answers[0];
							})[0];

							if (qAnswer) {
								studentResult.sumByFactor[q.idFactor] += qAnswer.weight;
							}

						} else if (q.qType === 'Alternative' || q.qType === 'Multiple') {
							for (i = 0; i < q.answers.length; ++i) {
								qAnswer = q.answers[i];
								if (qAnswer.weight === 1) {
									questionProcessed.correctAnswers.push(qAnswer.text);

								} else {
									for (j = 0; j < r.answers.length; ++j) {
										if (r.answers[j] === qAnswer._id) {
											isCorrect = false;
											questionProcessed.incorrectAnswers.push(qAnswer.text);
											break;
										}
									}
								}
							}
							if (isCorrect) {
								studentResult.correctCount += 1;
							}

						} else if (q.qType === 'Sequencing') {
							q.answers.sort(function(q1, q2) {
								if (q1.weight < q2.weight) {
									return -1;
								} else if (q1.weight > q2.weight) {
									return 1;
								}
								return 0;
							});
							questionProcessed.correctAnswers = q.answers.map(function(qA) {
								return qA.text;
							});
							if (q.answers.some(function(qA, index) {
								return qA._id !== r.answers[index];
							})) {
								// there's incorrect order of answers, store it to show in view
								questionProcessed.incorrectAnswers = r.answers.map(function(tA) {
									return allQuestionAnswersMap[tA].text;
								});
							} else {
								studentResult.correctCount += 1;
							}

						} else if (q.qType === 'Poll') {
							questionProcessed.correctAnswers = r.answers.map(function(tA) {
								return allQuestionAnswersMap[tA].text;
							});
						}

						if (q.qType !== 'Cattell') {
							studentResult.questionsCount += 1;
							studentResult.questionsProcessed.push(questionProcessed);
						}
					});

					if (Object.keys(studentResult.sumByFactor).length) {
						// map raw sum to sten by factor
						factors.forEach(function(f) {
							var i, sum = studentResult.sumByFactor[f._id] || 0;
							for (i = 0; i < f.matches.length; ++i) {
								// assuming matches are in ascending order
								if (f.matches[i].rawSum && sum <= f.matches[i].rawSum) {
									studentResult.stenByFactor[f._id] = parseInt(f.matches[i].sten, 10);
									break;
								}
							}
							// fix of a situation when answer's weight sum is more then max factor value
							if (!studentResult.stenByFactor[f._id]) {
								// get max rawSum value for current factor
								studentResult.stenByFactor[f._id] = f.matches.reduce(function(max, match) {
									if (match.rawSum && match.rawSum > max) {
										return match.rawSum;
									}
									return max;
								}, 0);
							}
						});
					}

					results.push(studentResult);
				});
				return results;
			};
		}
	});
