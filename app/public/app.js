'use strict';

angular.module('pollApp', [
	'ngRoute',
	'gettext',
	'greet'
]);

angular.module('greet', [
	'lang-selector'
]);

angular.module('pollApp')
	.config(["$routeProvider", "$locationProvider", function pollAppConfig($routeProvider, $locationProvider) {
		$locationProvider.html5Mode(true);

		$routeProvider
			.when('/greet', {
				template: '<greet></greet>'
			})
			.otherwise({
				templateUrl: '404.html'
			});
	}])
	.run(["gettextCatalog", function pollAppRun(gettextCatalog) {
		// cookies & language auto-select
		gettextCatalog.setCurrentLanguage('ru');
		gettextCatalog.loadRemote('po/ru.json');
	}]);

angular.module('greet')
	.component('greet', {
		controller: function greetController() {
			this.name = 'World';
		},
		templateUrl: 'greet/greet.template.html'
	});

angular
	.module('lang-selector', ['gettext'])
	.component('langSelector', {
		templateUrl: 'lang-selector/lang-selector.template.html',
		controller: ["gettextCatalog", function langSelectorController(gettextCatalog) {
			this.select = function langSelect(lang) {
				gettextCatalog.setCurrentLanguage(lang);
				gettextCatalog.loadRemote('po/' + lang + '.json');
			}
		}]
	});

