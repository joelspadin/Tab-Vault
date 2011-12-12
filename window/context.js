/**
 * Context menus derived from code by Juriy Zaytsev
 * http://thinkweb2.com/projects/prototype/
 */

var mb = {
	left: 0,
	center: 1,
	right: 2,
}

function ContextMenu(options) {
	var self = this;
	var swallowClick = false;
	
	this.initialize = function(options) {
		var empty = function() {};
		options = options || {};
		
		options.className = options.className || 'contextmenu';
		if (options.pageOffset === undefined)
			options.pageOffset = 4;
		if (options.zIndex === undefined)
			options.zIndex = 90;
		options.beforeShow = options.beforeShow || empty;
		options.afterShow = options.afterShow || empty;
		options.beforeHide = options.beforeHide || empty;
		options.beforeSelect = options.beforeSelect || empty;
		
		this.options = options;
		
		this.container = document.createElement('div');
		this.container.className = this.options.className;
		this.container.style = 'display:none; position:absolute';
		this.container.cxmenu = this;
		if (options.id)
			this.container.id = options.id;
		
		var list = document.createElement('ul');

		this.options.menuItems.forEach(function(item) {
			var el = document.createElement('li');
			el.className = item.className || '';
			
			if (item.id)
				el.id = item.id;
			
			if (item.separator)
				el.className = 'separator';
			else {
				var a = document.createElement('a');
				a.textContent = item.name;
				a.href = '#';
				a._callback = item.callback;
				a.addEventListener('click', this.onClick, false);				
				el.appendChild(a);
			}
			
			list.appendChild(el)
		}, this);
		
		this.container.appendChild(list);
		
		document.body.appendChild(this.container);
		
		window.addEventListener('click', function(e) {
			if (swallowClick) {
				swallowClick = false;
				stopEvent(e);
			}
		}, true);
		
		window.addEventListener('mousedown', new RightClickShim(hideHandler, true), true);
		
		window.addEventListener('mousedown', function(e) {
			if (self.container.style.display != 'none' && e.button != mb.right) {
				stopEvent(e);
			}
		}, true);
		
		if (this.options.selector) {
			var parents = document.querySelectorAll(this.options.selector);
			for (var i = 0; i < parents.length; i++) {
				this.attach(parents[i]);
			}
		}
	}
	
	this.attach = function(element) {
		element.addEventListener('mousedown', clickEventShim, false);
		element.addEventListener('contextmenu', stopEvent, false);
	}
	
	this.detach = function(element) {
		element.removeEventListener('mousedown', clickEventShim, true);
		element.removeEventListener('contextmenu', stopEvent, false);
	}
	
	this.show = function(e) {
		stopEvent(e);
		this.options.beforeShow(e);
		
		var x = e.pageX;
		var y = e.pageY;
		var vpDim = {
			width: window.innerWidth,
			height: window.innerHeight
		}
		
		var vpOff = {
			left: window.scrollX,
			top: window.scrollY
		}
		
		// Hide "Create Group" action if the tab is already in a group
		var tab = tabs.getTabFromNode(e.target);
		if (tab && tab.parent != tabs) 
			this.container.classList.add('ingroup');
		else
			this.container.classList.remove('ingroup');
		
		this.container.style.display = 'block';
		var elDim = {
			width: this.container.offsetWidth,
			height: this.container.offsetHeight
		};
		
		var elOff = {
			left: ((x + elDim.width + this.options.pageOffset) > vpDim.width 
				? (vpDim.width - elDim.width - this.options.pageOffset) : x),
			top: ((y - vpOff.top + elDim.height) > vpDim.height /*&& (y - vpOff.top) > elDim.height */
				? (y - elDim.height) : y)
		};
		
		if (elOff.top < 0)
			elOff.top = 0;
		
		this.container.style.left = elOff.left + 'px';
		this.container.style.top = elOff.top + 'px';
		this.container.style.zIndex = this.options.zIndex;
		
		this.event = e;
		this.options.afterShow(e);
	}
	
	this.onClick = function(e) {
		stopEvent(e);
		if (e.target._callback) {
			self.options.beforeSelect(e);
			self.container.style.display = 'none';
			e.target._callback(self.event);
		}
	}
	
	function clickEvent(e) {
		if (e.button != mb.right)
				return;
		self.show(e);
		debug('show cx menu');
	}

	var clickEventShim = new RightClickShim(clickEvent);
	
	function hideHandler(e) {
			if (e.button == mb.left && isMouseInside(e))
			return;
		
		if (self.container.style.display != 'none') {
			debug('hide cx menu');
			self.options.beforeHide(e);
			self.container.style.display = 'none';
			stopEvent(e);
			
			swallowClick = true;
			window.setTimeout(function() {
				swallowClick = false;
			}, 100);
		}
	}
	
	function stopEvent(e) {
		e.stopPropagation();
		e.preventDefault();
	}

	function isMouseInside(e) {
		var m = {x: e.pageX, y: e.pageY};
		var bounds = {
			x: parseInt(self.container.style.left),
			y: parseInt(self.container.style.top),
			width: self.container.offsetWidth,
			height: self.container.offsetHeight,
		}

		return dom.testBounds(m, bounds);
	}
	
	this.initialize(options);
}


function RightClickShim(eventhandler, allowLeft) {
	var x, y, self = this;
	
	this.mousedown = function(e) {
		if (!allowLeft && e.button != mb.right)
			return;
		
		x = e.pageX;
		y = e.pageY;
		
		window.addEventListener('mouseup', self.mouseup, false);
	}
	
	this.mouseup = function(e) {
		if ((allowLeft || e.button == mb.right) && x == e.pageX && y == e.pageY) {
			eventhandler(e);
		}
		
		window.removeEventListener('mouseup', self.mouseup, false);
	}

	return this.mousedown;
}


var contextmenus = new function ContextMenuList() {
	var empty = function() {};

	this.style = '';
	this.callbacks = {
		open: empty,
		openBackground: empty,
		openAndTrash: empty,
		openBackgroundAndTrash: empty,
		trash: empty,
		createGroup: empty,
		ungroup: empty,
		rename: empty,
		reloadIcon: empty,
		
		save: empty,
		saveAsGroup: empty,
		saveWindow: empty,
		saveAll: empty,
		saveDomain: empty,
		saveToGroup: empty,
		
		restoreTrash: empty,
		permanentDelete: empty,
	}
}

contextmenus.init = function() {

	var className = 'cxmenu';
	var style = contextmenus.style = settings.get('cxmstyle');
	
	if (style)
		className += ' ' + style;
	
	contextmenus.tab = new ContextMenu({
		id: 'cxmenu_tab',
		className: className,
		menuItems: [
			{
				name: _('CxOpen'),
				className: 'open',
				callback: function(e) {contextmenus.callbacks.open(e)}
			},
			{
				name: _('CxOpenBackground'),
				callback: function(e) {contextmenus.callbacks.openBackground(e)}
			},
			{
				name: _('CxOpenAndDelete'),
				callback: function(e) {contextmenus.callbacks.openAndTrash(e)}
			},
			{
				name: _('CxOpenBkgAndDelete'),
				callback: function(e) {contextmenus.callbacks.openBackgroundAndTrash(e)}
			},
			{
				separator: true
			},
			{
				name: _('CxCreateGroup'),
				className: 'group creategroup',
				callback: function(e) {contextmenus.callbacks.createGroup(e)}
			},
			{
				name: _('CxCopyUrl'),
				className: 'copy',
				id: 'cx_copy_url',
				callback: function() {},
			},
			{
				name: _('CxReloadIcon'),
				className: 'icon',
				callback: function(e) {contextmenus.callbacks.reloadIcon(e)}
			},
			{
				name: _('CxRename'),
				className: 'rename',
				callback: function(e) {contextmenus.callbacks.rename(e)}
			},
			{
				separator: true
			},
			{
				name: _('CxDelete'),
				className: 'delete',
				callback: function(e) {contextmenus.callbacks.trash(e)}
			}
		],
		afterShow: showClipboard,
	});


	contextmenus.group = new ContextMenu({
		id: 'cxmenu_group',
		className: className,
		menuItems: [
			{
				name: _('CxOpenAll'),
				className: 'open',
				callback: function(e) {contextmenus.callbacks.open(e)}
			},
			{
				name: _('CxOpenAllBackground'),
				callback: function(e) {contextmenus.callbacks.openBackground(e)}
			},
			{
				separator: true
			},
			{
				name: _('CxSaveToGroup'),
				callback: function(e) {contextmenus.callbacks.saveToGroup(e)}
			},
			{
				name: _('CxUngroup'),
				className: 'ungroup',
				callback: function(e) {contextmenus.callbacks.ungroup(e)}
			},
			{
				name: _('CxRename'),
				className: 'rename',
				callback: function(e) {contextmenus.callbacks.rename(e)}
			},
			{
				separator: true
			},
			{
				name: _('CxDelete'),
				className: 'delete',
				callback: function(e) {contextmenus.callbacks.trash(e)}
			}
		]
	});

	contextmenus.save = new ContextMenu({
		id: 'cxmenu_save',
		className: className,
		selector: '#save-tab',
		menuItems: [
			{
				name: _('CxSaveCurrent'),
				className: 'save',
				callback: function(e) {debug('yes');
					contextmenus.callbacks.save(e)}
			},
			{
				name: _('CxSaveAsGroup'),
				callback: function(e) {contextmenus.callbacks.saveAsGroup(e)}
			},
			{
				separator: true
			},
			{
				name: _('CxSaveAll'),
				callback: function(e) {contextmenus.callbacks.saveAll(e)}
			},
			{
				name: _('CxSaveWindow'),
				callback: function(e) {contextmenus.callbacks.saveWindow(e)}
			},
			{
				name: _('CxSaveDomain'),
				callback: function(e) {contextmenus.callbacks.saveDomain(e)}
			},
		]
	});

	contextmenus.trash = new ContextMenu({
		id: 'cxmenu_id',
		className: className,
		menuItems: [
			{
				name: _('CxRestore'),
				className: 'open',
				callback: function(e) {contextmenus.callbacks.restoreTrash(e)}
			},
			{
				name: _('CxDeletePerm'),
				className: 'delete',
				callback: function(e) {contextmenus.callbacks.permanentDelete(e)}
			},
		]
	});


	contextmenus.callbacks.save = function() {
		opera.extension.postMessage({action: 'get_tab'});
	}
	
	contextmenus.callbacks.saveAsGroup = function() {
		window.saveToGroup = -1;
		opera.extension.postMessage({action: 'get_tab'});
	}
	
	contextmenus.callbacks.saveToGroup = function(e) {
		var tab = tabs.getTabFromNode(e.target);
		if (tab instanceof TabGroup) {
			window.saveToGroup = tab.group;
			opera.extension.postMessage({action: 'get_tab'});
		}		
	}

	contextmenus.callbacks.saveAll = function() {
		opera.extension.postMessage({action: 'get_all'});
	}
	
	contextmenus.callbacks.saveWindow = function() {
		opera.extension.postMessage({action: 'get_window'});
	}
	
	contextmenus.callbacks.saveDomain = function() {
		opera.extension.postMessage({action: 'get_domain'});
	}
	
	
	contextmenus.callbacks.open = function(e) {
		var tab = tabs.getTabFromNode(e.target);
		tab.open(false, false);
	}
	
	contextmenus.callbacks.openBackground = function(e) {
		var tab = tabs.getTabFromNode(e.target);
		tab.open(true, false);
	}
	
	contextmenus.callbacks.openAndTrash = function(e) {
		var tab = tabs.getTabFromNode(e.target);
		tab.open(false, true);
		opera.extension.postMessage({ action: 'recount' })
	}
	
	contextmenus.callbacks.openBackgroundAndTrash = function(e) {
		var tab = tabs.getTabFromNode(e.target);
		tab.open(true, true);
		opera.extension.postMessage({ action: 'recount' })
	}
	
	contextmenus.callbacks.trash = function(e) {
		var tab = tabs.getTabFromNode(e.target);
		if (tab instanceof TabGroup)
			tab.collapse();
		
		if (tab.ondelete) {
			tab.ondelete({source: tab});
		}
	}
	
	contextmenus.callbacks.createGroup = function(e) {
		var tab = tabs.getTabFromNode(e.target);
		if (tab instanceof Tab) {
			var index = tabs.getIndex(tab);
			tabs.makeGroup(index, tab.title);
		}
	}
	
	contextmenus.callbacks.ungroup = function(e) {
		var tab = tabs.getTabFromNode(e.target);
		if (tab instanceof TabGroup)
			tab.ungroup();
	}
	
	contextmenus.callbacks.rename = function(e) {
		var tab = tabs.getTabFromNode(e.target);
		tab.rename();
	}
	
	contextmenus.callbacks.reloadIcon = function(e) {
		var tab = tabs.getTabFromNode(e.target);
		if (tab instanceof Tab) {
			var index = tab.parent.getIndex(tab);
			var group = tab.parent.group || 0;
			opera.extension.postMessage({
				action: 'reload_icon',
				index: index,
				group: group,
			});
			tab.reloadIcon();
		}
	}
	
	contextmenus.callbacks.restoreTrash = function(e) {
		var tab = tabs.getTabFromNode(e.target);
		if (tab instanceof Trash) {
			var index = trash.getIndex(tab);
			trash.restoreTab(index);
		}
	}
	
	contextmenus.callbacks.permanentDelete = function(e) {
		var tab = tabs.getTabFromNode(e.target);
		if (tab instanceof Trash) {
			var index = trash.getIndex(tab);
			trash.remove(index);
		}
	}
}


var clipboard = new ZeroClipboard.Client();
clipboard.glued = false;

function showClipboard(e) {
	var tab = tabs.getTabFromNode(e.target);
	if (tab instanceof Tab) {
		if (!clipboard.glued)
			clipboard.glue('cx_copy_url');
		else
			clipboard.show();
		
		clipboard.setText(tab.url);
	}
}

clipboard.addEventListener('complete', function(client, text) {
	$('#cxmenu_tab').style.display = 'none';
	clipboard.hide();
})
