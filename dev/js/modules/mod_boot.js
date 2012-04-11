(function (define, Symphony) {
	define(['jquery', 'backbone', 'underscore'], function ($, Backbone, _) {

		var listings_base = Symphony.WEBSITE + '/symphony/extension/filemanager/settings/',

		CoreSettings = Backbone.Model.extend({
			url: listings_base,
			initialize: function () {
				this.deferred = this.fetch({data: {'field_id': $('#filemanager').find('input[name="fields[field_id]"]').val()}});
			}
		}),

		CoreView = Backbone.View.extend({
			render: function () {
				this.collection.deferred.done($.proxy(this.setup, this));
			},
			setup: function (conf) {
				console.log(conf);

			}
		});

		return {
			Collection: CoreSettings,
			View: CoreView
		};
	});
}(this.define, this.Symphony));

