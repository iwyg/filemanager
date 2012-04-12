define(['jquery', 'backbone', 'underscore', 'templates/templates'], function ($, Backbone, _, template) {

		var Collection = Backbone.Model.extend({
			// Using the response from https://gist.github.com/1431041
			url: Symphony.WEBSITE + '/symphony/extension/filemanager/listing/',
			initialize: function () {
				// Assign the Deferred issued by fetch() as a property
				this.deferred = this.fetch({data: {'field_id': $('#filemanager').find('input[name="fields[field_id]"]').val()}});
			}
		});

		var View = Backbone.View.extend({
			initialize: function () {
				_.bindAll(this);
			},
			events: {
				'click .dir-toggle':  'toggleDir'
			},
			toggleDir: function (event) {
				event.preventDefault();
				event.stopPropagation();
				var target = $(event.target).parents().filter('.dir:not(#dir-list-root)').first(),
					subdir = target.find('> .sub-dir'),
					toggle = target.find('.dir-toggle');

				console.log(target);
				console.log(subdir);
					// toggle
				subdir.slideToggle();
				target.toggleClass('open');
			},
			render: function () {
				var that = this;
				// this.collection is passed in on instantiation
				this.collection.deferred.done(this.renderDir);
				this.collection.deferred.error(this.renderErr);
			},
			renderDir: function (data) {
				var that = this,
				tpl = this.renderTemplate(data, true);
				this.$el.html(tpl);
				console.log('TEST:', this.collection.get('subdirs'));
			},
			renderErr: function (data) {
				console.log('error: ', data);
			},
			renderTemplate: function (data, root) {
				var that = this, n,
				d = {},
				tpl = '<ul class="dir' + (root ? '" id="dir-list-root"' : ' sub-dir"') + '>';
				for (n in data) {
					if (n === 'subdirs') {
						for (var i = 0, l = data[n].length; i < l; i++) {
							tpl += _.template(template.dirs, $.extend(d, data[n][i], {contents: this.renderTemplate(data[n][i].directory)}));
						}

					}
					if (n === 'files') {
						for (var ii = 0, ll = data[n].length; ii < ll; ii++) {
							tpl += _.template(template.files, data[n][ii]);
						}

					}
				}
				tpl += '</ul>';
				delete d;
				return tpl;
			}
		});

		return {
			Collection: Collection,
			View: View
		};

});
