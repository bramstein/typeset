/**
 * @preserve JavaScript Core Array v0.39
 *
 * Licensed under the new BSD License.
 * Copyright 2008-2009, Bram Stein
 * All rights reserved.
 */
(function () {
	Object.extend(Array.prototype, {
		isEmpty: function () {
			return this.length < 1;
		},
		append: function () {
			var i = 0, len = arguments.length;
			// interestingly enough, push() beats both
			// concat()---which was expected---and splice()
			for (; i < len; i += 1) {
				this.push.apply(this, arguments[i]);
			}
			return this;
		},
		peek: function () {
			return this[this.length - 1];
		},
		contains: function (v) {
			return this.indexOf(v) !== -1;
		}
	});

	['reduce', 'reduceRight', 'filter', 'map', 'forEach', 'some', 'every', 'indexOf', 'lastIndexOf', 'isEmpty', 'equals', 'contains', 'append', 'peek', 'join', 'sort', 'reverse', 'push', 'pop', 'shift', 'unshift', 'splice', 'concat', 'slice'].forEach(function (func) {
		if (!(func in Array) && func in Array.prototype) {
			Array[func] = function (obj) {
				return this.prototype[func].apply(obj, Array.prototype.slice.call(arguments, 1));
			};
		}
	});
}());
