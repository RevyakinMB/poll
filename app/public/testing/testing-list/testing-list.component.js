angular
	.module('testingList')
	.component('testingList', {
		templateUrl: 'testing/testing-list/testing-list.template.html',
		controller: function testingListController(
			$timeout, $filter,
			Testing, Group, QuestionSet,
			messenger, gettextCatalog) {
			this.testingsScheduled = [];
			this.testingsPassed = [];
			Testing.query(
				function(ls) {
					ls.forEach(function(t) {
						if (t.attempts.length > 0) {
							this.testingsPassed.push(t);
						} else {
							this.testingsScheduled.push(t);
						}
					}, this);
				}.bind(this),
				function(err) {
					messenger({
						message: gettextCatalog.getString('An error occurred while testings loading'),
						isError: true
					}, this.message);
					console.log('Testings query error:', err);
				}.bind(this)
			);

			// helper maps
			this.groupsMap = [];
			this.groups = Group.query(function groupsLoaded(groups) {
				groups.forEach(function(g) {
					this.groupsMap[g._id] = g.groupName;
				}, this);
			}.bind(this), function(err) {
				console.log(err);
			});

			this.questionSetsMap = [];
			this.questionSets = QuestionSet.query(function qSetsLoaded(qSets) {
				qSets.forEach(function(q) {
					this.questionSetsMap[q._id] = q.name;
				}, this);
			}.bind(this), function(err) {
				console.log(err);
			});

			this.sortOpts = {
				scheduled: {
					property: '',
					reversed: false
				},
				passed: {
					property: '',
					reversed: false
				}
			};

			this.sortBy = function(property, passedTestingsSort) {
				var opts = !passedTestingsSort
					? this.sortOpts.scheduled
					: this.sortOpts.passed,
					expression;

				opts.reversed = opts.property === property
					? !opts.reversed
					: false;
				opts.property = property;

				if (!passedTestingsSort) {
					this.testingsScheduled = $filter('orderBy')(
						this.testingsScheduled,
						opts.property,
						opts.reversed,
						this.localeSensitiveComparator(opts.property));
				} else {
					expression = opts.property !== 'passedAt'
						? opts.property
						: function(value) {
							return value.attempts[0].startedAt;
						};
					this.testingsPassed = $filter('orderBy')(
						this.testingsPassed,
						expression,
						opts.reversed,
						this.localeSensitiveComparator(opts.property));
				}
			};

			this.localeSensitiveComparator = (function(self) {
				return function(property) {
					return function(v1, v2) {
						var mapped1, mapped2;

						// if we don't get strings, just compare by index
						if (v1.type !== 'string' || v2.type !== 'string') {
							return (v1.index < v2.index) ? -1 : 1;
						}

						if (property === 'idGroup') {
							mapped1 = self.groupsMap[v1.value] || v1.value;
							mapped2 = self.groupsMap[v2.value] || v2.value;
							return mapped1.localeCompare(mapped2);
						}

						return v1.value.localeCompare(v2.value);
					};
				};
			}(this));

			Object.defineProperty(this, 'allSelected', {
				get: function() {
					return this.testingsScheduled.every(function(t) {
						return t.selected;
					});
				}.bind(this),
				set: function(v) {
					this.testingsScheduled.forEach(function(t) {
						t.selected = v;
					});
				}.bind(this)
			});

			this.testingAdd = function() {
				this.testingsScheduled.forEach(function(t) {
					t.editing = false;
				});
				this.testingsScheduled.push(new Testing({
					idQuestionSet: undefined,
					scheduledFor: new Date(),
					idGroup: undefined,
					editing: true,
					changed: true
				}));
			};

			this.testingEdit = function() {
				var selected = this.testingsScheduled.filter(function(t) {
					t.editing = false;
					return t.selected;
				});
				if (selected.length) {
					selected[0].editing = true;
					selected[0].changed = true;
				}
			};

			this.editorClose = function(t) {
				t.editing = false;
			};

			this.testingRemove = function() {
				var victims = this.testingsScheduled.filter(function(t) {
					return t.selected;
				});

				victims.forEach(function(t) {
					if (!t._id) {
						this.testingsScheduled.splice(
							this.testingsScheduled.indexOf(t), 1);
						messenger({
							message: gettextCatalog.getString('Testing(s) successfully removed')
						}, this.message);
						return;
					}
					delete t.selected;

					t.$delete({
						testingId: t._id
					},
						function() {
							var idx = this.testingsScheduled.indexOf(t);
							if (idx !== -1) {
								this.testingsScheduled.splice(idx, 1);
							}
							messenger({
								message: gettextCatalog.getString('Testing(s) successfully removed')
							}, this.message);
						}.bind(this),
						function(err) {
							console.log(err);
							messenger({
								message: gettextCatalog.getString('Error: a testing was not deleted'),
								isError: true
							}, this.message);
						}.bind(this)
					);
				}, this);
			};

			this.testingSelect = function(event, t) {
				if (t) {
					t.selected = !t.selected;
				}
				event.stopPropagation();
			};

			this.testingSelectedCount = function() {
				return this.testingsScheduled.reduce(function(count, t) {
					return count + (t.selected ? 1 : 0);
				}, 0);
			};

			this.message = {
				text: '',
				error: false,
				hidden: true
			};

			this.changesSave = function() {
				var changedTestings = this.testingsScheduled.filter(function(t) {
						return t.changed;
					}),
					invalidTestings,
					isValid,
					yesterday = new Date();

				messenger(undefined, this.message);

				yesterday.setDate(yesterday.getDate() - 1);

				invalidTestings = changedTestings.filter(function(t) {
					return !t.idGroup || !t.idQuestionSet || new Date(t.scheduledFor) < yesterday;
				});

				isValid = invalidTestings.length === 0;

				if (!isValid) {
					messenger({
						message: gettextCatalog.getString('Error: a testing is invalid'),
						isError: true
					}, this.message);
					invalidTestings.forEach(function(t) {
						t.invalid = true;
						if (t.invalidTimeout) {
							$timeout.cancel(t.invalidTimeout);
						}
						t.invalidTimeout = $timeout(function() {
							delete t.invalid;
						}, 3000);
					});
					return;
				}

				if (!changedTestings.length) {
					messenger({
						message: gettextCatalog.getString('No testings changed')
					}, this.message);
					return;
				}

				changedTestings.forEach(function(t) {
					t.$save({
						testingId: t._id
					},
						function() {
							messenger({
								message: gettextCatalog.getString('Testing(s) successfully saved')
							}, this.message);
						}.bind(this),
						function() {
							messenger({
								message: gettextCatalog.getString('An error occurred while testings saving'),
								isError: true
							}, this.message);
						}.bind(this)
					);
				}, this);
			};
		}
	});
