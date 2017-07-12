angular
	.module('testResults')
	.component('testResults', {
		templateUrl: 'testing/test-results/test-results.template.html',
		controller: function testResultsController(
			$routeParams,
			gettextCatalog, messenger,
			Testing
		) {
			this.testing = Testing.get({
				testingId: $routeParams.testingId

			}, function(testing) {
				console.log('Loaded:', testing);

			}, function(err) {
				console.log('Error:', err);
				if (err.status === 404) {
					messenger({
						message: gettextCatalog.getString('Testing not found'),
						isError: true
					}, this.message);
				} else {
					messenger({
						message: gettextCatalog.getString('Error while testing loading'),
						isError: true
					}, this.message);
				}

			}.bind(this));

			this.message = {
				text: '',
				error: false,
				hidden: true
			};
		}
	});
