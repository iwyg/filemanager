/**
 * @package Views
 * @author thomas appel <mail@thomas-appel.com>

 * Displays <a href="http://opensource.org/licenses/gpl-3.0.html">GNU Public License</a>
 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
 */

(function (define, Symphony, jQuery) {
	var O = 0,
	siteRoot = Symphony.Context.get('root');


	define(['jquery', 'underscore', 'backbone', 'collections/col_select', 'modules/mod_sysmessage', 'templates/templates'], function ($, _, Backbone, Selection, SysMessage, templates) {
		// addapt order callback for horizontal ordering;
		function _orderHorizontal(event) {

			var object = $(this),
			item = object.find('.ordering'),
			top = item.offset().left,
			bottom = top + item.outerWidth(),
			position = event.pageX,
			prev,
			next;

			// Remove text ranges
			if (window.getSelection) {
				window.getSelection().removeAllRanges();
			}

			// Move item up
			if (position < top) {
				prev = item.prev('li');
				if (prev.length > 0) {
					item.insertBefore(prev);
					object.trigger('orderchange', [item]);
				}
			}

			// Move item down
			else if (position > bottom) {
				next = item.next('li');
				if (next.length > 0) {
					item.insertAfter(next);
					object.trigger('orderchange', [item]);
				}
			}
		}
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
		function _getThumbURL(model) {
			console.log(model.get('suffix'));
			var fileRoot = /(jpe?g|gif|tif?f|bmp|png)/.test(model.get('suffix').toLowerCase()) ? '/image/2/45/45/5' + model.get('src').substr((siteRoot + '/workspace').length) : '/extensions/filemanager/assets/images/file-preview.png';
			return siteRoot + fileRoot;
		}

		function _nodeDestroyed() {

		}

		function _setDraggable(node) {}

		var SelectView = Backbone.View.extend({

			events: {
				'click .remove': 'removeFromList'
			},
			initialize: function () {
				this.collection = new Selection();
				this.dirtree = this.options.dirtree;
				this.fieldname = this.options.fieldname;
				this.dirtree.on('select', _.bind(this.update, this));
				this.collection
					.on('add', _.bind(this.addItem, this)).on('remove', _.bind(this.removeItem, this));
				this.collection.on('selectionlimitexceed', _.bind(_selectError, this));
				this.template = this.options.mode === 'compact' ? templates.selected_compact: templates.selected_preview;
				this.label = this.$el.parent().find('label');

				if (this.options.mode === 'compact' && this.options.sortable) {
					this.$el.parent().on('mousemove.orderable', '.ordering:has(.ordering)', _orderHorizontal);
				}
				this.prePopulate();
			},

			prePopulate: function () {
				var view = this,
				fields = this.$el.find('.file-selected input[type=hidden]'),
				files = [],
				models = [];

				models = this.dirtree.collection.deferred.done(function () {
					fields.each(function () {
						//console.log(this.value);
						var f = view.dirtree.collection.getByFileName(this.value);
						//console.log(f, view.dirtree.collection);
						if (f && f.length) {
							view.collection.add(f, {
								silent: true
							});
						}
					});

					view.$el.empty();
					view.collection.each(_.bind(view.addItem, view));
					view.trigger('prepoulate', view.collection.pluck('id'));
					view.$el.symphonyOrderable();

				});
				/* this won't retain order
				models = this.dirtree.collection.deferred.done(function () {
					var collection = view.dirtree.collection.getByFileName(files);
					view.collection.add(collection, {
						silent: true
					});
					view.render();
					view.trigger('prepoulate', view.collection.pluck('id'));
				});
			   */
			},

			getFiles: function () {
				return this.collection.pluck('path');
			},

			render: function () {
				var view = this,
				html = '',
				template = this.template;

				this.collection.each(function (m) {
					var model = m.toJSON();
					_.extend(model, {
						fieldname: view.fieldname,
						thumb: _getThumbURL(m),
						draggable: view.options.sortable
					});
					html += template(model);
				});
				this.el.innerHTML = html;

			},
			addItem: function (f) {
				console.log(f, 'addITEM');
				var file = f.toJSON(),
				id,
				compiled;

				file.fieldname = this.fieldname;
				id = file.id;
				_.extend(file, {
					fieldname: this.fieldname,
					thumb: _getThumbURL(f),
					draggable: this.options.sortable
				});
				compiled = this.template(file);
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
} (this.define, this.Symphony, this.jQuery.noConflict()));
