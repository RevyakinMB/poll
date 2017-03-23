angular
	.module('lang-selector', ['gettext'])
	.component('langSelector', {
		templateUrl: 'lang-selector/lang-selector.template.html',
		controller: function langSelectorController(gettextCatalog) {
			this.select = function langSelect(lang) {
				gettextCatalog.setCurrentLanguage(lang);
				gettextCatalog.loadRemote('po/' + lang + '.json');
			};
		}
	});

