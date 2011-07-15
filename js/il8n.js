

opera.extension.il8n = new function Localization() {
	
	this.strings = {};
	
	
	this.get = function(item, defaultValue) {
		var temp = this.strings[item];
		if (!temp)
			opera.postError('Tab Vault Localization: No text for "' + item + '"');
		return temp || defaultValue || null;
	}
	
	this.queryNode = function(id) {
		var type = id.substr(0,4);
		if (type == 'loc:')
			return document.querySelector('[data-loc="' + id.substr(4) + '"]');
		else if (type == 'lbl:')
			return document.querySelector('label[for="' + id.substr(4) + '"]');
		else
			return document.getElementById(id);
	}
	
	this.translateNode = function(node, text, dest) {
		dest = dest || 'text';
		
		if (dest == 'text')
			node.textContent = text;
		else if (dest == 'html')
			node.innerHTML = text;
		else if (dest == 'title')
			node.title = text;
		else if (dest == 'placeholder')
			node.setAttribute('placeholder', text);
	}
	
	this.translate = function(id, item, dest) {
		var text = this.get(item);
		if (text === null)
			return;
		
		var node = il8n.queryNode(id);
		
		if (!node) {
			opera.postError('Tab Vault Localization: No node for "' + id + '"');
			return;
		}
		
		this.translateNode(node, text, dest);		
	}
	
	this.translateAll = function(selector, item, dest) {
		var text = this.get(item);
		if (text === null)
			return;
		
		var nodes = document.querySelectorAll(selector);
		for (var i = 0; i < nodes.length; i++) {
			this.translateNode(nodes[i], text, dest);
		}
	}

	this.translatePage = function(items, defaultDest) {
		for (var i = 0; i < items.length; i++) {
			this.translate(items[i][0], items[i][1], items[i][2] || defaultDest);
		}
	}
	
	
	this.loadLocaleScript = function(file) {
		var locale = settings.get('locale');
		if (!locale)
			return;
		
		var s = document.createElement('script');
		s.src = '/locales/' + locale + '/' + file;
		document.head.appendChild(s);
	}

	this.loadLocaleStyle = function(file) {
		var locale = settings.get('locale');
		if (!locale)
			return;
		
		var l = document.createElement('link');
		l.rel = 'stylesheet';
		l.href = '/locales/' + locale + '/' + file;
		document.head.appendChild(l);
	}
	
	this.getLocalePath = function(path, loc) {
		var locale = loc || settings.get('locale');
		if (!locale)
			return path;
		else {
			path = path.replace(/widget:\/\/wuid[a-z0-9-]+\//, '');
			path = path.replace(/locales\/[a-zA-Z-]+\//, '');
			
			return '/locales/' + locale + '/' + path;
		}
	}

	this.localizeLinks = function(links) {
		var locale = settings.get('locale');
		if (!locale)
			return;
		
		if (links.length === undefined)
			links = [ links ];
		
		for (var i = 0; i < links.length; i++) {
			var a = links[i];
			if (!(a instanceof HTMLElement))
				a = il8n.queryNode(a)
			a.href = il8n.getLocalePath(a.href, locale);
		}
	}
}



window.il8n = opera.extension.il8n;

function _(item) {
	return il8n.get(item);
}