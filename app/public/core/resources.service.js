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
	})
	.factory('QuestionSet', function($resource) {
		return $resource('/api/question-sets/:questionSetId', {}, {
			delete: {
				method: 'POST',
				params: {
					action: 'delete'
				}
			},
			query: {
				method: 'GET',
				params: { questionSetId: '' },
				isArray: true
			}
		});
	})
	.factory('FactorSet', function($resource) {
		return $resource('/api/factor-sets/:factorSetName', {}, {
			delete: {
				method: 'POST',
				params: {
					action: 'delete'
				}
			},
			query: {
				method: 'GET',
				params: { factorSetName: '' },
				isArray: true
			}
		});
	});
