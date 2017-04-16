angular
	.module('questionSetList')
	.component('questionSetList', {
		templateUrl: 'question-set-management/question-set-list/question-set-list.template.html',
		controller: function questionSetListController(QuestionSet) {
			this.questionSets = QuestionSet.query();
		}
	});
