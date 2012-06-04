(function (define) {
	define(['underscore', 'backbone'], function (_, Backbone) {

		var	syncManager = _.extend({
			collections: [],
			_callback: function (dir) {
				this.off(syncManager.events, syncManager._callback);
				syncManager.syncDirs(this, dir);
				this.on(syncManager.events, syncManager._callback);
			},
			events: 'update delete moved filedelete',
			syncDirs: function (col, dir) {
				_.each(this.collections, function (c) {
					var directory, path = dir.get('path'), index;
					if (c !== col) {
						index = _.indexOf(c.pluck('path'), path);
						directory = index >= 0 ? c.models[_.indexOf(c.pluck('path'), path)] : null;
						if (directory) {
							c.off(syncManager.events, syncManager._callback);
							c.updateDir(directory, {silent: false}).always(function () {
								c.on(syncManager.events, syncManager._callback);
							});
						}
					}
				});
			},
			add: function (col) {
				if (_.isArray(col)) {
					_.each(col, _.bind(syncManager.add, syncManager));
					return this;
				}

				if (!(col instanceof Backbone.Collection)) {
					throw ('can\'t add none collection Objects');
				}
				this.collections.push(col);
				this.trigger('add', col, this);
				return this;
			},
			removeCollection: function (col) {
				if (_.isArray(col)) {
					_.each(col, _.bind(syncManager.removeCollection, syncManager));
					return this;
				}
				var index = _.indexOf(this.collections, col);
				if (index >= 0) {
					this.collection.splice(index, 1);
				}
				return this;
			}
		}, Backbone.Events);
		return syncManager;
	});
}(this.define));

