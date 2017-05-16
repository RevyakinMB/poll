angular
	.module('jquery', [])
	.factory('jquery', function($window) {
		return $window.jQuery;
	});
