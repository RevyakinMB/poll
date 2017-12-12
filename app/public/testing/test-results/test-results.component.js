angular
	.module('testResults')
	.component('testResults', {
		templateUrl: 'testing/test-results/test-results.template.html',
		controller: function testResultsController(
			$routeParams,
			gettextCatalog, messenger,
			Testing, FactorSet,
			EduForm, Specialty,
			authorizeService
		) {
			var collectionsPopulate, resultsCalculate;

			this.results = [];
			this.message = {
				text: '',
				error: false,
				hidden: true
			};
			this.keysGet = Object.keys;

			this.authorized = authorizeService.isLoggedIn();

			// provide value for template
			this.studentId = $routeParams.studentId;

			if (this.studentId === 'examinationPaper') {
				this.passedMap = {};
				this.eduForms = {};
				this.specialties = {};

				EduForm.query(function(forms) {
					forms.forEach(function(f) {
						this.eduForms[f._id] = f.name;
					}, this);
					console.log(this.eduForms);
				}.bind(this), function(err) {
					console.log(err);
				});

				Specialty.query(function(specialties) {
					specialties.forEach(function(s) {
						this.specialties[s._id] = s.name;
					}, this);
					console.log(this.specialties);
				}.bind(this), function(err) {
					console.log(err);
				});

				this.testing = Testing.get({
					testingId: $routeParams.testingId
				}, function(t) {
					t.attempts.forEach(function(a) {
						this.passedMap[a.idStudent] = !!a.finishedAt;
					}, this);
				}.bind(this), function(err) {
					console.log(err);
				});
				return;
			}

			this.factorSet = FactorSet.get({ factorSetName: 'Cattell' });
			this.testing = Testing.get({
				testingId: $routeParams.testingId,
				weightsLoad: true

			}, function(testing) {
				var maps = collectionsPopulate(testing);

				this.factorSet.$promise.then(function(factorSet) {
					this.results = resultsCalculate(
						testing,
						maps.students,
						maps.questions,
						factorSet.factors);
				}.bind(this));

			}.bind(this), function(err) {
				console.log('Error:', err);
				if (err.status === 404) {
					messenger({
						message: gettextCatalog.getString('Testing not found'),
						isError: true
					}, this.message);
				} else {
					messenger({
						message: gettextCatalog.getString('Error while testing loading'),
						isError: true
					}, this.message);
				}

			}.bind(this));

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
					maps.questions[q._id] = {
						answers: q.answers,
						type: q.qType,
						idFactor: q.idFactor
					};
				});
				return maps;
			};

			resultsCalculate = function(testing, students, questions, factors) {
				var results = [];

				testing.attempts.forEach(function(a) {
					var studentResult = {
						name: students[a.idStudent],
						attempt: a,
						sumByFactor: {},
						stenByFactor: {},

						// takes into account non-Cattell questions only
						correctCount: 0,
						questionsCount: 0
					};

					if ($routeParams.studentId && a.idStudent !== $routeParams.studentId) {
						return;
					}

					a.results.forEach(function(r) {
						var q = questions[r.idQuestion],
							selectedAnswer,
							correctMap = {},
							isCorrect = true,
							i, checker;

						if (q.type === 'Cattell' || q.type === 'Alternative') {
							selectedAnswer = q.answers.filter(function(answer) {
								return answer._id === r.answers[0];
							});

							if (selectedAnswer.length !== 1) {
								console.error('Error while results calculation: no answer found',
									q.answers,
									r.answers[0]
								);
								return;
							}
							selectedAnswer = selectedAnswer[0];

						} else if (q.type === 'Sequencing' || q.type === 'Multiple') {
							q.answers.forEach(function(answer) {
								correctMap[answer._id] = answer;
							});
						}

						if (q.type === 'Cattell') {
							if (!studentResult.sumByFactor[q.idFactor]) {
								studentResult.sumByFactor[q.idFactor] = 0;
							}
							studentResult.sumByFactor[q.idFactor] += selectedAnswer.weight;

						} else if (q.type === 'Alternative') {
							if (selectedAnswer.weight === 1) {
								studentResult.correctCount += 1;
							}

						} else if (q.type === 'Multiple') {
							if (q.answers.filter(
								function(answer) {
									return answer.weight === 1;
								}).length === r.answers.length
							) {
								for (i = 0; i < r.answers.length; ++i) {
									if (correctMap[r.answers[i]].weight !== 1) {
										isCorrect = false;
										break;
									}
								}
								if (isCorrect) {
									studentResult.correctCount += 1;
								}
							}
						} else if (q.type === 'Sequencing') {
							for (i = 0; i < r.answers.length; ++i) {
								if (checker === undefined) {
									checker = correctMap[r.answers[i]].weight;

								} else if (checker >= correctMap[r.answers[i]].weight) {
									isCorrect = false;
									break;
								} else {
									checker = correctMap[r.answers[i]].weight;
								}
							}
							if (isCorrect) {
								studentResult.correctCount += 1;
							}
						}

						if (q.type !== 'Cattell') {
							studentResult.questionsCount += 1;
						}
					});

					if (Object.keys(studentResult.sumByFactor).length) {
						// map raw sum to sten by factor
						factors.forEach(function(f) {
							var i = 0,
								sum = studentResult.sumByFactor[f._id] || 0;
							for (i; i < f.matches.length; ++i) {
								// assuming matches are in ascending order
								if (f.matches[i].rawSum && sum <= f.matches[i].rawSum) {
									studentResult.stenByFactor[f._id] = f.matches[i].sten;
									break;
								}
							}
						});
					}

					results.push(studentResult);
				});

				return results;
			};
		}
	});
