(function (window, define, undefined) {

	var supports = {
		xhrFileUpload: !! (window.XMLHttpRequestUpload && window.FileReader),
		xhrFormDataFileUpload: !! window.FormData
	}, defaults = {
		cache: false,
		type: 'POST',
		//dataType: 'json',
		processData: false,
		contentType: false
	},
	//isXHRFileUpload = supports.xhrFileUpload || supports.xhrFormDataFileUpload;
	isXHRFileUpload = supports.xhrFormDataFileUpload;
	//branche modules
	define(['jquery', 'underscore', 'backbone', 'plugins/jquery-iframe-transport/jquery-iframe-transport'], function ($, _, Backbone) {

		var XhrUpload,

		_serializeArray = function (node) {
			var form = node.find('form'),
			hasForm = form.length;
			if (node.get(0).nodeName.toLowerCase() !== 'form' || ! hasForm) {
				// last resort: search for input fields
				node = node.find('input, textarea, select');
			} else if (hasForm) {
				node = form;
			}
			return node.serializeArray();
		},

		_getFormData = (function () {
			if (isXHRFileUpload) {
				return function (data) {

					var formData = new window.FormData();
					_.each(data, function (value, key, obj) {
						if (value instanceof window.Blob) {
							formData.append(key + '[]', value, key.name);
						} else if (value instanceof $) {
							_.each(_serializeArray(value), function (o) {
								formData.append(o.name, o.value);
							});
						}
					});
					return formData;
				};
			} else {
				return function (data) {
					var context = _serializeArray(data.context);
					context.push({name: 'iframe', value: true});
					return context;
				};
			}
		} ()),

		_onProgress = function (event) {
			var oEvent = event.originalEvent,
			total = oEvent.total || oEvent.totalSize,
			loaded = oEvent.loaded;
			this.trigger('progress', loaded, total);
		},

		_xhr = function () {
			var xhr = $.ajaxSettings.xhr();
			if (xhr.upload) {
				$(xhr.upload).on('progress', _.bind(_onProgress, this));
			}
			return xhr;
		},

		_validate = (function () {
			if (isXHRFileUpload) {
				return function (data) {
					if (!data.file || ! (data.file instanceof window.Blob)) {
						throw ('no file found');
					}
					// in older geko version, file.name and file.size are getters
					// only. so we cannot redeclare these properties
					if (!data.file.name && data.file.fileName) {
						data.file.name = data.file.fileName;
					}
					if (!data.file.size && data.file.fileSize) {
						data.file.size = data.file.fileSize;
					}
					return data;
				};
			} else {
				return function (data) {
					return data;
				};
			}
		} ()),

		_initXHROpts = function (data) {
			return _.extend({
				url: this.settings.url,
				data: _getFormData(_validate(data)),
				xhr: _.bind(_xhr, this)
			},
			XhrUpload.defaults);
		},

		_xhrOpts = (function () {
			if (isXHRFileUpload) {
				return _initXHROpts;
			} else {
				return function (data) {
					var files = data.form;
					data = _initXHROpts.call(this, data);
					data.files = files;
					data.iframe = true;

					data.dataType = 'iframe json';
					return data;
				};
			}
		} ());

		function Constructor() {
			this.initialize.apply(this, arguments);
		}

		Constructor.prototype.initialize = function () {};
		_.extend(Constructor.prototype, Backbone.Events);
		Constructor.extend = Backbone.Model.extend;

		XhrUpload = Constructor.extend({
			initialize: function (settings) {
				this.settings = _.extend(_.clone(XhrUpload.defaults), settings || {});
			},
			send: function (data) {
				data = _xhrOpts.call(this, data);
				var ajax =  $.ajax(data);
				/*
				ajax.complete(function () {
				});
			   */
				return ajax;
			}
			/*,
			cancel: function () {

			}
			*/
		});

		XhrUpload.defaults = (function () {
			if (isXHRFileUpload) {
				return defaults;
			} else {
				return _.extend(defaults, {
					files: '',
					form: '',
					processData: false,
				});
			}
		}());
		XhrUpload.isXHRFileUpload = isXHRFileUpload;
		return XhrUpload;
	});

} (this, this.define));

