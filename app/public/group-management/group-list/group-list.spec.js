describe('groupList component', function() {
	var $componentController, $httpBackend,
		ctrl,
		groupListCreate = function(ls) {
			return ls.map(function (name) {
				return {
					groupName: name,
					students: []
				};
			});
		},
		groupListAssert = function(groups, names) {
			for (var i = 0; i < groups.length; ++i) {
				expect(groups[i].groupName).toBe(names[i]);
			}
		};

	beforeEach(function() {
		module('groupList');
	});

	beforeEach(inject(function(_$componentController_, _$httpBackend_) {
		$componentController = _$componentController_;
		$httpBackend = _$httpBackend_;

		$httpBackend.expectGET('/api/groups').respond(
			200, groupListCreate(['Name2', 'Empty for now', 'Name1'])
		);

		ctrl = $componentController('groupList');
	}));

	afterEach(function() {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});

	it('should load group list on start', function() {
		expect(ctrl.groups.length).toBe(0);
		$httpBackend.flush();
		expect(ctrl.groups.length).toBe(3);
	});

	it('should sort group list on `Group name` column header click', function() {
		$httpBackend.flush();
		expect(ctrl.groups.length).toBe(3);
		ctrl.sort('name');
		groupListAssert(ctrl.groups, ['Empty for now', 'Name1', 'Name2']);

		ctrl.sort('name');
		groupListAssert(ctrl.groups, ['Name2', 'Name1', 'Empty for now']);
	});
});
