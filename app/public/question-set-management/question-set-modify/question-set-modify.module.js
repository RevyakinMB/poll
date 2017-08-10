angular
	.module('questionSetModify', [
		'core',
		'utils'
	])
	.config(function questionSetModifyConfig($routeProvider) {
		$routeProvider
			.when('/question-sets/:questionSetId', {
				title: 'Question sets',
				template: '<question-set-modify></question-set-modify>'
			});
	});
