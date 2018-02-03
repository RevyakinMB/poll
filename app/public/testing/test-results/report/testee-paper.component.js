angular
	.module('testResults')
	.component('testeePaper', {
		templateUrl: 'testing/test-results/report/testee-paper.template.html',
		bindings: {
			testing: '<',
			specialties: '<',
			eduForms: '<',
			passedMap: '<'
		},
		transclude: true
	});
