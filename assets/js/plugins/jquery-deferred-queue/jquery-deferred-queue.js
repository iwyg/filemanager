// Original License see https://bitbucket.org/masklinn/jquery.deferred-queue/
//
(function (window, define, factory) {
	"use strict";
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	} else {
		factory(window.jQuery);
	}
} (this, this.define, function ($, undefined) {
	"use strict";
	$.extend($.Deferred, {
		queue: function () {
			var queueDeferred = $.Deferred(),
			promises = 0, promise;

			function resolve() {
				if (--promises > 0) {
					return;
				}
				window.setTimeout($.proxy(queueDeferred, 'resolve'), 0);
			}

			promise = $.extend(queueDeferred.promise(), {
				push: function () {
					if (this.isResolved() || this.isRejected()) {
						throw new Error('Can not add promises to a resolved ' + 'or rejected promise queue');
					}

					promises += 1;
					$.when.apply(null, arguments).then(
					resolve, $.proxy(queueDeferred, 'reject'));
					return this;
				}
			});
			if (arguments.length) {
				promise.push.apply(promise, arguments);
			}
			return promise;
		}
	});
}));

