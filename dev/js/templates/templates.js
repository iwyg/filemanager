(function (define) {
	define([
		'underscore',
		'text!templates/dirtree.tpl',
		'text!templates/dirtree_error.tpl',
		'text!templates/dirs.tpl',
		'text!templates/newdir.tpl',
		'text!templates/files.tpl',
		'text!templates/selected_compact.tpl',
		'text!templates/selected_preview.tpl',
		'text!templates/upload.tpl',
		'text!templates/upload_list.tpl',
		'text!templates/upload_list_item.tpl',
		'text!templates/meta.tpl',
		'text!templates/search_bar.tpl',
		'text!templates/search_list.tpl',
		'text!templates/search_count.tpl'
	], function (_, dirtree, dirtree_error, dirs, newdir, files, selected_compact, selected_preview, upload, upload_list, upload_list_item, meta, search_bar, search_list, search_count) {
		var options = {};

		return {
			dirtree: _.template(dirtree),
			dirtree_error: _.template(dirtree_error),
			dirs: _.template(dirs),
			newdir: _.template(newdir),
			files: _.template(files),
			selected_compact: _.template(selected_compact),
			selected_preview: _.template(selected_preview),
			upload: _.template(upload),
			upload_list: _.template(upload_list),
			upload_list_item: _.template(upload_list_item),
			meta: _.template(meta),
			search_bar: _.template(search_bar),
			search_list: _.template(search_list),
			search_count: _.template(search_count)
		};
	});
}(this.define));
