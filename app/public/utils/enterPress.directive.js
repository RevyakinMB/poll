angular
	.module('utils')
	.directive('enterPress', function() {
		return function enterPressLink(scope, element, attrs) {
			element.bind('keypress keydown', function(event) {
				var btn = event.which || event.keyCode;
				if (btn === 13) {
					scope.$apply(function() {
						scope.$eval(attrs.enterPress);
					});

					event.preventDefault();
				}
			});
		};
	});
