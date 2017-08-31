angular
	.module('directories')
	.component('directory', {
		templateUrl: 'directories/directories.template.html',
		controller: function directoryController(
			$routeParams, Specialty, EduForm, gettextCatalog, messenger) {
			var dirOpts = [{
				path: 'specialties',
				label: function() {
					return gettextCatalog.getString('Specialty list');
				},
				Resource: Specialty
			}, {
				path: 'edu-forms',
				label: function() {
					return gettextCatalog.getString('Educational form list');
				},
				Resource: EduForm
			}].filter(function(opt) {
				return $routeParams.directory === opt.path;
			});

			if (dirOpts.length !== 1) {
				console.error($routeParams.directory, 'directory is unknown');
				this.notFound = true;
				return;
			}

			this.directory = dirOpts[0].Resource.query(
				function() {},
				function(err) {
					console.log(err);
				}
			);

			this.dirLabel = dirOpts[0].label;

			this.add = function() {
				var record = new dirOpts[0].Resource({
					name: '',
					editing: true,
					changed: true
				});

				this.directory.forEach(function(r) {
					r.editing = false;
				});

				this.directory.push(record);
			};

			this.edit = function() {
				var checked = this.directory.filter(function(r) {
					return r.checked;
				});
				if (checked.length !== 1) {
					return;
				}

				this.directory.forEach(function(r) {
					r.editing = false;
				});

				checked[0].editing = true;
				checked[0].changed = true;
			};

			this.delete = function() {
				var victims = this.directory.filter(function(r) {
					return r.checked;
				});

				victims.forEach(function(r) {
					if (!r._id) {
						this.directory.splice(this.directory.indexOf(r), 1);
						messenger({
							message: gettextCatalog.getString('Record(s) successfully removed')
						}, this.message);
						return;
					}
					delete r.checked;
					delete r.editing;
					delete r.changed;

					r.$delete({
						id: r._id
					},
						function() {
							var idx = this.directory.indexOf(r);
							if (idx !== -1) {
								this.directory.splice(idx, 1);
							}
							messenger({
								message: gettextCatalog.getString('Record(s) successfully removed')
							}, this.message);
						}.bind(this),
						function(err) {
							console.log(err);
							messenger({
								message: gettextCatalog.getString('Error: a record was not deleted'),
								isError: true
							}, this.message);
						}.bind(this)
					);
				}, this);
			};

			this.save = function() {
				var changed = this.directory.filter(function(r) {
					return r.changed;
				});

				if (!changed.length) {
					messenger({
						message: gettextCatalog.getString('No records changed')
					}, this.message);
					return;
				}

				changed.forEach(function(r) {
					r.$save({
						id: r._id
					},
						function() {
							messenger({
								message: gettextCatalog.getString('Data successfully saved')
							}, this.message);
						}.bind(this),
						function() {
							messenger({
								message: gettextCatalog.getString('An error occurred while changes saving'),
								isError: true
							}, this.message);
						}.bind(this)
					);
				}, this);
			};

			this.checkedCount = function() {
				return this.directory.filter(function(r) {
					return r.checked;
				}).length;
			};

			this.recordCheck = function($event, r) {
				if (r) {
					r.checked = !r.checked;
				}
				$event.stopPropagation();
			};

			this.stopPropagation = function($event) {
				$event.stopPropagation();
			};

			this.message = {
				text: '',
				error: false,
				hidden: true
			};

			Object.defineProperty(this, 'allChecked', {
				get: function() {
					return this.directory.every(function(r) {
						return r.checked;
					});
				}.bind(this),

				set: function(v) {
					this.directory.forEach(function(r) {
						r.checked = v;
					});
				}.bind(this)
			});
		}
	});
