angular
	.module('backupList')
	.component('backupList', {
		templateUrl: 'backup-management/backup-list.template.html',
		controller: function backupListController($http) {
			this.backups = [];
			$http.get('/api/backups').then(
				function(response) {
					this.backups = response.data;
				}.bind(this),
				function(err) {
					console.log(err);
					// show error
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
					function(response) {
						console.log(response);
						// TODO: success message
					}, function(err) {
						console.log(err);
						// msg
					});
			};

			this.createNewBackup = function() {
				$http.post('/api/backups', {}).then(
					function(response) {
						console.log(response);
						// TODO: success message
					},
					function(err) {
						console.log(err);
						// msg
					}
				);
			};
		}
	});
