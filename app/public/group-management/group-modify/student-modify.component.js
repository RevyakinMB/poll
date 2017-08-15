angular
	.module('groupModify')
	.component('studentModify', {
		bindings: {
			student: '<',
			onUpdate: '&',
			onClose: '&'
		},
		templateUrl: 'group-management/group-modify/student-modify.template.html',
		controller: function studentModifyController() {
			this.$onChanges = function(changes) {
				if (changes.student) {
					// take a copy of object to make it really one-way bind
					this.student = angular.copy(changes.student.currentValue);
				}
			};

			this.studentSave = function() {
				if (this.form.$invalid) {
					angular.forEach(this.form, function(value) {
						if (typeof value === 'object' &&
								Object.prototype.hasOwnProperty.call(value, '$modelValue')) {
							value.$setTouched();
						}
					});
					return;
				}
				this.onUpdate({
					$event: {
						student: this.student
					}
				});
			};

			this.hasError = function(input) {
				return input && input.$touched && input.$invalid;
			};
		}
	});
