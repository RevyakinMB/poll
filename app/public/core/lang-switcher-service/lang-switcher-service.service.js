angular
	.module('langSwitcherService')
	.value('availableLanguages', ['en', 'ru'])
	.factory('langSwitcherService', function langSwitcherFactory(
		availableLanguages,
		gettextCatalog, $rootScope,
		userPersistenceService,
		tmhDynamicLocale) {
		availableLanguages.forEach(function(lang) {
			gettextCatalog.loadRemote('po/' + lang + '.json');
		});
		return function(lang) {
			lang = lang || 'ru';
			if (availableLanguages.indexOf(lang) === -1) {
				console.error('Language switcher service: no such language: ' + lang);
				lang = 'ru';
			}
			userPersistenceService.setCookieData('language', lang, 365);

			$rootScope.$broadcast('language:switched', lang);
			gettextCatalog.setCurrentLanguage(lang);
			gettextCatalog.loadRemote('po/' + lang + '.json');
			switch (lang) {
			case 'en': {
				tmhDynamicLocale.set('en-gb');
				break;
			}
			default: {
				tmhDynamicLocale.set('ru-ru');
			}
			}
		};
	});
