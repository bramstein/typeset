/**
 * @preserve JavaScript Core Object v0.53
 *
 * Licensed under the new BSD License.
 * Copyright 2008-2009, Bram Stein
 * All rights reserved.
 */
(function () {
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
}());
