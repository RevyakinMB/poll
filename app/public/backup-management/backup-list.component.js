angular
	.module('backupList')
	.component('backupList', {
		templateUrl: 'backup-management/backup-list.template.html',
		controller: function backupListController(
			$http, gettextCatalog, messenger
		) {
			this.backups = [];
			$http.get('/api/backups').then(
				function(response) {
					this.backups = response.data;
				}.bind(this),
				function(err) {
					console.log(err);
					messenger({
						message: gettextCatalog.getString(
							'Error: an error occurred while backup list loading'),
						isError: true
					}, this.message);
				}.bind(this)
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
				}).then(
					function() {
						messenger({
							message: gettextCatalog.getString(
								'Backup successfully restored')
						}, this.message);
					}.bind(this),
					function(err) {
						console.log(err);
						messenger({
							message: gettextCatalog.getString(
								'Error: an error occurred while backup restoration'),
							isError: true
						}, this.message);
					}.bind(this));
			};

			this.newBackupCreate = function() {
				$http.post('/api/backups', {}).then(
					function() {
						messenger({
							message: gettextCatalog.getString(
								'Backup successfully created')
						}, this.message);
					}.bind(this),
					function(err) {
						console.log(err);
						messenger({
							message: gettextCatalog.getString(
								'Error: an error occurred while backup creation'),
							isError: true
						}, this.message);
					}.bind(this)
				);
			};

			this.message = {
				text: '',
				error: false,
				hidden: true
			};
		}
	});
