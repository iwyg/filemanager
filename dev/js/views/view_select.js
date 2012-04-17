/**
 * @package Views
 * @author thomas appel <mail@thomas-appel.com>

 * Displays <a href="http://opensource.org/licenses/gpl-3.0.html">GNU Public License</a>
 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
 */

(function (define) {
	var O = 0;
	define(['jquery', 'underscore', 'backbone', 'collections/col_select', 'modules/mod_sysmessage', 'templates/templates'], function ($, _, Backbone, Selection, SysMessage, templates) {
		function _selectError() {
			var response = {
				error: {
					message: SysMessage.file_select_limit_exceed,
					context: {
						count: this.collection.settings.limit
					}
				}
			};

			return new SysMessage('error', response, false);

		}

		var SelectView = Backbone.View.extend({

			events: {
				'click .remove': 'removeFromList'
			},
			initialize: function () {
				this.collection = new Selection();
				this.dirtree = this.options.dirtree;
				this.fieldname = this.options.fieldname;
				this.dirtree.on('select', _.bind(this.update, this));
				this.collection.on('add', _.bind(this.addItem, this)).on('remove', _.bind(this.removeItem, this));
				this.collection.on('selectionlimitexceed', _.bind(_selectError, this));
				this.prePopulate();
			},

			prePopulate: function () {
				var view = this,
				fields = this.$el.find('.file-selected input[type=hidden]'),
				files = [],
				models = [];

				fields.each(function () {
					files.push(this.value);
				});

				models = this.dirtree.collection.deferred.done(function () {
					var collection = view.dirtree.collection.getByFileName(files);
					view.collection.add(collection, {
						silent: true
					});
					view.render();
					view.trigger('prepoulate', view.collection.pluck('id'));
				});
			},

			getFiles: function () {
				return this.collection.pluck('path');
			},

			render: function () {
				var view = this,
				html = '',
				template = templates.selected;

				this.collection.each(function (model) {
					model = model.toJSON();
					_.extend(model, {
						fieldname: view.fieldname
					});
					html += template(model);
				});
				this.el.innerHTML = html;

			},
			addItem: function (file) {
				file = file.toJSON();
				file.fieldname = this.fieldname;
				var id = file.id,
				compiled = templates.selected(file);
				this.$el.append(compiled);
			},
			removeFromList: function (e) {
				var id = parseInt(e.target.id.split('remove-')[1], 10);
				if (this.removeItem(this.collection.get(id))) {
					this.trigger('removedselected', id);
				}
			},
			removeItem: function (file) {
				var id = file.id,
				item = $('#item-' + file.id);
				if (this.collection.remove(id)) {
					item.remove();
					return true;
				}
				return false;
			},

			update: function (type, file) {

				switch (type) {
				case 'add':
					this.collection.add(file);
					break;
				case 'remove':
					this.collection.remove(file);
					break;
				}
			}
		});

		return SelectView;
	});
} (this.define));

