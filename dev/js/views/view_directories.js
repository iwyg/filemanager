(function (window, Symphony, define) {
	define(['jquery', 'underscore', 'backbone', 'collections/col_directories', 'templates/_templates', 'modules/mod_sysmessage', 'modules/mod_byteconverter'], function ($, _, Backbone, Dirs, templates, SysMessage, convertBytes) {

		var FileView, DirView, MetaView, TreeView, metaStates = {};

		/** ## MetaView
		 * @class MetaView
		 * @augments Backbone.View
		 * @constructor
		 */
		MetaView = (function () {
			/**
			 * @private
			 * @api private
			 */
			function _close(event) {
				event.preventDefault();
				event.stopPropagation();
				this.close();
			}

			/**
			 * @private
			 * @api private
			 */
			function _renderPreviewImage() {
				var siteRoot = Symphony.Context.get('root'),
				fileRoot = /image\/.*/.test(this.model.get('type')) ? '/image/1/0/150' + this.model.get('src').substr((siteRoot + '/workspace').length) : '/extensions/filemanager/assets/images/file-preview.png';
				return siteRoot + fileRoot;
			}

			/**
			 * @private
			 * @api private
			 */
			function _switchSelected(type) {
				if (type === 'add') {
					this.$el.addClass('file-selected');
				} else if (type === 'remove') {
					this.$el.removeClass('file-selected');
				}
			}

			return Backbone.View.extend({

				events: {
					'click.meta .close': _close
				},

				/**
				 * @name MetaView#initialize
				 */
				initialize: function () {
					var switchSelected;

					this._rendered = false;
					this.$el.on('destroyed', _.bind(this.remove, this));

					switchSelected = _.bind(_switchSelected, this);
					this.options.parentView
						.on('select', switchSelected)
						.on('unselect', switchSelected);
				},

				/**
				 * @name MetaView#render
				 */
				render: function () {
					var data, compiled;
					if (this._rendered) {
						return this;
					}

					data = _.extend(this.model.toJSON(), {
						preview: _renderPreviewImage.call(this),
						//lastmod: new Date(this.model.get('lastmod')),
						size: convertBytes(this.model.get('size')) + ' (' + this.model.get('size') + ')'
					});
					compiled = templates.meta(data);

					this.el.innerHTML = compiled;
					this._rendered = true;
					return this;

				},

				/**
				 * @name MetaView#open
				 */
				open: function (hard) {
					var metaView = this,
					fileNode = $('#file-' + this.options.parentView.model.id);

					if (!this._rendered) {
						this.render();
						this.open(hard);
						return this;
					}
					this.$el.insertAfter(fileNode);
					this.delegateEvents();
					!hard ? this.$el.slideDown() : this.$el.css({display: 'block'});
					this._open = true;
					this.trigger('open', this);
					console.log(fileNode[0].className, fileNode.hasClass('selected'));
					if (fileNode.hasClass('selected')) {
						_switchSelected.call(this, 'add');
					} else if (this.options.parentView.model.get('selected')) {
						_switchSelected.call(metaView, 'add');
				    }
					console.log(metaView.options.parentView.model);
					setTimeout(function () {
						console.log(metaView.options.parentView.model.get('selected'));
					}, 2000);
					return this;
				},

				/**
				 * @name MetaView#close
				 */
				close: function (destroy) {
					var that = this;
					this._open = false;
					this.$el.slideUp(function () {
						if (destroy) {
							that.$el.remove();
							return;
						}
						that.undelegateEvents();
					});
					!destroy && this.trigger('close', this);
				},

				/**
				 * @name MetaView#remove
				 */
				remove: function () {
					this.undelegateEvents();
					this.trigger('remove');
				}
			});
		} ());

		/**
		 * Used to create a new MetaView Instance form a FileView Instance Context.
		 * Must be called with a FileView Instance as context.
		 *
		 * Example: var metaView = MetaView.makeView.call(fileView);
		 *
		 * @name MetaView#makeView
		 * @static
		 */
		MetaView.makeView = function () {
			if (! (this instanceof Backbone.View)) {
				throw ('makeView called with wrong context');
			}
			return new MetaView({
				parentView: this,
				tagName: 'li',
				model: this.model,
				id: 'meta-for-' + this.model.id,
				className: 'meta-view',
				idPrefix: 'meta-for-'
			});
		};

		/** ## SINGLE FILE
		 * @augments Backbone.View
		 * @class FileView
		 * @constructor
		 */
		FileView = (function () {
			function _fileSelfRemove(model) {
				var meta, dirPath;
				if (model === this.model) {
					if (this._metaView) {
						meta = this._metaView;
						dirPath = model.get('dir').get('path');
						this._metaView.close(true);
					}
				}
			}

			return Backbone.View.extend({
				initialize: function () {
					this.model.collection.on('remove', _.bind(_fileSelfRemove, this));
					//this.model.get('dir').collection.on('update', _.bind(_metaViewPersistance, this));
				},
				render: function (settings) {
					settings = settings || {};
					var view = this,
					compiled = templates.files(_.extend(this.model.toJSON(), {
						settings: settings
					}));
					this.el.innerHTML += compiled;

					setTimeout(function () {
						view.$el.find('#preview-' + view.model.id).on('click.file', _.bind(view.showMetaInfo, view));
					},
					0);
				},

				setMetaView: function () {
					var file = this.model.get('path'),
					dirView = this.dirView,
					id;

					if (!this._metaView) {
						id = dirView.model.collection.cid;
						this._metaView = MetaView.makeView.call(this);
						this._metaView.on('open', function () {
							metaStates[id][file] = true;
						}).on('close', function () {
							delete metaStates[id][file];
						});
					}
				},

				showMetaInfo: function (event) {

					event.preventDefault();
					event.stopPropagation();

					this.setMetaView();
					this._metaView.open();
				}

			});
		} ());

// ==================================================================

		/** ## SINGLE DIRECTORY VIEW
		 * @class DirView
		 * @constructor
		 * @augments Backbone.View
		 */
		DirView = (function () {
			var _tasks = 'upload create move delete'.split(' ');

			function _enableTask(task, dir) {
				this._tasks[task] && this._tasks[task].removeClass('disabled');
			}

			function _disableTask(task, dir) {
				this._tasks[task] && this._tasks[task].addClass('disabled');
			}

			function _setTasks() {
				var a = {},
				tb = this.$el.find('.toolbar:first');
				_.each(_tasks, function (task) {
					var n = tb.find('.' + task);
					if (n.length) {
						a[task] = n;
					}
				});
				this._tasks = a;
			}

			return Backbone.View.extend({
				events: {
					//	'click.dirview  .dir-header:first': '_toggle'
				},

				initialize: function () {
					var dir = this;
					this.fileViews = [];
					this._files = {};
					this.on('enabletask', _.bind(_enableTask, this)).on('disabletask', _.bind(_disableTask, this));
				},

				render: function (dirSettings, fileSettings, update) {

					var that = this,
					settings = _.clone(dirSettings),
					parent,
					pm = this.model.get('parent'),
					files = this.model.get('files'),
					ul;

					this.$el.html(templates.dirs(_.extend(this.model.toJSON(), {
						settings: _.extend(settings, fileSettings)
					})));

					ul = this.$el.find('#sub-' + this.model.id);

					if (files) {
						files.on('remove', _.bind(that.model.collection.trigger, that.model.collection, 'remove'));
						files.each(function (file) {
							var fv = new FileView({
								el: ul,
								model: file
							});
							fv.dirView = that;
							that._files[file.get('path')] = fv;
							that.fileViews.push(fv);
							fv.render(fileSettings);
						});
					}

					parent = pm ? document.getElementById('sub-' + pm.id) : document.getElementById('dir-list-root');
					parent && ! update && this.$el.appendTo(parent);
					_setTasks.call(this);

					this.model.get('state') === 'open' && this.$el.addClass(this.model.get('state'));

					if (update) {
						this.trigger('update', this);
					}

				},

				getFileByPath: function (path) {
					return this._files[path];
				},
				getSubDirs: function () {
					var subs = this.model.get('subdirs');
				}
			});
		} ());

		/** ## DIRECTORY TREE VIEW
		 * @augments Backbone.View
		 * @constructor
		 * @class TreeView
		 */
		TreeView = (function () {
			/**
			 * Handles click event when file node gets selected
			 * an triggers a select event and an select or unselect event on
			 * the FileView instance
			 *
			 * @private
			 */
			function _select(e, type) {
				var target = $(e.target),
				fileNode = target.parent(),
				fileModel = this.getFile(fileNode),

				event = type === 'add' ? 'select' : 'unselect',
				selected = type === 'add' ? true : false;

				if (type === 'add') {
					fileNode.addClass('selected');
				} else if (type === 'remove') {
					fileNode.removeClass('selected', selected);
				}
				this.trigger('select', type, fileModel.toJSON());
				fileModel.set('selected', selected);
				// getting the fileView instance and trigger an select or
				// unselect event:
				this.getDirViewByModel(fileModel.get('dir')).getFileByPath(fileModel.get('path')).trigger(event, type);
			}

			/**
			 * @private
			 */
			function _removeItemNode(id, type) {
				if (!this instanceof Backbone.View) {
					throw ('function called with wrong context');
				}
				var node = type === 'file' ? $('#file-' + id) : $('#' + id),
				moveable = $([node, node.find('.dir-header')]).filter(function () {
					return this.data('draggable') || this.data('droppable');
				});

				if (this.dirViews[id]) {
					delete this.dirViews[id];
				}
				node.detach();
				setTimeout(function () {
					node.remove();
				},
				100);
				return this;
			}

			/**
			 * @private
			 */
			function _removeItem(model, cols, options) {
				var isDir = /dir/.test(model.id);
				if (!isDir) {
					this.trigger('select', 'remove', model.toJSON());
				}
				return _removeItemNode.call(this, model.id, isDir ? 'dir': 'file');
			}

			/**
			 * @private
			 */
			function _createDir(parentModel, mask) {
				var name = mask.find('input[type=text]').val();
				this.collection.createDir(name, parentModel).always(function () {
					mask.off('click', '.confirm');
					mask.remove();
				}).always(function (resp) {
					var msg = new SysMessage(null, resp);
				});

			}

			/**
			 * @private
			 */
			function _renderSubDirsOnUpdate(sub) {
				sub = sub instanceof Backbone.Model ? sub: this.collection.get(sub.directory.id);
				return this.renderPart(sub);
			}

			/**
			 * @private
			 */
			function _moveItemTo(event, ui) {
				event.preventDefault();
				event.stopPropagation();
				var movedItem = ui.draggable,
				type = /file-/.test(movedItem[0].className) ? 'file': 'dir',
				destination = $(event.target).parent()[0].id,
				// the directory the item gets moved to
				source = type === 'file' ? movedItem.parents().filter('li.dir')[0].id: movedItem.parent()[0].id,
				file = type === 'file' ? movedItem[0].id.substr(5) : undefined;

				this.collection.moveItem({
					type: type,
					destination: destination,
					source: source,
					file: file
				});
			}

			/**
			 * @private
			 * @deprecated
			 */
			function _itemDelegateMoveable(event) {
				event.preventDefault();
				event.stopPropagation();
				var target;
				if (!/draggable/.test(event.target.className)) {
					return;
				}

				target = $(event.target);
				target.draggable({
					revert: true,
					revertDuration: 120,
					cursor: 'move',
					axis: 'y',
					handle: '.move',
					opacity: 0.7,
					snap: true,
					zIndex: 2700,
					scope: 'moveable'
				});
				return this;
			}

			/**
			 * @private
			 * @deprecated
			 */
			function _itemDelegateDroppable(event) {
				event.preventDefault();
				event.stopPropagation();
				var target;
				if (!/droppable/.test(event.target.className)) {
					return;
				}

				target = $(event.target).add('.droppable');
				target.droppable({
					drop: _.bind(_moveItemTo, this),
					greedy: true,
					tolerance: 'intersect',
					hoverClass: 'dropover',
					scope: 'moveable'
				});
				return this;
			}

			/**
			 * @private
			 */
			function _destroyDraggable() {
				$(this).draggable('destroy');
			}
			/**
			 * @private
			 */
			function _destroyDroppable() {
				$(this).droppable('destroy');
			}
			/**
			 * @private
			 */
			function _itemSetDraggable() {
				var target = this.$el.find('.draggable:not(.ui-draggable)');
				target.draggable({
					revert: true,
					revertDuration: 120,
					cursor: 'move',
					axis: 'y',
					handle: '.move',
					opacity: 0.7,
					snap: true,
					zIndex: 2700,
					scope: 'moveable'
				});
				target.on('destroyed', _destroyDraggable);
				return this;
			}

			/**
			 * @private
			 */
			function _itemSetDroppable() {
				var dirtree = this,
				target = this.$el.find('.droppable:not(.ui-droppable)');

				target.droppable({
					drop: _.bind(_moveItemTo, this),
					greedy: true,
					tolerance: 'intersect',
					hoverClass: 'dropover',
					scope: 'moveable',
					over: function (event, ui) {
						var parent = $(this).parent();
						if (!parent.hasClass('open')) {
							$(this).on('dropout', function (event, ui) {
								dirtree.closeDir(parent);
							});
							dirtree.openDir(parent);
						}
					},

				});
				target.on('destroyed', _destroyDroppable);
				return this;
			}

			/**
			 * @private
			 * @deprecated
			 */
			function _ensureDelegates() {
				this.$el.find('.draggable:not(.ui-draggable)').trigger('mouseenter').end().find('.droppable:not(.ui-droppable)').trigger('mouseenter');
			}

			/**
			 * Runs each time a Directory gets updated
			 * Determines weather a MetaView Instance was opend or not before
			 * the update
			 *
			 * @private
			 * @api private
			 */
			function _handleMetaStates(model) {
				var fnames = _.keys(metaStates[this.collection.cid]),
				f,
				meta,
				files = [],

				dir = this.getDirViewByModel(model);

				if (!fnames.length) {
					return;
				}

				_.each(fnames, function (path) {
					f = dir.getFileByPath(path);
					if (f) {
						f.setMetaView();
						f._metaView.open(true);
					}
				});
			}

			return Backbone.View.extend({
				events: {
					//'click .dir-toggle':  'toggleDir',
					'click.dritree .toolbar': 'tasks',
					'click.dirtree .dir-header': 'toggleDir',
					'click.dirtree .file:not(.selected) > .text': 'select',
					'click.dirtree .file.selected > .text': 'unselect',
					'click.dirtree .file > .toolbar > .delete': 'deleteFile',
					'click.dirtree .dir-header > .toolbar > .delete': 'deleteDir',
					'click.dirtree .dir-header > .toolbar > .create': 'createDir',
					//'mouseenter.dirtree .draggable:not(.ui-draggable)': _itemDelegateMoveable,
					//'mouseover.dirtree .droppable:not(.ui-droppable)': _itemDelegateDroppable
				},

				initialize: function () {
					this.collection = new Dirs();
					this.dirViews = {};
					this.collection.addSetting('field_id', this.options.field_id);
					this.collection.populate();
					this.collection.deferred.done(_.bind(this.render, this));
					//this.collection.on('itemdelete', _.bind(_removeItemNode, this));
					this.collection.on('add', _.bind(this.renderPart, this));
					this.collection.on('remove', _.bind(_removeItem, this));
					this.collection.on('update', _.bind(_handleMetaStates, this));
					metaStates[this.collection.cid] = {};
					//this.on('update', _.bind(_ensureDelegates, this));
				},

				tasks: function (e) {
					var parentId = $(e.target).parents().filter('li').find('ul')[0].id.substr(4),
					task = e.target.className.split(' ')[1];
					this.trigger(task, this.collection.get(parentId));
					return false;
				},

				select: function (e) {
					_select.call(this, e, 'add');
				},

				unselect: function (e) {
					_select.call(this, e, 'remove');
				},

				selectById: function (id) {
					this.filesById(id).addClass('selected');
					return this;
				},

				unselectById: function (id) {
					this.filesById(id).removeClass('selected');
					return this;
				},

				filesById: function (ids) {
					return this.$el.find(_.isArray(ids) ? ('#file-' + ids.join(', #file-')) : '#file-' + ids);
				},

				getFile: function (node) {
					var id = node.parent()[0].id.substr(4);
					return this.collection.getFile(node[0].id.split('file-')[1], id);
				},
				confirm: function (message) {
					return confirm(message);
				},

				deleteDir: function (event) {
					var dir = this.collection.get($(event.target).parents().filter('.dir')[0].id);
					var message = Symphony.Language.get(SysMessage.confirm_directory_deletion, {
						'dir': dir.get('name'),
						'dir2': dir.get('name'),
						'dircount': dir.get('subdirs') ? dir.get('subdirs').length: 0,
						'filecount': dir.get('files') ? dir.get('files').models.length: 0
					});

					if (this.confirm(message)) {
						this.collection.deleteItem(dir, 'dir');
					}
				},

				deleteFile: function (event) {
					var t = $(event.target),
					fileNode = t.parents().filter('.file'),
					parentNode = fileNode.parent(),
					file = this.getFile(fileNode);

					var message = Symphony.Language.get(SysMessage.confirm_file_deletion, {
						'file': 'test'
					});

					if (this.confirm(message)) {
						this.collection.deleteItem(file, 'file');
						//_select.call(this, {target: t.parent()[0]}, 'remove');
					}
				},

				createDir: function (event) {
					var target = $(event.target),
					dir = this.collection.get(target.parents().filter('.dir')[0].id),
					compiled = $(templates.newdir({
						parent: dir.get('path'),
						level: ~~dir.get('level') + 1
					}));
					$('#sub-' + dir.id).prepend(compiled);
					this.openDir(target.parents().filter('.dir'));
					compiled.on('click', '.add', _.bind(_createDir, this, dir, compiled));
					compiled.on('click', '.cancel', function () {
						compiled.remove();
					});
				},

				toggleDir: function (event) {
					var target, subdir, toggle, trigger, toggle;
					event.preventDefault();
					event.stopPropagation();

					target = $(event.target).parents().filter('.dir:not(#dir-list-root)').first();
					subdir = target.find('> .sub-dir');
					trigger = target.hasClass('open') ? 'close': 'open';
					toggle = trigger === 'open' ? 'openDir': 'closeDir';

					this[toggle](target);
					//this.trigger('toggle', trigger);
				},

				openDir: function (node) {
					node.find('> .sub-dir').slideDown();
					node.addClass('open');
					this.collection.get(node[0].id).set('state', 'open');
				},

				closeDir: function (node) {
					node.find('> .sub-dir').slideUp();
					node.removeClass('open');
					this.collection.get(node[0].id).set('state', 'close');
				},

				enableTask: function (task, dir) {
					this.dirViews[dir.id].trigger('enabletask', task);
				},

				disableTask: function (task, dir) {
					this.dirViews[dir.id].trigger('disabletask', task);
				},

				/**
				 * Renders a directory branch
				 * @param {Object: Backbone.Model Instance} model the directory model
				 */
				renderPart: function (model) {
					var dir, update = this.dirViews[model.id] ? true: false;

					if (!update) {
						dir = new DirView({
							tagName: 'li',
							id: model.id,
							className: 'dir level-' + model.get('level'),
							model: model
						});
						this.dirViews[model.id] = dir;
					} else {
						dir = this.dirViews[model.id];
						dir.model = model;
					}
					dir.render(this.options.dirSettings, this.options.fileSettings, update);
					if (update && _.isArray(model.get('subdirs'))) {
						_.each(model.get('subdirs'), _.bind(_renderSubDirsOnUpdate, this));
					}
					update && this.trigger('update', dir);

					_itemSetDraggable.call(this);
					_itemSetDroppable.call(this);
				},

				/**
				 * starts the initial render process.
				 * This is nomaly done once
				 */
				render: function () {
					var view = this;
					this.el.innerHTML = templates.dirtree({
						name: this.options.baseName
					});
					this.collection.each(_.bind(this.renderPart, this));
				},
				/**
				 * Fetches all DirView instances
				 * from a given DirView instance
				 *
				 * @param {DirView Instance} dir
				 * @param {Boolean} deep pass true to get all nested subdirs
				 * @return {Array} all DirView instances that are subdirs of the given DirView
				 * @api public
				 */
				getSubdirsFromView: function (dir, deep) {
					var tree = this,
					subdirs = dir.model.get('subdirs'),
					res = [];

					if (subdirs) {
						_.each(subdirs, function (d) {
							if (tree.dirViews[d.id]) {
								res.push(tree.dirViews[d.id]);
								if (deep && d.get('subdirs')) {
									res.push.apply(res, tree.getSubdirsFromView(tree.dirViews[d.id], true));
								}
							}
						});
					}
					return res;
				},
				/**
				 * get a DirView Instance form
				 * by passing in a directory model
				 *
				 * @name TreeView#getDirViewByModel
				 * @param {Object:Directory Instance} dir a given directory model
				 * @return {Mixed} DirView Instance or undefined
				 * @api public
				 */
				getDirViewByModel: function (dir) {
					return this.dirViews[dir.id];
				},

				/**
				 * get a DirView Instance form
				 * by passing in a directory id
				 *
				 * @name TreeView#getDirViewById
				 * @param {String} id directory id
				 * @return {Mixed} DirView Instance or undefined
				 * @api public
				 */
				getDirViewById: function (id) {
					return this.dirViews[id];
				}
			});
		} ());

		return TreeView;
	});
} (this, this.Symphony, this.define));
