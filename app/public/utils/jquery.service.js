angular
	.module('jquery', [])
	.factory('jQuery', function($window) {
		return $window.jQuery;
	});
