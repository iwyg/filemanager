/**
 * @package Collections
 * @author thomas appel <mail@thomas-appel.com>
 * @requires underscore collections/col_general

 * Displays <a href="http://opensource.org/licenses/gpl-3.0.html">GNU Public License</a>
 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
 */

(function(a){a(["underscore","collections/col_general"],function(a,b){function e(){var a=c[this.cid];a.push((new Date).getTime())}function f(a,b){var c=a.length,d=b.length,e=0;if(c!==d)return!0;for(;e<c;e++)if(a[e]!==b[e])return!0;return!1}var c={},d=b.prototype.constructor.prototype.add,g=b.extend({initialize:function(){this.cid="c"+a.uniqueId(),c[this.cid]=[]},record:function(){c[this.cid]=this.pluck("path")},comparator:function(a){return a.get("sorting")},getDiff:function(){var a=this.pluck("path");return f(c[this.cid],a)},add:function(b){var c=a.isArray(b),e=c?b.length:1,f=this.models.length+e,g;return this.settings.limit!==undefined&&f>this.settings.limit?(g=a.isArray(b)?a.pluck(b,"id"):b.id,c?a.each(b,function(a){a.set("selected",!1)}):b.set("selected",!1),this.trigger("selectionlimitexceed",g),!1):d.apply(this,arguments)},hasChanges:function(){return!!c[this.cid].length}});return g})})(this.define)