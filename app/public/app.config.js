angular.module('pollApp')
	.config(function pollAppConfig(
		$routeProvider, $locationProvider, $httpProvider,
		tmhDynamicLocaleProvider
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

		tmhDynamicLocaleProvider.localeLocationPattern(
			'/bower_components/angular-i18n/angular-locale_{{locale}}.js'
		);
	})
	.run(function pollAppRun(
		langSwitcherService,
		$rootScope, $location, $http,
		authorizeService,
		userPersistenceService
	) {
		var routesWithoutAuth = [
				'/greet',
				'/login',
				'/testPassing',
				'/testResults'
			],
			language;

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

		language = userPersistenceService.getCookieData('language');
		if (language) {
			langSwitcherService(language);

		} else {
			$http.get('/api/_language')
				.then(function(res) {
					var lang = res.data.language.substr(0, 2);
					langSwitcherService(lang);
				})
				.catch(function(err) {
					console.log(err);
				});
		}
	});
