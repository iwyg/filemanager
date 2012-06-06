/**
 * @package Views
 * @author thomas appel <mail@thomas-appel.com>

 * Displays <a href="http://opensource.org/licenses/gpl-3.0.html">GNU Public License</a>
 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
 */

(function (window, Symphony, define) {
	define(['jquery', 'underscore', 'backbone', 'modules/mod_sysmessage', 'modules/mod_helper', 'templates/templates'], function ($, _, Backbone, SysMessage, helper, templates) {

		/**
		 * @extends Backbone.View
		 * @class SearchView
		 * @constructor
		 */
		var $doc = $(window.document),
		SearchView = (function () {
			var threshold = 0, trcache;

			function _addSelection(event) {
				event.preventDefault();
				var target = $([$(event.target), $(event.target).parents().filter('li')]).filter(function () {
					return this.hasClass('result-item');
				}),
				id = target[0][0].id.replace(/result/, 'file');
				target.addClass('selected');
				//$('#' + id).find('> .text').trigger('click.dirtree');

				var file = this.collection.getFileById(parseInt(id.substr(5), 10));
				file.set('selected', true);
			}

			function _triggerSearch(event) {
				var target, results, l;
				threshold++;
				this.reset();
				trcache = this.options.threshold;
				this.options.threshold = 0;
				threshold = 0;
				target = event.target;
				results = this.collection.searchFiles(target.value);
				l = results.length;
				this.counter = $(templates.search_count({found: Symphony.Language.get(SysMessage[l === 1 ? 'count_file_found' : 'count_files_found'], {count: l})}));
				_.each(results, _.bind(this.render, this));
				this.field.after(this.counter);
			}
			function _clearOnEscape(event) {
				if (event.which !== 27) {
					return;
				}
				this.reset();
				this.field.val('').blur();
			}
			function _clear() {
				_clearOnEscape.call(this, {which: 27});
			}
			function _toggleSelected(model) {
				var resultNode = $('#result-' + model.id);

				if (resultNode.length) {
					resultNode[model.get('selected') ? 'addClass' : 'removeClass']('selected');
				}
			}

			function _removeResultNode(model) {
				var resultNode = $('#result-' + model.id);

				if (resultNode.length) {
					resultNode.remove();
				}
			}

			function _bindEscape(event) {
				this.field.parent().addClass('active');
				$doc.on('keyup.searchlist', _.bind(_clearOnEscape, this));
			}

			function _unbindEscape(event) {
				this.field.parent().removeClass('active');
				$doc.off('keyup.searchlist');
			}

			return Backbone.View.extend({
				events: {
					'click.searchlist .result-item:not(.selected)': _addSelection,
					'focus.searchlist input[type=text]': _bindEscape,
					'blur.searchlist input[type=text]': _unbindEscape,
					'click.searchlist .remove': _clear,
					'keyup.searchlist input[type=text]' : _triggerSearch
				},

				initialize: function () {
					this.$el = $(templates.search_bar({id: null}));
					this.el = this.$el.get();

					this.el.id = this.options.id || 'search-' + this.cid;

					this.template = templates.search_list;
					this.list = this.$el.find('.results');
					this.field = this.$el.find('input[type=text]');

					this.collection
						.on('selected', _.bind(_toggleSelected, this))
						.on('filedelete', _.bind(_removeResultNode, this));

					//this.$el.on('keyup.searchlist input[type=text]', _.debounce(_.bind(_triggerSearch, this), 250));
				},

				reset: function () {
					this.options.threshold = trcache;
					this.list.empty();
					if (this.counter) {
						this.counter.remove();
					}
				},

				render: function (file) {
					var f = file.toJSON(), compiled;
					f.thumb = helper.getThumbURL(file, '/image/2/40/40/5');
					compiled = this.template(f);
					this.list.append(compiled);
				}
			});
		}());
		return SearchView;
	});
} (this, this.Symphony, this.define));
