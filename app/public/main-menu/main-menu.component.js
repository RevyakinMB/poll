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
			}];

			// temporary dummy menu items
			for (i = 0; i < 7; ++i) {
				this.items.push({
					name: gettextCatalog.getString('Menu' + (i + 3)),
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
