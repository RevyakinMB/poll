angular
	.module('questionSetModify')
	.component('questionModify', {
		templateUrl: 'question-set-management/question-set-modify/question-modify.template.html',
		bindings: {
			question: '<',
			onUpdate: '&',
			onClose: '&'
		},
		controller: function questionModifyController(questionTypes, appLocalStorage) {
			this.$onChanges = function(changes) {
				var _id, draft;
				if (changes.question) {
					this.question = angular.copy(changes.question.currentValue);
					this.questionInitial = angular.copy(changes.question.currentValue);

					draft = appLocalStorage.getItem(
						this.question._id || this.question.tempId);
					if (!draft) {
						return;
					}
					try {
						_id = this.question._id;
						this.question = JSON.parse(draft);
						this.question._id = _id;
					} catch (e) {
						// no draft
					}
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

			this.answerAdd = function() {
				this.question.answers.push({
					text: '',
					weight: 0
				});
			};

			this.answerRemove = function(a) {
				this.question.answers.splice(
					this.question.answers.indexOf(a), 1
				);
			};

			this.questionSave = function() {
				if (this.qForm.$invalid) {
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
				}, this);
			};

			this.hasError = function(input) {
				return input && input.$touched && input.$invalid;
			};
		}
	});
