angular
	.module('mainMenu')
	.component('mainMenu', {
		templateUrl: 'main-menu/main-menu.template.html',
		controller: function mainMenuController(gettextCatalog, $location, $rootScope) {
			var i;
			this.items = [{
				name: gettextCatalog.getString('Group list'),
				path: '/groups'
			}, {
				name: gettextCatalog.getString('Greet page'),
				path: '/greet'
			}, {
				name: gettextCatalog.getString('Question set list'),
				path: '/question-sets'
			}, {
				name: gettextCatalog.getString('Cattell factor set'),
				path: '/cattell-factor-set'
			}, {
				name: gettextCatalog.getString('Testing list'),
				path: '/testings'
			}, {
				name: gettextCatalog.getString('Database backup'),
				path: '/backup-list'
			}];

			// temporary dummy menu items
			for (i = 0; i < 3; ++i) {
				this.items.push({
					name: gettextCatalog.getString('Menu' + (i + 7)),
					path: '/nonExistent'
				});
			}

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
