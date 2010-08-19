/**
 * Object Orientation Kit
 *
 * LICENSE
 *
 * @license http://www.opensource.org/licenses/bsd-license.php New BSD License
 * @copyright Copyright (c) 2010, Danny Graham, Scott Thundercloud
 */

/**
 * @constructor
 */
ook = new(function (){
	this.Class = function()
	{
		var newClass = function()
		{
			var constructor = (this.initialize) ? this.initialize : this._construct;
			if (this.__construct) {
				var instance = this.__construct.apply(this, arguments);

				if (constructor && instance) constructor.apply(instance, arguments);
				else if (constructor) constructor.apply(this, arguments);

				if (instance) return instance;
				else return this;
			}
			if (constructor) constructor.apply(this, arguments);
		};

		newClass.__mixins = [];
		newClass.__interfaces = [];
		newClass.__extends = null;

		newClass.mixin = function(strObj)
		{
			this.__mixins.push(strObj);
			return this;
		};

		newClass.implement = function(strObj)
		{
			this.__interfaces.push(strObj);
			return this;
		}

		newClass.extend = function(strObj)
		{
			this.__extends = strObj;
			return this;
		}

		newClass.prototype.__construct = function()
		{
			var InterfaceException = function(unsatisfiedProperty)
			{
				return 'Interface Dependency Not Satisfied: '+unsatisfiedProperty;
			}

			var returnDOM = function(p)
			{
				p.isDOM = true;
				p._parent = {};

				try{
					// Backup Methods (to catch protected methods)
					for (var property in p) {
						if (typeof p[property] == 'function') p._parent[property] = p[property];
					}

					for (var property in this) {
						try {
							p[property] = this[property];
						}
						catch (e) {}
					}
				} 
				catch (ee) {}
				
				return p;
			};

			var returnObject = function(p)
			{
				this._parent = p;
				for (var property in p)
				{
					if (!this[property]) this[property] = this._parent[property];
				}
				return this;
			};

			var mixins = newClass.__mixins;
			var interfaces = newClass.__interfaces;
			var extentions = newClass.__extends;

			// Perform Mixin
			for(var i=0; i<newClass.__mixins.length; i++)
			{
				if (typeof newClass.__mixins[i] == 'function') var mObj = eval('new '+newClass.__mixins[i]+'();');
				else if (typeof newClass.__mixins[i] == 'object') var mObj = newClass.__mixins[i];
				else if (typeof newClass.__mixins[i] == 'string') var mObj = eval(newClass.__mixins[i]); // This is EVIIIIL
				
				if (!mObj) return;
				
				for (var property in mObj) {
					this[property] = mObj[property];
				}
			}

			// Perform Extensions
			if (newClass.__extends != null)
			{
				if (typeof newClass.__extends != 'string') {
					var finalClass = (newClass.__extends.isDOM || newClass.__extends.tagName) ? returnDOM.apply(this,[newClass.__extends]) : returnObject.apply(this,[newClass.__extends]);
				}
				else if (newClass.__extends.substring(0,5) != '_DOM_') {
					var p = eval('new '+newClass.__extends+'();');
					var finalClass = (p.isDOM) ? returnDOM.apply(this,[p]) : returnObject.apply(this,[p]);
				}
				else {
					var finalClass = returnDOM.apply(this, [document.createElement(newClass.__extends.substring(5))]);
				}
			}

			// Validate Interfaces
			/** interface support is slated for removal as it's just extra bloat **/
//			for(var i=0; i<interfaces.length; i++)
//			{
//				var mObj = eval(interfaces[i]);
//				for(var property in mObj)
//				{
//					if (typeof finalClass[property] == 'undefined') throw new InterfaceException(property);
//				}
//			}

			return finalClass;
		}

		return newClass;
	};
	
	this.event = this.Class();
	this.event.prototype._construct = function(){
		
		var __events = {};
		var __event = function(event)
		{
			return {
				name: event,
				listeners: []
			};
		};

		var __dispatchQueue = function(origin, data)
		{
			if (!__events[origin]) return false;
			 
			var event = data.type;
			if (!__events[origin][event]) return false;
						 
			for(var i=0; i < __events[origin][event].listeners.length; i++)
			{
				var proc = (__events[origin][event].listeners[i][event]) ? (__events[origin][event].listeners[i][event]) : __events[origin][event].listeners[i];
				proc(data);
			}
		};

		var __removeListener = function(origin, event, listener)
		{
			if (!__events[origin]) return false;
			if (!__events[origin][event]) return false;
			
			for (var i in __events[origin][event].listeners)
			{
				if(__events[origin][event].listeners[i] == listener) {
					__events[origin][event].listeners.splice(i, 1);
				}
			}
		};

		var __addEvent = function(origin,event)
		{
			if (!__events[origin]) __events[origin] = {};
			if (!__events[origin][event]) __events[origin][event] = __event(event);
		};

		var __checkListener = function(origin, event, obj)
		{
			if (!__events[origin]) return false;
			if (!__events[origin][event]) return false;
			
			var listeners = __events[origin][event].listeners;
			for(var i=0; i < listeners.length; i++)
			{
				if(listeners[i] == obj) return true;
			}
			return false;
		};

		this.dispatch = function(origin, data)
		{
			__dispatchQueue(origin, data);
		};
		
		this.addListener = function(origin,event,obj)
		{
			__addEvent(origin,event);
			if(!__checkListener(origin,event,obj)) __events[origin][event].listeners.push(obj);
		};
		
		this.removeListener = function(origin,type,listener)
		{
			__removeListener(origin,type,listener);
		};
		
	};
	this.event = new this.event;
	
	this.observable = {
		dispatch: function(data)
		{
			ook.event.dispatch(this,data);
		},

		addListener: function(event,obj)
		{
			ook.event.addListener(this,event,obj);
		},

		removeListener: function(event, listener)
		{
			ook.event.removeListener(this,event,listener);
		}
	};
})();
