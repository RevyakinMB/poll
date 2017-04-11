angular.module('pollApp')
	.config(function pollAppConfig($routeProvider, $locationProvider) {
		$locationProvider.html5Mode(true);

		$routeProvider
			.when('/', {
				redirectTo: '/greet'
			})
			.when('/greet', {
				template: '<greet></greet>'
			})
			.when('/groups', {
				template: '<group-list></group-list>'
			})
			.when('/groups/:groupId', {
				template: '<group-modify></group-modify>'
			})
			.otherwise({
				templateUrl: '404.html'
			});
	})
	.run(function pollAppRun(langSwitcherService, currentLanguage) {
		// TODO: cookies & language auto-select
		langSwitcherService(currentLanguage.value);
	});
