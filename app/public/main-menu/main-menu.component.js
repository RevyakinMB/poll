angular
	.module('mainMenu')
	.component('mainMenu', {
		templateUrl: 'main-menu/main-menu.template.html',
		controller: function mainMenuController(gettextCatalog, $location, $rootScope) {
			this.items = [{
				name: function() {
					return gettextCatalog.getString('Group list');
				},
				path: '/groups'
			}, {
				name: function() {
					return gettextCatalog.getString('Greet page');
				},
				path: '/greet'
			}, {
				name: function() {
					return gettextCatalog.getString('Question set list');
				},
				path: '/question-sets'
			}, {
				name: function() {
					return gettextCatalog.getString('Cattell factor set');
				},
				path: '/cattell-factor-set'
			}, {
				name: function() {
					return gettextCatalog.getString('Testing list');
				},
				path: '/testings'
			}, {
				name: function() {
					return gettextCatalog.getString('Database backup');
				},
				path: '/backup-list'
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
