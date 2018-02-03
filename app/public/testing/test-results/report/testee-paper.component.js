angular
	.module('testResults')
	.component('testeePaper', {
		templateUrl: 'testing/test-results/report/testee-paper.template.html',
		bindings: {
			testing: '<',
			result: '<',
			specialties: '<',
			eduForms: '<'
		},
		transclude: true,
		controller: function testeePaperController() {
			this.name = function() {
				var names, result;
				if (!this.result.name) {
					return this.result.name;
				}
				names = this.result.name.split(' ');
				result = names[0];
				if (names[1]) {
					result += ' ' + names[1][0] + '.';
				}
				if (names[2]) {
					result += ' ' + names[2][0] + '.';
				}
				return result;
			};
		}
	});
