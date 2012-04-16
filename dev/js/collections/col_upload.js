/**
 * @package filemanager
 * @author thomas appel <mail@thomas-appel.com>

 * Displays <a href="http://opensource.org/licenses/gpl-3.0.html">GNU Public License</a>
 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
 */

(function (define, Symphony) {
	// define Collection
	// ============================================================================================

	define(['jquery', 'underscore', 'backbone', 'collections/col_general', 'modules/mod_async_upload', 'modules/mod_byteconverter'], function ($, _, Backbone, General, Upload, convertBytes) {
		var UploadCollection, UploadListItem, UploadList;

		function _onError(dfr, state) {
			if (state === 'abort') {
				this.trigger('cancled', this);
			}

			if (state === 'error') {
				this.trigger('error', this, $.parseJSON(dfr.responseText));
			}
		}

		function _onComplete(dfr, state) {
			if (state === 'success') {
				//this.trigger('success', this.id, dfr);
				this.trigger('success', this, dfr);
			}
		}

		function _setStateHandles(upload) {
			upload
				.fail(_.bind(_onError, this))
				.done(_.bind(_onComplete, this));
			return upload;
		}
		function _selfDestruct(model) {
			if (model === this)  {
				this.trigger('destroyed', this);
			}
		}

		UploadListItem = Backbone.Model.extend({
			initialize: function () {
				this.collection.trigger('create', this);
				window._m = this;
				this.collection.on('remove', _.bind(_selfDestruct, this));
			},

			parse: function (data) {

			},

			url: function () {
				return this.collection.url + '?field_id=' + this.get('field_id');
			},

			defaults: {
				context: '',		// jQuery DOMObject
				file: [],
				originalFiles: [],
				form: '',			// string
				name: undefined,	// string
				size: 0,			// number
				type: undefined,	// string
				id: undefined,
				field_id: undefined
			},
			_createSendData: function () {
				return {
					file: this.get('file'),

				};
			},
			_filter: function (o, filter) {
				var f = filter.split(' '),
				b = {};

				_.each(o, function (a, k) {
					if (_.include(f, k)) {
						b[k] = a;
					}
				});
				return b;

			},
			send: function () {
				var upload = new Upload({url: this.url()});
				upload.on('progress', _.bind(this._onProgress, this));
				this._upload = _setStateHandles.call(this, upload.send(this._filter(this.toJSON(), 'file context form')));

			},


			_onProgress: function (l, t) {
				this.trigger('progress', Math.floor((l / t) * 100));
			},

			_onSuccess: function () {
			}
		});
		// UPLOAD FILES LIST
		// ==================================================================
		UploadList = (function () {

			var _waitQueue = {},
			_ulQueue = {};

			function _validateType(mime) {

				// var escaped = '(' + this.settings.allowed_types.join('|') + ')', filter;
				// escaped = escaped.replace(/\/\*/g, '/.*');
				// filter = new RegExp(escaped);

				if (!mime.match(this.settings.allowed_types)) {
					return false;
				}
				return true;
			}

			function _validateFileSize(size) {
				if (parseInt(this.settings.max_file_size, 10) < size) {
					return false;
				}
				return true;
			}

			function _parse(data) {
				var collection = this, list = [],
				files = _.toArray(data[0].files);
				// if files property doesn't exsits, browser doesn't support
				// File API, so we're faking it:
				if (!files.length) {
					files.push({
						name: data[0].value.replace(/^.*\\/, '')
					});
				}

				_.each(files, function (file, it, ofiles) {
					var d =  _.clone(collection.model.prototype.defaults);
					// if browser doesn't support file API, validate file site
					// and type on the server
					if (file.type && !_validateType.call(collection, file.type)) {
						files[it] = null;
						files.splice(it, 1);
						collection.trigger('invalidtype', file.name || file.fileName, file.type);
					} else if (file.size && !_validateFileSize.call(collection, file.size)) {
						files[it] = null;
						files.splice(it, 1);
						collection.trigger('filesizeexceeds', file.name || file.fileName, file.size);

					} else {
						d.form = data;
						d.file = file;
						d.originalFiles = ofiles;
						d.name = file.name || file.fileName;
						d.size = convertBytes(file.size || file.fileSize);
						d.type = file.type;
						d.id = _.uniqueId();
						list.push(d);
					}
				});
				return list;
			}

			function _flushWaitQueue(model) {
				var q = _waitQueue[this.cid],
				index = _.indexOf(q, model);

				if (index > -1) {
					q.splice(index, 1);
					this._uploads--;
					this.trigger('flush');
				}
			}

			function _flushUlQueu(model) {
				var q = _ulQueue[this.cid],
				index = _.indexOf(q, model);
				if (index > -1) {
					q.splice(index, 1);
					this.trigger('flush');
				}
			}

			function _pushUlQueue(model) {
				_ulQueue[this.cid].push(model);
				this.trigger('push');
			}

			function _pushWaitQueu(model) {
				_waitQueue[this.cid].push(model);
				this.trigger('push');
			}

			function _sanitizeFile(file) {
				// in older geko version, file.name and file.size are getters
				// only. so we cannot redeclare these properties
				if (!file.name && file.fileName) {
					file.name = file.fileName;
				}
				if (!file.size && file.fileSize) {
					file.size = file.fileSize;
				}
				return file;
			}

			function _onError(message) {
				alert(message);
			}

			return General.extend({

				events: {
					'error': '_onError'
				},

				initialize: function () {
					this.cid = this.cid || 'c' + _.uniqueId();
					_ulQueue[this.cid] = [];
					_waitQueue[this.cid] = [];

					this.on('add', _.bind(_pushWaitQueu, this));
					this.on('remove', _.bind(_flushWaitQueue, this));
				},

				url: Symphony.Context.get('root') + '/symphony/extension/filemanager/upload/',

				model: UploadListItem,

				addItem: function (data) {
					var model = _parse.call(this, data);
					this.add(model);
				},

				removeItem: function (id) {
					this.remove(id);
				},

				update: function (id, update) {
					var col = this, m;
					if (_.isArray(update)) {
						_.each(update, function (upd) {
							col.update(id, upd);
						});
					} else {
						m = this.get(id);
						m.set(update);
						//_flushWaitQueue.call(this, m);
					}

				},

				send: function (id) {
					var model = this.get(id), send;
					model
						.on('success', _.bind(this.update, this))
						.on('success error cancled', _.bind(_flushUlQueu, this));

					send = model.send();

					_pushUlQueue.call(this, model);
					_flushWaitQueue.call(this, model);

					return model._upload;
				},

				cancel: function (id) {
					var model = this.get(id);
					if (model._upload && !model._upload.isResolved()) {
						model._upload.abort();
						_pushWaitQueu.call(this, model);
						return true;
					}
					return false;
				},

				hasActiveUploads: function () {
					return !!_ulQueue[this.cid].length;
				},

				hasPendingUploads: function () {
					return !!_waitQueue[this.cid].length;
				}
			});
		}());

		UploadCollection = General.extend({

			constructors : {
				UploadList: UploadList
			},

			addList: function () {
				var list = new UploadList();
				_.each(this.settings, function (val, key) {
					list.addSetting(key, val, true);
				});
				return list;
			},

			initialize: function () {
				this.settings = _.extend({}, UploadCollection.defaults);
			}
		});

		UploadCollection.defaults = {
			field_id: null,
			allowed_types: ['image/jpeg']
		};

		return new UploadCollection();
	});

}(this.define, this.Symphony));
