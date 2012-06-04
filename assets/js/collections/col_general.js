/**
 * @package Collections
 * @author thomas appel <mail@thomas-appel.com>
 * @requires underscore backbone

 * Displays <a href="http://opensource.org/licenses/gpl-3.0.html">GNU Public License</a>
 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
 */

(function(a){a(["underscore","backbone"],function(a,b){var c=b.Collection.prototype.constructor,d=function(){this.settings=this.settings||{},c.apply(this,arguments)},e;return d.prototype=b.Collection.prototype,d.extend=b.Collection.extend,e=d.extend({addSetting:function(a,b,c){this.settings=this.settings||{};if(!this.settings[a]||c===!0)return this.settings[a]=b,this;throw"setting "+a+"already defined"}}),e.defaults={},e})})(this.define)