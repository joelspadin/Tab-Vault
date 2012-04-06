opera.extension.il8n = new function Localization() {
	this.strings = {};
	
	this.get = function(item, nullIfMissing) {
		return this.strings[item] || (nullIfMissing ? null : this.missingText(item));
	}

	this.missingText = function(item) {
		return 'loc:' + item;
	}
	
	this.translate = function(node) {
		var key = node.getAttribute('data-loc');
		var title = node.getAttribute('data-loctitle');
		var placeholder = node.getAttribute('data-locplaceholder');
		
		if (key) {
			var text;
			if (text = this.get(key, true)) 
				node.innerHTML = text;
			else {
				node.innerHTML = this.missingText(key);
				node.classList.add('loc-missing');
			}
		}
		
		if (title) {
			var text;
			if (text = this.get(title, true)) 
				node.title = text;
			else {
				node.title = this.missingText(title);
				node.classList.add('loc-missing');
			}
		}
		
		if (placeholder) {
			var text;
			if (text = this.get(placeholder, true))
				node.setAttribute('placeholder', text);
			else {
				node.setAttribute('placholder', this.missingText(placeholder));
				node.classList.add('loc-missing');
			}
		}
	}
	
	this.translatePage = function(noTitle) {
		var sel = '[data-loc], [data-locplaceholder]' + (noTitle ? '' : ', [data-loctitle]');
		var nodes = document.querySelectorAll(sel);
		for (var i = 0; i < nodes.length; i++)
			this.translate(nodes[i]);
	}


	this.loadLocaleScript = function(file) {
		var locale = settings.locale;
		if (!locale)
			return;
		
		var s = document.createElement('script');
		s.src = '/locales/' + locale + '/' + file;
		document.head.appendChild(s);
	}

	this.loadLocaleStyle = function(file) {
		var locale = settings.locale;
		if (!locale)
			return;
		
		var l = document.createElement('link');
		l.rel = 'stylesheet';
		l.href = '/locales/' + locale + '/' + file;
		document.head.appendChild(l);
	}
	
	this.getLocalePath = function(path, loc) {
		var locale = loc || settings.locale;
		if (!locale)
			return path;
		else {
			path = path.replace(/widget:\/\/wuid[a-z0-9-]+\//, '');
			path = path.replace(/locales\/[a-zA-Z-]+\//, '');
			
			return '/locales/' + locale + '/' + path;
		}
	}

	this.localizeLinks = function(selector) {
		var locale = settings.get('locale');
		if (!locale)
			return;
		
		var links = document.querySelector(selector);
		
		for (var i = 0; i < links.length; i++) {
			links[i].href = il8n.getLocalePath(links[i].href, locale);
		}
	}
	
}


window.il8n = opera.extension.il8n;

function _(item) {
	return il8n.get(item);
}