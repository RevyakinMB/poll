angular
	.module('utils')
	.service('appLocalStorage',
		function appLocalStorageService($window) {
			var localStorage = $window.localStorage;

			this.getItem = function(key) {
				return localStorage.getItem(key);
			};

			this.setItem = function(key, value) {
				return localStorage.setItem(key, value);
			};

			this.removeItem = function(key) {
				return localStorage.removeItem(key);
			};
		});
