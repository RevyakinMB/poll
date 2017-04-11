angular
	.module('langSwitcherService')
	.value('availableLanguages', ['en', 'ru'])
	.value('currentLanguage', {
		value: 'ru'
	})
	.factory('langSwitcherService', function langSwitcherFactory(
		availableLanguages, currentLanguage, gettextCatalog, $rootScope) {
		return function(lang) {
			if (availableLanguages.indexOf(lang) === -1) {
				throw new Error('Language switcher service: no such language: ' + lang);
			}
			currentLanguage.value = lang;
			$rootScope.$broadcast('language:switched', lang);
			gettextCatalog.setCurrentLanguage(lang);
			gettextCatalog.loadRemote('po/' + lang + '.json');
		};
	});
