angular
	.module('questionSetModify', [])
	.config(function questionSetModifyConfig($routeProvider) {
		$routeProvider
			.when('/question-sets/:questionSet', {
				template: '<question-set-modify></question-set-modify>'
			});
	});
