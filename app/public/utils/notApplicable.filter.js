angular
	.module('utils')
	.filter('notApplicable', function(gettextCatalog) {
		return function notApplicableFilter(input) {
			if ([undefined, null, ''].indexOf(input) !== -1) {
				return gettextCatalog.getString('N/a');
			}
			return input;
		};
	});
