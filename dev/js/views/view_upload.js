/**
 * @package Views
 * @author thomas appel <mail@thomas-appel.com>

 * Displays <a href="http://opensource.org/licenses/gpl-3.0.html">GNU Public License</a>
 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
 */

(function (Symphony, define, window, undefined) {

	define(['jquery', 'underscore', 'backbone', 'collections/col_upload', 'modules/mod_animate_circle', 'modules/mod_sysmessage', 'templates/templates'], function ($, _, Backbone, upload, AnimatedCircle, SysMessage, templates) {

		var corf = Backbone.View.extend.call(function () {this.initialize.apply(this, arguments);}, Backbone.Events);
		corf.extend = Backbone.View.extend;

		var cbs = function () {
		};

		var StateManager = corf.extend({
			initialize: function () {
				this.observable = {};
				this.observable.children = [];
				this._callback = _.bind(cbs, this);
			},


			register: function (obj, array) {
				this.observable.parent = obj;
				this.observable.children = array;
			},

			listen: function (cond) {
				var stm = this;
				this.on('condition', function () {
					_.each(stm.observable._diff, function (item) {
						item.on(cond, stm._callback);
					});
				});
			},

			condition: function (cond) {
				var g = this;
				this.observable.parent.on(cond, function () {
					g.observable._diff = _.difference(g.observable.children, g.observable._diff);
					g.trigger('condition');
				});
			},
			setState: function () {

			}
		});

		// UPLOAD FILES LIST VIEW
		// ==================================================================
		var UploadListItemView = Backbone.View.extend({
			events: {
				'click .send': 'submit'
			},
			initialize: function () {
				//this.collection = new upload.constructors.UploadList();
				this.collection = upload.addList();
				this.collection.field_id = this.options.field_id;
				this.collection.on('create', _.bind(this.add, this));
				this._ulQueue = [];
			},

			add: function (model) {
				var m = model.toJSON(), item;
				m.destination = this.options.destination;
				item = $(templates.upload_list_item(m));
				model.set('context', item);
				model.set('field_id', 52);
				this.$el.append(item);
				item.data('circle', new AnimatedCircle({
					canvas: item.find('.progress')[0],
					lineWidth: 2,
					stepTime: 400
				}));
				this._ulQueue.push(item);
			},

			createItem: function (event, input) {
				this.collection.addItem(input);
			},

			_flushUlQueue: function (cb) {
				if (_.isFunction(cb)) {
					while (this._ulQueue.length) {
						cb.call(this._ulQueue.pop());
					}
				} else {
					this._ulQueue = [];
				}
			},

			_flushUlItem: function (item) {
				var index = _.indexOf(this._ulQueue, item);
				if (index >= 0) {
					this._ulQueue.splice(index, 1);
				}
			},

			submitAll: function () {
				this._flushUlQueue(function (i) {
					this.find('.send').trigger('click');
				});
			},

			submit: function (event) {
				event.preventDefault();
				var parent = $(event.target).parents().filter('tr'),
				id = parent[0].id.split('send-')[1],

				model = this.collection.get(id);
				model.on('progress', _.bind(this.progress, this, model.get('context').data('circle')));

				this.collection.send(id);
				this._flushUlItem(model.get('context'));
			},

			progress: function (circle, val) {
				circle.animate(val);
			}


		});

		var UploadListItem = (function () {

			function _setUpProgressIndicator(canvas) {
				return new AnimatedCircle({
					canvas: canvas,
					lineWidth: 6,
					stepTime: 250
				});
			}


			function _itemRender() {
				var compiled = templates.upload_list_item(this.model.toJSON());
				this.undelegateEvents();
				this.setElement(compiled);
			}

			function _itemSetState() {
				var states = '.' + _.toArray(arguments).join(', .');
				this.$el.find(states).toggleClass('disabled');
			}

			function _itemOnProgress(indicator, value) {

				indicator.progressIndicator.animate(value || 0);
				indicator.progressValue.html(value ? value + '&#160;%' : '');
			}

			function _onSuccess() {
				var data = this.$el.data();
				this.trigger('success', this.model, this._upld.resolve());
				// quick fix for FF
				//
				//data.progressIndicator.clearAnimation();
				//data.progressIndicator.drawFullCircle(data.progressIndicator.settings.endColor);
				data.progressIndicator.animate(99);
				setTimeout(function () {
					data.progressIndicator.animate(100);
				}, data.progressIndicator.settings.stepTime);
				data.progressValue.html('100&#160;%');
			}

			function _onError() {
				var data = this.$el.data();
				this.$el.addClass('error');
				data.progressIndicator.clearAnimation();
				//data.progressIndicator.settings.startColor = [255, 0, 0];
				//data.progressIndicator.settings.endColor = [255, 0, 0];
				data.progressIndicator.drawFullCircle([255, 0, 0]);
			}
			function _selfRemove(model) {
				this.trigger('remove', model);
				this.$el.remove();
			}

			return Backbone.View.extend({
				events: {
					'click.item .remove': 'remove',
					'click.item .start:not(.disabled)': 'submit',
					'click.item .cancel:not(.disabled)': 'cancel'
					//'click.item .cancel': 'cancel'
				},

				initialize: function () {
					var model = this.model;
					/*
					this.model.on('change', function () {
						console.log('__update__? ', model);
					});
				   */
					this.model.on('change:file', _.bind(this.update, this));
					this.model.on('success', _.bind(_onSuccess, this));
					this.model.on('error', _.bind(_onError, this));
					this.model.on('destroyed', _.bind(_selfRemove, this));
					this._upld = $.Deferred();
				},

				update: function (remove) {
					var fn = this.$el.find('.file-name');
					//anker = $('<a class="file-name" href="' + this.model.get('src') + '">' + this.model.get('name') + '</a>');
					//fn.after(anker).remove();
					this.$el.addClass('success');
					_itemSetState.call(this, 'cancel');
				},

				render: function () {
					this._parent = this.$el;
					_itemRender.call(this);
					this.$el.data('progress-indicator', _setUpProgressIndicator(this.$el.find('.progress')[0]));
					this.$el.data('progress-value', this.$el.find('.progress-text'));

					this.model.set('context', this._parent);
					this._parent.append(this.$el);

				},

				submit: function (e) {
					e.stopPropagation();
					e.preventDefault();
					this.$el.data('');
					this.model.on('progress', _.bind(_itemOnProgress, this, this.$el.data()));
					this.trigger('upload', this.model, this._upld.promise());
					_itemSetState.call(this, 'cancel', 'start');
				},

				cancel: function (e) {
					e.stopPropagation();
					e.preventDefault();
					this.trigger('cancel', this.model, this._upld.reject());
					_itemSetState.call(this, 'cancel', 'start');
					this.$el.removeClass('success error');
					_itemOnProgress.call(this, this.$el.data(), 0);
				},

				remove: function (e) {
					e.stopPropagation();
					e.preventDefault();
					this.cancel(e);
					this.model.collection.remove(this.model);
				},

			});
		}());

		var UploadListView = (function () {

			function _flushUlQueue(cb, final) {
				if (_.isFunction(cb)) {
					while (this._ulQueue.length) {
						cb.call(this._ulQueue.pop());
					}
				} else {
					this._ulQueue = [];
				}
				if (_.isFunction(final)) {
					final();
				}
			}

			function _flushUlItem(item) {
				var index = _.indexOf(this._ulQueue, item);
				if (index >= 0) {
					this._ulQueue.splice(index, 1);
					this.trigger('flushed');
				}
			}

			function _makeFakeForm(input) {
				var form = $('<form/>').append(input);
				form[0].reset();
				return input;
			}

			function _addToQueue(item) {
				this._ulQueue.push(item);
			}

			function _add(event) {
				// replace the original file input
				var input = $(event.target),
				clonedInput = input.clone();
				_makeFakeForm(clonedInput);

				input.after(clonedInput);
				input.detach();
				this.collection.addItem(input);
			}

			function _submit(model) {
				this.collection.send(model.id).fail(function (response) {
					new SysMessage(null, response);
				});
				this.trigger('start');
			}
			function _cancel(item, model) {
				if (this.collection.cancel(model.id)) {
					this._ulQueue.push(item);
					this.trigger('cancel');
				}
			}
			function _notifySuccess() {
				this.trigger('fileuploaded');
			}

			function _setCond(c) {
				var that = this, conds = c.split(' '),
				collection = this.collection,
				elems = (function () {
					var o = {};
					_.each(conds, function (key) {
						o[key] = that.$el.find('.' + key);
					});
					return o;

				}());



				collection.on('flush push', function () {
					if (!collection.models.length) {
						elems.remove.addClass('disabled');
					} else {
						elems.remove.removeClass('disabled');
					}

					if (collection.hasPendingUploads()) {
						elems.start.removeClass('disabled');
					} else {
						elems.start.addClass('disabled');
					}

					if (collection.hasActiveUploads()) {
						elems.cancel.removeClass('disabled');
					} else {
						elems.cancel.addClass('disabled');
					}

				});

			}

			function _invalidType() {
			}

			function _invalidSize() {
			}


			return Backbone.View.extend({
				events: {
				//	'click .add': 'addItem',
				//	'click .start': 'startAll',
					'click .cancel:not(.small):not(.disabled)': 'cancelAll',
					'click .remove:not(.small):not(.disabled)': 'removeAll',
					'click .start:not(.small):not(.disabled)': 'submitAll',
				//	'click .cancel': 'cacelAll',
					'click .close': 'close',
					'change input[type=file]': _add
				},
				initialize: function () {
					//this.collection = new upload.constructors.UploadList();
					this.collection = upload.addList();
					this.collection
						.on('create', _.bind(this.add, this))
						.on('invalidtype', _.bind(_invalidType, this))
						.on('filesizeexceeds', _.bind(_invalidSize, this));

					this._ulQueue = [];
				},

				render: function (dir) {
					var compiled = templates.upload_list(_.extend(dir.toJSON(), {destination: this.options.destination}));
					//this.uploadList = $(compiled);
					this._parent = this.$el;
					this.undelegateEvents();
					this.setElement(compiled, true);
					this._parent.append(this.el);
					this._listcontainer = $('#upload-container-' + dir.id);
					_setCond.call(this, 'remove start cancel');
				},

				add: function (model) {
					var item;
					model.set('field_id', this.options.field_id);
					item = new UploadListItem({
						model: model,
						el: this._listcontainer || '#upload-container-' + model.id
					});

					item.render();

					this._ulQueue.push(item);

					model
						.on('success', _.bind(_flushUlItem, this, item))
						.on('success', _.bind(_notifySuccess, this, item));

					item.on('cancel', _.bind(_cancel, this, item));
					item.on('upload', _.bind(_flushUlItem, this, item));
					item.on('upload', _.bind(_submit, this));

					this.trigger('add');
				},

				cancelAll: function () {
					this.$el.find('.file-list .cancel').trigger('click.item');
				},
				submitAll: function () {
					_flushUlQueue.call(this, function (i) {
						this.$el.find('.start').trigger('click.item');
					});
				},

				removeAll: function () {
					var view = this;
					this.collection.remove(this.collection.models);
					/*
					_flushUlQueue.call(this, null, function () {
						view.trigger('change');
					});
				   */
				},

				close: function (e) {
					e.stopPropagation();
					e.preventDefault();
					// remove all uploads first
					this.$el.remove();
					this.trigger('remove');
				},
			});
		}());



		// UPLOAD CONTROLL
		// ==================================================================
		var UploadView = Backbone.View.extend({
			events: {
				'click .start-all': 'start'
			},

			initialize: function () {
				this.files = [];
				this.collection = upload;
				this.uploadList = {};
				this._dirinstance = [];
			},

			toggleView: function () {
				this.$el.slideDown();
			},

			addUpload: function (dir) {
				var uploadList = new UploadListView({
					el: '#uploads-' + this.cid,
					className: 'row item upload-container',
					field_id: this.options.field_id,
					destination: dir.get('path')
				});
				var me = this;
				uploadList.render(dir);
				uploadList.on('remove', _.bind(this.collection.remove, this.collection, dir.id));
				uploadList.on('remove', function () {
					if (!me.collection.models.length) {
						me.$el.slideUp();
					}
				});
				uploadList.on('fileuploaded', _.bind(function () {
					me.trigger('fileuploaded', dir);
				}));

			},

			render: function () {
				if (this._rendered) {
					return true;
				}
				this.el.innerHTML = templates.upload({id: this.cid});
				this._rendered = true;
			},

			// fires when a change event occures, e.g. files are added to the
			// file input

			removeItem: function () {

			},

			start: function () {
				this.uploadList.submitAll();
			},

			createUpload: function (dir) {
				if (this.collection.get(dir.id)) {
					return false;
				}
				if (this._rendered === true) {
					this.collection.add(dir);
					this.addUpload(dir);
					this.trigger('uploadcreate', dir);
				} else {
					this.render();
					this.createUpload(dir);
					return;
				}
				this.toggleView();

			}
		});

		return UploadView;
	});
}(this.Symphony, this.define, this));
