angular
	.module('testResults')
	.component('cattellFactorTable', {
		templateUrl: 'testing/test-results/cattell-table/cattell-table.template.html',
		bindings: {
			factors: '<',
			result: '<'
		},
		controller: function() {
			this.keysGet = function(obj) {
				console.log(obj);
				return obj ? Object.keys(obj) : [];
			};
		}
	});
