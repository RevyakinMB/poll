angular
	.module('utils')
	.directive('resourceUpload', function($http, $location) {
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
						// TODO: message service
						console.log(e);
					});
				});
				element.on('$destroy', function() {
					element.off();
				});
			}
		};
	});
