angular.module('pollApp')
	.config(function pollAppConfig($routeProvider, $locationProvider) {
		$locationProvider.html5Mode(true);

		$routeProvider
			.when('/greet', {
				template: '<greet></greet>'
			})
			.when('/groups/:groupId', {
				template: '<group-modify></group-modify>'
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
