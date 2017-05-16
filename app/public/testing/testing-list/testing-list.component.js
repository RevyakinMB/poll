angular
	.module('testingList')
	.component('testingList', {
		templateUrl: 'testing/testing-list/testing-list.template.html',
		controller: function testingListController(
			Testing, Group, QuestionSet,
			messenger, $timeout, gettextCatalog) {
			this.testingsScheduled = [];
			this.testingsPassed = [];
			this.testings = Testing.query(
				function(ls) {
					// TODO: ls.filter(t => t.attempts.length > 0)

					var d = new Date();
					d.setDate(d.getDate() + 1);
					ls.forEach(function(t) {
						if (t.scheduledFor < d) {
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

			Object.defineProperty(this, 'allSelected', {
				get: function() {
					return this.testings.every(function(t) {
						return t.selected;
					});
				}.bind(this),
				set: function(v) {
					this.testings.forEach(function(t) {
						t.selected = v;
					});
				}.bind(this)
			});

			this.testingAdd = function() {
				this.testings.forEach(function(t) {
					t.editing = false;
				});
				this.testings.push(new Testing({
					idQuestionSet: undefined,
					scheduledFor: new Date(),
					idGroup: undefined,
					editing: true,
					changed: true
				}));
			};

			this.testingEdit = function() {
				var selected = this.testings.filter(function(t) {
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
				var victims = this.testings.filter(function(t) {
					return t.selected;
				});

				victims.forEach(function(t) {
					if (!t._id) {
						this.testings.splice(this.testings.indexOf(t), 1);
						return;
					}
					delete t.selected;

					t.$delete({
						testingId: t._id
					},
						function() {
							var idx = this.testings.indexOf(t);
							if (idx !== -1) {
								this.testings.splice(idx, 1);
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
				return this.testings.reduce(function(count, t) {
					return count + (t.selected ? 1 : 0);
				}, 0);
			};

			this.message = {
				text: '',
				error: false,
				hidden: true
			};

			this.changesSave = function() {
				// this.testingsScheduled. ...
				var now = Date.now(),
					invalidTestings,
					isValid,
					dateFixed = function(input) {
						var parts;
						if (typeof input !== 'string') {
							return new Date(input);
						}

						parts = input.split('.');
						if (parts.length !== 3) {
							throw new Error('An error occurred: non RU locale of air-datePicker used?');
						}
						return new Date(parts[2], parts[1] - 1, parts[0]);
					};

				try {
					invalidTestings = this.testings.filter(function(t) {
						return t.changed && (!t.idGroup || !t.idQuestionSet || dateFixed(t.scheduledFor) < now);
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

				this.testings.forEach(function(t) {
					if (!t.changed) {
						return;
					}
					try {
						t.scheduledFor = dateFixed(t.scheduledFor);
					} catch (err) {
						console.error(err.message);
						messenger({
							message: gettextCatalog.getString('An error occurred'),
							isError: true
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
