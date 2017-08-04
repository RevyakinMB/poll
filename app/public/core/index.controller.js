angular
	.module('core')
	.controller('IndexCtrl', function indexCtrl(userPersistenceService) {
		this.loginCheck = function() {
			return userPersistenceService.getCookieData('login');
		};
	});
