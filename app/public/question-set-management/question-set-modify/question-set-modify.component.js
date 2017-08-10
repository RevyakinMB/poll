angular
	.module('questionSetModify')
	.component('questionSetModify', {
		templateUrl: 'question-set-management/question-set-modify/question-set-modify.template.html',
		controller: function questionSetModifyControler(
			$routeParams, $compile, $scope, $document, $timeout,
			gettextCatalog, QuestionSet, appLocalStorage, messenger,
			FactorSet
		) {
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
						console.error('Question set', this.setId, 'not found');
						this.notFound = true;
					}
				}.bind(this));
			}

			this.factors = [];
			FactorSet.get({
				factorSetName: 'Cattell'
			},
				function(factorSet) {
					this.factors = factorSet.factors;
				}.bind(this),
				function(err) {
					console.log('Error while factor set loading:', err);
					messenger({
						message: gettextCatalog.getString(
							'Error: Cattell factor set was not loaded'),
						isError: true
					}, this.message);
				}.bind(this)
			);

			this.questionAdd = function() {
				var cleanup;
				this.set.questions.push({
					text: '',
					qType: 'Alternative',
					idFactor: undefined,
					answers: [{
						text: '',
						weight: 0
					}, {
						text: '',
						weight: 0
					}],
					// tempId intended for question draft reference
					tempId: Math.random().toString(36).substr(2, 5)
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
				['text', 'idFactor', 'qType', 'answers']
					.forEach(function(field) {
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

			this.haveDraft = function(q) {
				return !!appLocalStorage.getItem(q._id || q.tempId);
			};

			this.editorOpen = function($event, q) {
				var scope, target;
				if (this.editor && this.questionDirty === q) {
					this.editorClose();
					return;
				}
				this.editorClose();
				this.questionDirty = q;

				scope = $scope.$new(false);
				this.editor = $compile([
					'<question-modify',
					' factors=$ctrl.factors',
					' question=$ctrl.questionDirty',
					' on-update=$ctrl.questionUpdate($event)',
					' on-close=$ctrl.editorClose()',
					'></question-modify>'
				].join(''))(scope);
				this.editor._scope = scope;

				target = $event.currentTarget || $event.target;
				target.parentNode.insertBefore(
					this.editor[0], target.nextSibling);
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

			this.changesSave = function() {
				var draftsReplaceMap = {}, i,
					isValid = this.set.questions.every(function(q) {
						var weight = false, answersValid;
						if (!q.text) {
							return false;
						}
						answersValid = q.answers.every(function(a) {
							weight |= a.weight;
							return a.text;
						});
						return answersValid && weight;
					});
				if (!isValid) {
					messenger({
						message: gettextCatalog.getString(
							'Error: question/answer text or correct answer is missing'),
						isError: true
					}, this.message);
					return;
				}

				this.editorClose();

				// save drafts assigned to temporary question ids
				for (i = 0; i < this.set.questions.length; ++i) {
					(function(q, index) {
						if (!q.tempId) {
							return;
						}
						draftsReplaceMap[index] = q.tempId;
					}(this.set.questions[i], i));
				}

				this.set.$save({
					questionSetId: this.setId ? this.setId : ''
				},
				function() {
					var draft, tempId;
					messenger({
						message: gettextCatalog.getString('Question set successfully saved')
					}, this.message);
					this.setId = this.set._id;

					// replace drafts of newly created questions
					for (i = 0; i < this.set.questions.length; ++i) {
						tempId = draftsReplaceMap[i];
						draft = tempId && appLocalStorage.getItem(tempId);
						if (draft) {
							appLocalStorage.setItem(this.set.questions[i]._id, draft);
							appLocalStorage.removeItem(tempId);
						}
					}
				}.bind(this), function(err) {
					console.warn('Error while saving question set', err);
					if (err.data.error === 'Validation error') {
						messenger({
							message: gettextCatalog.getString('Error: form validation failed'),
							isError: true
						});
						return;
					}
					messenger({
						message: gettextCatalog.getString('Error:') + ' ' + err.data.error,
						isError: true
					}, this.message);
				}.bind(this));
			};
		}
	});
