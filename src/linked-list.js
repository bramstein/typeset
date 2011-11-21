
function LinkedList() {
	this.head = null;
	this.tail = null;
	this.listSize = 0;
}
(function () {
	Object.extend(LinkedList, {
		Node: function (data) {
			this.prev = null;
			this.next = null;
			this.data = data;		
		}
	});

	Object.extend(LinkedList.Node.prototype, {
		toString: function () {
			return this.data.toString();
		}
	});

	function isLinked(list, node) {
		return !((node && node.prev === null && node.next === null && list.tail !== node && list.head !== node) || list.isEmpty());
	}

	Object.extend(LinkedList.prototype, {
		size: function () {
			return this.listSize;
		},

		isEmpty: function () {
			return this.listSize === 0;
		},

		first: function () {
			return this.head;
		},

		last: function () {
			return this.last;
		},

		toString: function () {
			return this.toArray().toString();
		},

		toArray: function () {
			var node = this.head,
				result = [];
			while (node !== null) {
				result.push(node);
				node = node.next;
			}
			return result;
		},

		// Note that modifying the list during
		// iteration is not safe.
		forEach: function (fun) {
			var node = this.head;
			while (node !== null) {
				fun(node);
				node = node.next;
			}
		},	

		contains: function (n) {
			var node = this.head;
			if (!isLinked(this, n)) {
				return false;
			}
			while (node !== null) {
				if (node === n) {
					return true;
				}
				node = node.next;
			}
			return false;
		},

		at: function (i) {
			var node = this.head, index = 0;

			if (i >= this.listLength || i < 0) {
				return null;
			}

			while (node !== null) {
				if (i === index) {
					return node;
				}
				node = node.next;
				index += 1;
			}
			return null;
		},

		insertAfter: function (node, newNode) {
			if (!isLinked(this, node)) {
				return this;
			}
			newNode.prev = node;
			newNode.next = node.next;
			if (node.next === null) {
				this.tail = newNode;
			} else {
				node.next.prev = newNode;
			}
			node.next = newNode;
			this.listSize += 1;
			return this;
		},

		insertBefore: function (node, newNode) {
			if (!isLinked(this, node)) {
				return this;
			}
			newNode.prev = node.prev;
			newNode.next = node;
			if (node.prev === null) {
				this.head = newNode;
			} else {
				node.prev.next = newNode;
			}
			node.prev = newNode;
			this.listSize += 1;
			return this;
		},

		push: function (node) {
			if (this.head === null) {
				this.unshift(node);
			} else {
				this.insertAfter(this.tail, node);
			}
			return this;
		},

		unshift: function (node) {
			if (this.head === null) {
				this.head = node;
				this.tail = node;
				node.prev = null;
				node.next = null;
				this.listSize += 1;
			} else {
				this.insertBefore(this.head, node);
			}
			return this;
		},

		remove: function (node) {
			if (!isLinked(this, node)) {
				return this;
			}
			if (node.prev === null) {
				this.head = node.next;
			} else {
				node.prev.next = node.next;
			}
			if (node.next === null) {
				this.tail = node.prev;
			} else {
				node.next.prev = node.prev;
			}
			this.listSize -= 1;
			return this;
		},

		pop: function () {
			var node = this.tail;
			this.tail.prev.next = null;
			this.tail = this.tail.prev;
			this.listSize -= 1;
			node.prev = null;
			node.next = null;
			return node;
		},

		shift: function () {
			var node = this.head;
			this.head.next.prev = null;
			this.head = this.head.next;
			this.listSize -= 1;
			node.prev = null;
			node.next = null;
			return node;
		}
	});
}());
