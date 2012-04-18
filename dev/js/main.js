/**
 * @package filemanager
 * @author thomas appel <mail@thomas-appel.com>
 * Displays <a href="http://opensource.org/licenses/gpl-3.0.html">GNU Public License</a>
 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
 */

(function (jOuery, Symphony, require) {

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
		'plugins/jquery-event-destroyed'
	], function (fm_settings, $, _, Backbone, UploadView, TreeView, SelectView, SysMessage, syncManager) {

		var listings_base, upload_base, CoreSettings;


		Backbone.noConflict();
		_.noConflict();

		Backbone.emulateHTTP = true;

		listings_base = Symphony.Context.get('root') + '/symphony/extension/filemanager/settings/';
		upload_base = Symphony.Context.get('root') + '/symphony/extension/filemanager/upload/';

		CoreSettings = Backbone.Model.extend({
			url: listings_base,
			initialize: function () {
				var that = this;
				this.deferred = this.fetch({
					data: {
						'field_id': $('#filemanager').find('input[name="fields[field_id]"]').val()
					}
				});
			}
		});

		function Config() {
			return this;
		}

		function C() {
			if (typeof this.initialize === 'function') {
				this.initialize.apply(this, arguments);
			}
		}
		C.prototype = _.extend({}, Backbone.Events);
		C.extend = Backbone.Model.extend;





		Config.prototype = {
			url: fm_settings.root + '/symphony/extension/filemanager/settings/',
			get: function (id) {
				return $.ajax({url: this.url, data: {'field_id': id}});
			}
		};

		_.each(fm_settings.instances,  function (set) {
			set.deferred = new Config().get(set.field_id);
		});

		function submitForm(form) {
			var formData = form.serialize();
			$.ajax({type: 'POST', url: form.attr('action'), data: formData});
		}

		// DOMREADY
		// ==================================================================
		$(function () {
			var form = $('form'),
			max_size = parseInt($('input[name=MAX_FILE_SIZE]').val(), 10);

			_.each(fm_settings.instances, function (manager, name) {
				console.log('__instance__ :', manager.instance);
				var wrapper = $('#' + name),
				container = $('#filemanager-container-' + manager.instance),
				selectContainer = $('#filemanager-files-select-container-' + manager.instance),

				dirTreeView,
				selectView,
				upload;

				wrapper.addClass('loading');

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
					//
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

					selectView = new SelectView({
						dirtree: dirTreeView,
						el: selectContainer.find('ul').get(0),
						fieldname: settings.element_name
					});

					if (settings.allow_dir_move) {
						dirTreeView.$el.addClass('draggable');
					}

					if (settings.limit_files) {
						selectView.collection.addSetting('limit', parseInt(settings.limit_files, 10));
					}

					if (settings.allow_dir_upload_files) {

						upload = new UploadView({
							el: '#filemanager-fileupload-' + manager.instance,
							field_id: settings.field_id
						});

						upload.collection.addSetting('allowed_types', new RegExp(settings.allowed_types), true);
						upload.collection.addSetting('max_file_size', settings.max_upload_size || max_size);
						upload.collection.addSetting('field_id', settings.field_id);
						upload.collection.url = upload_base;

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

					dirTreeView.on('update', function () {
						// wait until collection is fully pupulated
						// TODO; fix add deferred to handle this instead of
						// a timeout
						setTimeout(function () {
							var paths = selectView.collection.pluck('path'),
							files = dirTreeView.collection.getByFileName(paths),
							fids = _.pluck(files, 'id');
							dirTreeView.selectById(fids);

							//console.log(files);
							//console.log(fids);

							// also update file ids on selectview collection
							selectView.collection.each(function (file) {
								var f = dirTreeView.collection.getByFileName(file.get('path'));
								f = f[0];
								if (f) {
									file.set('id', f.id);
									file.id = f.id;
								}
							});
							selectView.render();
						}, 0);
					});
					selectView.on('prepoulate', _.bind(dirTreeView.selectById, dirTreeView));
					selectView.on('removedselected', _.bind(dirTreeView.unselectById, dirTreeView));
					selectView.collection.on('selectionlimitexceed', dirTreeView.unselectById);

					dirTreeView.collection.deferred.always(function () {
						wrapper.removeClass('loading');
						container.slideDown();
					});

					$(window).on('beforeunload', function () {

						if (selectView.collection.hasChanges()) {
							submitForm(form);
							form.submit();
							return Symphony.Language.get(SysMessage.unsaved_changes);
						}
					});

				});
			});

		});

	});

} (this.jQuery, this.Symphony, this.require));
