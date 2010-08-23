/**
 * Object Orientation Kit
 *
 * LICENSE
 *
 * @license http://www.opensource.org/licenses/bsd-license.php New BSD License
 * @copyright Copyright (c) 2010, Danny Graham, Scott Thundercloud
 */

/**
 * @const
 * @type {Object}
 */
var ook = {};

/**
 * Create a new uninstantiated class with a constructor,
 * the ability to perform mixins, and the ability to extend
 * any object including native DOM objects.
 * 
 * @return {!Object}
 */
ook.Class = function()
{
	/**
	 * The actual class we'll be working with
	 * @private
	 * @this {Object}
	 * @return {!Object} The class constructor
	 */
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

	/**
	 * @type {Array}
	 */
	newClass.__mixins = [];

	/**
	 * @type {Array}
	 */
	newClass.__interfaces = [];

	/**
	 * @type {Array}
	 */
	newClass.__extends = null;

	/**
	* Adds an item to the list of mixins
	* @param {*} Object to be mixed in
	* @this {Object}
	* @return {!Object}
	*/
	newClass.mixin = function(strObj)
	{
		this.__mixins.push(strObj);
		return this;
	};

	/**
	* Adds an item to the list of mixins
	* @param {*} Object to be mixed in
	* @this {Object}
	* @return {!Object}
	*/
	newClass.implement = function(strObj)
	{
		this.__interfaces.push(strObj);
		return this;
	}

	/**
	* Sets an object to be extended
	* @param {*} Object to be mixed in
	* @this {Object}
	* @return {!Object}
	*/
	newClass.extend = function(strObj)
	{
		this.__extends = strObj;
		return this;
	}

	/**
	* Our new class's constructor that will be called
	* @return {!Object} The final class to be instantiated
	*/
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

/**
 * Provides late mixins for decorating instantiated objects
 * @return {!Object}
 */
ook.mixin = function(obj, mixin)
{
	if (typeof mixin == 'function') var mObj = eval('new '+mixin+'();');
	else if (typeof mixin == 'object') var mObj = mixin;
	
	if (!mObj) return obj;
	
	for (var property in mObj) {
		obj[property] = mObj[property];
	}
	
	return obj;
};

/** 
 * Event management
 * @constructor
 */
ook.events = ook.Class();
ook.events.prototype._construct = function()
{
	/** @private */
	var __events = {};

	/** @private */
	var __event = function(event)
	{
		return {
			name: event,
			listeners: []
		};
	};

	/** @private */
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

	/** @private */
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

	/** @private */
	var __addEvent = function(origin,event)
	{
		if (!__events[origin]) __events[origin] = {};
		if (!__events[origin][event]) __events[origin][event] = __event(event);
	};

	/** @private */
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

	/** @protected */
	this.dispatch = function(origin, data)
	{
		__dispatchQueue(origin, data);
	};
	
	/** @protected */
	this.addListener = function(origin,event,obj)
	{
		__addEvent(origin,event);
		if(!__checkListener(origin,event,obj)) __events[origin][event].listeners.push(obj);
	};
	
	/** @protected */
	this.removeListener = function(origin,type,listener)
	{
		__removeListener(origin,type,listener);
	};
	
};
ook.events = new ook.events;

ook.observable = {
	/** 
	 * Dispatch events to listeners
	 * @param {Object} data The event object
	 * @this {Object}
	 */
	dispatch: function(data)
	{
		ook.events.dispatch(this,data);
	},

	/** 
	 * Add a listener to an object
	 * @param {string} event The event to listen for
	 * @param {Object} obj The event listener object
	 * @this {Object}
	 */
	addListener: function(event,obj)
	{
		ook.events.addListener(this,event,obj);
	},

	/** 
	 * Remove a listener
	 * @param {string} event The event to stop listening for
	 * @param {Object} listener The event listener to remove
	 * @this {Object}
	 */
	removeListener: function(event, listener)
	{
		ook.events.removeListener(this,event,listener);
	}
};
