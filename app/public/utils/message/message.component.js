angular
	.module('utils')
	.component('message', {
		templateUrl: 'utils/message/message.template.html',
		controller: function messageController(
			$element, $timeout,
			messenger,
			gettextCatalog
		) {
			messenger.setMessageComponent(this);
			this.hide = function() {
				$element.css('display', 'none');
			};
			this.hide();

			this.show = function(options) {
				var me = this;
				if (this.messageDelay) {
					$timeout.cancel(this.messageDelay);
				}
				if (!options) {
					this.hidden = true;
					$timeout(this.hide, 500);
					return;
				}
				$element.css('display', 'block');

				this.title = options.isError ?
					options.title || gettextCatalog.getString('Error') :
					options.title || gettextCatalog.getString('Done');
				this.text = options.message;
				this.hidden = false;
				this.error = options.isError;

				if (!options.isError) {
					this.messageDelay = $timeout(function() {
						me.hidden = true;
						$timeout(me.hide, 500);
					}, 3000);
				}
			};
		}
	});
