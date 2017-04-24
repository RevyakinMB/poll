angular
	.module('core')
	.factory('questionTypes',
		function questionTypesFactory(gettextCatalog) {
			return [{
				value: 'Alternative',
				name: gettextCatalog.getString('Alternative choice')
			}, {
				value: 'Multiple',
				name: gettextCatalog.getString('Multiple choice')
			}, {
				value: 'Sequencing',
				name: gettextCatalog.getString('Sequencing')
			}, {
				value: 'Match',
				name: gettextCatalog.getString('Match making')
			}];
		});
