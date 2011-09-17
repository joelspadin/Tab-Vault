function debug(msg) {
	//opera.postError(msg);
}

// Flags for update function
var update = {
	tabs: 0x1,
	trash: 0x2,
	settings: 0x4,
	all: 0x7,
};

window.addEventListener('load', function() {
	// Initialization
	storage.settings.init();
	var styleCache;				// store styles to lessen IO use
	var reopen = false;			// set to true to repoen panel on next focused tab

	// Build UI elements
	var UIItemProperties = {
		disabled: true,
		title: 'Tab Vault',
		icon: 'img/icon_18.png',
		onclick: buttonClicked,
		badge: {
			display: 'none',
			textContent: '0',
		}
	};

	var button = opera.contexts.toolbar.createItem(UIItemProperties);
	opera.contexts.toolbar.addItem(button);

	// Called when the toolbar button is clicked
	function buttonClicked() {
		// Send message to focused tab to open TabVault UI
		var focused = opera.extension.tabs.getFocused();
		if (focused) 
			postOpen(focused, !settings.get('instant_open'));
	}

	// Enables the button if there is a focused tab, disables it otherwise
	function enableButton() {
		var tab = opera.extension.tabs.getFocused();
		if (tab)
			button.disabled = false;
		else
			button.disabled = true;
	}
	
	// Updates the button's badge with the current number of stored tabs
	function updateBadge() {
		if (settings.get('show_badge')
			&& (storage.tabs.count > 0 || !settings.get('hide_zero'))) {
			button.badge.textContent = storage.tabs.count;
			button.badge.backgroundColor = settings.get('badge_background');
			button.badge.color = settings.get('badge_text');
			button.badge.display = 'block';
		}
		else 
			button.badge.display = 'none';
	}
	
	// Called when a tab is focused
	function tabFocused(e) {
		tabChanged(e);
		if (reopen) {
			reopen = false;
			var focused = opera.extension.tabs.getFocused();
			if (focused) {
				debug('Reopening UI: ' + focused.url);
				postOpen(focused, false);
			}
		}
	}
	
	// Called when a tab loses focus
	function tabChanged(e) {
		// Enable/disable the button and close any open Tab Vault panels when the current tab changes
		enableButton();
		opera.extension.broadcastMessage({
			action: 'close',
			smooth: false,
		});
	}

	// Set up extensions event handlers
	opera.extension.tabs.onfocus = tabFocused;
	opera.extension.tabs.onblur = tabChanged;
	
	opera.extension.onconnect = function(e) {
		debug('connected to ' + e.origin);
		if (e.origin.indexOf('widget://') != -1) {
			e.source.postMessage({
				action: 'hello_options_page'
			});
		}
		
		enableButton();
		updateBadge();
	}

	opera.extension.onmessage = function(e) {
		switch (e.data.action) {
			case 'add_tab':
				// Stores the focused tab
				var focused = opera.extension.tabs.getFocused();
				if (focused) {
					storage.tabs.add({
						url: focused.url,
						title: focused.title,
						icon: focused.faviconUrl,
					});
					postUpdate(e.source, update.tabs);
					updateBadge();				
					if (settings.get('close_on_add')) {
						reopen = settings.get('reopen_ui');
						focused.close();
					}
				}
				else
					throw new Error('TabVault: No focused tab to store');
				break;
			case 'trash_tab':
				// Sends the tab with the given index to the trash
				storage.trashTab(e.data.index);
				postUpdate(e.source, update.tabs | update.trash);
				updateBadge();
				break;
			case 'restore_tab':
				// Restores the trashed tab with the given index
				storage.restoreTab(e.data.index);
				postUpdate(e.source, update.tabs | update.trash);
				updateBadge();
				break;
			case 'clear_trash':
				// Empties the trash
				storage.trash.clear();
				postUpdate(e.source, update.trash);
				break;
			case 'move_tab':
				// Moves a tab to a new position
				storage.tabs.move(e.data.from, e.data.to);
				break;
			case 'set_setting':
				// Changes the value of a configuration setting
				settings.set(e.data.name, e.data.value);
				break;
			case 'update':
				// Respond to a request to update all information
				postUpdate(e.source, update.all);
				break;
			case 'open':
				// Opens a tab with the given url
				if (e.data.newWindow) 
					opera.extension.tabs.create({
						url: e.data.url,
						focused: !e.data.background && !settings.get('focus_crash_workaround')
					});
				else
					opera.extension.tabs.getFocused().update({url: e.data.url});
				break;
			case 'close_current':
				// Closes the current tab
				opera.extension.tabs.getFocused().close();
				break;
			case 'import':
				// Imports a session file (.win)
				var tabs = session.read(e.data.session);
				var getFavicon = function(i) {
					if (i == tabs.length) {
						postUpdate(e.source, update.tabs);
						e.source.postMessage({action: 'import_complete'});
					}
					else {
						session.getFavicon(tabs[i].url, i, function(index, icon) {
							tabs[index].icon = icon;
							storage.tabs.add(tabs[index]);
							debug('imported tab ' + index);
							getFavicon(index + 1);
						});
					}
				}
				getFavicon(0);
				break;
			case 'export':
				// Exports tabs as a session file (.win)
				var dataURI = session.write(storage.tabs.getAll(), e.data.screen);
                opera.extension.tabs.create({
                    url: dataURI,
                    focused: true
                });
				break;
			case 'frame_workaround':
				// Workaround for when message is posted to framed injected script instead
				// of the instance in the main page.  Broadcasts message to all instances
				// asking for a response if their url matches that of the focused tab.
				var focused = opera.extension.tabs.getFocused();
				if (focused) {
					debug('Broadcasting frame workaround message');
					opera.extension.broadcastMessage({
						action: 'frame_workaround_open',
						url: focused.url,
						smooth: e.data.smooth,
					});
				}
				break;
			case 'frame_workaround_response':
				// Posts an open message to tabs that respond to the workaround message
				debug('Executing frame workaround');
				postOpen(e.source, e.data.smooth);
				break;
			case 'repair_tabs':
				opera.postError('Tab Vault: Repairing tab storage');
				storage.tabs.consistencyCheck();
				postUpdate(e.source, update.tabs);
				break;
			case 'repair_trash':
				opera.postError('Tab Vault: Repairing trash storage');
				storage.trash.consistencyCheck();
				postUpdate(e.source, update.trash);
				break;
			case 'reset_settings':
				opera.postError('Tab Vault: Resetting all settings to defaults');
				settings.reset();
				postUpdate(e.source, update.settings);
				break;
			case 'reset_all':
				opera.postError('Tab Vault: Resetting everything!');
				resetAll();
				postUpdate(e.source, update.all);
				break;
			default:
				throw new Error('TabVault: Unknown action "' + e.data.action + '"');
		}
	}
	
	
	// Posts a message to open the Tab Vault panel
	function postOpen(listener, smooth) {
		listener.postMessage(getUpdateData({
			action: 'open',
			smooth: smooth,
			styles: getStyles(),
		}));
	}
	
	// Posts a message to update info in the panel
	function postUpdate(listener, updateTypes) {
		listener.postMessage(getUpdateData({
			action: 'update',
		}, updateTypes));
	}

	// Populates a data object with updated tab/trash/settings info
	function getUpdateData(data, updateTypes) {
		if (data === null)
			data = {};
		if (!updateTypes)
			updateTypes = update.all;

		data.tabs = (updateTypes & update.tabs) ? storage.tabs.getAll() : null;
		data.trash = (updateTypes & update.trash) ? storage.trash.getAll() : null;
		data.settings = (updateTypes & update.settings) ? settings.getPanelSettings() : null;
		return data;
	}

	// Gets the stylesheet for the Tab Vault panel
	function getStyles() {
		var cache = settings.get('cache_styles') || false;
		if (cache && styleCache) {
			debug('getting cached CSS');
			return styleCache;
		}

		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'styles.css', false);
		xhr.send();
		var styles = xhr.responseText;
		styles = replaceVariables(styles);

		if (cache) {
			styles = styles.replace(/\t|\s\s+/g, ' ');
			styleCache = styles;
		}
		return styles;
	}
	
	function replaceVariables(css) {
		return css.replace(/\$\w+\b/g, function(match) {
			return settings.get(match.substr(1));
		});
	}

	function resetAll() {
		widget.preferences.clear();
		settings.init();
		styleCache = null;
		reopen = false;
		updateBadge();
	}
	
   
	window.addEventListener('storage', function(e) {
		var name = e.key.replace(/^st_/, '');
		var value = JSON.parse(e.newValue);

		switch (name) {
			case 'cache_styles':
				if (value === false)
					styleCache = null;
				break;
			case 'show_badge':
			case 'hide_zero':
			case 'badge_background':
			case 'badge_text':
				updateBadge();
				break;
		}
	}, false);
   
}, false);

