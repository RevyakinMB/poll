angular
	.module('questionSetModify')
	.component('questionModify', {
		templateUrl: 'question-set-management/question-set-modify/question-modify.template.html',
		bindings: {
			question: '<',
			onUpdate: '&',
			onClose: '&',
			factors: '<'
		},
		controller: function questionModifyController(
			questionTypes, appLocalStorage,
			$scope) {
			this.$onChanges = function(changes) {
				var _id, draft, i;
				if (changes.question) {
					// real one-way binding
					this.question = angular.copy(changes.question.currentValue);

					// load draft version of the question from local storage
					draft = appLocalStorage.getItem(
						this.question._id || this.question.tempId);
					if (draft) {
						try {
							_id = this.question._id;
							this.question = JSON.parse(draft);
							this.question._id = _id;
						} catch (e) {
							// broken draft
						}
					}

					// update answers' weights on question type change
					$scope.$watch(function() {
						return this.question.qType;
					}.bind(this), function(v) {
						var leaveMeAlone = true;
						if (v === 'Alternative') {
							this.question.answers.forEach(function(a) {
								a.weight = (leaveMeAlone && a.weight === 1) ? 1 : 0;
								if (a.weight === 1) {
									leaveMeAlone = false;
								}
							});
						} else if (v === 'Multiple') {
							this.question.answers.forEach(function(a) {
								a.weight = a.weight === 1 ? 1 : 0;
							});
						}
					}.bind(this));

					i = 0;
					// used by radio input values
					this.question.answers.forEach(function(a) {
						(function(answerIndex) {
							a.answerIndex = answerIndex;
						}(i++));
					});

					this.questionInitial = angular.copy(this.question);
				}
			};

			this.$onDestroy = function() {
				if (this.saved) {
					appLocalStorage.removeItem(this.question._id || this.question.tempId);
					return;
				}
				if (angular.equals(this.question, this.questionInitial)) {
					return;
				}
				appLocalStorage.setItem(
					this.question._id || this.question.tempId,
					JSON.stringify(this.question)
				);
			};

			this.qTypes = questionTypes;

			Object.defineProperty(this, 'altAnswerSelected', {
				get: function altAnswerSelectedGet() {
					var i;
					for (i = 0; i < this.question.answers.length; ++i) {
						if (this.question.answers[i].weight) {
							return this.question.answers[i].answerIndex;
						}
					}
					return -1;
				},
				set: function altAnswerSelectedSet(v) {
					this.question.answers.forEach(function(a) {
						a.weight = a.answerIndex === v ? 1 : 0;
					});
				}
			});

			this.answerAdd = function() {
				this.question.answers.push({
					text: '',
					weight: 0,
					answerIndex: this.question.answers.length
				});
			};

			this.answerRemove = function(a) {
				if (this.question.answers.length < 3) {
					return;
				}
				this.question.answers.splice(
					this.question.answers.indexOf(a), 1
				);
			};

			this.answerMove = function(a, direction) {
				var idx = this.question.answers.indexOf(a),
					replaceMe;

				if ((direction === 'up' && idx === 0) ||
					(direction === 'down' && idx === this.question.answers.length - 1)) {
					return;
				}

				replaceMe = this.question.answers.splice(idx, 1)[0];

				this.question.answers.splice(
					direction === 'up' ? idx - 1 : idx + 1,
					0,
					replaceMe);
			};

			this.questionSave = function() {
				if (this.qForm.$invalid || (
						this.question.qType === 'Sequencing' &&
						!this.positionNumbersAreUnique())) {
					console.log('Question data is invalid');
					// force errors display
					angular.forEach(this.qForm, function(field) {
						if (typeof field === 'object' &&
							Object.prototype.hasOwnProperty.call(field, '$modelValue')) {
							field.$setTouched();
						}
					});
					return;
				}
				this.onUpdate({
					$event: {
						question: this.question
					}
				});
				this.saved = true;
				this.onClose();
			};

			// helpers
			this.anyAnswerIsSelected = function() {
				return this.question.answers.some(function(a) {
					return a.weight === 1;
				});
			};

			this.positionNumbersAreUnique = function() {
				var obj = {};
				return this.question.answers.every(function(a) {
					var unique = obj[a.weight] === undefined;
					obj[a.weight] = true;
					return unique;
				});
			};

			this.hasError = function(input) {
				return input && input.$touched && input.$invalid;
			};
		}
	});
