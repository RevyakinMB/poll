describe('groupModify', function() {
	beforeEach(module('groupModify'));

	describe('groupModifyController', function() {
		var $componentController, $httpBackend;

		beforeEach(inject(function(_$componentController_, _$httpBackend_) {
			$componentController = _$componentController_;
			$httpBackend = _$httpBackend_;
		}));

		describe('when groupId is `new`', function() {
			var ctrl;
			beforeEach(inject(function() {
				ctrl = $componentController('groupModify', {
					$routeParams: { groupId: 'new' }
				});
			}));

			it('should create empty `group` model', function() {
				expect(ctrl.group.students.length).toBe(0);
				expect(ctrl.group.groupName).toBe('');
			});

			it('should create new `group` on save', function() {
				ctrl.group.groupName = 'Test group name';
				ctrl.group.students.push({
					firstName: 'f',
					lastName: 'l'
				});

				expect(ctrl.group._id).toBeUndefined();

				$httpBackend.expectPOST('/api/groups', JSON.stringify(ctrl.group))
					.respond(201, Object.assign({}, ctrl.group, {
						_id: 'uniqueIdCreatedByBackend'
					}));

				ctrl.changesSave();

				$httpBackend.flush();

				expect(ctrl.group._id).toBe('uniqueIdCreatedByBackend');

				$httpBackend.verifyNoOutstandingExpectation();
				$httpBackend.verifyNoOutstandingRequest();
			});
		});

		describe('when groupId is defined', function() {
			var ctrl;
			beforeEach(inject(function() {
				ctrl = $componentController('groupModify', {
					$routeParams: { groupId: 'uniqueId' }
				});

				jasmine.addCustomEqualityTester(angular.equals);
			}));

			it ('should load group with corresponding id', function() {
				$httpBackend.expectGET('/api/groups/uniqueId')
					.respond(200, {
						groupName: 'Test group name',
						students:  [{
							firstName: 'f',
							lastName: 'l'
						}],
						_id: 'uniqueId'
					});

				expect(ctrl.group.groupName).toBeUndefined();
				expect(ctrl.group.students).toBeUndefined();

				$httpBackend.flush();

				expect(ctrl.group.groupName).toBe('Test group name');
				expect(ctrl.group.students).toEqual([{
					firstName: 'f',
					lastName: 'l'
				}]);
				expect(ctrl.group._id).toBe('uniqueId');

				$httpBackend.verifyNoOutstandingExpectation();
				$httpBackend.verifyNoOutstandingRequest();
			});
		});

		describe('message box', function() {
			it('should show error message when group was not found', function() {
				var ctrl;

				$httpBackend.expectGET('/api/groups/nonExistent')
					.respond(404, {statusText: 'Not found'});

				ctrl = $componentController('groupModify', {
					$routeParams: { groupId: 'nonExistent' }
				});

				$httpBackend.flush();

				expect(ctrl.groupNotFound).toBe(true);

				$httpBackend.verifyNoOutstandingExpectation();
				$httpBackend.verifyNoOutstandingRequest();
			});

			describe('should show', function() {
				var ctrl;

				beforeEach(function() {
					$httpBackend.expectGET('/api/groups/uniqueId')
						.respond(200, {
							groupName: 'Test group name',
							students:  [],
							_id: 'uniqueId'
						});

					ctrl = $componentController('groupModify', {
						$routeParams: { groupId: 'uniqueId' }
					});
				});

				afterEach(inject(function($timeout) {
					$timeout.flush();

					expect(ctrl.errorMessage).toBeUndefined();
					expect(ctrl.successMessage).toBeUndefined();

					$httpBackend.verifyNoOutstandingExpectation();
					$httpBackend.verifyNoOutstandingRequest();
				}));

				it('error message on inconsistent student data save attempt', function() {
					$httpBackend.flush();

					expect(ctrl.errorMessage).toBeUndefined();
					expect(ctrl.group.students).toEqual([]);

					ctrl.group.students.push({
						firstName: '',
						lastName: '',
						patronymic: ''
					});

					ctrl.changesSave();

					expect(ctrl.errorMessage).toBeDefined();
					expect(ctrl.successMessage).toBeUndefined();
				});

				it('success message on correct data save', function() {
					$httpBackend.flush();

					expect(ctrl.successMessage).toBeUndefined();
					expect(ctrl.group.students).toEqual([]);

					ctrl.group.students.push({
						firstName: 'T',
						lastName: 'J'
					});

					$httpBackend.expectPOST(
						'/api/groups/uniqueId',
						JSON.stringify(ctrl.group)
					).respond(200, ctrl.group);

					ctrl.changesSave();

					$httpBackend.flush();

					expect(ctrl.errorMessage).toBeUndefined();
					expect(ctrl.successMessage).toBeDefined();
				});
			});
		});

		describe('students array of group instance', function() {
			var ctrl;
			beforeEach(function() {
				$httpBackend.expectGET('/api/groups/uniqueId')
					.respond({
						groupName: 'Test group name',
						students:  [{
							lastName: 'L1',
							firstName: 'R1'
						}, {
							lastName: 'L2',
							firstName: 'R2'
						}],
						_id: 'uniqueId'
					});
				ctrl = $componentController('groupModify', {
					$routeParams: { groupId: 'uniqueId' }
				});
				$httpBackend.flush();
			});

			it('should be increased by one on studentAdd call', function() {
				expect(ctrl.group.students.length).toBe(2);
				ctrl.studentAdd();
				expect(ctrl.group.students.length).toBe(3);
				expect(ctrl.group.students[2].firstName).toBe('');
			});

			it('should be decreased by one on studentDelete call', function() {
				expect(ctrl.group.students.length).toBe(2);
				ctrl.studentDelete(ctrl.group.students[0]);
				expect(ctrl.group.students.length).toBe(1);
			});

			xit('should be updated on studentUpdate call', function() {
				ctrl.studentAdd();
				expect(ctrl.group.students[2].firstName).toBe('');
				ctrl.studentUpdate(ctrl.group.students[2], {
					student: {
						firstName: 'New',
						lastName: 'Name',
						patronymic: ''
					}
				});
				expect(ctrl.group.students[2].firstName).toBe('New');
				expect(ctrl.group.students[2].lastName).toBe('Name');
			});
		});
	});
});
