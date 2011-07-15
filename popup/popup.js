
function $(sel) {
	return document.querySelector(sel);
}

var dom = new function DomUtils() {
	
	this.defaultBounds = {
		x: 0, y: 0, width: 0, height: 0, bottom: 0, right: 0
	}
	
	// makes a new element given its type, modifiers, and inner HTML
	this.make = function(element, modifiers, content) {
		var el = document.createElement(element);
		if (modifiers) {
			var mod = modifiers.split(' ');
			for (var i = 0; i < mod.length; i++) {
				if (mod[i][0] == '.') {
					el.addClass(mod[i].substr(1));
				}
				else if (mod[i][0] == '#') {
					el.id = mod[i].substr(1);
				}
				else if (mod[i][0] == '[') {
					var match = mod[i].match(/\[(.+?)(?:=(.+?))?\]/);
					if (match) 
						el.setAttribute(match[1], match[2] || '');
				}
			}
		}
		if (content)
			el.innerHTML = content;
		return el;
	}
	
	this.position = function(obj) {
		var left = 0, top = 0;
		do {
			left += obj.offsetLeft;
			top += obj.offsetTop;
		} while (obj = obj.offsetParent);
		
		return {x: left, y: top};
	}
	
	this.getBounds = function(obj, scrollY) {
		scrollY = scrollY || 0;
		var pos = dom.position(obj);
		var bounds = { 
			x: pos.x,
			y: pos.y + scrollY,
			width: obj.offsetWidth,
			height: obj.offsetHeight
		}
		bounds.right = bounds.x + bounds.width;
		bounds.bottom = bounds.y + bounds.height;
		return bounds;
	}
	
	this.getCenter = function(bounds) {
		return {
			x: bounds.x + 0.5 * bounds.width,
			y: bounds.y + 0.5 * bounds.height
		}
	}
	
	// Gets the position of the mouse from a mouse event object
	this.mousePosition = function(e) {
		if (!e)
			return {x: 0, y: 0};
		return {x: e.pageX, y: e.pageY};
	}


	// Returns true if pos is within the rectangle bounded by [x,y][width,height]
	this.testBounds = function(pos, bounds) {
		return (pos.x >= bounds.x && pos.y >= bounds.y
			&& pos.x <= bounds.x + bounds.width
			&& pos.y <= bounds.y + bounds.height);
	}
	
}




// Utility functions for HTML elements
HTMLElement.prototype.hasClass = function(className) {
	return this.classList.contains(className);
}

HTMLElement.prototype.addClass = function(className) {
	this.classList.add(className);
}

HTMLElement.prototype.removeClass = function(className) {
	this.classList.remove(className);
}

HTMLElement.prototype.appendChildren = function(newChildren) {
	for (var i = 0; i < newChildren.length; i++) {
		this.appendChild(newChildren[i]);
	}
}

HTMLElement.prototype.removeSelf = function() {
	this.parentNode.removeChild(this);
}

HTMLElement.prototype.swapChildren = function(index1, index2) {
	if (index1 instanceof HTMLElement)
		index1 = this.childNodes.indexOf(index1);
	if (index2 instanceof HTMLElement)
		index2 = this.childNodes.indexOf(index2);
	
	if (index1 == -1 || index2 == -1)
		return;
	
	var spacer = document.createElement('div');
	var item1 = this.childNodes[index1];
	var item2 = this.childNodes[index2];
	this.replaceChild(spacer, item1);
	this.replaceChild(item1, item2);
	this.replaceChild(item2, spacer);
}

HTMLElement.prototype.moveChild = function(from, to) {
	if (to == from)
		return;
	
	var item = this.childNodes[from];
	var before;
	if (to > from)
		before = this.childNodes[to + 1] || null;
	if (to < from)
		before = this.childNodes[to] || null;
	
	item.removeSelf();
	this.insertBefore(item, before);
}

NodeList.prototype.indexOf = function(node) {
	for (var i = 0; i < this.length; i++)
		if (this[i] == node)
			return i;
	
	return -1;
}


var varstyle = new function VariableStyles() {
	
	this.read = function(filename, callback) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', filename, false);
		
		xhr.onreadystatechange = function(e) {
			if (xhr.readyState == 4) 
				callback(xhr);
		}
		
		xhr.send(null);
	}
	
	this.parse = function(css, variables) {
		return css.replace(/<(.+?)>/g, function(unused, str) {
			var repl = 0;
			var parts = str.split(',');
			
			for (var i = 0; i < parts.length; i++) {
				var f = parseFloat(parts[i]);
				if (f == parts[i]) 
					repl += f;
				else 
					repl += variables[parts[i]];
			}
			return repl;
		});
	}
	
	this.addStyle = function(filename, variables) {
		var self = this;
		this.read(filename, function(xhr) {
			if (!xhr.responseText) {
				opera.postError('Could not load ' + filename);
				return;
			}

			var style = document.createElement('style');
			style.textContent = self.parse(xhr.responseText, variables);
			document.head.appendChild(style);
			
		});
		
	}
	
}



var tabs = new function TabList() {
	this.animLength = 200;
	this.resizeDelay = 100;
	this.disableLength = 1200;
	this.compact = settings.get('compact') || false;
	this.tooltips = settings.get('tooltips') || false;
	this.verboseTips = settings.get('verbose_tab_tips') || false;
	this.keepExpanded = settings.get('keep_groups_open') || false;
	this.saveToTop = settings.get('save_to_top') || false;
	this.groupToTop = settings.get('group_to_top') || false;
	this.allowOpen = true;

	this.tabs = [];
	this.el = null;
	
	this.ontrash = null;
	this.ongroupexpand = null;
	
	this.disableOpen = function(time) {
		debug('disabling open');
		this.allowOpen = false;
		setTimeout(function() {tabs.allowOpen = true}, time || tabs.disableLength);
	}
	
	this.attachTab = function(tab, nodomchange, nopush) {
		if (!nopush)
			this.tabs.push(tab);
		tab.parent = this;
		
		tab.ondelete = function(e) {
			var index = tabs.tabs.indexOf(e.source);
			if (index == -1)
				throw new Error('Cannot remove tab. Tab is not in list.');
			debug('removing tab ' + index);
			tabs.remove(index);
		}
		
		if (!nodomchange)
			this.el.appendChild(tab.el);
	}
	
	this.attachGroup = function(group, nodomchange, nopush) {
		this.attachTab(group, nodomchange, nopush);
		
		group.ontrash = function(e) {
			if (tabs.ontrash)
				tabs.ontrash(e);
		}
	
		group.onexpand = function(e) {
			if (tabs.ongroupexpand)
				tabs.ongroupexpand(e);
		}
	}
	
	this.add = function(tab) {
		this.attachTab(tab);
		storage.tabs.add(tab.info);
	}
	
	this.swap = function(index1, index2, nodomchange) {
		if (index1 >= this.tabs.length)
			throw new Error('index1 out of bounds: ' + index1 + ' >= ' + this.tabs.length);
		if (index2 >= this.tabs.length)
			throw new Error('index2 out of bounds: ' + index2 + ' >= ' + this.tabs.length);

		var tab1 = this.tabs[index1];
		var tab2 = this.tabs[index2];
		this.tabs[index2] = tab1;
		this.tabs[index1] = tab2;
		if (!nodomchange)
			this.el.swapChildren(index1, index2);
		storage.tabs.swap(index1, index2);
	}

	this.move = function(from, to, nodomchange) {
		if (from >= this.tabs.length)
			throw new Error('from index out of bounds: ' + from + ' >= ' + this.tabs.length);
		if (to >= this.tabs.length)
			throw new Error('to index out of bounds: ' + to + ' >= ' + this.tabs.length);

		var dir = Math.sign(to - from);
		for (var i = from; i != to; i += dir) 
			this.swap(i, i + dir, true);
		
		if (!nodomchange)
			this.el.moveChild(from, to);
	}
	
	this.remove = function(index, notrash, nodomchange) {
		if (index >= this.tabs.length) 
			throw new Error('index out of bounds: ' + index + ' >= ' + this.tabs.length);
		
		var tab = this.tabs[index];
		if (tab instanceof TabGroup) {
			debug('remove tabgroup ' + index);
			if (tab.tabs.length > 0)
				tab.removeSelf(nodomchange);
			else {
				debug('group is empty. deleting');
				this.tabs.splice(index, 1);
				this.el.childNodes[index].removeSelf();
				storage.trashTab(index);
			}
		}
		else {
			var info = this.tabs[index].info;
			this.tabs.splice(index, 1);
			
			if (!nodomchange)
				this.el.childNodes[index].removeSelf();
			
			if (!notrash) {
				if (!(tab instanceof TabGroup)) {
					storage.trashTab(index);
					trash.attachTab(new Trash(info));
				}

				if (this.ontrash)
					this.ontrash({group: false});
			}
		}
	}
	
	this.makeGroup = function(index, title) {
		var g = storage.tabs.makeGroup(index, title);
		
		debug('making group ' + index + ' ' + this.tabs[index].constructor.name);
		if (this.tabs[index].constructor.name == 'TabGroup')
			debug(this.tabs);
		
		var newGroup = new TabGroup(storage.tabs.get(index));
		newGroup.attachTab(new Tab(storage.tabs.get(0, g)));
		
		var temp = this.tabs[index];
		this.tabs[index] = newGroup;
		this.attachGroup(newGroup, true, true);
		
		this.el.replaceChild(newGroup.el, temp.el);
		
		return newGroup;
	}
	
	this.getIndex = function(tab) {
		return this.tabs.indexOf(tab);
	}
	
	this.getTab = function(index, group) {
		var g = tabs.getGroup(group);
		if (g)
			return g.tabs[index];
		else
			return null;
	}
	
	this.getGroup = function(group) {
		for (var i = 0; i < tabs.tabs.length; i++) {
			var t = tabs.tabs[i];
			if (t instanceof TabGroup && t.group == group)
				return t;
		}
		return null;
	}
	
	this.init = function(listEl) {
		this.el = listEl;
	}
	
	
	this.getTabFromNode = function(node) {
		if (!node)
			return null;
		
		while (node.tabInfo === undefined) {
			if (!node.parentNode)
				return null;
			node = node.parentNode;
		}
		
		return node.tabInfo;
	}
}


var trash = new function TrashList() {
	
	this.tabs = [];
	this.el = null;
	
	this.onrestore = null;
	
	this.attachTab = function(tab) {
		this.tabs.push(tab);
		tab.onclick = function(e) {
			var index = trash.tabs.indexOf(e.source);
			if (index == -1)
				throw new Error('Cannot restore tab. Tab is not in trash.');
			trash.restoreTab(index);
		}
		
		this.el.appendChild(tab.el);
	}
	
	this.restoreTab = function(index) {
		if (index >= this.tabs.length) 
			throw new Error('index out of bounds: ' + index + ' >= ' + this.tabs.length);
		
		var info = this.tabs[index].info;
		this.tabs.splice(index, 1);
		this.el.childNodes[index].removeSelf();
		storage.restoreTab(index);
		tabs.attachTab(new Tab(info));
		
		if (this.onrestore)
			this.onrestore();
	}
	
	this.remove = function(index) {
		storage.trash.remove(index);
		this.tabs.splice(index, 1);
		this.el.childNodes[index].removeSelf();
	}
	
	this.clear = function() {
		storage.trash.clear();
		this.tabs = [];
		while (this.el.childNodes.length > 0)
			this.el.childNodes[0].removeSelf();
	}
	
	this.getIndex = function(tab) {
		return this.tabs.indexOf(tab);
	}

	this.init = function(listEl) {
		this.el = listEl;
	}
}



function Tab(info) {
	var self = this;
	
	this.parent = null;
	this.info = info || {};
	
	this.dom = {
		container: null,
		icon: null,
		title: null,
		url: null,
		close: null,
	}
	
	this.__defineGetter__('title', function() {return this.info.title});
	this.__defineSetter__('title', function(value) {this.info.title = value});
	
	this.__defineGetter__('url', function() {return this.info.url});
	this.__defineSetter__('url', function(value) {this.info.url = value});
	
	this.__defineGetter__('icon', function() {return this.info.icon});
	this.__defineSetter__('icon', function(value) {this.info.icon = value});
	
	this.__defineGetter__('el', function() {return this.dom.container});
	
	this.ondelete = null;
	
	
	this.update = function(info) {
		if (typeof info != 'undefined') {
			this.title = info.title || this.title;
			this.url = info.url || this.url;
			this.icon = info.icon || this.icon;
		}
		
		// update title/url
		this.dom.title.textContent = this.title;
		if (tabs.compact) {
			if (tabs.verboseTips)
				this.dom.container.title = this.title + '  ' + this.url;
			else
				this.dom.container.title = this.url;
		}
		else {
			this.dom.title.title = this.title;
			this.dom.url.textContent = this.url;
			this.dom.url.title = this.url;
		}
		
		// update icon
		if (this.icon) {
			if (this.dom.icon.src != this.icon)
				this.dom.icon.src = this.icon;
		} 
		else 
			invalidIcon();
	}
	
	this.open = function(background, trash) {
		if (trash)
			this.trash();
		
		opera.extension.postMessage({
			action: 'open_tab',
			url: this.url,
			focused: !background
		});
	}
	
	this.openCurrent = function(trash) {
		if (trash)
			this.trash();
		
		opera.extension.postMessage({
			action: 'change_tab',
			url: this.url
		});
	}
	
	this.trash = function() {
		var index = this.parent.getIndex(this);
		
		if (index == -1)
			throw new Error('Cannot remove tab. Tab is not in parent list.');
		this.parent.remove(index);
	}
	
	this.setTitle = function(newTitle) {
		self.title = newTitle;
		self.dom.title.textContent = self.title;
		
		var i = self.parent.getIndex(self);
		var g = (self.parent instanceof TabGroup) ? self.parent.group : 0;
		var data = storage.tabs.get(i, g);
		data.title = self.title;
		storage.tabs.set(i, data, g);
	}
	
	this.startRename = function() {
		self.dom.title.title = '';
		self.dom.close.title = ''
		self.dom.container.addClass('rename');
	}
	
	this.endRename = function() {
		self.update(self.info);
		self.dom.container.removeClass('rename');
		if (tabs.tooltips) {
			self.dom.close.title = il8n.get('TabDeleteTip');
		}
	}
	
	this.rename = function() {
		this._editabletitle.edit();
	}
	
	function invalidIcon() {
		self.dom.icon.src = '../img/page.png';
	}

	this.reloadIcon = function() {
		self.dom.icon.src = '../img/reloading.gif';
	}
	
	function build() {
		self.dom.container = dom.make('li', '.tab');
		self.dom.container.role = 'link';
		self.dom.icon = dom.make('img', '.icon');
		self.dom.title = dom.make('a', '.title');
		self.dom.url = dom.make('span', '.url');
		self.dom.close = dom.make('button', '.close');
		
		self.dom.icon.addEventListener('error', invalidIcon, false);
		
		if (tabs.compact) {
			self.dom.container.appendChildren([
				self.dom.icon,
				self.dom.title,
				self.dom.close
			]);
		}
		else {
			self.dom.container.addClass('full');
			var top = dom.make('span', '.top');
			var bot = dom.make('span', '.bot');
			top.appendChildren([ self.dom.icon, self.dom.title ]);
			bot.appendChildren([ self.dom.url, self.dom.close ]);
			self.dom.container.appendChildren([ top, bot ]);
		}
		
		if (tabs.tooltips) {
			self.dom.close.title = il8n.get('TabDeleteTip');
		}
		
		contextmenus.tab.attach(self.dom.container);
		
		self.update();
	}
	
	function attachEvents() {
		self.dom.close.addEventListener('click', function(e) {
			if (self.ondelete)
				self.ondelete({source: self});
			e.stopPropagation();
		}, true);
		
		self.dom.close.addEventListener('mousedown', function(e) {
			e.stopPropagation();
			e.preventDefault();
		}, true);
		
		new DraggableTab(self);
		self._editabletitle = new EditableTitle(
			self.dom.title, self.setTitle, null,
			self.startRename, self.endRename);
	}
	
	function init() {
		self.title = self.title || '';
		self.url = self.url || 'about:blank';
		self.icon = self.icon || null;
		
		build();
		attachEvents();
		
		self.el.tabInfo = self;
	}
	
	init();
}


function TabGroup(info) {
	var self = this;
	
	this.parent = null;
	this.info = info || {};
	this.tabs = [];
	
	this.dom = {
		container: null,
		top: null,
		title: null,
		collapse: null,
		edit: null,
		tabs: null,
	}
	
	this.__defineGetter__('title', function() {return this.info.title});
	this.__defineSetter__('title', function(value) {this.info.title = value});
	
	this.__defineGetter__('group', function() {return this.info.group});
	this.__defineSetter__('group', function(value) {this.info.group = value});
	
	this.__defineGetter__('el', function() {return this.dom.container});
	
	this.__defineGetter__('expanded', function() {return !this.el.hasClass('collapsed')});
	this.__defineGetter__('tabsize', function() {return this.expanded ? 1 + this.tabs.length : 1});
	
	this.ondelete = null;
	this.ontrash = null;
	this.onexpand = null;
	
	
	this.attachTab = function(tab, nodomchange) {
		this.tabs.push(tab);
		tab.parent = this;
		
		tab.ondelete = function(e) {
			var index = self.tabs.indexOf(e.source);
			if (index == -1)
				throw new Error('Cannot remove tab. Tab is not in group.');
			self.remove(index);
		}
		
		if (!nodomchange)
			this.dom.tabs.appendChild(tab.el);
	}
	
	this.add = function(tab) {
		this.attachTab(tab);
		storage.tabs.add(tab.info, this.group);
	}
	
	this.swap = function(index1, index2, nodomchange) {
		if (index1 >= this.tabs.length)
			throw new Error('index1 out of bounds: ' + index1 + ' >= ' + this.tabs.length);
		if (index2 >= this.tabs.length)
			throw new Error('index2 out of bounds: ' + index2 + ' >= ' + this.tabs.length);

		var tab1 = this.tabs[index1];
		var tab2 = this.tabs[index2];
		this.tabs[index2] = tab1;
		this.tabs[index1] = tab2;
		
		if (!nodomchange)
			this.dom.tabs.swapChildren(index1, index2);
		storage.tabs.swap(index1, index2, this.group);
	}

	this.move = function(from, to, nodomchange) {
		if (from >= this.tabs.length)
			throw new Error('from index out of bounds: ' + from + ' >= ' + this.tabs.length);
		if (to >= this.tabs.length)
			throw new Error('to index out of bounds: ' + to + ' >= ' + this.tabs.length);

		var dir = Math.sign(to - from);
		for (var i = from; i != to; i += dir) {
			this.swap(i, i + dir, this.group, true);
		}
		
		if (!nodomchange)
			this.dom.tabs.moveChild(from, to);
	}
	
	this.remove = function(index, notrash, nodomchange) {
		if (index >= self.tabs.length) 
			throw new Error('index out of bounds: ' + index + ' >= ' + self.tabs.length);
		
		var info = self.tabs[index].info;
		self.tabs.splice(index, 1);
		
		if (!nodomchange)
			self.dom.tabs.childNodes[index].removeSelf();
		
		if (!notrash) {
			storage.trashTab(index, self.group);
			trash.attachTab(new Trash(info));

			if (self.ontrash)
				self.ontrash({group: true});
			
			if (self.tabs.length == 0 && self.ondelete) 
				self.ondelete({source: self});
			else 
				self.updateHeight();
		}
		else if (!nodomchange)
			self.updateHeight();
	}

	this.removeSelf = function(notrash, nodomchange) {
	
		if (self.tabs.length == 0 && self.ondelete) {
			debug('removeself');
			self.ondelete({source: self});
		}
		
		while (self.tabs.length > 0)
			self.remove(0, notrash, nodomchange);
	}
	
	this.mergeGroup = function(otherGroup, toTop) {
		var i = 0;
		while (otherGroup.tabs.length > 0) {
			var tab = otherGroup.tabs[0];
			
			otherGroup.remove(0, true);
			storage.tabs.remove(0, otherGroup.group);
			self.add(tab);
			if (toTop) {
				self.move(self.tabs.length - 1, i++);
			}
		}
		
		otherGroup.removeSelf();
	}
	
	this.ungroup = function() {
		var index = tabs.getIndex(self);
		var size = self.tabs.length;
		while (self.tabs.length > 0) {
			var tab = self.tabs[0];
			
			self.remove(0, true);
			storage.tabs.remove(0, self.group);
			tabs.add(tab);
		}
		
		for (var i = 0; i < size; i++) {
			tabs.move(tabs.tabs.length - 1, index);
		}
		
		self.removeSelf();
	}
	
	this.getIndex = function(tab) {
		return self.tabs.indexOf(tab);
	}
	
	
	this.update = function(info) {
		if (typeof info != 'undefined') {
			self.title = info.title || self.title;
		}
		
		// update title/url
		this.dom.title.textContent = self.title;
	}
	
	this.expand = function() {
		self.el.removeClass('collapsed');
		self.dom.tabs.style.height = self.dom.tabs.scrollHeight + 'px';
		
		if (tabs.keepExpanded) {
			self.info.expand = true;
			storage.tabs.set(tabs.getIndex(self), self.info);
		}
		
		
		if (tabs.tooltips)
			self.dom.top.title = il8n.get('GroupCollapseTip');
		
		if (self.onexpand)
			self.onexpand({source: self, expanded: true});
	}
	
	this.collapse = function() {
		self.el.addClass('collapsed');
		self.dom.tabs.style.height = 0;
		
		if (tabs.keepExpanded) {
			delete self.info.expand;
			storage.tabs.set(tabs.getIndex(self), self.info);
		}
		
		if (tabs.tooltips)
			self.dom.top.title = il8n.get('GroupExpandTip');
		
		if (self.onexpand)
			self.onexpand({source: self, expanded: false});
	}

	this.toggleExpand = function() {
		if (!self.expanded)
			self.expand();
		else
			self.collapse();
	}
	
	this.updateHeight = function(instant) {
		if (!self.expanded)
			return;
		
		var count = self.dom.tabs.childNodes.length;
		var height = count ? self.dom.tabs.firstChild.offsetHeight : 0;
		//self.dom.tabs.style.height = self.tabs.length * self.tabs[0].el.offsetHeight;
		self.dom.tabs.style.height = (count * height) + 'px';
		setTimeout(function() {
			self.dom.tabs.style.height = self.dom.tabs.scrollHeight + 'px';
		}, instant ? 0 : tabs.animLength);
	}

	this.setTitle = function(newTitle) {
		self.title = newTitle;
		self.dom.title.textContent = self.title;
		
		var i = storage.tabs.getGroupIndex(self.group);
		var data = storage.tabs.get(i);
		data.title = self.title;
		storage.tabs.set(i, data);
	}
	
	this.hideTooltip = function() {
		self.dom.top.title = '';
	}
	
	this.showTooltip = function() {
		self.dom.top.title = il8n.get('GroupExpandTip');
	}
	
	
	this.open = function(background, trash) {
		// Open all tabs in this group and focus the first if !background
		for (var i = this.tabs.length - 1; i >= 0; i--) 
			this.tabs[i].open(background || i != 0, false);
	}
	
	this.openCurrent = function(trash) {
		this.open(false, trash);
	}
	
	this.trash = function() {
		var index = this.parent.getIndex(this);
		
		if (index == -1)
			throw new Error('Cannot remove tab. Tab is not in parent list.');
		this.parent.remove(index);
	}
	
	this.rename = function() {
		this._editabletitle.edit();
	}
	
	
	function build() {
		self.dom.container = dom.make('li', '.tabgroup .collapsed');
		self.dom.title = dom.make('span', '.title');
		self.dom.collapse = dom.make('button', '.collapse');
		self.dom.edit = dom.make('button', '.edit');
		self.dom.tabs = dom.make('ul');
		
		self.dom.top = dom.make('a', '.top');
		self.dom.top.appendChildren([
			self.dom.collapse,
			self.dom.title,
			self.dom.edit,
		]);

		self.dom.container.appendChildren([
			self.dom.top,
			self.dom.tabs,
		]);
		
		if (tabs.tooltips) {
			self.dom.top.title = il8n.get('GroupExpandTip');
			self.dom.edit.title = il8n.get('GroupNameTip');
		}
		contextmenus.group.attach(self.dom.top);
		
		self.update();
	}
	
	function attachEvents() {

		new DraggableTab(self);
		self._editabletitle = new EditableTitle(
			self.dom.title, self.setTitle, self.dom.edit,
			self.hideTooltip, self.showTooltip);
	}
	
	function init() {
		self.title = self.title || 'Group';
		
		build();
		attachEvents();
		
		self.el.tabInfo = self;
		
		if (tabs.keepExpanded && self.info.expand) {
			self.dom.tabs.style.OTransitionProperty = 'none';
			self.expand();
			self.updateHeight(true);
			setTimeout(function() {
				self.dom.tabs.style.OTransitionProperty = null;
			}, 500);
		}
	}
	
	init();
}


function Trash(info) {
	var self = this;
	
	this.info = info || {};
	
	this.dom = {
		container: null,
		icon: null,
		title: null,
	}
	
	this.__defineGetter__('title', function() {return this.info.title});
	this.__defineSetter__('title', function(value) {this.info.title = value});
	
	this.__defineGetter__('url', function() {return this.info.url});
	this.__defineSetter__('url', function(value) {this.info.url = value});
	
	this.__defineGetter__('icon', function() {return this.info.icon});
	this.__defineSetter__('icon', function(value) {this.info.icon = value});
	
	this.__defineGetter__('el', function() {return this.dom.container});
	
	this.onclick = null;
	
	this.update = function(info) {
		if (typeof info != 'undefined') {
			this.title = info.title || this.title;
			this.url = info.url || this.url;
			this.icon = info.icon || this.icon;
		}
		
		// update title/url
		this.dom.title.textContent = this.title;
		this.dom.container.title = this.url;
		
		if (tabs.tooltips)
			this.dom.container.title = il8n.get('TrashRestoreTip') + '  ' + this.dom.container.title;
		
		// update icon
		if (this.icon) 
			this.dom.icon.src = this.icon;
		else 
			invalidIcon();
		
	}
	
	function invalidIcon() {
		self.dom.icon.src = '../img/page.png';
	}
	
	function build() {
		self.dom.container = dom.make('li', '.tab .trash .compact');
		self.dom.icon = dom.make('img', '.icon');
		self.dom.title = dom.make('span', '.title');
		
		self.dom.icon.addEventListener('error', invalidIcon, false);

		self.dom.container.appendChildren([
			self.dom.icon,
			self.dom.title
		]);
		
		contextmenus.trash.attach(self.dom.container);
		
		self.update();
	}
	
	function attachEvents() {
		self.dom.container.addEventListener('click', function() {
			if (self.onclick)
				self.onclick({source: self});
		}, false);
	}

	function init() {
		self.title = self.title || '';
		self.url = self.url || 'about:blank';
		self.icon = self.icon || null;
		
		build();
		attachEvents();
		
		self.el.tabInfo = self;
	}
	
	init();
}


function EditableTitle(titlespan, callback, triggerarea, startCallback, endCallback) {
	var self = this;
	var editing = false;
	var textbox;
	var oldTitle;
	
	this.edit = function() {
		if (editing)
			return;
		
		if (triggerarea) {
			triggerarea.addClass('apply');
			oldTitle = triggerarea.title;
			triggerarea.title = il8n.get('GroupNameTip2');
		}
		
		if (startCallback)
			startCallback();
		
		textbox = dom.make('input', '.title [type=text]');
		textbox.value = titlespan.textContent;
		
		textbox.addEventListener('mousedown', function(e) {
			e.stopPropagation();
		}, true);
		
		textbox.addEventListener('keypress', function(e) {
			if (e.keyCode == 13) {
				self.apply();
				e.preventDefault();
			}
		}, false);
		
		titlespan.parentNode.replaceChild(textbox, titlespan);
		
		addEventListener('mousedown', mouseDownOutside, true);
		addEventListener('click', clickOutside, true);
		editing = true;
		
		textbox.focus();
		textbox.select();
	}
	
	this.apply = function() {
		if (!editing)
			return;
		
		if (triggerarea) {
			triggerarea.removeClass('apply');
			triggerarea.title = oldTitle;
		}
	
		if (endCallback)
			endCallback();
		
		callback(textbox.value);
		
		textbox.parentNode.replaceChild(titlespan, textbox);
		
		removeEventListener('mousedown', mouseDownOutside, true);
		removeEventListener('click', clickOutside, true);
		editing = false;
		textbox = null;
	}
	
	function mouseDownOutside(e) {
		if (e.target == textbox)
			return;
		
		e.stopPropagation();
	}
	
	function clickOutside(e) {
		if (e.target == textbox)
			return;
		
		self.apply();
		e.stopPropagation();
	}
	
	function init() {
		
		if (triggerarea) {
			triggerarea.addEventListener('click', function(e) {
				if (!editing)
					self.edit();
				else
					self.apply();
			}, false);

			triggerarea.addEventListener('mousedown', function(e) {
				e.stopPropagation();
				e.preventDefault();
			}, true);
		}
	}
	
	init();
}