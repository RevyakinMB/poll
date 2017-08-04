angular
	.module('core')
	.factory('authorizeService', function authorizeService($http, userPersistenceService) {
		var user, _login;

		_login = userPersistenceService.getCookieData('login');
		if (_login) {
			user = {
				login: _login
			};
		}

		return {
			userLogin: function userLogin(login, password) {
				return $http.post('/api/login', {
					login: login,
					password: password

				}).then(function(_user) {
					user = _user.data;
					userPersistenceService.setCookieData('login', user.login);
				});
			},

			userLogout: function userLogout() {
				return $http.post('/api/logout').then(function() {
					user = undefined;

					userPersistenceService.clearCookieData('login');
				});
			},

			isLoggedIn: function isLoggedIn() {
				return !!user;
			}
		};
	});
