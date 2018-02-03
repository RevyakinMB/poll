angular
	.module('testResults')
	.component('testResultPaper', {
		templateUrl: 'testing/test-results/report/exam-paper.template.html',
		bindings: {
			testing: '<',
			specialties: '<',
			eduForms: '<',
			passedMap: '<'
		}
	});
