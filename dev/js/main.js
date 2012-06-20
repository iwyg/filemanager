/**
 * @package filemanager
 * @author thomas appel <mail@thomas-appel.com>
 * Displays <a href="http://opensource.org/licenses/gpl-3.0.html">GNU Public License</a>
 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
 */

(function (jOuery, Symphony, require) {
	'use strict';
	var oldQ = jQuery;

	require([
		'settings',
		'jquery',
		'underscore',
		'backbone',
		'views/view_upload',
		'views/view_directories',
		'views/view_search',
		'views/view_select',
		'modules/mod_sysmessage',
		'modules/mod_syncmanager',
		'jqueryui',
		'plugins/jquery-event-destroyed',
		'orderable'
	], function (fm_settings, $, _, Backbone, UploadView, TreeView, SearchView, SelectView, SysMessage, syncManager) {

		console.log('Arguments: ', arguments);
		console.log('Backbone loaded: ', typeof Backbone === 'object');
		console.log('Backbone version: ', Backbone ? Backbone.VERSION : 'not available');

		var listings_base, upload_base, CoreSettings, changes = false,

		cantSelect = function () {
			return false;
		};


		$.noConflict();
		Backbone.noConflict();
		_.noConflict();
		window.jQuery = oldQ.noConflict();
		console.log('Backbone still avalive and loaded?: ', typeof Backbone === 'object');
		console.log('Backbone version: ', Backbone ? Backbone.VERSION : 'not available');

		if (typeof $.fn.symphonyOrderable !== 'function' && typeof oldQ.fn.symphonyOrderable === 'function') {
			$.fn.symphonyOrderable = oldQ.fn.symphonyOrderable;
		}

		Backbone.emulateHTTP = true;

		function Config() {}

		Config.prototype = {
			url: fm_settings.root + '/symphony/extension/filemanager/settings/',
			get: function (id) {
				return $.ajax({url: this.url, data: {'field_id': id}});
			}
		};

		// DOMREADY
		// ==================================================================
		$(function () {
			var form = $('form'),

			submitForm = function () {
				var formData = form.serialize();
				$.ajax({type: 'POST', url: form.attr('action'), data: formData});
			};


			_.each(fm_settings.instances, function (manager, name) {
				var wrapper = $('#' + name),
				container = $('#filemanager-container-' + manager.instance),
				selectContainer = $('#filemanager-files-select-container-' + manager.instance),
				dirTreeView,
				searchView,
				selectView,
				upload,
				limit;

				wrapper.addClass('loading');

				// setup sections when settings are available
				manager.deferred = new Config().get(manager.field_id);
				manager.deferred.done(function (settings) {
					var dirSettings = {},
					fileSettings = {};

					limit = parseInt(settings.limit_files, 10);

					_.each(settings, function (value, key) {
						if (key.match(/^allow_dir_/)) {
							dirSettings[key] = value;
						}
					});
					_.each(settings, function (value, key) {
						if (key.match(/^allow_file_/)) {
							fileSettings[key] = value;
						}
					});

					// initialize directory listing
					dirTreeView = new TreeView({
						el: '#filemanager-dir-listing-body-' + manager.instance,
						tagName: 'ul',
						className: 'root-dir dir',
						dirSettings: dirSettings,
						fileSettings: fileSettings,
						field_id: settings.field_id,
						baseName: settings.element_name //the field name we are postign to
					});

					if (limit === -1) {
						selectContainer.remove();
						dirTreeView.collection.canSelect = cantSelect;
					}

					syncManager.add(dirTreeView.collection);

					dirTreeView.collection.on(syncManager.events, syncManager._callback);

					// set searchin files:
					if (settings.allow_file_search) {
						searchView = new SearchView({
							threshold: 3,
							collection: dirTreeView.collection,
							id: 'search-' + dirTreeView.cid
						});
						dirTreeView.$el.parent().find('label').after(searchView.$el);
					}

					// set moving directories:
					if (settings.allow_dir_move) {
						dirTreeView.$el.addClass('draggable');
					}

					// initialize upload selction if available
					if (settings.allow_dir_upload_files) {

						upload = new UploadView({
							el: '#filemanager-fileupload-' + manager.instance,
							field_id: settings.field_id
						});

						upload.collection.addSetting('allowed_types', new RegExp(settings.allowed_types), true);
						upload.collection.addSetting('max_file_size', settings.max_upload_size);

						upload.collection.addSetting('field_id', settings.field_id);

						upload.on('uploadcreate', _.bind(dirTreeView.disableTask, dirTreeView, 'upload'));
						upload.on('uploaddestroy', _.bind(dirTreeView.enableTask, dirTreeView, 'upload'));
						upload.on('fileuploaded', _.bind(dirTreeView.collection.updateDir, dirTreeView.collection));

						// trigger an upload creation
						dirTreeView
							.on('upload', _.bind(upload.createUpload, upload))
							.on('toggle', function () {
							//dirs._setSchemeState, dirs)
						});
					}

					// set SelectView
					if (limit !== -1) {

						// initialize selected files view
						selectView = new SelectView({
							dirtree: dirTreeView,
							el: selectContainer.find('ul').get(0),
							fieldname: settings.element_name,
							mode: settings.display_mode,
							sortable: settings.allow_sort_selected
						});

						if (limit > 0) {
							selectView.collection.addSetting('limit', limit);
						}
						//	if (limit === -1) {
						//		selectView.collection.addSetting('limit', 0);
						//	}

						// setupt Events
						// sync selection when directory is updated
						dirTreeView.collection.on('update', function (dir) {
							var currentSelected = selectView.collection.pluck('path'),
							existing = dirTreeView.collection.getByFileName(currentSelected);

							selectView.collection.reset(existing);

							_.each(existing, function (f) {
								f.set('selected', true);
							});

							selectView.render();

						});

						selectView.collection.on('selectionlimitexceed', _.bind(dirTreeView.unselectById, dirTreeView));
					}


					dirTreeView.collection.deferred.always(function () {
						wrapper.removeClass('loading');
						container.slideDown();
					});

					$(window).on('beforeunload.getdiff', function () {
						if (SelectView && selectView.collection.getDiff()) {
							changes = true;
						}
					});

				});
				var bindunload = _.debounce(function () {
					$(window).on('beforeunload.filemanager', function () {
						if (changes) {
							submitForm();
							return Symphony.Language.get(SysMessage.unsaved_changes);
						}
					});
				}, 100);

				form.on('submit.filemanager', function () {
					$(window).off('beforeunload.filemanager');
				});

				bindunload();
			});
		});
	});

} (this.jQuery.noConflict(), this.Symphony, this.require));
