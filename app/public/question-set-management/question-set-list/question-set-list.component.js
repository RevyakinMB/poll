angular
	.module('questionSetList')
	.component('questionSetList', {
		templateUrl: 'question-set-management/question-set-list/question-set-list.template.html',
		controller: function questionSetListController(QuestionSet, Testing) {
			this.questionSets = QuestionSet.query(
				function() {},
				function(err) {
					console.log(err);
				});

			this.useCount = {};
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
		}
	});
