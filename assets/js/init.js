/**
 * @package filemanager
 * @author thomas appel <mail@thomas-appel.com>

 * Displays <a href="http://opensource.org/licenses/gpl-3.0.html">GNU Public License</a>
 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
 */

(function(a,b,c,d){c("settings",[],function(){return{root:d.Context.get("root"),instances:{}}}),c("bootstrap",["settings"],function(a){return function(b,c){a.instances["filemanager-"+c]={field_id:b,instance:c}}}),b({baseUrl:d.Context.get("root")+"/extensions/filemanager/assets/js",paths:{jquery:"../../../../symphony/assets/js/jquery",orderable:"../../../../symphony/assets/js/symphony.orderable",jqueryui:"libs/jquery-ui-1.8.18.custom",underscore:"../../../sym_backbonejs/assets/underscore",backbone:"../../../sym_backbonejs/assets/backbone",text:"../../../sym_requirejs/assets/text"}},["main"])})(this,this.require,this.define,this.Symphony)