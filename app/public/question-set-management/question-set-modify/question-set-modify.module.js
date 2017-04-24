angular
	.module('questionSetModify', [
		'core'
	])
	.config(function questionSetModifyConfig($routeProvider) {
		$routeProvider
			.when('/question-sets/:questionSetId', {
				template: '<question-set-modify></question-set-modify>'
			});
	});
