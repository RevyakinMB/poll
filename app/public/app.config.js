angular.module('pollApp')
	.config(function pollAppConfig(
		$routeProvider, $locationProvider, $httpProvider
	) {
		$locationProvider.html5Mode(true);

		$routeProvider
			.when('/', {
				redirectTo: '/greet'
			})
			.when('/greet', {
				title: 'Home',
				template: '<greet></greet>'
			})
			.when('/groups', {
				title: 'Groups',
				template: '<group-list></group-list>'
			})
			.when('/groups/:groupId', {
				title: 'Groups',
				template: '<group-modify></group-modify>'
			})
			.otherwise({
				title: '404',
				templateUrl: '404.html'
			});

		$httpProvider.interceptors.push(function($q, $location) {
			return {
				responseError: function(response) {
					if (response && response.status === 401) {
						$location.path('/login');
					}
					return $q.reject(response);
				}
			};
		});
	})
	.run(function pollAppRun(
		langSwitcherService, currentLanguage,
		$rootScope, $location,
		authorizeService
	) {
		var routesWithoutAuth = ['/greet', '/testPassing', '/login'];

		$rootScope.$on('$routeChangeStart', function() {
			var url = $location.url();
			if (url === '/') {
				return;
			}
			if (authorizeService.isLoggedIn()) {
				return;
			}
			if (routesWithoutAuth.some(function(route) {
				return url.indexOf(route) !== -1;
			})) {
				return;
			}
			$location.url('/login?redirect=' + url);
		});

		$rootScope.$on('$routeChangeSuccess', function(event, current) {
			$rootScope.title = current.$$route.title;
		});

		// TODO: cookies & language auto-select
		langSwitcherService(currentLanguage.value);
	});
