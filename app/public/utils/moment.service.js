angular
	.module('moment', [])
	.factory('moment', function($window) {
		return $window.moment;
	});
