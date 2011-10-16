if (!Math.sign) 
	Math.sign = function(x) {
		if (x > 0)
			return 1;
		if (x < 0)
			return -1;
		return 0;
	}

var platform = {
	windows: navigator.platform.indexOf('Win') != -1,
	mac: navigator.platform.indexOf('Mac') != -1,
	linux: navigator.platform.indexOf('Linux') != -1,
}


//TODO: Consistency check for groups

/**
 * Stores a list of tabs including their urls, titles, and favicon locations
 */
function TabStorage(prefix) {
	
	function getCount(group) {
		return parseInt(widget.preferences[name('count', group)] || 0);
	}

	function setCount(count, group) {
		widget.preferences[name('count', group)] = count;
		if (group && count == 0)
			widget.preferences.removeItem(name('count', group));
	}

	function setTabData(index, data, group) {
		if (data == null)
			widget.preferences.removeItem(name(index, group))
		else
			widget.preferences[name(index, group)] = JSON.stringify(data);
	}
	
	function name(item, group) {
		var gp = '';
		if (group) 
			gp = 'g' + group + '_';
		
		var sep = (parseInt(item) == item) ? '' : '_';
		
		return gp + prefix + sep + item;
	}

	/**
	 * Gets the number of tabs stored
	 */ 
	this.__defineGetter__('count', function() {
		return getCount();
	});
	
	this.getCount = function(group) {
		return getCount(group);
	}
	
	this.getTotalCount = function() {
		var count = 0;
		var end = this.count;
		for (var i = 0; i < end; i++) {
			var tab = this.get(i);
			if (!tab)
				continue;

			if (tab.group)
				count += this.getCount(tab.group);
			else
				count++;
		}
		return count;
	}
	
	this.getGroupIndex = function(group) {
		var count = this.count;
		for (var i = 0; i < count; i++) {
			var tab = this.get(i);
			if (tab && tab.group == group)
				return i;
		}
		return -1;
	}

	/**
	 * Returns whether the tab with the specified index exists
	 */ 
	this.exists = function(index, group) {
		return typeof widget.preferences[name(index, group)] !== 'undefined';
	}

	this.groupExists = function(group) {
		return typeof widget.preferences[name('count', group)] !== 'undefined';
	}

	/** 
	 * Adds a tab to the end of the list
	 */
	this.add = function(data, group) {
		var index = this.getCount(group);
		this.set(index, data, group);
		setCount(index + 1, group);
	}

	/**
	 * Sets the tab at a specified index
	 */ 
	this.set = function(index, data, group) {
		setTabData(index, data, group);
	}

	/**
	 * Gets the tab at a specified index
	 */ 
	this.get = function(index, group) {
		if (index >= this.getCount(group))
			return null;

		var data = widget.preferences[name(index, group)];
		if (typeof data == 'undefined')
			return null;
		return JSON.parse(data);
	}

	/**
	 * Removes the tab at the specified index
	 */
	this.remove = function(index, group) {
		if (index >= this.getCount(group))
			throw new Error('index out of bounds: ' + index + ' >= ' + this.getCount(group));

		var end = this.getCount(group) - 1;
		this.move(index, end, group);
		setTabData(end, null, group);
		setCount(end, group);
	}

	/**
	 * Swaps the tabs at the given indices
	 */
	this.swap = function(index1, index2, group) {
		if (index1 >= this.getCount(group))
			throw new Error('index1 out of bounds: ' + index1 + ' >= ' + this.getCount(group));
		if (index2 >= this.getCount(group))
			throw new Error('index2 out of bounds: ' + index2 + ' >= ' + this.getCount(group));

		var tab1 = this.get(index1, group);
		var tab2 = this.get(index2, group);
		setTabData(index1, tab2, group);
		setTabData(index2, tab1, group);
	}

	/**
	 * Moves the tab at 'from' to 'to' sliding all other tabs in between
	 */
	this.move = function(from, to, group) {
		if (from >= this.getCount(group))
			throw new Error('from index out of bounds: ' + from + ' >= ' + this.getCount(group));
		if (to >= this.getCount(group))
			throw new Error('to index out of bounds: ' + to + ' >= ' + this.getCount(group));

		var dir = Math.sign(to - from);
		for (var i = from; i != to; i += dir) {
			this.swap(i, i + dir, group);
		}
	}


	this.newGroupInfo = function(title) {
		var group = 1;
		while (this.groupExists(group))
			group++;
		
		title = title || ("Group " + group);
		
		return {
			group: group,
			title: title
		}
	}

	/**
	 * Turns the tab at index into a group
	 * Use -1 to add an empty group at the end
	 * Returns the number of the created group
	 */
	this.makeGroup = function(index, title) {
		var info = this.newGroupInfo(title);
		this.add(info);
		
		if (index != -1) {
			var tabInfo = this.get(index);
			this.remove(index);
			this.move(this.count - 1, index);

			this.add(tabInfo, info.group);
		}
		
		return info.group;
	}

	/**
	 * Moves the tab at index in fromGroup to the end of toGroup
	 * Returns the tab's new index
	 */
	this.changeGroup = function(index, fromGroup, toGroup) {
		var info = this.get(index, fromGroup);
		this.remove(index, fromGroup);
		this.add(info, toGroup);
		return this.getCount(toGroup) - 1;
	}

	/**
	 * Gets an array of all stored tabs in a group
	 */
	this.getAll = function(group) {
		var size = this.getCount(group);
		var tabs = [];
		for (var i = 0; i < size; i++) {
			var temp = this.get(i, group);
			if (temp) {
				if (temp.group) 
					temp.tabs = this.getAll(temp.group);
				tabs.push(temp);
			}	
		}

		return tabs;
	}
	
	this.importTabs = function(tabs) {
		for (var i = 0; i < tabs.length; i++) {
			if (tabs[i].group) 
				this.importGroup(tabs[i]);
			else
				this.add(tabs[i]);
			
		}
		
	}
	
	this.importGroup = function(group) {
		if (!group.tabs || !group.tabs.length)
			return;
		
		var title = group.title || group.tabs[0].title || 'New Group';
		var index = this.makeGroup(-1, title);
		
		for (var i = 0; i < group.tabs.length; i++) 
			this.add(group.tabs[i], index);
	}

	/**
	 * Removes all stored tabs
	 */
	this.clear = function(group) {
		for (var i = this.getCount(group) - 1; i >= 0; i--) {
			this.remove(i, group);
		}
	}

	/**
	 * Attempts to repair any corruption in the storage
	 */
	this.consistencyCheck = function() {
		// Set count to largest indexed item
		for (var key in widget.preferences) {
			if (key.indexOf(prefix) == 0 && key != (prefix + '_count')) {
				var index = parseInt(key.substr(prefix.length));
				if (index >= this.count) {
					setCount(index + 1);
				}
			}
		}

		// Remove all empty spots
		for (var i = 0; i < this.count; i++) {
			if (!this.exists(i)) {
				this.remove(i);
			}
		}

		// Reset count to largest indexed item
		var i = 0;
		do {i++} while (this.exists(i));
		setCount(i);
	}
}


var storage = new function Storage() {
	this.tabs = new TabStorage('tab');
	this.trash = new TabStorage('trash');

	this.settings = new function SettingsStorage() {
		// settings: [name, defaultValue]
		this.settings = [
			['show_badge', true],
			['compact', true],
			['tooltips', true],
			['verbose_tab_tips', false],
			['disable_animation', false],
			['trash_on_open', false],
			['delete_duplicates', false],
			['close_on_save', false],
			['close_on_open', true],
			['close_on_pageopen', true],
			['close_tab_on_save', false],
			['keep_groups_open', true],
			['open_one_group', false],
			['middle_click', 'open'],
			['save_to_top', false],
			['group_to_top', false],
			['limit_height', false],
			['max_height', screen.height],
			['limit_trash', false],
			['max_trash', 32],
			['popup_width', 250],
			
			['locale', ''],
			['cxmstyle', platform.mac ? 'mac' : 'dfl'],
			['password', ''],

			['bkg_color', '#fd0000'],
			['bkg_alpha', 255],
			['text_color', '#ffffff'],
			['text_alpha', 255],
		];
		
		/**
		 * Initializes settings
		 */
		this.init = function() {
			if (!this.get('initialized')) {
				this.resetAll();
				this.set('initialized', true);
			}
			else
				this.fillDefaults();
		}
		
		/**
		 * Resets a setting to its default values
		 */
		this.reset = function(name) {
			for (var i = 0; i < this.settings.length; i++) {
				if (this.settings[i][0] == name) {
					this.set(name, this.settings[i][1]);
					return;
				}
			}
		}

		/**
		 * Resets all settings to their default values
		 */
		this.resetAll = function() {
			for (var i = 0; i < this.settings.length; i++)
				this.set(this.settings[i][0], this.settings[i][1]);
		}
		
		this.fillDefaults = function() {
			for (var i = 0; i < this.settings.length; i++) {
				if (typeof widget.preferences['st_' + this.settings[i][0]] == 'undefined')
					this.set(this.settings[i][0], this.settings[i][1]);
			}
		}

		/**
		 * Gets the value of a setting
		 */
		this.get = function(name) {
			var data = widget.preferences['st_' + name];
			if (typeof data == 'undefined')
				return null;
			return JSON.parse(data);
		}

		/**
		 * Sets the value of a setting
		 */
		this.set = function(name, value) {
			var temp = JSON.stringify(value);
			try {
				widget.preferences['st_' + name] = temp;
			}
			catch (e) {
				opera.postError('Failed to save "' + name + '". Exception was:\n' + e.name + '\n' + e.message + 
					'\nsize of data was ' + temp.length + ' characters.');
			}
		}

		/**
		 * Gets an object with the values of all settings
		 */
		this.getAll = function() {
			var data = {};
			for (var i = 0; i < this.settings.length; i++) 
				data[this.settings[i][0]] = this.get(this.settings[i][0]);
			return data;
		}

		/**
		 * Sets all the settings defined in the data object
		 */
		this.setAll = function(data) {
			for (var key in data) 
				this.set(key, data[key]);
		}
	}

	/**
	 * Sends a tab from main storage to the trash
	 */
	this.trashTab = function(index, group) {
		//debug('trashing ' + index);
		var tab = this.tabs.get(index, group);
		if (!tab)
			throw new Error('Cannot trash tab ' + index + ': tab does not exist');

		var isGroup = !!storage.tabs.get(index, group).group;
		storage.tabs.remove(index, group);
		
		if (!isGroup)
			storage.trash.add(tab);
	}
	
	/**
	 * Sends a tab from the trash to main storage
	 */
	this.restoreTab = function(index) {
		//debug('restoring ' + index);
		var tab = storage.trash.get(index);
		if (!tab)
			throw new Error('Cannot restore trash ' + index + ': tab does not exist');

		storage.trash.remove(index);
		storage.tabs.add(tab);
	}
}

var settings = storage.settings;