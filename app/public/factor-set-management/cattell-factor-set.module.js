angular
	.module('cattellFactorSet', [
		'utils'
	])
	.config(function cattellFactorSetConfig($routeProvider) {
		$routeProvider
			.when('/cattell-factor-set', {
				template: '<cattell-factor-set></cattell-factor-set>'
			});
	});
