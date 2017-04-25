angular
	.module('questionSetModify')
	.component('questionModify', {
		templateUrl: 'question-set-management/question-set-modify/question-modify.template.html',
		bindings: {
			question: '<',
			onUpdate: '&',
			onClose: '&'
		},
		controller: function questionModifyController(questionTypes) {
			this.$onChanges = function(changes) {
				if (changes.question) {
					this.question = angular.copy(changes.question.currentValue);
					console.log(this.question);
				}
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
