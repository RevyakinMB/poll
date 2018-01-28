angular
	.module('questionSetList')
	.component('questionSetList', {
		templateUrl: 'question-set-management/question-set-list/question-set-list.template.html',
		controller: function questionSetListController(QuestionSet, Testing,
			$location, gettextCatalog, messenger) {
			this.questionSets = QuestionSet.query(
				function() {},
				function(err) {
					console.log(err);
				});

			this.useCount = {};

			this.message = {
				text: '',
				error: false,
				hidden: true
			};

			Testing.query(function(testings) {
				testings.forEach(function(t) {
					if (!this.useCount[t.idQuestionSet]) {
						this.useCount[t.idQuestionSet] = 0;
					}
					this.useCount[t.idQuestionSet] += 1;
				}, this);
			}.bind(this), function(err) {
				console.log(err);
			});

			Object.defineProperty(this, 'allChecked', {
				get: function() {
					return this.questionSets.every(function(s) {
						return s.checked;
					});
				}.bind(this),
				set: function(v) {
					this.questionSets.forEach(function(s) {
						s.checked = v;
					});
				}.bind(this)
			});

			this.edit = function() {
				var checked = this.questionSets.filter(function(s) {
					return s.checked;
				});

				if (checked.length !== 1) {
					return;
				}

				$location.path('/question-sets/' + checked[0]._id);
			};

			this.setCheck = function($event, s) {
				if (s) {
					s.checked = !s.checked;
				}

				$event.stopPropagation();
			};

			this.setOpen = function($event, id) {
				$location.path('/question-sets/' + id);
				$event.stopPropagation();
			};

			this.checkedCount = function() {
				return this.questionSets.filter(function(s) {
					return s.checked;
				}).length;
			};

			this.delete = function() {
				this.questionSets.filter(function(s) {
					return s.checked;
				}).forEach(function(s) {
					delete s.checked;

					s.$delete({
						questionSetId: s._id
					},
					function() {
						var idx = this.questionSets.indexOf(s);
						this.questionSets.splice(idx, 1);
						messenger({
							message: gettextCatalog.getString('Question set(s) successfully removed')
						}, this.message);

					}.bind(this),
					function(err) {
						console.log(err);
						if (err.data.error === 'A testing with specified question set exists') {
							messenger({
								message: gettextCatalog.getString(
									'Error: a testing with specified question set exists'),
								isError: true
							}, this.message);
							return;
						}
						messenger({
							message: gettextCatalog.getString('Error: a question set was not deleted'),
							isError: true
						}, this.message);

					}.bind(this));
				}, this);
			};
		}
	});
