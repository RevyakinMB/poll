angular
	.module('core.resources', ['ngResource'])
	.factory('Group', function($resource) {
		return $resource('/api/groups/:groupId', {}, {
			delete: {
				method: 'POST',
				params: {
					action: 'delete'
				}
			},
			query: {
				method: 'GET',
				params: { groupId: '' },
				isArray: true
			}
		});
	})
	.factory('Student', function($resource) {
		return $resource('/api/groups/:groupId/students/:studentId', {}, {
			delete: {
				method: 'POST',
				params: {
					action: 'delete'
				}
			},
			query: {
				method: 'GET',
				params: { studentId: '' },
				isArray: true
			}
		});
	});
