/**
 * @package Views
 * @author thomas appel <mail@thomas-appel.com>

 * Displays <a href="http://opensource.org/licenses/gpl-3.0.html">GNU Public License</a>
 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
 */

(function (define, Symphony, jQuery) {
	var O = 0,
	siteRoot = Symphony.Context.get('root');


	define([
		'jquery',
		'underscore',
		'backbone',
		'collections/col_select',
		'modules/mod_sysmessage',
		'modules/mod_helper',
		'templates/templates'
	], function ($, _, Backbone, Selection, SysMessage, helper, templates) {
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

		function _nodeDestroyed() {

		}
		function _selectFile(file) {
			this.collection[file.get('selected') ? 'add' : 'remove'](file);
		}

		function _setDraggable(node) {}

		function _setSort(node) {
			var id = parseInt(node[0].id.replace('item-', ''), 10),
			index = node.index();
			this.collection.get(id).set({'sorting': index}, {silent: true});
		}

		function _sort(event, target) {
			var index = target.index(), view = this;
			_setSort.call(this, target);
			target.siblings().each(function () {
				_setSort.call(view, $(this));
			});
			this.collection.sort({silent: true});
		}

		var SelectView = Backbone.View.extend({

			events: {
				'click .remove': 'removeFromList'
			},
			initialize: function () {
				this.collection = new Selection();

				this.dirtree = this.options.dirtree;
				this.fieldname = this.options.fieldname;
				this.dirtree.collection.on('selected', _.bind(_selectFile, this));
				this.collection
					.on('add', _.bind(this.addItem, this)).on('remove', _.bind(this.removeItem, this))
					.on('add remove reset', _.bind(this.toggleState, this));
				this.collection.on('selectionlimitexceed', _.bind(_selectError, this));
				this.template = this.options.mode === 'compact' ? templates.selected_compact: templates.selected_preview;
				this.label = this.$el.parent().find('.section-head');
				this.$el.addClass(this.options.mode);
				if (this.options.sortable) {
					this.$el.symphonyOrderable();
					if (this.options.mode === 'compact') {
						this.$el.parent().on('mousemove.orderable', '.ordering:has(.ordering)', _orderHorizontal);
					}
					this.$el.on('orderstop.orderable', _.bind(_sort, this));
				}
				this.prePopulate();
				console.log(this.comparator);
			},


			prePopulate: function () {
				var view = this,
				fields = this.$el.find('input.file-selected'),
				files = [],
				models = [];

				models = this.dirtree.collection.deferred.done(function () {
					fields.each(function () {
						var f = view.dirtree.collection.getByFileName(this.value);
						if (f && f.length) {
							f[0].set('selected', true);
						}
					});

					view.$el.empty();
					view.collection.each(_.bind(view.addItem, view));
					view.trigger('prepoulate', view.collection.pluck('id'));
					view.toggleState();
					view.collection.record();

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

			toggleState: function () {
				if (this.collection.models.length) {
					this.$el.addClass('populated');
					this.label.addClass('hidden');
				} else {
					this.$el.removeClass('populated');
					this.label.removeClass('hidden');
				}
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
						thumb: helper.getThumbURL(m),
						draggable: view.options.sortable
					});
					m.set({'sorting': $('#item-' + m.id).index()}, {silent: true});
					html += template(model);
				});
				this.el.innerHTML = html;

			},
			addItem: function (f) {
				var file = f.toJSON(),
				id,
				compiled;

				file.fieldname = this.fieldname;
				id = file.id;
				_.extend(file, {
					fieldname: this.fieldname,
					thumb: helper.getThumbURL(f),
					draggable: this.options.sortable
				});
				compiled = this.template(file);
				this.$el.append(compiled);
				f.set({'sorting': $('#item-' + f.id).index()}, {silent: true});
			},

			removeItem: function (file) {
				var id = file.id,
				item = $('#item-' + file.id);
				item.remove();
				return true;
			},

			removeFromList: function (e) {
				var id = parseInt(e.target.id.split('remove-')[1], 10),
				file = this.collection.get(id);
				if (file) {
					file.set('selected', false);
					//this.trigger('removedselected', id);
				}
			}
		});

		return SelectView;
	});
} (this.define, this.Symphony, this.jQuery.noConflict()));
