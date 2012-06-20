/**
 * @package Modules
 * @requires jquery underscore
 * @author thomas appel <mail@thomas-appel.com>

 * Displays <a href="http://opensource.org/licenses/gpl-3.0.html">GNU Public License</a>
 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
 */

(function (define, Symphony) {
	var msg = {
		uploadedfile_size_exceeds:	'file size ({$f_size}) limit exceeds allowed size',
		file_size_exceeds:			'{$item} exceeds allowed size',
		file_type_invalid:			'{$item}: filetype invalid',
		file_exists:				'file {$file} already exists',
		file_move_success:			'file {$item} successfully moved to {$to}',
		file_upload_success:		'{$file} successfully uploaded',
		file_delete_success:		'successfully deleted {$file}',
		dir_move_success:			'directory {$item} successfully moved {$to}',
		directory_exists:			'directory {$file} already exists',
		directory_created:			'Directory {$dir} successfully created in {$path}',
		invalid_destination:		'invalid destination: {$dir}',
		invalid_mimetype:			'file type {$mimetype} not allowed',
		confirm_file_deletion:		'Are you shure you want to delete {$file}? This step cannot be undone.',
		confirm_directory_deletion: 'Are you shure you want to delete {$dir}? {$dir2} contains {$dircount} directories and {$filecount} files that will be deleted. This step cannot be undone.',
		file_select_limit_exceed:	'Can\'t select more than {$count} files',
		unsaved_changes:			'There are unsaved changes. Do you really want to continue?',
		directory_listing_error:	'Cannot resolve directory structure for {$root}',
		dir_access_error:			'Cannot access {$file}',
		dir_creating_error:			'Failed creating Directory {$dir} in {$path}',
		item_move_error:			'can\'t move {$file} to {$location}',
		file_delete_error:			'can\'t delete file {$file}',
		dir_delete_error:			'can\'t delete directory {$file}',
		root_dir_error:				'can\'t delete or move {$dir}. {$dir2} is used by another field',
		count_files_found:			'{$count} files found',
		count_file_found:			'{$count} file found'
	},

	msgQueue = [],
	msgCache = [],
	O = 0,

	FILTER = /\{\$.*?\}/g,

	defaultMsg = {
		message: 'undefined error',
		context: null
	};


	define(['jquery', 'underscore'], function ($, _) {
		window._$_ = $;
		var symLang = {};
		_.each(msg, function (key, i) {
			symLang[key] = false;
		});
		Symphony.Language.add(symLang);

		function SysMessage(type, response, parse) {
			this._msgID = O++;
			parse = typeof parse === 'boolean' ? parse : true;
			this.type = !type && response.status === 400 ? 'error' : response.success ? 'success' : type;
			this.msgObj = this.type === 'success' ? response.success : this.type === 'error' ? (parse ? $.parseJSON(response.responseText).STATUS_ERROR : response.error) : defaultMsg;
			msgQueue.push(this.parseMessage());
			this.displayMessage();
		}

		SysMessage.prototype = {
			parseMessage: function () {
				return Symphony.Language.get(this.msgObj.message, this.msgObj.context);
			},

			getMessage: function () {
				return msgCache[this._msgID];
			},

			displayMessage: function () {
				var time = msgQueue.length > 1 ? 0 : 4000,
				header = $('#header'),
				that = this, msg = msgQueue.shift();
				msgCache.push(msg);

				header.find('.notifier').css({display: ''});
				Symphony.Message.post(msg, that.type);
				setTimeout(function () {
					setTimeout(function () {
						Symphony.Message.clear(that.type);
					}, 300);

				}, time);

				return msg;
			}
		};

		_.extend(SysMessage, msg);
		return SysMessage;
	});
}(this.define, this.Symphony));
