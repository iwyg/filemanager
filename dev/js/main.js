/**
 * @package filemanager
 * @author thomas appel <mail@thomas-appel.com>
 * Displays <a href="http://opensource.org/licenses/gpl-3.0.html">GNU Public License</a>
 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
 */

(function (jOuery, Symphony, require) {

	var oldQ = jQuery;

	require([
		'fm_settings',
		'jquery',
		'underscore',
		'backbone',
		'views/view_upload',
		'views/view_directories',
		'views/view_select',
		'modules/mod_sysmessage',
		'modules/mod_syncmanager',
		'jqueryui',
		'plugins/jquery-event-destroyed',
		'orderable'
	], function (fm_settings, $, _, Backbone, UploadView, TreeView, SelectView, SysMessage, syncManager) {

		var listings_base, upload_base, CoreSettings, changes = false;


		$.noConflict();
		Backbone.noConflict();
		_.noConflict();
		window.jQuery = oldQ.noConflict();

		Backbone.emulateHTTP = true;
		/*
		function C() {
			if (typeof this.initialize === 'function') {
				this.initialize.apply(this, arguments);
			}
		}
		C.prototype = _.extend({}, Backbone.Events);
		C.extend = Backbone.Model.extend;
		*/
		function Config() {
			return this;
		}

		Config.prototype = {
			url: fm_settings.root + '/symphony/extension/filemanager/settings/',
			get: function (id) {
				return $.ajax({url: this.url, data: {'field_id': id}});
			}
		};

		_.each(fm_settings.instances,  function (set) {
			set.deferred = new Config().get(set.field_id);
		});


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
				selectView,
				upload;

				wrapper.addClass('loading');

				// setup sections when settings are available
				manager.deferred.done(function (settings) {
					var dirSettings = {},
					fileSettings = {};

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

					syncManager.add(dirTreeView.collection);

					dirTreeView.collection.on(syncManager.events, syncManager._callback);

					// initialize selected files view
					selectView = new SelectView({
						dirtree: dirTreeView,
						el: selectContainer.find('ul').get(0),
						fieldname: settings.element_name,
						mode: settings.display_mode,
						sortable: settings.allow_sort_selected
					});

					if (settings.allow_dir_move) {
						dirTreeView.$el.addClass('draggable');
					}

					if (settings.limit_files) {
						selectView.collection.addSetting('limit', parseInt(settings.limit_files, 10));
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


					// unselect file if a file is deleted:
					// dirTreeView.collection.on('itemdelete', function () {
					//	console.log('item deleted', arguments);
					// });
					//selectView.on('prepoulate', _.bind(dirTreeView.selectById, dirTreeView));
					//selectView.on('removedselected', _.bind(dirTreeView.unselectById, dirTreeView));
					selectView.collection.on('selectionlimitexceed', dirTreeView.unselectById);

					dirTreeView.collection.deferred.always(function () {
						wrapper.removeClass('loading');
						container.slideDown();
					});

					$(window).on('beforeunload.getdiff', function () {
						if (selectView.collection.getDiff()) {
							changes = true;
						}
					});

					/*
					$(window).on('beforeunload.filemanager', function () {

						if (selectView.collection.hasChanges()) {
							submitForm();
							form.submit();
							return Symphony.Language.get(SysMessage.unsaved_changes);
						}
					});
					form.on('submit', function () {
						$(window).off('before.filemanager');
					});
				   */

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
