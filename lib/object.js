/**
 * @preserve JavaScript Core Object v0.53
 *
 * Licensed under the new BSD License.
 * Copyright 2008-2009, Bram Stein
 * All rights reserved.
 */
(function () {
	function getInternalType(value) {
		return Object.prototype.toString.apply(value);
	}
    
    function Clone() {}

	Object.extend = function (obj) {
		var i = 1, key, len = arguments.length;
		for (; i < len; i += 1) {
			for (key in arguments[i]) {
				// make sure we do not override built-in methods but toString and valueOf
				if (arguments[i].hasOwnProperty(key) && 
					(!obj[key] || obj.propertyIsEnumerable(key) || key === 'toString' || key === 'valueOf')) {
					obj[key] = arguments[i][key];
				}
			}
		}
		return obj;
	};

	Object.extend(Object, {
		isAtom: function (value) {
			return ((typeof value !== 'object' || value === null) && 
				typeof value !== 'function') || 
				Object.isBoolean(value) || Object.isNumber(value) || Object.isString(value);
		},

		isNumber: function (value) {
			return (typeof value === 'number' || value instanceof Number) && !isNaN(value);
		},

		isString: function (value) {
			return typeof value === 'string' || value instanceof String;
		},

		isBoolean: function (value) {
			return value !== null && 
				(typeof value === 'boolean' || value instanceof Boolean);
		},

		isArray: function (value) {
			return getInternalType(value) === '[object Array]';
		},

		isObject: function (value) {
			return getInternalType(value) === '[object Object]';
		},

		isFunction: function (value) {
			return typeof value === 'function';
		},

		isDefined: function (value) {
			return typeof value !== 'undefined';
		},

		filter: function (obj, fun, thisObj) {
			var key, r = {}, val;
			thisObj = thisObj || obj;
			for (key in obj) {
				if (obj.hasOwnProperty(key)) {
					val = obj[key];
					if (fun.call(thisObj, val, key, obj)) {
						r[key] = val;
					}
				}
			}
			return r;
		},

		map: function (obj, fun, thisObj) {
			var key, r = {};
			thisObj = thisObj || obj;
			for (key in obj) {
				if (obj.hasOwnProperty(key)) {
					r[key] = fun.call(thisObj, obj[key], key, obj);
				}
			}
			return r;
		},

		forEach: function (obj, fun, thisObj) {
			var key;
			thisObj = thisObj || obj;
			for (key in obj) {
				if (obj.hasOwnProperty(key)) {
					fun.call(thisObj, obj[key], key, obj);			
				}
			}
		},

		every: function (obj, fun, thisObj) {
			var key;
			thisObj = thisObj || obj;
			for (key in obj) {
				if (obj.hasOwnProperty(key) && !fun.call(thisObj, obj[key], key, obj)) {
					return false;
				}
			}
			return true;
		},

		some: function (obj, fun, thisObj) {
			var key;
			thisObj = thisObj || obj;
			for (key in obj) {
				if (obj.hasOwnProperty(key) && fun.call(thisObj, obj[key], key, obj)) {
					return true;
				}
			}
			return false;
		},

		isEmpty: function (obj) {
			return Object.every(obj, function (value, key) { 
				return !obj.hasOwnProperty(key); 
			});
		},

		values: function (obj) {
			var r = [];
			Object.forEach(obj, function (value) {
				r.push(value);
			});
			return r;
		},

		keys: function (obj) {
			var r = [];
			Object.forEach(obj, function (value, key) {
				r.push(key);
			});
			return r;
		},

        // Shallow or deep copy of an object. Code inspired by:
        // * Oran Looney - http://oranlooney.com/static/functional_javascript/owl_util.js
        // * Object-Oriented JavaScript, by Stoyan Stefanov
		copy: function (obj, deep) {
            var c, p, r;
            
            if (typeof obj !== 'object') {
                return obj;
            } else {
                c = obj.valueOf();
                
                // Test for strict identity: if they are not equal we 
                // can be sure this not a native type wrapper.
                if (obj !== c) {
                    return new obj.constructor(c);
                }
                
                // We clone the prototype if possible, otherwise construct a clean object or array
                if (obj instanceof obj.constructor && obj.constructor !== Object && !Object.isArray(obj)) {
                    r = Object.clone(obj.constructor.prototype);
                } else {
                    r = Object.isArray(obj) ? [] : {};
                }

                for (p in obj) {
                    if (obj.hasOwnProperty(p)) {
                        r[p] = deep ? Object.copy(obj[p], deep) : obj[p]; 
                    }
                }
                return r;
            }
		},

		clone: function (obj) {
			Clone.prototype = obj;
			return new Clone();
		},

		reduce: function (obj, fun, initial) {
			var key, initialKey;

			if (Object.isEmpty(obj) && initial === undefined) {
				throw new TypeError();
			}
			if (initial === undefined) {
				for (key in obj) {
					if (obj.hasOwnProperty(key)) {
						initial = obj[key];
						initialKey = key;
						break;
					}
				}
			}
			for (key in obj) {
				if (obj.hasOwnProperty(key) && key !== initialKey) {
					initial = fun.call(null, initial, obj[key], key, obj);
				}
			}
			return initial;
		}
	});
}());
