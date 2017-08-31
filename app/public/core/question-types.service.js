angular
	.module('core')
	.factory('questionTypes',
		function questionTypesFactory(gettextCatalog) {
			return [{
				value: 'Alternative',
				name: function() {
					return gettextCatalog.getString('Alternative choice');
				}
			}, {
				value: 'Multiple',
				name: function() {
					return gettextCatalog.getString('Multiple choice');
				}
			}, {
				value: 'Sequencing',
				name: function() {
					return gettextCatalog.getString('Sequencing');
				}
			}, {
				value: 'Cattell',
				name: function() {
					return gettextCatalog.getString('Cattell');
				}
			}, {
				value: 'Poll',
				name: function() {
					return gettextCatalog.getString('Poll');
				}
			}
			// , {
			//	value: 'Match',
			//	name: function() {
			//		return gettextCatalog.getString('Match making');
			// }
			];
		});
