/**
 * @package Collections
 * @author thomas appel <mail@thomas-appel.com>
 * @requires jquery underscore backbone collections/col_general

 * Displays <a href="http://opensource.org/licenses/gpl-3.0.html">GNU Public License</a>
 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
 */

(function (define, Symphony) {
	// body
	define(['jquery', 'underscore', 'backbone', 'collections/col_general'], function ($, _, Backbone, General) {
		var _schemes = {},
		File, Files, Directory, Directories;

		File = Backbone.Model.extend({
			initialize: function (attributes, options) {
				if (options.dir) {
					this.set({dir: options.dir}, {silent: true});
				}
				this.set({'id': _.uniqueId()}, {silent: true});
			}
		});

		Files = Backbone.Collection.extend({
			model: File,

			getByFileName: function (fnames) {
				fnames = _.isArray(fnames) ? fnames : fnames.split();
				return _.filter(this.models, function (file) {
					return _.indexOf(fnames, file.get('path')) >= 0;
				});
			}
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
				//this.collection.off('add', this._setSub);
				//delete this._setSub;
			}

			function _selfRemove(silent, collection, options) {
				options = options || {};
				collection = this.collection || collection;
				collection.remove(this, _.extend(options, {silent: silent}));
			}

			function _clearSubDirs(collection, dir, oldc, options) {
				var files;
				if (dir === this) {
					files = this.get('files');
					if (files) {
						files.remove(files.models);
					}
					if (this.get('subdirs')) {
						_.each(this.get('subdirs'), function (dir) {
							_selfRemove.call(dir, false, collection, options);
						});
					}
				}
			}

			function _getSubDirs(res) {
				var dir = this,
				subdirs = dir.get('subdirs');

				if (subdirs) {
					_.each(subdirs, function (d) {
						res.push(d);
						_getSubDirs.call(d, res);
					});
				}
			}

			return Backbone.Model.extend({
				defaults: {
					name: '',
					_parent: null,
					path: null,
					state: 'close'
				},

				initialize: function (data, options) {
					var that = this;
					//this._setParent = _.bind(_setParent, this);
					//this._setSub = _.bind(_setSub, this);
					this.collection.on('remove', _.bind(_clearSubDirs, this, this.collection));
						//.on('add reset', this._setParent)
						//.on('add reset', this._setSub)


					this.on('change:state', _.bind(_reportState, this));
					this.on('change:parent', _.bind(_setSub, this));
					this.set('state', this.collection.getSchemeStateByPath(this));
					//_setParent.call(this);
					//_setSub.call(this);
				},

				/**
				 * parse raw server response
				 * checks if the response has files and turns them into a collection
				 * @param {Object} response response Object from the server
				 * @return {Object} all subdir nested Models
				 */
				parse: function (response) {
					var files;
					if (response.files && _.isArray(response.files)) {
						files = new Files();
						files.add(response.files, {dir: this});
						response.files = files;
					}
					return response;
				},

				/**
				 * get all nested Subdirectories
				 * @param {Boolean} self include this directory in result array
				 * @return {Array} all subdir nested Models
				 */
				getSubDirs: function (self) {
					var res = self ? [this] : [];
					_getSubDirs.call(this, res);
					return res;
				},
				getByFileName: function (fnames) {
					if (this.get('files')) {
						return this.get('files').getByFileName(fnames);
					}
					return [];
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
			/*
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
		   */
			function _parse(dir, res, isroot) {
				var that = this, uuid, subdir;

				if (dir.directory) {
					return _parse.call(this, dir.directory, res);
				}

				uuid = dir.id ? dir.id : 'dir' + _.uniqueId();
				dir._parent = dir._parent;
				//dir.parent = dir.parent;
				dir.id = uuid;
				res.push(dir);

				if (dir.subdirs) {
					while (dir.subdirs.length) {
						subdir = dir.subdirs.shift();
						subdir.directory._parent = uuid;
						//subdir.directory.parent = dir;
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
				var res,
				removeDirs = dir.getSubDirs(true);

				resp.directory._parent = dir.get('_parent');
				resp.directory.id = dir.id;
				resp.directory.cid = dir.cid;

				// subdirs will automatically remove them self when an remove
				// event is triggered. We won't notify any one else than the
				// subdirs itself, so we remove them all together with option
				// silent

				this.remove(removeDirs, {silent: true});
				res = this.parse(resp);
				this.add(res, {parse: true});
				this.trigger('update', this.get(dir.id));
			}

			function _schemeExists(id) {
				return !!_schemes[id];
			}

			return General.extend({
				url: Symphony.Context.get('root') + '/symphony/extension/filemanager/listing/',

				model: Directory,

				// factories
				// ===========================================================================
				initialize: function () {
					this.cid = this.cid || 'c' + _.uniqueId();
					this.on('reset', function () {
					});
					this.on('add', function () {
					});
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

					var dirs = this, parsed =  _parse.call(this, response, []),
					out = _.map(parsed, function (dir) {
						dir = new Directory(dir, {collection: dirs, parse: true});
						return dir;
					});
					_.each(out, function (dir) {
						var parentId = dir.get('_parent'),
						parent = _.find(out, function (parent) {
							return parent.get('id') === parentId;
						});
						dir.set({parent: parent});
					});
					return out;
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
					var path = model.get('path');
					if (_schemes[this.cid][path]) {
						_schemes[this.cid][path].state = model.get('state') ? model.get('state') : 'close';
					}
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


				/**
				 * retrieve File Models be their pathname
				 * @param {Mixed} fnames string or array containing pathnames
				 * @return {Array} returns found file models
				 */
				getByFileName: function (fnames) {
					var files = this.getFiles(),
					result = [];

					if (!_.isArray(fnames)) {
						fnames = fnames.split(',');
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

				/**
				 * Update attributes of a directory
				 * @param {Backbone.Model instance} dir Directory which should
				 * be uodated
				 */
				updateDir: function (dir) {
					_update.call(this, {
						'select': dir.get('path')
					})
					 .done(_.bind(_prepareUpdateResponse, this, dir))
					 .fail();
				},

				/**
				 * Create a new directory on the server
				 * @param {String} name name for new directory
				 * @param {Backbone.Model instance} parent Directory in which
				 * the new one will be created
				 */
				createDir: function (name, parent) {
					parent = this.get(parent.id) || undefined;
					if (!parent) {
						return false;
					}
					var url = this.url.replace(/listing\/$/, 'edit/'),
					conf = {
						mkdir: name,
						within: parent.get('path'),
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

				/**
				 * Moves a file or directory model to a new location
				 * @param {Object} conf the configuration object containing
				 * a file and a type property
				 *
				 */
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
								//that.updateDir(source);
							} else {
								that.remove(source);
							}
							that.updateDir(destination);
						},

						error: function () {}
					});

				},

				/**
				 * Delete a directory or file from its collection
				 * @param {Backbone.Model instance} file the model to be
				 * removd
				 * @param {String} type accepts 'file' or 'dir'
				 */
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
