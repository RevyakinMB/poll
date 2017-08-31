angular
	.module('utils')
	.directive('datePicker', function datePicker(jQuery, moment) {
		return {
			restrict: 'A',
			require: 'ngModel',
			scope: {
				ngModel: '='
			},
			link: function datePickerLink(scope, element, attrs, ngModelCtrl) {
				var opt = {
						toggleSelected: false,
						timepicker: true
					}, listener;

				opt.onSelect = function(formattedDate, date) {
					scope.ngModel = new Date(date).toISOString();
					console.log('onSelect', new Date(date).toISOString());
					scope.$applyAsync();
				};

				listener = scope.$watch('ngModel', function(v) {
					console.log('$watch', v);
					jQuery(element).data('datepicker').selectDate(new Date(v));
					listener();
				});

				ngModelCtrl.$formatters.unshift(function(modelValue) {
					console.log('$formatters', modelValue);
					return moment(new Date(modelValue)).format('DD.MM.YYYY');
				});

				ngModelCtrl.$parsers.unshift(function(viewValue) {
					var isValid = moment(viewValue, 'DD.MM.YYYY', true).isValid(),
						date;
					console.log('$parsers', viewValue);

					if (!isValid) {
						return ngModelCtrl.$modelValue;
					}

					date = moment(viewValue, 'DD.MM.YYYY').toISOString();
					jQuery(element).data('datepicker').selectDate(new Date(date));
					return date;
				});

				element.on('$destroy', function() {
					jQuery(element).data('datepicker').destroy();
				});

				jQuery(element).datepicker(opt);
			}
		};
	});
