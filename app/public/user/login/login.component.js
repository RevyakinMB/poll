angular
	.module('login')
	.component('login', {
		templateUrl: 'user/login/login.template.html',
		controller: function loginController(
			authorizeService, gettextCatalog, messenger, $location) {
			this.redirectTo = $location.search().redirect || '/';
			this.userLogin = function() {
				authorizeService.userLogin(this.login, this.password)
					.then(function() {
						$location.path(this.redirectTo);
					}.bind(this))
					.catch(function(err) {
						console.log(err);
						messenger.show({
							message: gettextCatalog.getString(
								'Wrong username or password'),
							isError: true
						});
					});
			};

			authorizeService.userLogout().catch(function(err) {
				console.log(err);
			});
		}
	});
