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
					// TODO: ls.filter(t => t.attempts.length > 0)

					var d = new Date();
					d.setDate(d.getDate() - 5);
					ls.forEach(function(t) {
						if (new Date(t.scheduledFor) < d) {
							this.testingsPassed.push(t);
						} else {
							this.testingsScheduled.push(t);
						}
					}, this);
				}.bind(this),
				function testingsQueryError(err) {
					console.log('Testings query error:', err);
				}
			);

			// helper maps
			this.groupsMap = [];
			this.groups = Group.query(function groupsLoaded(groups) {
				groups.forEach(function(g) {
					this.groupsMap[g._id] = g.groupName;
				}, this);
			}.bind(this));

			this.questionSetsMap = [];
			this.questionSets = QuestionSet.query(function qSetsLoaded(qSets) {
				qSets.forEach(function(q) {
					this.questionSetsMap[q._id] = q.name;
				}, this);
			}.bind(this));

			this.sortPropName = '';
			this.sortReversed = false;
			this.sortBy = function(property) {
				this.sortReversed = this.sortPropName === property
					? !this.sortReversed
					: false;
				this.sortPropName = property;

				this.testingsScheduled = $filter('orderBy')(
					this.testingsScheduled,
					this.sortPropName,
					this.sortReversed,
					this.localeSensitiveComparator);
			};
			this.localeSensitiveComparator = (function(self) {
				return function(v1, v2) {
					var mapped1, mapped2;

					// if we don't get strings, just compare by index
					if (v1.type !== 'string' || v2.type !== 'string') {
						return (v1.index < v2.index) ? -1 : 1;
					}

					if (self.sortPropName === 'idGroup') {
						mapped1 = self.groupsMap[v1.value] || v1.value;
						mapped2 = self.groupsMap[v2.value] || v2.value;
						// compare strings alphabetically, taking locale into account
						return mapped1.localeCompare(mapped2);
					}
					return v1.value.localeCompare(v2.value);
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
						}.bind(this),
						function(err) {
							console.log(err.message);
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

			this.passedShow = false;

			this.passedHideShow = function() {
				this.passedShow = !this.passedShow;
			};

			this.message = {
				text: '',
				error: false,
				hidden: true
			};

			this.changesSave = function() {
				var now = new Date(),
					invalidTestings,
					isValid;

				try {
					invalidTestings = this.testingsScheduled.filter(function(t) {
						return t.changed && (!t.idGroup || !t.idQuestionSet || new Date(t.scheduledFor) < now);
					});
				} catch (err) {
					console.error(err.message);
					messenger({
						message: gettextCatalog.getString('An error occurred'),
						isError: true
					}, this.message);
					return;
				}

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
							t.invalid = false;
						}, 3000);
					});
					return;
				}

				this.testingsScheduled.forEach(function(t) {
					if (!t.changed) {
						messenger({
							message: gettextCatalog.getString('No testings changed')
						}, this.message);
						return;
					}

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
