
// Utility functions to manipulate the DOM
var dom = new function DomUtils() {
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
	
	// Sets the value of a <select> element
	this.setOption = function(select, value) {
		for (var i = 0; i < select.options.length; i++) {
			if (select.options[i].value == value) {
				select.selectedIndex = i;
				return true;
			}
		}
		return false;
	}

	// Gets the checked value of a set of radio boxes
	this.getRadioValue = function(element) {
		var name = element.name;
		var inputs = element.form.elements[name];
		for (var i = 0; i < inputs.length; i++) {
			if (inputs[i].checked)
				return inputs[i].value;
		}
		return null;
	}
	
	
	
	
	// Makes placeholder attributes for textarea elements work
	this.fixPlaceholders = function() {
		if ('placeholder' in document.createElement('textarea'))
			return;
		
		var textareas = document.querySelectorAll('textarea[placeholder]');
		for (var i = 0; i < textareas.length; i++) 
			new PlaceholderShim(textareas[i]);
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



// Builds a collapsible element
function Collapsible(el) {
	
	var width = el.offsetWidth;
	var resizeTimeout = false;
	
	function setHeight() {
		el.style.height = el.scrollHeight + 'px';
	}

	setHeight();
	el.addClass('collapsible');
	el.addClass('init');
	
	el.expand = function() {
		setHeight();
		el.removeClass('collapsed');
	}
	
	el.collapse = function() {
		el.addClass('collapsed');
	}
	
	window.setTimeout(function() {
		el.removeClass('init');
	}, 1);
	
	window.addEventListener('resize', function() {
		if (el.offsetWidth == width || resizeTimeout)
			return;
		
		width = el.offsetWidth;
		el.style.height = 'auto';
		el.addClass('resize');
		resizeTimeout = true;
		window.setTimeout(function() {
			el.removeClass('resize');
			setHeight();
			resizeTimeout = false;
		}, 500);
		
	}, false);
}

// Builds a button that collapses its next sibling
function Expander(element, childElement) {
	var child = childElement || element.nextElementSibling;
	
	element.expandNode = child;
	element.addClass('expander');
	
	element.toggle = function() {
		if (element.hasClass('collapsed')) {
			element.removeClass('collapsed');
			child.expand();
			
			if (false && element.hasAttribute('data-hash')) {
				// Looks like you can't change the location of an internal page
				var loc = window.location.href.replace(/#+/, '');
				window.location.replace(loc + '#' + element.getAttribute('data-hash'));
				debug(window.location.hash);
			}
		}
		else {
			element.addClass('collapsed');
			child.collapse();
		}
	}
	
	element.addEventListener('click', element.toggle, false);
	
	if (element.hasClass('collapsed'))
		child.addClass('collapsed');
	
	new Collapsible(child);
}



// Makes placeholder work on a textarea
function PlaceholderShim(el) {
	
	function setPlaceholder() {
		if (el.value != '')
			return;
		
		el.value = el.getAttribute('placeholder');
		el.addClass('placeholder');
	}
	
	function removePlaceholder() {
		if (el.value != el.getAttribute('placeholder'))
			return;
		
		el.value = '';
		el.removeClass('placeholder');
	}
	
	el.addEventListener('focus', function(e) {
		removePlaceholder();
	}, false);
	
	el.addEventListener('blur', function(e) {
		setPlaceholder();
	}, false);
	
	setPlaceholder();
}



var access = new function ExternalAccess() {
	
	this.makeAction = function(closeOnSave) {
		var pass = settings.get('password');
		return 'Go to page,"javascript:window.opera.tabvault.save(\'' + pass + '\')"'
		+ (closeOnSave ? ' & Delay,100 & Close page' : ''); 
	}
	
	this.makeButton = function(label, icon, closeOnSave) {
		return access.makeAction() + ',,' + (label ? '"' + label + '"' : '') + ',' + (icon ? '"' + icon + '"' : '')
		+ (closeOnSave ? ' & Delay,100 & Close page' : '');
	}
	
	this.makeButtonLink = function(label, icon, closeOnSave) {
		var link = dom.make('a', '.o-button');
		var img = dom.make('span', '.icon');
		
		if (icon.substr(0,3) == '16:') {
			icon = icon.substr(3);
			link.className += ' small';
		}
		
		link.href = 'opera:/button/' + access.makeButton(label, icon, closeOnSave);
		
		if (icon)
			img.style.background = '-o-skin("' + icon + '")';
		else {
			img.textContent = label;
			img.className += ' text';
		}
		
		link.appendChild(img);
		return link;
	}
	
	this.generatePassword = function() {
		var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		var len = 12;
		var pass = '';
		
		for (var i = 0; i < len; i++) {
			pass += chars[Math.min(Math.floor(Math.random() * chars.length), chars.length - 1)];
		}
		
		return pass;
	}
	
	
	this.makeButtons = function(container, closeOnSave) {
		var label = il8n.get('SaveButtonTitle');
		var icons = [
			'Add to bookmarks',
			'Bookmarks',
			'Panel bookmarks',
			'New Note',
			'New Window',
			'Add widget',
			'New page',
			'Save',
			'16:Bookmark Visited',
			'16:Menu Bookmarks',
			'16:Bookmark Unvisited',
			'16:Search Bookmark',
			'16:Note',
			'16:Note Web',
			'16:Menu Window',
			'16:Extensions Panel Button Get More',
			'16:Menu File',
			'16:Menu Transfers',
			'',
		];
		
		container.innerHTML = '';
		
		for (var i = 0; i < icons.length; i++) {
			container.appendChild(access.makeButtonLink(label, icons[i], closeOnSave));
		}
	}
	
}


if (settings.get('disable_animation')) {
	var style = dom.make('style');
	style.textContent = '*{-o-transition-property:none !important}';
	document.head.appendChild(style);
}


