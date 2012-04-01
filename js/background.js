

window.addEventListener('load', function() {
	// Initialization
	//debug('clearing');
	//widget.preferences.clear();
	//testTabStorage();
	
	checkVersion();
	
	var UIItemProperties, button, resizeTimeout;
	var popupWidth;
	var notificationLength = 3000;
	var notificationTimer;
	
	function init() {
		storage.settings.init();

		loadLocale();

		// Build UI elements
		UIItemProperties = {
			disabled: false,
			title: 'Tab Vault',
			icon: 'img/icon_18.png',
			onclick: buttonClicked,
			badge: {
				display: 'none',
				textContent: '0',
			},
			popup: {
				href: 'window/index.html',
				width: 250,
				height: 300
			}
		};
		
		button = opera.contexts.toolbar.createItem(UIItemProperties);
		opera.contexts.toolbar.addItem(button);
		
		updateBadgeColors();
		updateBadge();
		updateWidth();
	}
	init();


	opera.extension.onmessage = function(e) {
		console.log(e.data.action);
		switch(e.data.action) {
			case 'get_tab':
				// Gets info about the focused tab
				var tab = opera.extension.tabs.getFocused();
				console.log(tab);
				if (tab) 
					e.source.postMessage({
						action: 'get_tab',
						url: tab.url,
						title: tab.title,
						icon: tab.faviconUrl
					});
				else
					e.source.postMessage({ action: 'get_error' });
				break;
				
			case 'open_tab':
				// Opens a tab
				opera.extension.tabs.create({
					url: e.data.url,
					focused: e.data.focused || false
				});
				break;
				
			case 'close_tab':
				// Closes the focused tab
				var focused = opera.extension.tabs.getFocused();
				if (focused) 
					focused.close();
				break;
				
			case 'change_tab':
				// Navigates the focused tab to a new URL
				var focused = opera.extension.tabs.getFocused();
				if (focused) {
					focused.update({ url: e.data.url });
					if (settings.get('close_on_pageopen'))
						e.source.postMessage({ action: 'close' });
					e.source.postMessage({ action: 'open_success', url: e.data.url });
				}
				else
					e.source.postMessage({ action: 'open_error' });
				break;
				
			case 'resize':
				// Resize the popup to fit its tabs
				function resize() {
					resizePopup(e.data.page, e.data.size);
					e.source.postMessage({action: 'resize_done'});
					resizeTimeout = null;
				}
				// If timeout is already going, cancel it
				if (resizeTimeout)
					clearTimeout(resizeTimeout);
			
				if (e.data.delay)
					resizeTimeout = setTimeout(resize, e.data.delay);
				else
					resize();
				break;
				
			case 'enter_page':
				// Called when dragging a tab over the page
				showDropMessage(e.data.title, e.data.group, e.data.tabs);
				break;
				
			case 'leave_page':
				// Called when dragging a tab away from the page
				hideDropMessage();
				break;
				
			case 'reset_all':
				// Resets everything to defaults
				resetAll();
				e.source.postMessage({ action: 'update' });
				break;
				
			case 'recount':
				// Update count on badge
				setTimeout(updateBadge, 200);
				break;
				
			case 'export':
				// Exports tabs as a session
				
				if (!sessionInit(e))
					break;
				
				var uri;
				if (e.data.format == 'adr') {
					uri = session.writeAdr(storage.tabs.getAll());
				}
				else {
					var wind = {
						x: screen.width * 0.1,
						y: screen.height * 0.1,
						width: screen.width * 0.75,
						height: screen.height * 0.75
					}
					uri = session.write(storage.tabs.getAll(), wind);
				}
				opera.extension.tabs.create({ url: uri, focused: e.data.focused || false });
				break;
				
			case 'import':
				// Import tabs from a session
				
				if (!sessionInit(e))
					break;
					
				var tabs = [];
				tabs = session.read(e.data.session);
				try {
					//tabs = session.read(e.data.session);
					getFavicons(tabs, function() {
						storage.tabs.importTabs(tabs);
						e.source.postMessage({ action: 'import_done' });
						updateBadge();
					});
				}
				catch (ex) {
					console.log('Tab Vault: Error occurred while importing:\n' + ex.toString());
					e.source.postMessage({ action: 'import_error' });
				}
				break;
				
			case 'reload_icon':
				var tab = storage.tabs.get(e.data.index, e.data.group);
				window.utils.getFavicon(tab, function(data) {
					debug('test');
					storage.tabs.set(e.data.index, data, e.data.group);
					// Popup may be closed now (probably is since Opera likes closing it
					// for no good reason) so ignore any errors this generates
					try {
						e.source.postMessage({
							action: 'reload_icon_done',
							index: e.data.index,
							group: e.data.group,
							icon: data.icon
						});
					}
					catch (e) {}
				});
				break;
				
			case 'external_save':
				// Page asks to save itself or another page
				//var pass = settings.get('password');
				//if (!pass || e.data.pass != pass) {
				if (!checkPassword(e.data.pass)) {
					opera.postError('Tab Vault: Cannot save page. Invalid password.');
					return;
				}
				
				// If no URL provided, get info from focused tab
				if (!e.data.url) {
					var tab = opera.extension.tabs.getFocused();
					if (tab) {
						e.data.url = tab.url;
						e.data.title = tab.title;
						// Don't know why, but this fails when called from a button or shortcut
						e.data.icon = tab.faviconUrl;
					}
					else {
						externalSaveError();
						break;
					}
				}

				storage.tabs.add({
					url: e.data.url,
					title: e.data.title,
					icon: e.data.icon,
				});
				
				if (settings.get('save_to_top')) 
					storage.tabs.move(storage.tabs.count - 1, 0);
				
				updateBadge(true);
				
				if (e.data.close)
					tab.close();
				break;
				
			case 'get_all':
				// Gets all tabs
				var tabs = [];
				var windows = opera.extension.windows.getAll();
				console.log(windows);
				for (var i = 0; i < windows.length; i++) {
					try {
						var allTabs;
						if (windows[i].tabs.getAll)
							allTabs = windows[i].tabs.getAll();
						else
							allTabs = windows[i].tabs;
						
						console.log(allTabs);
						for (var j = 0; j < allTabs.length; j++) {
							var t = allTabs[j];
							tabs.push({
								url: t.url,
								title: t.title,
								icon: t.faviconUrl
							});
						}	
					}
					catch (e) {}
				}
				
				sendGroupMsg(e.source, tabs);
				break;
				
			case 'get_window':
				// Gets all tabs in the current window
				var tabs = [];
				var focused = opera.extension.windows.getFocused();
				
				var allTabs;
				if (focused.tabs.getAll)
					allTabs = focused.tabs.getAll();
				else
					allTabs = focused.tabs;
				
				for (var i = 0; i < allTabs.length; i++) {
					var t = allTabs[i];
					tabs.push({
						url: t.url,
						title: t.title,
						icon: t.faviconUrl
					});
				}
				
				sendGroupMsg(e.source, tabs);
				break;
				
			case 'get_domain':
				// Gets all tabs on the same domain as the focused tab
				var tabs = [];
				var focused = opera.extension.tabs.getFocused();
				
				if (!focused) {
					e.source.postMessage({ action: 'get_error' });
					break;
				}
				
				var domain = getDomain(focused.url);
				var windows = opera.extension.windows.getAll();
				for (var i = 0; i < windows.length; i++) {
					try {
						var allTabs;
						if (windows[i].tabs.getAll)
							allTabs = windows[i].tabs.getAll();
						else
							allTabs = windows[i].tabs;
						
						for (var j = 0; j < allTabs.length; j++) {
							var t = allTabs[j];
							if (getDomain(t.url) == domain)
								tabs.push({
									url: t.url,
									title: t.title,
									icon: t.faviconUrl
								});
						}
					}
					catch (e) {}
				}
				
				sendGroupMsg(e.source, tabs, domain);
				break;
				
			
		}
	}
	
	opera.extension.tabs.onfocus = hideDropMessage;
	
	
	function sendGroupMsg(source, tabs, title) {
		if (tabs.length > 0)
			source.postMessage({
				action: 'get_group',
				title: title || tabs[0].title,
				tabs: tabs
			});
		else
			source.postMessage({ action: 'get_error' });
	}
	
	
	function checkPassword(pass) {
		var temp = settings.get('password');
		return temp && pass == temp
	}
	
	function getDomain(url) {
		return url.match(/:\/\/(www\.)?(.[^/:]+)/)[2];
	}
	
	function formatNumber(text, value) {
		var parts = text.split('|');
		
		var i = Math.min(parts.length - 1, Math.floor(value));
		
		if (Math.floor(value) != value)
			i = parts.length - 1;
		
		return parts[i].replace('%s', value);
	}
	
	
	/**
	 * Shows an indicator that a tab is being dragged over the current page
	 */
	function showDropMessage(title, group, tabs) {
		var focused = opera.extension.tabs.getFocused();
		if (focused) {
			if (group)
				title += ' ' + formatNumber(localesettings.TabCount, tabs);
			
			focused.postMessage({ 
				action: 'show', 
				title: title,
				msg: group ? localesettings.DropToOpenGroup : localesettings.DropToOpen,
				anim: !settings.get('disable_animation'),
				right: popupWidth,
			});
		}
	}
	
	/**
	 * Hides the indicator
	 */
	function hideDropMessage() {
		var focused = opera.extension.tabs.getFocused();
		if (focused)
			focused.postMessage({ action: 'hide' });
	}

	/**
	 * Occurs when the extension button is clicked
	 */
	function buttonClicked() {
		resizePopup('tabs');	
	}
	
	/**
	 * Resizes the popup to fit its contents
	 * page = tabs | trash
	 * size overrides the calculation of the # of tabs to account for
	 */
	function resizePopup(page, size) {
		var tabs = size || 0;
		var minTabs = 6;
		var tabHeight = 26;
		var padding = 48;
		
		if (!size) {
			if (page == 'tabs') 
				tabs = storage.tabs.count;
			else if (page == 'trash') {
				tabs = storage.trash.count;
				padding += 28;
			}
			else
				tabs = Math.max(storage.tabs.count, storage.trash.count);
		}
		
		//debug('resizing to ' + tabs + ' tabs');
		tabs = (tabs < minTabs) ? minTabs : tabs;
		var height = padding + (tabs + 1) * tabHeight
		button.popup.height = settings.get('limit_height') ? Math.min(height, settings.get('max_height')) : height; 
	}
	
	/**
	 * Updates the number of tabs shown on the extension button
	 */
	function updateBadge(plusone) {
		var tabs = storage.tabs.getTotalCount();
		if (settings.get('show_badge') && tabs > 0) {
			if (plusone) {
				tabs -= 1;
				tabs += '+1';
				if (notificationTimer)
					clearTimeout(notificationTimer);
				notificationTimer = setTimeout(updateBadge, notificationLength);
			}
			
			button.badge.display = 'block';
			button.badge.textContent = tabs;
		}
		else 
			button.badge.display = 'none';
	}
	
	function externalSaveError() {
		button.badge.display = 'block';
		button.badge.textContent = 'err';
		if (notificationTimer)
			clearTimeout(notificationTimer);
		notificationTimer = setTimeout(updateBadge, notificationLength);
	}
	
	/**
	 * Updates the colors of the button's badge
	 */
	function updateBadgeColors() {
		colorutils.getIndicatorColors(button.badge);
	}
	
	/**
	 * Checks for upgrading from version 1.x to 2
	 */
	function checkVersion() {
		var version = settings.get('version');
		var initialized = settings.get('initialized');
		
		if (initialized) {
			if (!version || version < 2) {
				// Attempt upgrade here
				debug('upgrading');
				opera.extension.tabs.create({ url: 'upgrade.html', focused: true });
			}
		}
		else {
			settings.set('version', 2);
			opera.extension.tabs.create({ url: 'help.html#first', focused: true });
		}
			
	}
	
	/**
	 * Imports favicons by opening each tab, waiting for the favicon to load,
	 * saving its location, and closing the tab
	 * 
	 * By the way, this is a candidate for the most horrendous function I've ever written
	 */
	function getFavicons(array, callback) {
		var groups = [];
		
		// get() calls itself for next tab until all tabs finished, then calls done() 
		function get(tabs, i, done) {
			debug('get ' + i);
			if (i == tabs.length) 
				done();
			else {
				if (tabs[i].group) {
					groups.push(tabs[i].tabs);
					get(tabs, i + 1, done);
				}
				else 
					window.utils.getFavicon(tabs[i], function(data) {
						get(tabs, i + 1, done);
					});
			}
		}
		
		function getAllGroups() {
			debug('get all groups (' + groups.length + ')');
			// getGroup() calls get() for its tabs. When get() is finished, it calls
			// getGroup() for the next group until all groups finished, then calls callback()
			function getGroup(j) {
				debug('get group ' + j);
				if (j == groups.length) 
					callback(array);
				else 
					get(groups[j], 0, function() {
						getGroup(j + 1);
					});
			}
			
			getGroup(0);
		}
		
		get(array, 0, getAllGroups);
	}
	
	
	function resetAll() {
		widget.preferences.clear();
		opera.contexts.toolbar.removeItem(button);
		checkVersion();
		init();
	}
	
	function updateWidth() {
		popupWidth = Math.max(localesettings.PopupWidth, settings.get('popup_width'));
		button.popup.width = popupWidth;
	}
	
	function loadLocale() {
		var locale = settings.get('locale');
		if (locale == '') {
			var def = getLocaleDef(navigator.language);
			if (def !== null)
				locale = def.language;
		}
		
		if (locale) {
			var a = document.getElementsByTagName('script');
			for (var i = 0; i < a.length; i++) {
				if (a[i].src.indexOf('locale-misc.js') != -1) {
					a[i].parentNode.removeChild(a[i]);
				}
			}
			
			var s = document.createElement('script');
			s.src = 'locales/' + locale + '/locale-misc.js';
			document.head.appendChild(s);
			
			setTimeout(updateWidth, 500);
		}
	}
	
	
	var updateTimeout;
	
	window.addEventListener('storage', function(e) {
		if (!e)
			return;
		
		var name = e.key.replace(/^st_/, '');
		//var value = settings.get(name);

		switch (name) {
			case 'show_badge':
				updateBadge();
				break;
			case 'locale':
				loadLocale();
				break;
			case 'bkg_color':
			case 'bkg_alpha':
			case 'text_color':
			case 'text_alpha':
				updateBadgeColors();
				break;
			case 'popup_width':
				updateWidth();
				break;
		}
		
		// Check if the number of stored tabs changed
		// Wait a moment in case multiple changes occur at once
		if (name.match(/_count/)) {
			if (updateTimeout)
				clearTimeout(updateTimeout);
			updateTimeout = setTimeout(function() {
				updateBadge();
				updateTimeout = null;
			}, 500);
		}
			
	}, false);
   
}, false);



var colorutils = new function ColorUtils() {
	
	/**
	 * Gets the indicator colors from settings
	 */
	this.getIndicatorColors = function(data) {
		data = data || {};
		var alphaScale = 0.5;
		data.backgroundColor = colorutils.rgba(
			settings.get('bkg_color'), 
			settings.get('bkg_alpha') * alphaScale);
		data.color = colorutils.rgba(
			settings.get('text_color'), 
			settings.get('text_alpha') * alphaScale);
		return data;
	}
	
	/**
	 * Mixes an rgb color with an opacity and returns it in rgba() form
	 */
	this.rgba = function(color, opacity) {
		var a = parseInt(opacity) / 256;
		
		var match = color.match(/^#?([0-9a-f]{1,2})([0-9a-f]{1,2})([0-9a-f]{1,2})$/);
		if (!match)
			return 'rgba(0,0,0,' + a + ')';
		
		var r,g,b;
		r = parseInt(match[1], 16);
		g = parseInt(match[2], 16);
		b = parseInt(match[3], 16);
		
		return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
	}
}

var utils = new function() {
	var polling = {
		interval: 100,
		maxTime: 20000,
		maxTries: 0,
	}
	
	polling.maxTries = polling.maxTime / polling.interval;
	
	/**
	 * Gets the favicon url of a page by opening it, checking until it loads the favicon, then closing it
	 */ 
	this.getFavicon = function(tabObj, callback) {
		var tab = opera.extension.tabs.create({ url: tabObj.url, focused: false });
		var tries = 0;
		
		var check = function() {
			//debug('checking: try ' + tries);
			if (tab.faviconUrl) {
				tab.close();
				tabObj.icon = tab.faviconUrl;
				callback(tabObj);
			}
			else {
				tries++;
				if (tries < polling.maxTries)
					setTimeout(check, polling.interval);
				else {
					tab.close();
					tabObj.icon = null;
					callback(tabObj);
					opera.postError('Tab Vault: Timeout getting favicon for "' + tabObj.url + '"');
				}
			}
		}
		check();
	}
}


var sessionScriptLoaded = false;
function sessionInit(eventData) {
	if (sessionScriptLoaded)
		return true;
	
	var script = document.createElement('script');
	script.src = 'js/session.js';
	document.head.appendChild(script);
	sessionScriptLoaded = true;
	
	setTimeout(function() {
		opera.extension.onmessage(eventData);
	}, 100)
	return false;
}


