/**
 * @preserve JavaScript Core Array Extra v0.46
 *
 * Licensed under the new BSD License.
 * Copyright 2008-2009, Bram Stein
 * All rights reserved.
 */
(function () {
	Object.extend(Array.prototype, {
		filter: function (fun, thisObj) {
			var i = 0, r = [], val, len = this.length;
			thisObj = thisObj || this;
			for (; i < len; i += 1) {
				if (i in this) {
					val = this[i];
					if (fun.call(thisObj, val, i, this)) {
						r.push(val);
					}
				}
			}
			return r;
		},
		map: function (fun, thisObj) {
			var i = 0, r = [], len = this.length;
			thisObj = thisObj || this;
			for (; i < len; i += 1) {
				if (i in this) {
					r[i] = fun.call(thisObj, this[i], i, this);
				}
			}
			return r;
		},
		forEach: function (fun, thisObj) {
			var i = 0, len = this.length;
			thisObj = thisObj || this;
			for (; i < len; i += 1) {
				if (i in this) {
					fun.call(thisObj, this[i], i, this);
				}
			}
		},
		every: function (fun, thisObj) {
			var i = 0, len = this.length;
			thisObj = thisObj || this;
			for (; i < len; i += 1) {
				if (i in this && !fun.call(thisObj, this[i], i, this)) {
					return false;
				}
			}
			return true;
		},
		some: function (fun, thisObj) {
			var i = 0, len = this.length;
			thisObj = thisObj || this;
			for (; i < len; i += 1) {
				if (i in this && fun.call(thisObj, this[i], i, this)) {
					return true;
				}
			}
			return false;
		},
		indexOf: function (element, from) {
			var len = this.length;
			from = Number(from) || 0;
			from = (from < 0) ? Math.ceil(from) : Math.floor(from);
			from = (from < 0) ? from + len : from;

			for (; from < len; from += 1) {
				if (from in this && this[from] === element) {
					return from;
				}
			}
			return -1;
		},
		lastIndexOf: function (element, from) {
			var len = this.length;
			from = Number(from) || (len - 1);
			from = (from < 0) ? Math.ceil(from) : Math.floor(from);
			from = (from < 0) ? from + len : from;
			from = (from >= len) ? len : from;

			for (; from > -1; from -= 1) {
				if (from in this && this[from] === element) {
					return from;
				}
			}
			return -1;
		},
		reduce: function (fun, initial) {
			var i = 0, len = this.length;
			
			if (len === 0 && initial === undefined) {
				throw new TypeError();
			}
			if (initial === undefined) {
				do {
					if (i in this) {
						initial = this[i];
						i += 1;
						break;
					}
					i += 1;
					if (i >= len) {
						throw new TypeError();
					}
				}
				while (true);
			}
			for (; i < len; i += 1) {
				if (i in this) {
					initial = fun.call(null, initial, this[i], i, this);
				}
			}
			return initial;
		},
		reduceRight: function (fun, initial) {
			var len = this.length, i = len - 1;

			if (len === 0 && initial === undefined) {
				throw new TypeError();
			}
			if (initial === undefined) {
				do {
					if (i in this) {
						initial = this[i];
						i -= 1;
						break;
					}
					i -= 1;
					if (i < 0) {
						throw new TypeError();
					}
				}
				while (true);
			}
			for (; i >= 0; i -= 1) {
				if (i in this) {
					initial = fun.call(null, initial, this[i], i, this);
				}
			}
			return initial;
		}
	});
}());
