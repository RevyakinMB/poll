angular
	.module('login')
	.component('login', {
		templateUrl: 'user/login/login.template.html',
		controller: function loginController(
			authorizeService, gettextCatalog, messenger, $location) {
			this.userLogin = function() {
				authorizeService.userLogin(this.login, this.password)
					.then(function() {
						$location.path('/');
					})
					.catch(function(err) {
						console.log(err);
						messenger({
							message: gettextCatalog.getString(
								'Wrong username or password'),
							isError: true
						}, this.message);
					}.bind(this));
			};

			this.message = {
				text: '',
				error: false,
				hidden: true
			};
		}
	});
