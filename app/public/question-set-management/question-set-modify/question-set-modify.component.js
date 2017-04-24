angular
	.module('questionSetModify')
	.component('questionSetModify', {
		templateUrl: 'question-set-management/question-set-modify/question-set-modify.template.html',
		controller: function questionSetModifyControler(
			$routeParams, $compile, $scope, $document, $timeout,
			gettextCatalog, QuestionSet) {
			if ($routeParams.questionSetId === 'new') {
				this.set = new QuestionSet();
				this.set.name = '';
				this.set.questions = [];
			} else {
				this.setId = $routeParams.questionSetId;
				this.set = QuestionSet.get({
					questionSetId: this.setId
				}, function success() {}, function error(err) {
					if (err) {
						console.error('Question set', this.questionSets, 'not found');
						this.notFound = true;
					}
				}.bind(this));
			}

			this.questionAdd = function() {
				var cleanup;
				this.set.questions.push({
					text: '',
					qType: 'Alternative',
					theme: '',
					answers: [{
						text: '',
						idWeight: {
							weight: 0
						}
					}, {
						text: '',
						idWeight: {
							weight: 0
						}
					}]
				});
				// editor is already created for a question
				if (this.editor) {
					return;
				}
				// wait for creation of DOM elements corresponding to new question
				cleanup = $scope.$watch(function() {
					return $document[0].querySelector(
						// last `Edit` btn of question list
						'.js-edit' + (this.set.questions.length - 1)
					);
				}.bind(this), function(editBtnOfCreatedQuestion) {
					if (!editBtnOfCreatedQuestion) {
						return;
					}
					cleanup();
					// moving outside of current $digest process
					// so programmatically triggered event
					// won't call another $apply
					$timeout(function() {
						// open editor
						angular.element(editBtnOfCreatedQuestion).triggerHandler('click');
					}, 0, false);
				});
			};

			this.questionUpdate = function($event) {
				['text', 'theme', 'qType', 'answers'].forEach(function(field) {
					this.questionDirty[field] = $event.question[field];
				}, this);
			};

			this.questionDelete = function(q) {
				if (this.questionDirty === q) {
					this.editorClose();
				}
				this.set.questions.splice(
					this.set.questions.indexOf(q), 1
				);
			};

			this.editorOpen = function($event, q) {
				var parent, scope;
				if (this.editor) {
					return;
				}
				this.questionDirty = q;

				scope = $scope.$new(false);
				this.editor = $compile([
					'<question-modify',
					' question=$ctrl.questionDirty',
					' on-update=$ctrl.questionUpdate($event)',
					' on-close=$ctrl.editorClose()',
					'></question-modify>'
				].join(''))(scope);
				this.editor._scope = scope;

				parent = $event.target.parentNode;
				parent.parentNode.insertBefore(this.editor[0], parent.nextSibling);
			};

			this.editorClose = function() {
				if (!this.editor || !this.editor.length) {
					return;
				}
				this.editor[0].parentNode.removeChild(this.editor[0]);
				this.editor._scope.$destroy();
				this.editor = undefined;
				this.questionDirty = undefined;
				// TODO: remove on empty question
			};

			// page interaction feedback
			this.message = {
				text: '',
				error: false,
				hidden: true
			};

			this.messageShow = function(options) {
				if (this.messageDelay) {
					$timeout.cancel(this.messageDelay);
				}
				this.message.text = options.message;
				this.message.hidden = false;
				this.message.error = options.isError;

				this.messageDelay = $timeout(function() {
					this.message.hidden = true;
				}.bind(this), options.isError ? 15000 : 3000);
			};

			this.changesSave = function() {
				var isValid = this.set.questions.every(function(q) {
					var weight = false, answersValid;
					if (!q.text) {
						return false;
					}
					answersValid = q.answers.every(function(a) {
						weight |= a.idWeight.weight;
						return a.text;
					});
					return answersValid && weight;
				});
				if (!isValid) {
					this.messageShow({
						message: gettextCatalog.getString(
							'Error: question/answer text is missing or correct answer is missing'),
						isError: true
					});
					return;
				}
				this.set.$save({
					questionSetId: this.setId ? this.setId : ''
				},
				function() {
					this.messageShow({
						message: gettextCatalog.getString('Question set successfully saved'),
						isError: false
					});
					this.setId = this.set._id;
				}.bind(this), function(err) {
					console.warn('Error while saving question set', err);
					if (err.data.error === 'Validation error') {
						this.messageShow({
							message: gettextCatalog.getString('Error: form validation failed'),
							isError: true
						});
						return;
					}
					this.messageShow({
						message: gettextCatalog.getString('Error:') + ' ' + err.data.error,
						isError: true
					});
				}.bind(this));
			};
		}
	});
