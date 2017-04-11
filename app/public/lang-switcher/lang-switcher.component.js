angular
	.module('langSwitcher', ['langSwitcherService'])
	.component('langSwitcher', {
		templateUrl: 'lang-switcher/lang-switcher.template.html',
		controller: function langSelectorController(
			langSwitcherService, availableLanguages, currentLanguage, $scope) {
			this.languages = availableLanguages;
			this.current = currentLanguage.value;

			$scope.$on('language:switched', function(event, language) {
				this.current = language;
			}.bind(this));

			this.switch = function langSwitch(lang) {
				langSwitcherService(lang);
			};
		}
	});

