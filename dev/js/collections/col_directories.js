(function (define, Symphony) {
	// body
	define(['jquery', 'underscore', 'backbone', 'collections/col_general'], function ($, _, Backbone, General) {
		var _schemes = {},
		File, Files, Directory, Directories;

		File = Backbone.Model.extend({
			initialize: function () {
				this.set({
					'id': _.uniqueId()
				},
				{
					silent: true
				});
			}
		});

		Files = Backbone.Collection.extend({
			parse: function (rawData) {
				return rawData;
			},
			model: File
		});

		Directory = (function () {

			function _reportState() {
				this.collection.setSchemeState(this);
			}
			function _setNestingLevel(dir, parent) {
				dir.set('level', parent && parent.get('level') + 1 || 0);
			}

			function _setParent() {
				var parent;

				if (!!this.get('_parent')) {
					parent = this.collection.get(this.get('_parent'));
					this.set('parent', parent);
				}
				//_setNestingLevel(this, parent);

				this.collection.off('add reset', this._setParent);
				delete this._setParent;
			}
			function _setSub() {
				var parent = this.get('parent');
				if (!!parent) {
					//parent.get('subdirs').pop();
					parent.get('subdirs').push(this);
				}
				this.collection.off('add reset', this._setSub);
				delete this._setSub;
			}

			function _selfRemove(silent, collection) {
				collection = this.collection || collection;
				collection.remove(this, {silent: silent});
			}

			function _clearSubDirs(collection, dir) {
				var files;
				if (dir === this) {
					files = this.get('files');
					if (files) {
						files.remove(files.models);
					}
					if (this.get('subdirs')) {
						_.each(this.get('subdirs'), function (dir) {
							_selfRemove.call(dir, false, collection);
						});
					}
				}
			}

			return Backbone.Model.extend({
				defaults: {
					name: '',
					_parent: null,
					path: null,
					state: 'close'
				},
				initialize: function () {
					var that = this;
					this._setParent = _.bind(_setParent, this);
					this._setSub = _.bind(_setSub, this);
					this.collection.on('add reset', this._setParent);
					this.collection.on('add reset', this._setSub);
					this.collection.on('remove', _.bind(_clearSubDirs, this, this.collection));
					this.on('change:state', _.bind(_reportState, this));
					this.set('state', this.collection.getSchemeStateByPath(this));
				},
				parse: function (response) {
					if (response.files && _.isArray(response.files)) {
						response.files = new Files(response.files);
					}
					return response;
				}
			});
		} ());

		// DIRECTORY COLLECTION
		// ==================================================================
		Directories = (function () {
			function _createScheme() {
				var scheme;
				if (_schemes[this.cid]) {
					return;
				} else {
					scheme = _schemes[this.cid] = {};
				}
				_.each(this.models, function (model) {
					scheme[model.get('path')] = {
						state: 'close'
					};
				});

			}

			function _parse(dir, res, isroot) {
				var that = this, uuid, subdir;

				if (dir.directory) {
					return _parse.call(this, dir.directory, res);
				}

				uuid = dir.id ? dir.id : 'dir' + _.uniqueId();
				dir._parent = dir._parent;
				dir.id = uuid;
				res.push(dir);

				if (dir.subdirs) {
					while (dir.subdirs.length) {
						subdir = dir.subdirs.shift();
						subdir.directory._parent = uuid;
						_parse.call(this, subdir, res);
					}
				}

				return res;
			}

			function _update(data, options) {
				options = options || {};
				options.success = options.success || function () {};
				options.error = options.error || function () {};
				//options.parse = options.parse || this.parse;
				return $.ajax({
					type: 'GET',
					url: this.url,
					dataType: 'json',
					data: _.extend({
						field_id: this.settings.field_id
					}, data),
					success: options.success,
					error: options.error,
				});
			}

			function _prepareUpdateResponse(dir, resp) {
				var res;
				resp.directory._parent = dir.get('_parent');
				resp.directory.id = dir.id;
				//this.remove(dir.get('subdirs'));
				this.remove(dir, {silent: true});
				res = this.parse(resp);
				//console.log(res, 'parse');
				this.add(res, {parse: true});
			}

			function _schemeExists(id) {
				return !!_schemes[id];
			}

			return General.extend({
				url: Symphony.WEBSITE + '/symphony/extension/filemanager/listing/',

				model: Directory,

				// factories
				// ===========================================================================
				initialize: function () {
					this.cid = this.cid || 'c' + _.uniqueId();
					// Assign the Deferred issued by fetch() as a property
				},

				populate: function () {
					this.deferred = this.fetch({
						data: {
							'field_id': this.settings.field_id || 0
						}
					});
					this.deferred.done(_.bind(_createScheme, this));
				},

				parse: function (response) {
					return _parse.call(this, response, []);
				},

				// utilities:
				// ===========================================================================
				setScheme: function (scheme) {
					_schemes[this.cid] = scheme;
					return this;
				},

				changeScheme: function () {
					if (!_schemeExists(this.cid)) {
						_createScheme.call(this);
					}
				},

				setSchemeState: function (model, state) {
					_schemes[this.cid][model.get('path')].state = model.get('state') ? model.get('state') : 'close';
				},
				getSchemeStateByPath: function (model) {
					if (_schemeExists(this.cid) && _schemes[this.cid][model.get('path')]) {
						return _schemes[this.cid][model.get('path')].state;
					}
					return 'close';
				},

				// iterators:
				// ===========================================================================
				getFile: function (fileId, dirId) {
					var files = this.getFiles(dirId),
					file;

					if (!_.isArray(files)) {
						return files.get(fileId);
					} else {
						file = _.find(files, function (fs) {
							return fs.get(fileId);
						});
					}
					return file;
				},

				getFiles: function (id) {
					if (id) {
						return this.get(id).get('files');
					}
					return this.pluck('files');
				},

				getFileById: function (id) {
					id = parseInt(id, 10);
					var files = this.getFiles();

					var file = _.find(files, function (f) {
						return f.get(id);
					});
					return file.get(id);
				},

				getByFileName: function (fnames) {
					var files = this.getFiles(),
					result = [];

					if (!_.isArray(fnames)) {
						fnames = fnames.split(' ');
					}
					_.each(files, function (file) {
						if (file) {
							var model = _.filter(file.models, function (m) {
								return _.include(fnames, m.attributes.path);
							});
							model.length && result.push(model);
						}
					});
					return _.flatten(result);
				},

				updateDir: function (dir) {
					_update.call(this, {
						'select': dir.get('path')
					})
					 .done(_.bind(_prepareUpdateResponse, this, dir))
					 .fail();
				},

				createDir: function (name, parent) {
					parent = this.get(parent.id) || undefined;
					if (!parent) {
						return false;
					}
					var url = this.url.replace(/listing\/$/, 'edit/');
					var conf = {
						mkdir: name,
						in : parent.get('path'),
						type: 'create'
					};

					return $.ajax({
						url: url,
						type: 'post',
						data: conf,
						dataType: 'json',
						success: _.bind(this.updateDir, this, parent)
					});
				},

				moveItem: function (conf) {
					var that = this,
					source = this.get(conf.source),
					destination = this.get(conf.destination),
					item = conf.file ? this.getFile(conf.file, source.id) : source,
					data = {
						from: item.get('path'),
						to: destination.get('path'),
						type: 'move',
						dataType: conf.type
					},
					url = this.url.replace(/listing\/$/, 'edit/');
					return $.ajax({
						url: url,
						type: 'post',
						data: data,
						dataType: 'json',
						success: function () {
							if (conf.type === 'file') {
								item.collection.remove(item);
								that.updateDir(source);
							} else {
								that.remove(source);
							}
							that.updateDir(destination);
						},

						error: function () {}
					});

				},

				deleteItem: function (file, type) {
					var url = this.url.replace(/listing\/$/, 'edit/'),
					col = this;
					return $.ajax({
						url: url,
						type: 'post',
						data: {
							type: 'delete',
							file: file.get('path')
						},
						dataType: 'json',
						success: function () {
							if (type !== 'file') {
								col.remove(file);
							} else {
								file.collection.remove(file);
							}
							col.trigger('itemdelete', file.get('id'), type);
						},
						error: function () {}
					});
				},

			});
		} ());

		return Directories;

	});
} (this.define, this.Symphony));
