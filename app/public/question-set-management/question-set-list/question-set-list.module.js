angular
	.module('questionSetList', [])
	.config(function questionSetListConfig($routeProvider) {
		$routeProvider
			.when('/question-sets', {
				title: 'Question sets',
				template: '<question-set-list></question-set-list>'
			});
	});
