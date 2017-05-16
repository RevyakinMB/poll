angular
	.module('utils')
	.directive('datePicker', function datePicker(moment, jquery) {
		return {
			restrict: 'A',
			require: 'ngModel',
			scope: {
				ngModel: '='
			},
			link: function datePickerLink(scope, element) {
				var opt = {};

				opt.onSelect = function(formattedDate) {
					scope.ngModel = formattedDate;
					scope.$applyAsync();
				};

				scope.$watch('ngModel', function(v) {
					var value;
					if (typeof v === 'string') {
						value = moment(v, moment.ISO_8601, true).isValid()
							? new Date(v)
							: v;
					} else {
						value = v;
					}

					jquery(element).data('datepicker').selectDate(value);
				});

				jquery(element).datepicker(opt);
			}
		};
	});
