angular
	.module('utils')
	.service('messenger', function messengerFactory() {
		this.show = function(options) {
			if (!this.component) {
				throw new Error('No message component found');
			}
			this.component.show(options);
		};

		this.hide = function() {
			if (!this.component) {
				throw new Error('No message component found');
			}
			this.component.hide();
		};

		this.setMessageComponent = function(component) {
			if (this.component) {
				throw new Error('There are more then one message component');
			}
			this.component = component;
		};
	});
