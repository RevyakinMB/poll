angular.module('pollApp')
	.config(function pollAppConfig($routeProvider, $locationProvider) {
		$locationProvider.html5Mode(true);

		$routeProvider
			.when('/greet', {
				template: '<greet></greet>'
			})
			.otherwise({
				templateUrl: '404.html'
			});
	})
	.run(function pollAppRun(gettextCatalog) {
		// cookies & language auto-select
		gettextCatalog.setCurrentLanguage('ru');
		gettextCatalog.loadRemote('po/ru.json');
	});
