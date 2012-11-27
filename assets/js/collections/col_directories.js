(function(a,b){a(["jquery","underscore","backbone","collections/col_general"],function(a,c,d,e){var f={},g,h,i,j,k=/,+\s+/g;g=function(){function e(a){(a===this||a===this.get("dir"))&&this.set("selected",!1)}function b(){this.collection.settings.selectable&&this.get("dir").trigger("selected",this)}function a(){if(!(this instanceof d.Model))throw"function called with wron context"}return d.Model.extend({initialize:function(a,d){d.dir&&this.set({dir:d.dir},{silent:!0}),this.set({id:c.uniqueId(),selected:!1,sorting:0},{silent:!0}),this.on("change:selected",c.bind(b,this)),this.collection.on("remove",c.bind(e,this)),d.dir&&this.get("dir").on("removed",c.bind(e,this))},index:function(){return this.collection.indexOf(this)},set:function(a,b){return a==="selected"?this.collection.settings.selectable&&d.Model.prototype.set.apply(this,arguments):d.Model.prototype.set.apply(this,arguments)}})}(),h=function(){return e.extend({model:g,getByFileName:function(a){a=c.isArray(a)?a:a.replace(k,",").split(",");return c.filter(this.models,function(b){return c.indexOf(a,b.get("path"))>=0})},getFilesByIndexRange:function(a,b){var c=a<b?a:b,d=b>a?b:a,e=[];while(c<=d)e.push(this.at(c++));return e}})}(),i=function(){function j(a){var b=this,d=b.get("subdirs");d&&c.each(d,function(b){a.push(b),j.call(b,a)})}function i(a,b,d,e){var f;b===this&&(f=this.get("files"),f&&f.remove(f.models),this.get("subdirs")&&c.each(this.get("subdirs"),function(b){g.call(b,!1,a,e)}))}function g(a,b,d){d=d||{},b=this.collection||b,b.remove(this,c.extend(d,{silent:a})),this.trigger("removed")}function f(){var a=this.get("parent");!a||a.get("subdirs").push(this)}function e(){var a;!this.get("_parent")||(a=this.collection.get(this.get("_parent")),this.set("parent",a)),this.collection.off("add reset",this._setParent),delete this._setParent}function b(a,b){a.set("level",b&&b.get("level")+1||0)}function a(){this.collection.setSchemeState(this)}return d.Model.extend({defaults:{name:"",_parent:null,path:null,state:"close"},initialize:function(b,d){var e=this;this.collection.on("remove",c.bind(i,this,this.collection)),this.on("change:state",c.bind(a,this)),this.on("change:parent",c.bind(f,this)),this.set("state",this.collection.getSchemeStateByDir(this)),this.get("files")&&this.get("files").addSetting("selectable",this.collection.canSelect())},parse:function(a){var b;a.files&&c.isArray(a.files)&&(b=new h,b.add(a.files,{dir:this}),a.files=b);return a},getSubDirs:function(a){var b=a?[this]:[];j.call(this,b);return b},getByFileName:function(a){return this.get("files")?this.get("files").getByFileName(a):[]}})}(),j=function(){function n(a){return!!f[a]}function m(a,b,c){var d,e=a.getSubDirs(!0);b=b||{},c.directory._parent=a.get("_parent"),c.directory.id=a.id,c.directory.cid=a.cid,this.remove(e,{silent:!0}),d=this.parse(c),this.add(d,{parse:!0}),h.call(this,"__UPDATE__"),!b.silent&&this.trigger("update",this.get(a.id),"update")}function l(b,d){d=d||{},d.success=d.success||function(){},d.error=d.error||function(){};return a.ajax({type:"GET",url:this.url,dataType:"json",data:c.extend({field_id:this.settings.field_id},b),success:d.success,error:d.error})}function j(a,b,d){var e=this,f,g;if(a.directory)return j.call(e,a.directory,b);f=a.id?a.id:"dir"+c.uniqueId(),a._parent=a._parent,a.id=f,b.push(a);if(a.subdirs)while(a.subdirs.length)g=a.subdirs.shift(),g.directory._parent=f,j.call(e,g,b);return b}function h(){var a=[];c.each(c.compact(this.pluck("files")),function(b){a.push(b.models)}),d[this.cid]=c.flatten(a)}function g(){var a;f[this.cid]||(a=f[this.cid]={},c.each(this.models,function(b){a[b.get("path")]={state:"close"}}))}var d={};return e.extend({url:b.Context.get("root")+"/symphony/extension/filemanager/listing/",model:i,initialize:function(){this.cid=this.cid||"c"+c.uniqueId(),this.on("reset add update remove moved delete",c.bind(h,this))},populate:function(){this.deferred=this.fetch({data:{field_id:this.settings.field_id||0}}),this.deferred.done(c.bind(g,this))},parse:function(a){var b=this,d=j.call(this,a,[]),e=c.map(d,function(a){a=new i(a,{collection:b,parse:!0});return a});c.each(e,function(a){var b=a.get("_parent"),d=c.find(e,function(a){return a.get("id")===b});a.set({parent:d})}),this.trigger("preadd",e,"preadd");return e},setScheme:function(a){f[this.cid]=a;return this},changeScheme:function(){n(this.cid)||g.call(this)},setSchemeState:function(a,b){var c=a.get("path");f[this.cid][c]&&(f[this.cid][c].state=a.get("state")?a.get("state"):"close")},getSchemeStateByDir:function(a){return n(this.cid)&&f[this.cid][a.get("path")]?f[this.cid][a.get("path")].state:"close"},getFiles:function(){var a=d[this.cid];return a.length?a:g.call(this)&&d[this.cid]},getFileByDir:function(a,b){var d=this.getFilesByDir(b),e;if(!c.isArray(d))return d.get(a);e=c.find(d,function(b){return b.get(a)});return e},getFilesByDir:function(a){return a?this.get(a).get("files"):!1},getFileById:function(a){return c.find(d[this.cid],function(b){return b.id===a})},getByFileName:function(a){var b=this.getFiles(),d=[];c.isArray(a)||(a=a.replace(k,",").split(",")),c.each(a,function(a){var e=c.find(b,function(b){return b.get("path")===a});e&&d.push(e)});return d},updateDir:function(a,b){var d=l.call(this,{select:a.get("path")}).done(c.bind(m,this,a,b)).fail();return d},createDir:function(b,d){d=this.get(d.id)||undefined;if(!d)return!1;var e=this.url.replace(/listing\/$/,"edit/"),f={mkdir:b,within:d.get("path"),type:"create"};return a.ajax({url:e,type:"post",data:f,dataType:"json",success:c.bind(this.updateDir,this,d)})},moveItem:function(b){var c=this,d=this.get(b.source),e=this.get(b.destination),f=b.file?this.getFileById(b.file):d,g={from:f.get("path"),to:e.get("path"),type:"move",dataType:b.type},h=this.url.replace(/listing\/$/,"edit/");return a.ajax({url:h,type:"post",data:g,dataType:"json",success:function(){b.type==="file"?(f.collection.remove(f),c.trigger("moved",d)):c.remove(d),c.updateDir(e)},error:function(){}})},searchFiles:function(a,b,c){var e,f=[],g=0,h,i=new RegExp(a,"i");if(!a||a.length<(c||3))return f;b=b||"file",e=d[this.cid],h=e.length;for(;g<h;g++){if(!e||!i.test(e[g].get(b)))continue;f.push(e[g])}return f},deleteItem:function(b,c){var d=this.url.replace(/listing\/$/,"edit/"),e=this,f,g=a.Deferred();c!=="file"?this.trigger("beforedirectorydelete",g):g.resolve();return a.ajax({url:d,type:"post",data:{type:"delete",file:b.get("path")},dataType:"json",success:function(){c!=="file"?e.remove(b):b.collection.remove(b),c==="file"&&e.trigger("filedelete",b),e.trigger("itemdelete",b.get("id"),c),e.trigger("delete",c==="file"?b.get("dir"):b.get("parent"))},error:function(){}})},canSelect:function(){return!0}})}();return j})})(this.define,this.Symphony)