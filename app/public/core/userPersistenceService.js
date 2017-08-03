angular
	.module('core')
	.factory('userPersistenceService', function userPersistenceService($cookies) {
		return {
			setCookieData: function(key, value) {
				$cookies.put(key, value);
			},

			getCookieData: function(key) {
				return $cookies.get(key);
			},

			clearCookieData: function(key) {
				$cookies.remove(key);
			}
		};
	});
