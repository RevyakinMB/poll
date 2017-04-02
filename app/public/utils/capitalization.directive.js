angular
	.module('utils')
	.directive('capitalization', function() {
		var nonCapitalizedBits = ['von', 'av', 'af', 'de', 'di'],
			isValid = function(name) {
				if (!name) {
					return true;
				}
				if (nonCapitalizedBits.indexOf(name.split(' ')[0]) !== -1) {
					return true;
				}
				return name[0].toUpperCase() === name[0];
			};
		return {
			restrict: 'A',
			require: 'ngModel',
			link: function capitalizationLink(scope, element, attrs, ctrl) {
				ctrl.$validators.capitalization = function(modelValue, viewValue) {
					return isValid(modelValue || viewValue);
				};
			}
		};
	});
