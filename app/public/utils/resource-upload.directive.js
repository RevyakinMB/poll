angular
	.module('utils')
	.directive('resourceUpload', function($http, $location, messenger, gettextCatalog) {
		var resourceTypes = ['group', 'questionSet'];
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				var resourceType = attrs.resourceUpload,
					redirect = scope.$eval(attrs.resourceRedirect);
				if (resourceTypes.indexOf(resourceType) === -1) {
					console.error('resource-upload directive: unknown resource type', resourceType);
					return;
				}
				element.on('change', function(event) {
					var formData;
					if (!event.target.files || !event.target.files.length) {
						return;
					}
					formData = new FormData();
					formData.append('file', event.target.files[0]);
					formData.append('resourceType', resourceType);

					element.val('');

					$http.post('/api/import', formData, {
						// stop angular to serialize a file
						transformRequest: angular.identity,
						headers: {
							// let browser to set content type to multipart/form-data
							'Content-Type': undefined
						}
					}).then(function(response) {
						if (redirect && response.data.resourceId) {
							switch (resourceType) {
							case 'group': {
								$location.path('/groups/' + response.data.resourceId);
								break;
							}
							default: {
								$location.path('/question-sets/' + response.data.resourceId);
								break;
							}
							}
						}
					}).catch(function(e) {
						var msg;
						if (e.data.error === 'Bad Request') {
							msg = gettextCatalog.getString('Unknown file format');

						} else if (e.data.error === 'No valid data to import') {
							msg = gettextCatalog.getString('No valid data to import');

						} else if (e.data.error.indexOf('There is incorrect answer weight; line:') !== -1) {
							msg = gettextCatalog.getString('There is incorrect answer weight; line:') + ' ' +
								e.data.error.substr(e.data.error.lastIndexOf(':') + 2);

						} else if (e.data.error.indexOf('Please specify at least two answers to question:') !== -1) {
							msg = gettextCatalog.getString('Please specify at least two answers to question:') + ' ' +
								e.data.error.substr(e.data.error.lastIndexOf(':') + 2);

						} else if (e.data.error.indexOf('There is a question with empty answer\'s text:') !== -1) {
							msg = gettextCatalog.getString('There is a question with empty answer\'s text:') + ' ' +
								e.data.error.substr(e.data.error.lastIndexOf(':') + 2);

						} else if (e.data.error.indexOf('Incorrect answer weights:') !== -1) {
							msg = gettextCatalog.getString('Incorrect answer weights:') + ' ' +
								e.data.error.substr(e.data.error.lastIndexOf(':') + 2);

						} else if (e.data.error.indexOf('There\'s more then one correct answer:') !== -1) {
							msg = gettextCatalog.getString('There\'s more then one correct answer:') + ' ' +
								e.data.error.substr(e.data.error.lastIndexOf(':') + 2);

						} else if (e.data.error.indexOf('There\'s ambiguous answer sequence:') !== -1) {
							msg = gettextCatalog.getString('There\'s ambiguous answer sequence:') + ' ' +
								e.data.error.substr(e.data.error.lastIndexOf(':') + 2);

						} else if (e.data.error.indexOf('There is answer to unknown question; line:') !== -1) {
							msg = gettextCatalog.getString('There is answer to unknown question; line:') + ' ' +
								e.data.error.substr(e.data.error.lastIndexOf(':') + 2);

						} else if (e.data.error.indexOf('Unknown factor index; line:') !== -1) {
							msg = gettextCatalog.getString('Unknown factor index; line:') + ' ' +
								e.data.error.substr(e.data.error.lastIndexOf(':') + 2);

						} else if (e.data.error.indexOf('Wrong question type; line:') !== -1) {
							msg = gettextCatalog.getString('Wrong question type; line:') + ' ' +
								e.data.error.substr(e.data.error.lastIndexOf(':') + 2);

						} else if (e.data.error.indexOf('Empty question text; line:') !== -1) {
							msg = gettextCatalog.getString('Empty question text; line:') + ' ' +
								e.data.error.substr(e.data.error.lastIndexOf(':') + 2);

						} else {
							msg = e.data.error;
						}
						messenger.show({
							message: msg,
							isError: true
						});
						console.log(e);
					});
				});
				element.on('$destroy', function() {
					element.off();
				});
			}
		};
	});
