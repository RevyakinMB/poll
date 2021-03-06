angular
	.module('core')
	.factory('userPersistenceService', function userPersistenceService($cookies) {
		return {
			setCookieData: function(key, value, maxAge) {
				var expires = new Date();
				expires.setDate(expires.getDate() + (maxAge || 1));
				$cookies.put(key, value, {
					expires: expires
				});
			},

			getCookieData: function(key) {
				return $cookies.get(key);
			},

			clearCookieData: function(key) {
				$cookies.remove(key);
			}
		};
	});
