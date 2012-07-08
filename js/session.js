

var session = new function SessionExporter() {
	/**
	 * Reads a session file and returns a list of tab objects without favicons
	 */  
	this.read = function(text) {
		var type = text.match(/^\s*Opera\s+(Preferences|Hotlist)/i);
		if (type && type[1].toLowerCase() == 'hotlist')
			return this.readAdr(text);
		
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
				//console.log('Section: ' + ini.section);
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
				//console.log('adding group name ' + ini.value);
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
	
	this.readAdr = function(text) {
		var tabs = [];
		
		var adr = new IniReader(AdrUtils);
		adr.open(text);
		
		var tab = null;
		var group = null;
		var isGroup = false;
		var ignore = false;
		var level = 0;
		
		while (adr.read()) {
			if (adr.isSection) {
				switch (adr.section.toLowerCase()) {
					case 'url':
						if (!isGroup && tab) 
							addTab(tab);
						tab = { url: '', title: '', icon: '' };
						isGroup = ignore = false;
						break;
						
					case 'folder':
						if (!isGroup && tab)
							addTab(tab);
						if (group) {
							ignore = true;
							tab = null;
							level++;
							console.log('ignoring', level, 'level folder');
						}
						else {
							console.log('making new group');
							tab = group = { group: true, title: '', tabs: [] };
							isGroup = true;
						}
						break;
					
					case '-':
						if (level > 0) {
							level--;
							console.log('level', level);
							break;
						}
						
						if (!isGroup && tab)
							addTab(tab);
						if (group) 
							addGroup(group);
						else
							level--;
						console.log('ending group', level);
						tab = group = null;
						isGroup = ignore = false;
						break;
				}
			}
			else if (tab && !ignore) {
				switch (adr.key.toLowerCase()) {
					case 'name':
						tab.title = adr.value;
						break;
						
					case 'url':
						if (!isGroup)
							tab.url = adr.value;
						break;
				}
			}
		}
		
		if (!isGroup && tab)
			addTab(tab);
		if (group)
			tabs.push(group);
		
		function addTab(info) {
			console.log('adding tab ', info.title);
			if (group) 
				group.tabs.push(info);
			else
				tabs.push(info);
		}
		
		function addGroup(info) {
			console.log('adding group ', info.title, ', tabs:', info.tabs.length);
			if (info.tabs.length > 0)
				tabs.push(info);
		}
		
		console.log(tabs);
		return tabs;
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
					writeTab(ini, index++, windowId, tabs[i].tabs[j], groupId, j);
				}
			}
			else {
				writeTab(ini, index++, windowId, tabs[i]);
			}
		}
		
		return ini.toDataURI();
	}
	
	this.writeAdr = function(tabs) {
		var adr = new IniWriter(true);
		adr.open();
		adr.writeHeader('2.0');
		
		var id = 1;
		
		for (var i = 0; i < tabs.length; i++) {
			if (tabs[i].group) {
				adr.writeSection('FOLDER');
				adr.write('ID', id++);
				adr.write('NAME', tabs[i].title);
				adr.writeLine();
				
				for (var j = 0; j < tabs[i].tabs.length; j++) {
					writeAdrTab(adr, id++, tabs[i].tabs[j]);
				}
				adr.writeLine('-');
				adr.writeLine();
			}
			else
				writeAdrTab(adr, id++, tabs[i]);
		}
		
		return adr.toDataURI();
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
	
	function writeAdrTab(adr, id, info) {
		adr.writeSection('URL');
		adr.write('ID', id);
		adr.write('NAME', info.title);
		adr.write('URL', info.url);
		adr.writeLine();
	}

	this.writeHTML = function(tabs) {
		var html = new TextWriter();
		html.write('<!DOCTYPE NETSCAPE-Bookmark-file-1>');
		html.write('<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">');
		html.write('<!--Warning. Tab Vault cannot import this format.');
		html.write('Export as a bookmarks or session file if you plan to import into Tab Vault. -->');
		html.write('<TITLE>Bookmarks</TITLE>');
		html.write('<H1>Bookmarks</H1>');
		html.write('<DL><P>');

		var indent = 1;
		for (var i = 0; i < tabs.length; i++) {
			if (tabs[i].group) {

				html.write('<DT><H3>' + tabs[i].title + '</H3>', indent);
				html.write('<DL><P>', indent);
				indent++;

				for (var j = 0; j < tabs[i].tabs.length; j++) {
					writeHTMLTab(html, tabs[i].tabs[j], indent);
				}

				indent--;
				html.write('</DL><P>', indent);
			} else {
				writeHTMLTab(html, tabs[i], indent);
			}
		}

		html.write('</DL><P>');
		return html.toDataURI();
	}

	function writeHTMLTab(html, info, indent) {
		var url = info.url.replace('&', '&amp;');
		var data = '<DT><A HREF="' + url + '">' + info.title + '</A>';
		html.write(data, indent);
	}
}

var IniUtils = {
	section: /^\s*\[(.+)\]\s*$/,
	value: /^\s*(.+?)\s*=\s*(.*)\s*$/,
	endGroup: '',
	comment: ';',
	newline: '\n',
}

var AdrUtils = {
	section: /^\s*\#(.+)\s*$/,
	value: /^\s*(.+?)\s*=\s*(.*)\s*$/,
	endGroup: '-',
	comment: ';',
	newline: '\n',
}

function IniReader(utils) {
	var text = null;
	this.isSection = false;
	this.section = null;
	this.key = null;
	this.value = null;
	
	utils = utils || IniUtils;

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
		
		var eol = text.indexOf(utils.newline);
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
		if (line.indexOf(utils.comment) == 0 || line.match(/^\s*$/))
			return null;
		
		if (utils.endGroup != '' && line.indexOf(utils.endGroup) == 0) {
			data.section = utils.endGroup;
			return data;
		}

		// Test for section header
		var match = line.match(utils.section);
		if (match != null) {
			data.section = match[1];
			return data;
		}
		// Test for data
		match = line.match(utils.value);
		if (match != null) {
			data.key = match[1];
			data.value = match[2];
			return data;
		}
		return null;
	}
}

function IniWriter(adr) {
	this.text = null;
	adr = adr || false;
	var utils = adr ? AdrUtils : IniUtils;

	this.open = function() {
		this.text = '';
	}
	
	this.close = function() {
		this.text = null;
	}

	this.write = function(string, value) {
		if (typeof value != 'undefined')
			this.text += (adr ? '\t' : '') + string + '=' + value + utils.newline;
		else
			this.text += string;
	}

	this.writeLine = function(string) {
		string = string || '';
        this.text += string + utils.newline;
	}

	this.writeComment = function(string) {
		this.writeLine(utils.comment + ' ' + string);
	}

	this.writeHeader = function(version) {
		version = version || '2.1';
		if (adr) {
			this.writeLine('Opera Hotlist version ' + version);
			this.writeLine('Options: encoding = utf8, version=3');
			this.writeLine();
		}
		else {
			this.writeLine('Opera Preferences version ' + version);
			this.writeComment('Do not edit this file while Opera is running');
			this.writeComment('This file is stored in UTF-8 encoding');
			this.writeLine();
		}
	}

	this.writeSection = function(name) {
		if (adr)
			this.writeLine('#' + name);
		else
			this.writeLine('[' + name + ']');
	}
    
    this.toDataURI = function() {
        return 'data:text/plain;base64;charset=utf-8,' + encodeBase64(this.text);
    }
}

function TextWriter() {
	this.text = '';
	this.indents = '\t\t\t\t';

	this.open = function() {
		this.text = '';
	}

	this.write = function(text, indent) {
		this.text += this.indents.substr(0, indent || 0) + text + '\n';
	}

	this.toDataURI = function() {
		return 'data:text/html;base64;charset=utf-8,' + encodeBase64(this.text);
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