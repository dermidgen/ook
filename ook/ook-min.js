/*
 http://www.opensource.org/licenses/bsd-license.php New BSD License
 @copyright Copyright (c) 2010, Danny Graham, Scott Thundercloud
*/
var ook={};
ook.Class=function(){var a=function(){var c=this.initialize?this.initialize:this._construct;if(this.__construct){var g=this.__construct.apply(this,arguments);if(c&&g)c.apply(g,arguments);else c&&c.apply(this,arguments);return g?g:this}c&&c.apply(this,arguments)};a.__mixins=[];a.__interfaces=[];a.__extends=null;a.mixin=function(c){this.__mixins.push(c);return this};a.implement=function(c){this.__interfaces.push(c);return this};a.extend=function(c){this.__extends=c;return this};a.prototype.__construct=function(){for(var c=
function(f){f.isDOM=true;f._parent={};try{for(var i in f)if(typeof f[i]=="function")f._parent[i]=f[i];for(i in this)try{f[i]=this[i]}catch(j){}}catch(k){}return f},g=function(f){this._parent=f;for(var i in f)this[i]||(this[i]=this._parent[i]);return this},b=0;b<a.__mixins.length;b++){if(typeof a.__mixins[b]=="function")var d=eval("new "+a.__mixins[b]+"();");else if(typeof a.__mixins[b]=="object")d=a.__mixins[b];if(!d)return null;for(var e in d)this[e]=d[e]}if(a.__extends!=null)if(typeof a.__extends!=
"string")var h=a.__extends.isDOM||a.__extends.tagName?c.apply(this,[a.__extends]):g.apply(this,[a.__extends]);else if(a.__extends.substring(0,5)!="_DOM_"){b=eval("new "+a.__extends+"();");h=b.isDOM?c.apply(this,[b]):g.apply(this,[b])}else h=c.apply(this,[document.createElement(a.__extends.substring(5))]);return h};return a};ook.mixin=function(a,c){if(typeof c=="function")var g=eval("new "+c+"();");else if(typeof c=="object")g=c;if(!g)return a;for(var b in g)a[b]=g[b];return a};ook.events=ook.Class();
ook.events.prototype._construct=function(){var a=[],c=function(b,d){var e=g(b,d);return e!==false?a[e]:null},g=function(b,d){for(var e=0;e<a.length;e++)if(typeof a[e].name!="undefined"&&typeof a[e].origin!="undefined")if(a[e].name===b&&a[e].origin===d)return e;return false};this.dispatch=function(b,d){var e=d.type;if(c(e,b))for(var h=g(e,b),f=0;f<a[h].listeners.length;f++)(a[h].listeners[f][e]?a[h].listeners[f][e]:a[h].listeners[f])(d)};this.addListener=function(b,d,e){c(d,b)||a.push({name:d,origin:b,
listeners:[]});var h;a:{if(c(d,b)){h=c(d,b).listeners;for(var f=0;f<h.length;f++)if(h[f]===e){h=true;break a}}h=false}if(!h){b=g(d,b);a[b].listeners.push(e)}};this.removeListener=function(b,d,e){if(c(d,b)){b=g(d,b);for(d=0;d<a[b].listeners.length;d++)a[b].listeners[d]===e&&a[b].listeners.splice(d,1)}}};ook.events=new ook.events;
ook.observable={dispatch:function(a){ook.events.dispatch(this,a)},addListener:function(a,c){ook.events.addListener(this,a,c)},removeListener:function(a,c){ook.events.removeListener(this,a,c)}};
