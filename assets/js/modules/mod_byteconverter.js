/**
 * @package Modules
 * @author thomas appel <mail@thomas-appel.com>

 * Displays <a href="http://opensource.org/licenses/gpl-3.0.html">GNU Public License</a>
 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
 */

(function(a){var b=1e3,c=Math.pow(b,2),d=Math.pow(b,3);a([],function(){function a(a,b){return(Math.round(a/b*1e5)/1e5).toFixed(2)}function e(c){return a(c,b)}function f(b){return a(b,c)}function g(b){return a(b,d)}function h(a){return a<b?a+"":a<c?e(a)+" KB":a<d?f(a)+" MB":g(a)+" GB"}return h})})(this.define)