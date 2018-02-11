angular
	.module('cattellFactorSet')
	.filter('resultRange', function() {
		return function(input, factors, index) {
			var i = index - 1, previous;
			if (!input) {
				return '\u2014';
			}
			while (i > -1 && !previous) {
				previous = factors[i--].rawSum;
			}
			if (previous === (input - 1)) {
				return input;
			}
			if (previous >= input) {
				// error: sequence is not ascending
				return '?';
			}
			return (previous ? (previous + 1) : '0') + ' - ' + input;
		};
	})
	.component('cattellFactorSet', {
		templateUrl: 'factor-set-management/cattell-factor-set.template.html',
		controller: function cattellFactorSetController(
			FactorSet, messenger, gettextCatalog) {
			this.set = FactorSet.get({
				factorSetName: 'Cattell'
			},
				function getSuccess() {
					// ok
				},
				function getError(err) {
					console.log('Error:', err.statusText);
				}
			);

			this.factorAdd = function() {
				this.set.factors.push({
					index: 'New',
					namePositive: 'New+',
					nameNegative: 'New-',
					matches: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function(i) {
						return { sten: i, rawSum: i };
					})
				});

				this.factorEdit(this.set.factors[this.set.factors.length - 1]);
			};

			this.factorRemove = function(f) {
				var idx = this.set.factors.indexOf(f);
				this.set.factors.splice(idx, 1);
			};

			this.factorEdit = function(f) {
				if (f.editing) {
					f.editing = false;
					return;
				}
				this.set.factors.forEach(function(factor) {
					factor.editing = false;
				});
				f.editing = true;
			};

			this.changesSave = function() {
				var isValid = this.set.factors.every(function(f) {
					return f.index && f.namePositive && !this.nonAscending(f);
				}, this);

				if (!isValid) {
					messenger.show({
						message: gettextCatalog.getString('Invalid form data; fix errors to proceed'),
						isError: true
					});
					return;
				}

				this.set.$save({
					factorSetName: 'Cattell'
				},
					function success() {
						messenger.show({
							message: gettextCatalog.getString('Factor set successfully saved')
						});
					},
					function error(err) {
						console.warn('Error while saving question set', err);
						if (err.data.error === 'FactorSets validation failed') {
							messenger.show({
								message: gettextCatalog.getString('Form validation failed'),
								isError: true
							});
							return;
						}
						messenger.show({
							message: err.data.error,
							isError: true
						});
					}
				);
			};

			this.nonAscending = function(f) {
				var value = -1;
				return !f.matches.every(function(next) {
					if (next.rawSum === undefined ||
						next.rawSum === null) {
						return true;
					}
					if (next.rawSum <= value) {
						return false;
					}
					value = next.rawSum;
					return true;
				});
			};
		}
	});
