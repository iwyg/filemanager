(function (define, Symphony) {
	var msg = {
		file_size_exceeds: '{$item} exceeds allowed size',
		file_type_invalid: '{$item}: filetype invalid',
		file_exists: 'file {$file} already exists',
		directory_exists: 'directory {$file} already exists',
		directory_created: 'Directory {$dir} successfully created in {$path}',
		invalid_destination: 'invalid destination: {$dir}',
		confirm_file_deletion: 'Are you shure you want to delete {$file}? This step cannot be undone.',
		confirm_directory_deletion: 'Are you shure you want to delete {$dir}? {$dir2} contains {$dircount} directories and {$filecount} files that will be deleted. This step cannot be undone.',
		file_select_limit_exceed: 'Can\'t select more than {$count} files',
		unsaved_changes: 'There are unsaved changes. Do you really want to continue?'
	},

	msgQueue = [],
	FILTER = /\{\$.*?\}/g;

	define(['jquery', 'underscore'], function ($, _) {
		var symLang = {};
		_.each(msg, function (key, i) {
			symLang[key] = false;
		});
		Symphony.Language.add(symLang);

		function SysMessage(type, response, parse) {
			parse = typeof parse === 'boolean' ? parse : true;
			this.type = !type && response.status === 400 ? 'error' : response.success ? 'success' : type;
			this.msgObj = this.type === 'success' ? response.success : this.type === 'error' ? parse ? $.parseJSON(response.responseText).STATUS_ERROR.error : response.error : {};
			msgQueue.push(this.parseMessage());

			this.displayMessage();
		}

		SysMessage.prototype = {
			parseMessage: function () {
				return Symphony.Language.get(this.msgObj.message, this.msgObj.context);
			},

			displayMessage: function () {
				var time = msgQueue.length > 1 ? 0 : 4000,
				that = this;

				Symphony.Message.fade('silence', 10);
				Symphony.Message.post(msgQueue.shift(), that.type);
				setTimeout(function () {
					setTimeout(function () {
						Symphony.Message.clear(that.type);
					}, 300);

				}, time);
			}
		};

		_.extend(SysMessage, msg);
		return SysMessage;
	});
}(this.define, this.Symphony));

