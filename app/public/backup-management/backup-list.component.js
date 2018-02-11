angular
	.module('backupList')
	.component('backupList', {
		templateUrl: 'backup-management/backup-list.template.html',
		controller: function backupListController(
			$http, gettextCatalog, messenger, moment
		) {
			var messageFn, restorePostFn, backupPostFn;
			this.backups = [];
			$http.get('/api/backups').then(
				function(response) {
					this.backups = response.data;
					this.backups.forEach(function(backup) {
						var date = moment(backup.date, 'YYYY-MM-DD.HH.mm.ss');
						if (date.isValid()) {
							backup.viewDate = date.toDate();
						}
					});
				}.bind(this),
				function(err) {
					console.log(err);
					messenger.show({
						message: gettextCatalog.getString(
							'An error occurred while backup list loading'),
						isError: true
					});
				}
			);

			this.checkedCount = function() {
				return this.backups.filter(function(b) {
					return b.checked;
				}).length;
			};

			this.backupCheck = function($event, b) {
				if (b) {
					b.checked = !b.checked;
				}
				$event.stopPropagation();
			};

			// helper request results messaging function
			messageFn = function(success, failure) {
				return [
					function() {
						messenger.show({
							message: gettextCatalog.getString(success)
						});
					}, function(err) {
						console.log(err);
						messenger.show({
							message: gettextCatalog.getString(failure),
							isError: true
						});
					}
				];
			};

			restorePostFn = messageFn(
				'Backup successfully restored',
				'An error occurred while backup restoration');

			this.restore = function() {
				var checked = this.backups.filter(function(b) {
					return b.checked;
				});

				if (checked.length !== 1) {
					console.error('There have to be single backup checked');
					return;
				}

				$http.post('/api/backups', {
					date: checked[0].date
				}).then(restorePostFn[0], restorePostFn[1]);
			};

			backupPostFn = messageFn(
				'Backup successfully created',
				'An error occurred while backup creation');

			this.newBackupCreate = function() {
				$http.post('/api/backups', {}).then(backupPostFn[0], backupPostFn[1]);
			};
		}
	});
