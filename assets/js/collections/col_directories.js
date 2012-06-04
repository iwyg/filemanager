/* vim: set noexpandtab tabstop=4 shiftwidth=4 softtabstop=4: */

/**
 * @package Collections
 * @author thomas appel <mail@thomas-appel.com>
 * @requires jquery underscore backbone collections/col_general

 * Displays <a href="http://opensource.org/licenses/gpl-3.0.html">GNU Public License</a>
 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
 */

(function (define, Symphony) {

	define([
		'jquery',
		'underscore',
		'backbone',
		'collections/col_general'
	], function ($, _, Backbone, General) {

		/**
		 * A Collection representing file structure models within a given basedirectory
		 *
		 * @exports collections/col_directories
		 * @version 1.0.4
		 */

		var _schemes = {},
		File, Files, Directory, Directories,

		EXP_CS_LIST = /,+\s+/g;

		/**
		 * @class File
		 * @constructor
		 * @augments Backbone.Model
		 */
		File = (function () {
			/**
			 * context this: instanceof Backbone.Model
			 */
			function _ensureContext() {

				if (!(this instanceof Backbone.Model)) {
					throw ('function called with wron context');
				}
			}
			function _notifyDirectory() {
				this.collection.settings.selectable && this.get('dir').trigger('selected', this);
			}
			function _selfDestruct(model) {
				if (model === this || model === this.get('dir')) {
					this.set('selected', false);
				}
			}
			return Backbone.Model.extend({
				initialize: function (attributes, options) {
					if (options.dir) {
						this.set({dir: options.dir}, {silent: true});
					}
					this.set({'id': _.uniqueId(), 'selected': false, 'sorting': 0}, {silent: true});
					this.on('change:selected', _.bind(_notifyDirectory, this));
					this.collection.on('remove', _.bind(_selfDestruct, this));

					if (options.dir) {
						this.get('dir').on('removed', _.bind(_selfDestruct, this));
					}
				},

				index: function () {
					return this.collection.indexOf(this);
				},

				set: function (key) {
					if (key === 'selected') {
						return this.collection.settings.selectable && Backbone.Model.prototype.set.apply(this, arguments);
					}
					else {
						return Backbone.Model.prototype.set.apply(this, arguments);
					}
				}
			});
		}());

		/**
		 * @class Files
		 * @constructor
		 * @augments Backbone.Collection
		 */
		Files = (function () {
			/**
			 * context this: instanceof Backbone.Collection
			 */
			return General.extend({

				model: File,
				getByFileName: function (fnames) {
					fnames = _.isArray(fnames) ? fnames : fnames.replace(EXP_CS_LIST, ',').split(',');
					return _.filter(this.models, function (file) {
						return _.indexOf(fnames, file.get('path')) >= 0;
					});
				},

				getFilesByIndexRange: function (start, end) {
					var a = start < end ? start : end,
					b = end > start ? end : start,
					res	= [];
					while (a <= b) {
						res.push(this.at(a++));
					}
					return res;
				}
			});
		}());
		/**
		 * @class Directory
		 * @constructor
		 * @augments Backbone.Model
		 */
		Directory = (function () {

			/**
			 * context this: instanceof Backbone.Model
			 */
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
				this.trigger('removed');
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
					this.set('state', this.collection.getSchemeStateByDir(this));

					if (this.get('files')) {
						this.get('files').addSetting('selectable', this.collection.canSelect());
					}
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

		/**
		 * @class Directories
		 * @constructor
		 * @augments Backbone.Collection
		 */
		Directories = (function () {
			/**
			 * context this: instanceof Backbone.Collection
			 */
			var _filesCache = {};

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

			function _buildfilesCache() {
				var filegrp = [];
				_.each(_.compact(this.pluck('files')), function (files) {
					filegrp.push(files.models);
				});
				_filesCache[this.cid] = _.flatten(filegrp);
			}

			/**
			 * takes nested directory models from the raw server response and
			 * parese them in an unnested array.
			 *
			 * Here, each directory gets a unique identifyer
			 * If a directory has subdirectories, each subdirectory will get
			 * a property called `_parent` with the value of its parent id
			 *
			 * @name Directories#_parse
			 *
			 * @param {Object} dir a directory object
			 * @param {Array} res the array to populate with directory objects
			 * @param {Boolean} isroot
			 * @return {Array}
			 *
			 * @private
			 * @api private
			 */
			function _parse(dir, res, isroot) {
				var that = this,
				uuid,
				subdir;

				if (dir.directory) {
					return _parse.call(that, dir.directory, res);
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
						_parse.call(that, subdir, res);
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

			function _prepareUpdateResponse(dir, options, resp) {
				var res,
				removeDirs = dir.getSubDirs(true);

				options = options || {};

				resp.directory._parent = dir.get('_parent');
				resp.directory.id = dir.id;
				resp.directory.cid = dir.cid;

				// subdirs will automatically remove themself if a remove
				// event is triggered. We won't notify anyone else than the
				// subdirs itself, so we remove them all together with option
				// silent

				this.remove(removeDirs, {silent: true});
				res = this.parse(resp);
				this.add(res, {parse: true});
				_buildfilesCache.call(this, '__UPDATE__');
				!options.silent && this.trigger('update', this.get(dir.id), 'update');
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
					//this.on('reset add update moved delete', _.throttle(_.bind(_buildfilesCache, this)), 0);
					this.on('reset add update remove moved delete', _.bind(_buildfilesCache, this));
					//this.on('reset', _.bind(_buildfilesCache, this));
					//this.on('update', _.bind(_buildfilesCache, this));
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
					this.trigger('preadd', out, 'preadd');
					return out;
				},

				// utilities:
				// ===========================================================================

				/**
				 * set a Scheme
				 * @param {Object} scheme the diretory state object
				 */
				setScheme: function (scheme) {
					_schemes[this.cid] = scheme;
					return this;
				},

				/**
				 * creates the Schme structure if none is available
				 */
				changeScheme: function () {
					if (!_schemeExists(this.cid)) {
						_createScheme.call(this);
					}
				},

				/**
				 * Set the State for a directory
				 *
				 * @param {Directory Instance} model the directory model
				 * @param {String} state the state (open or close)
				 * @return {String} the directory state
				 */
				setSchemeState: function (model, state) {
					var path = model.get('path');
					if (_schemes[this.cid][path]) {
						_schemes[this.cid][path].state = model.get('state') ? model.get('state') : 'close';
					}
				},

				/**
				 * Retrieve a Directory state by a Directory Model
				 *
				 * @param {Directory Instance} model
				 * @return {String} the directory state
				 */
				getSchemeStateByDir: function (model) {
					if (_schemeExists(this.cid) && _schemes[this.cid][model.get('path')]) {
						return _schemes[this.cid][model.get('path')].state;
					}
					return 'close';
				},

				// iterators:
				// ===========================================================================

				/**
				 * Retrieves all files from filescache
				 */
				getFiles: function () {
					var fc = _filesCache[this.cid];
					return fc.length ? fc : (_createScheme.call(this) && _filesCache[this.cid]);
				},

				/**
				 * Retrive a file from a certain directory
				 *
				 * @param {Number} fileId the files' identifier
				 * @param {Number} dirId the directories' identifier
				 *
				 * @return {Mixed} File instance or undefined
				 *
				 */
				getFileByDir: function (fileId, dirId) {
					var files = this.getFilesByDir(dirId),
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


				/**
				 * Retrive all files from a certain directory
				 *
				 * @param {Number} id file identifier
				 * @return {Mixed} File instance or false if none was found
				 */
				getFilesByDir: function (id) {
					if (id) {
						return this.get(id).get('files');
					}
					return false;
				},

				/**
				 * Retrive a file by its id
				 *
				 * @param {Number} id integer
				 * @return {File Instance}
				 */
				getFileById: function (id) {
					return _.find(_filesCache[this.cid], function (file) {
						return file.id === id;
					});
				},

				/**
				 * retrieve File Models be their pathnames
				 * takes an array of pathsnames or String as commy separated list
				 *
				 * @param {Mixed} fnames string or array
				 * @return {Array} found file models
				 */
				getByFileName: function (fnames) {
					var files = this.getFiles(),
					results = [];

					if (!_.isArray(fnames)) {
						fnames = fnames.replace(EXP_CS_LIST, ',').split(','); //allow comma separated lists
					}

					_.each(fnames, function (path) {
						var fs = _.find(files, function (file) {
							return file.get('path') === path;
						});
						fs && results.push(fs);
					});
					return results;
				},

				/**
				 * Update attributes of a directory
				 * @param {Backbone.Model instance} dir Directory which should
				 * be uodated
				 */
				updateDir: function (dir, options) {
					var d = _update.call(this, {
						'select': dir.get('path')
					})
					 .done(_.bind(_prepareUpdateResponse, this, dir, options))
					 .fail();
					return d;
				},

				/**
				 * Create a new directory on the server
				 *
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
				 *
				 * @param {Object} conf the configuration object containing a file and a type property
				 *
				 */
				moveItem: function (conf) {
					var that = this,
					source = this.get(conf.source),
					destination = this.get(conf.destination),
					item = conf.file ? this.getFileById(conf.file) : source,
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
								that.trigger('moved', source);
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
				 * Takes a string (filename or fragment of a fileattribute) and
				 * returns all matched file models (by given attribute or
				 * filename (default)
				 *
				 * @param {String} fragment the searchstring
				 * @param {String} attrib file model attribute to search for
				 * @param {Integer} min minmum searchstring length (defaults to 3)
				 *
				 * @return {Array} the result array
				 * @api public
				 *
				 */
				searchFiles: function (fragment, attrib, min) {
					var filegrp,
					res = [],
					i = 0, l,
					EXP = new RegExp(fragment, 'i');

					if (!fragment || fragment.length < (min || 3)) {
						return res;
					}

					attrib = attrib || 'file';
					filegrp = _filesCache[this.cid];

					l = filegrp.length;
					for (;i < l; i++) {
						if (!filegrp || !EXP.test(filegrp[i].get(attrib))) {
							continue;
						}
						res.push(filegrp[i]);
					}
					return res;
				},

				/**
				 * Delete a directory or file from its collection
				 *
				 * @param {Backbone.Model instance} file the model to be removed
				 * @param {String} type accepts 'file' or 'dir'
				 */
				deleteItem: function (file, type) {
					var url = this.url.replace(/listing\/$/, 'edit/'),
					col = this,
					directory,
					canDelete = $.Deferred();

					if (type !== 'file') {
						this.trigger('beforedirectorydelete', canDelete);
					} else {
						canDelete.resolve();
					}

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
							if (type === 'file') {
								col.trigger('filedelete', file);
							}
							col.trigger('itemdelete', file.get('id'), type); // this will eventually be removed in the future
							col.trigger('delete', type === 'file' ? file.get('dir') : file.get('parent'));
						},
						error: function () {}
					});
				},
				canSelect: function () {
					return true;
				}
			});
		} ());
		return Directories;
	});
} (this.define, this.Symphony));
