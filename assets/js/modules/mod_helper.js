(function (define, Symphony) {
	define(['jquery', 'underscore'], function ($, _) {
		var EXP_ISIMAGE = /(jpe?g|gif|tif?f|bmp|png)/,
		URL_WORKSPACE = '/workspace',
		PREVIEW_IMG = '/extensions/filemanager/assets/images/file-preview.png',
		SITE_ROOT = Symphony.Context.get('root'),
		default_thumb_size = '/image/2/40/40/5';
		return {
			getThumbURL: function (model, size) {
				var fileRoot = EXP_ISIMAGE.test(model.get('extension').toLowerCase()) ? (size || default_thumb_size) + model.get('src').substr((SITE_ROOT + URL_WORKSPACE).length) : PREVIEW_IMG;
				return SITE_ROOT + fileRoot;
			},
			isjQueryObject: function (object) {
				return (object instanceof $ && object.length);
			}
		};
	});
}(this.define, this.Symphony));
