describe('`notApplicable` filter', function() {
	var $filter;
	beforeEach(function() {
		module('utils');
		inject(function(_$filter_) {
			$filter = _$filter_;
		});
	});

	it('should return `N/a` on `undefined` or empty input', function() {
		expect($filter('notApplicable')(undefined)).toBe('N/a');
		expect($filter('notApplicable')(null)).toBe('N/a');
		expect($filter('notApplicable')('')).toBe('N/a');
	});

	it('should return back non-empty input', function() {
		expect($filter('notApplicable')('Test')).toBe('Test');
	});
});
