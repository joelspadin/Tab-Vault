

var session = new function SessionExporter() {
	/**
	 * Reads a session file and returns a list of tab objects without favicons
	 */  
	this.read = function(text) {
		var tabs = [];
		var modes = {
			none: 0,
			info: 1,
			url: 2,
			title: 3,
			groups: 4,
		};
		
		var ini = new IniReader();
		ini.open(text);
		
		var index = 0;
		var history = -1;
		var group = 0;
		var groups = {};
		var groupNames = [];
		var tab = null;
		var mode = modes.none;
		
		function addTab(tab, group) {
			// If no group, add to tab list
			if (group == 0)
				tabs.push(tab)
			else {
				// If in group and group exists, add to group
				if (groups[group]) 
					groups[group].tabs.push(tab);
				else {
					// If in group and group doesn't exist, create it
					var newGroup = { 
						group: true, 
						tabs: [ tab ],
						title: groupNames[group] || null,
					}

					groups[group] = newGroup;
					tabs.push(newGroup)
				}
			}
		}
		
		while (ini.read()) {
			if (ini.isSection) {
				//debug('Section: ' + ini.section);
				// [#] sections begin new tabs
				if (ini.section.match(/^\d+$/)) {
					index = ini.section;
					history = -1;
					mode = modes.info;
					if (tab != null && tab.url)
						addTab(tab, group);
					
					tab = { url: '', title: '', icon: '' };
					//debug('New Tab ' + index);
				}
				// [#history url] sections hold urls
				else if (ini.section == index + 'history url')
					mode = modes.url;
				// [#history title] sections hold titles
				else if (ini.section == index + 'history title')
					mode = modes.title;
				else if (ini.section == 'tabvault groups')
					mode = modes.groups;
				else
					mode = modes.none;
			}
			else if (mode == modes.groups) {
				debug('adding group name ' + ini.value);
				groupNames[parseInt(ini.key)] = ini.value;
			}
			else if (index > 0) {
				if (mode == modes.info) {
					// If section contains "current history", use that index for urls/titles
					if (ini.key == 'current history')
						history = parseInt(ini.value) - 1;
					else if (ini.key == 'group')
						group = parseInt(ini.value);
				}
				else if (ini.key == history || (history == -1 && ini.key.match(/^\d+$/))) {
					// If key is a number, this may be a url/title
					if (mode == modes.url) {
						//debug('url = ' + ini.value);
						tab.url = ini.value;
					}
					else if (mode == modes.title) {
						//debug('title = ' + ini.value);
						tab.title = ini.value;
						debug('>' + tab.title + '<');
						if (tab.title.match(/^".*"$/))
							tab.title = tab.title.substring(1, tab.title.length - 1);
					}
				}
			}
		}
		// Append the last tab to the list
		if (tab != null && tab.url)
			addTab(tab, group);
		
		debug(tabs, 5);
		
		return tabs;
	}
	
	
	
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
	

	
	/**
	 * Writes a session file given a list of tabs and the position/dimensions of the window
	 * and returns it as a data uri
	 */ 
	this.write = function(tabs, wind) {
		var ini = new IniWriter();
		ini.open();
		ini.writeHeader();
		ini.writeComment('Save this file with a ".win" extension in your sessions folder.');
		ini.writeComment('Macintosh: ~/Library/Preferences/Opera Preferences/sessions/');
		ini.writeComment('Windows: %AppData%\\Opera\\Opera\\sessions\\');
		ini.writeComment('Linux: ~/.opera/sessions/');
		ini.writeLine();

		var windowId = Math.floor(Math.random() * 10000);
		var groupId = 0;

		var count = tabs.length + 1;
		for (var i = 0; i < tabs.length; i++)
			if (tabs[i].group)
				count += tabs[i].tabs.length - 1;

		// Write the first section
		ini.writeSection('session');
		ini.write('version', '7000');
		ini.write('window count', count);
		ini.writeLine();
		
		// Save group titles
		ini.writeSection('tabvault groups');
		for (var i = 0; i < tabs.length; i++) 
			if (tabs[i].group)
				ini.write(++groupId, tabs[i].title);
		ini.writeLine();
		groupId = 0;
        
		// Write the parent window section
		ini.writeSection(1);
		ini.write('x', wind.x);
		ini.write('y', wind.y);
		ini.write('w', wind.width);
		ini.write('h', wind.height);
		ini.write('state', 0);
		ini.write('restore to state', 0);
		ini.write('id', windowId);
		ini.write('parent', 0);
		ini.write('saveonclose', 1);
		ini.write('type', 0);
		ini.writeLine();
        
		// Write sections for each tab
		var index = 2;
		
		for (var i = 0; i < tabs.length; i++) {
			
			if (tabs[i].group) {
				groupId++;
				for (var j = 0; j < tabs[i].tabs.length; j++) {
					writeTab(ini, index, windowId, tabs[i].tabs[j], groupId, j);
					index++;
				}
			}
			else {
				writeTab(ini, index, windowId, tabs[i]);
				index++;
			}
		}
		
		return ini.toDataURI();
	}
	
	function writeTab(ini, index, windowId, info, groupId, groupIndex) {
		groupId = groupId || 0;
		var first = groupId && groupIndex == 0;
		
		ini.writeSection(index);
		ini.write('state', 2);
		ini.write('restore to state', 0);
		ini.write('parent', windowId);
		ini.write('saveonclose', 1);
		ini.write('stack position', groupId ? groupIndex + 1 : 0);
		ini.write('group', groupId);
		ini.write('group-active', (groupId && first) ? 1 : 0);
		ini.write('hidden', (groupId && !first) ? 1 : 0);
		ini.write('type', 1);
		ini.write('max history', 1);
		ini.write('current history', 1);
		ini.write('lists', 'history url,history document type,history title');
		ini.write('show img', 1);
		ini.write('load img', 1);
		ini.write('CSS mode', 1);
		ini.write('scale', 100);
		ini.write('show scrollbars', 1);
		ini.writeLine();

		ini.writeSection(index + 'history url');
		ini.write('count', 1);
		ini.write('0', info.url);
		ini.writeLine();

		ini.writeSection(index + 'history document type');
		ini.write('count', 1);
		ini.write('0', 6);
		ini.writeLine();

		var title = info.title;
		if (title.indexOf('"') != -1)
			title = '"' + title + '"';

		ini.writeSection(index + 'history title');
		ini.write('count', 1);
		ini.write('0', title);
		ini.writeLine();
	}
}

var IniUtils = {
	section: /^\s*\[(.+)\]\s*$/,
	value: /^\s*(.+?)\s*=\s*(.*)\s*$/,
	comment: ';',
	newline: '\n',
}

function IniReader() {
	var text = null;
	this.isSection = false;
	this.section = null;
	this.key = null;
	this.value = null;

	this.open = function(iniText) {
		text = iniText;
	}

	this.close = function() {
		text = null;
	}

	this.read = function() {
		if (text.length == 0)
			return false;
		
		var data = null;
		// Read lines until line with data found or eof
		while (!data) {
			var line = readLine();
			if (line == null)
				return false;
			data = parseLine(line);
		}

		data = data || { section: null, key: null, value: null };

		if (data.section) {
			this.isSection = true;
			this.section = data.section;
			this.key = this.value = null;
			return true;
		}
		else if (data) {
			this.isSection = false;
			this.key = data.key;
			this.value = data.value;
			return true;
		}
		else {
			this.isSection = false;
			this.section = this.key = this.value = null;
			return false;
		}
	}
	
	var readLine = function() {
		if (text.length == 0)
			return null;
		
		var eol = text.indexOf(IniUtils.newline);
		if (eol == -1) {
			var temp = text;
			text = '';
			return temp;
		}
		
		var line = text.substr(0, eol);
		text = text.substr(eol).replace(/^[\s\t\n]+/, '');
		return line;
	}

	var parseLine = function(line) {
		var data = { section: null, key: null, value: null };
		// Trim line
		line = line.replace(/^\s+/, '');
		
		// Ignore commented and empty lines
		if (line.indexOf(IniUtils.comment) == 0 || line.match(/^\s*$/))
			return null;

		// Test for section header
		var match = line.match(IniUtils.section);
		if (match != null) {
			data.section = match[1];
			return data;
		}
		// Test for data
		match = line.match(IniUtils.value);
		if (match != null) {
			data.key = match[1];
			data.value = match[2];
			return data;
		}
		return null;
	}
}



function IniWriter() {
	this.text = null;

	this.open = function() {
		this.text = '';
	}
	
	this.close = function() {
		this.text = null;
	}

	this.write = function(string, value) {
		if (typeof value != 'undefined')
			this.text += string + '=' + value + IniUtils.newline;
		else
			this.text += string;
	}

	this.writeLine = function(string) {
		string = string || '';
        this.text += string + IniUtils.newline;
	}

	this.writeComment = function(string) {
		this.writeLine(IniUtils.comment + ' ' + string);
	}

	this.writeHeader = function(version) {
		version = version || '2.1';
		this.writeLine('Opera Preferences version ' + version);
		this.writeComment('Do not edit this file while Opera is running');
		this.writeComment('This file is stored in UTF-8 encoding');
		this.writeLine();
	}

	this.writeSection = function(name) {
		this.writeLine('[' + name + ']');
	}
    
    this.toDataURI = function() {
        return 'data:text/plain;base64;charset=utf-8,' + encodeBase64(this.text);
    }
}

// Base64 conversion code found at
// http://my.opera.com/Lex1/blog/fast-base64-encoding-and-test-results
function encodeBase64(str){
	var chr1, chr2, chr3, rez = '', arr = [], i = 0, j = 0, code = 0;
	var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='.split('');

	while(code = str.charCodeAt(j++)){
		if(code < 128){
			arr[arr.length] = code;
		}
		else if(code < 2048){
			arr[arr.length] = 192 | (code >> 6);
			arr[arr.length] = 128 | (code & 63);
		}
		else if(code < 65536){
			arr[arr.length] = 224 | (code >> 12);
			arr[arr.length] = 128 | ((code >> 6) & 63);
			arr[arr.length] = 128 | (code & 63);
		}
		else{
			arr[arr.length] = 240 | (code >> 18);
			arr[arr.length] = 128 | ((code >> 12) & 63);
			arr[arr.length] = 128 | ((code >> 6) & 63);
			arr[arr.length] = 128 | (code & 63);
		}
	};

	while(i < arr.length){
		chr1 = arr[i++];
		chr2 = arr[i++];
		chr3 = arr[i++];

		rez += chars[chr1 >> 2];
		rez += chars[((chr1 & 3) << 4) | (chr2 >> 4)];
		rez += chars[chr2 === undefined ? 64 : ((chr2 & 15) << 2) | (chr3 >> 6)];
		rez += chars[chr3 === undefined ? 64 : chr3 & 63];
	};
	return rez;
};