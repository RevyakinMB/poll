angular
	.module('mainMenu')
	.component('mainMenu', {
		templateUrl: 'main-menu/main-menu.template.html',
		controller: function mainMenuController(gettextCatalog, $location, $rootScope) {
			this.items = [{
				name: function() {
					return gettextCatalog.getString('Pass test');
				},
				path: '/greet'
			}, {
				name: function() {
					return gettextCatalog.getString('Groups');
				},
				path: '/groups'
			}, {
				name: function() {
					return gettextCatalog.getString('Question sets');
				},
				path: '/question-sets'
			}, {
				name: function() {
					return gettextCatalog.getString('Testings');
				},
				path: '/testings'
			}, {
				name: function() {
					return gettextCatalog.getString('Settings');
				},
				path: '/settings'
			}];

			this.currentPath = $location.path();
			this.isCurrent = function(item) {
				return this.currentPath.indexOf(item.path) === 0;
			};
			this.undbindEventHandler =
				$rootScope.$on('$locationChangeSuccess', function() {
					this.currentPath = $location.path();
				}.bind(this));

			this.$onDestroy = function() {
				this.undbindEventHandler();
			};
		}
	});
