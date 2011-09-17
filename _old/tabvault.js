// --UserScript--
// @exclude *
// --/UserScript--

function debug(msg) {
	//opera.postError(msg);
}

var extension;
var active = false;
var closing = false;
var importing = false;
var tabs;
var trash;
var settings;

var buttons;
var panels;
var activePanel = null;


function handleMessage(e) {
	extension = e.source;
	debug('received message: ' + e.data.action);
	switch (e.data.action) {
		case 'open':
			if (active) {
				closeUI(!settings['instant_open']);
				break;
			}
			updateData(e.data);
			applyCss(e.data.styles);
			openUI(e.data.smooth || false);
			break;
		case 'close':
			closeUI(e.data.smooth || false);
			break;
		case 'update':
			updateData(e.data);
			updateUI(
				e.data.tabs ? true : false,
				e.data.trash ? true : false,
				e.data.settings ? true : false);
			break;
		case 'import_complete':
			importing = false;
			if (active) {
				var textarea = $('tabvlt_import');
				textarea.value = '';
				textarea.disabled = false;
				textarea.focus();
				textarea.blur();
				switchPanel('main');
			}
			break;
		case 'frame_workaround_open':
			debug(e.data.url);
			if (window.location.href.replace(/#.*$/, '') == e.data.url) {
				debug('Responding to frame workaround message');
				extension.postMessage({
					action: 'frame_workaround_response',
					smooth: e.data.smooth,
				});
			}
			break;
		case 'hello_options_page':
			break;
		default:
			debug('Unknown action: ' + e.data.action);
	}
}

// If this is an iframe, don't load
if (window.top == window.self) {
	debug('injected: ' + window.location);
	opera.extension.onmessage = handleMessage;
}
else {
	debug('framed: ' + window.location);
	opera.extension.onmessage = function(e) {
		switch (e.data.action) {
			case 'open':
				debug('Frame received open message');
				e.source.postMessage({
					action: 'frame_workaround',
					smooth: e.data.smooth,
				});
				break;
			case 'close':
			case 'frame_workaround_open':
				break;
			default:
				debug('Unhandled action in frame: ' + e.data.action);
		}
	}
}




function addClass(elem, className) {
	if (elem && elem.className.split(' ').indexOf(className) == -1)
		elem.className = (elem.className + ' ' + className).trim();
}

function removeClass(elem, className) {
	if (!elem)
		return;
	elem.className = elem.className.split(' ').filter(function(item) {
		return item != className;
	}).join(' ');
}

function make(element, modifiers, content) {
	var el = document.createElement(element);
	if (modifiers) {
		var mod = modifiers.split(' ');
		for (var i = 0; i < mod.length; i++) {
			if (mod[i][0] == '.') {
				addClass(el, mod[i].substr(1));
			}
			else if (mod[i][0] == '#') {
				el.id = mod[i].substr(1);
			}
		}
	}
	if (content)
		el.innerHTML = content;
	return el;
}

function $(id) {
	return document.getElementById(id);
}

function updateData(data) {
	if (data.tabs !== null)
		tabs = data.tabs;
	if (data.trash !== null)
		trash = data.trash;
	if (data.settings !== null)
		settings = data.settings;
}

function applyCss(css) {
	if (active)
		return;
	
	// If linux workaround is in effect, styles may be left on page
	if (settings['linux_crash_workaround'] && $('tabvlt_styles')) {
		debug('ignoring applyCss. already applied.')
		return;
	}

	// Correct placement of some elements in Quirks Mode
	if (document.compatMode == 'BackCompat')
		css += '#tabvlt .tab .close { margin-top: -18px; }'
			+ '#tabvlt .tab .btm { margin-top: 0.25em; }'
			+ '#tabvlt .tab .url { margin-bottom: 3px; }'
			+ '#tabvlt_trash .trash { padding-bottom: 3px; }'
			+ '#tabvlt .tab .icon { margin-top: -8px; }';

	var s = make('style', '#tabvlt_styles');
	s.type = 'text/css';
	s.appendChild(document.createTextNode(css));
	(document.getElementsByTagName('head')[0] || document.documentElement).appendChild(s);
}

function removeCss() {
	if (!active || settings['linux_crash_workaround']) {
		debug('ignoring removeCss. Panel not active or linux workaround in effect.')
		return;
	}

	var s = $('tabvlt_styles');
	if (!s)
		return;
	
	s.parentNode.removeChild(s);
}


function addCurrentTab() {
	extension.postMessage({
		action: 'add_tab'
	});
	
	if (settings['close_on_add']) 
		extension.postMessage({
			action: 'close_current'
		});
	else
		switchPanel('main');
}

function trashTab(index) {
	extension.postMessage({
		action: 'trash_tab',
		index: index,
	});
}

function restoreTab(index) {
	extension.postMessage({
		action: 'restore_tab',
		index: index,
	});
}

function clearTrash() {
	extension.postMessage({
		action: 'clear_trash'
	});

	switchPanel('main');
}

function openTab(index, newWindow, background) {
	var url = tabs[index].url;
	if (settings['trash_on_open'])
		trashTab(index);

	extension.postMessage({
		action: 'open',
		url: url,
		newWindow: newWindow,
		background: background
	});
}

function moveTab(index, newIndex) {
	if (index == -1 || newIndex == -1)
		debug('invalid index');
	
	extension.postMessage({
		action: 'move_tab',
		from: index,
		to: newIndex,
	});
	
	reindexTabs();
}

function exportSession(e) {
    extension.postMessage({
        action: 'export',
        screen: {
            x: window.screenLeft,
            y: window.screenTop,
            width: window.outerWidth,
            height: window.outerHeight,
        }
    });
    e.preventDefault();
}

function importSession(e) {
	if (importing)
		return;
	
	importing = true;
	var textarea = $('tabvlt_import');
	extension.postMessage({
		action: 'import',
		session: textarea.value,
	});
	textarea.value = 'Importing.  Please Wait.';
	textarea.disabled = true;
	e.preventDefault();
}



// UI Methods

function openUI(smooth) {
	// If UI is already open, do nothing
	if (active)
		return;
	
	active = true;
	
	// Build overlay
	var overlay = make('div', '#tabvlt_ov');
	// If opening smoothly, set 'active' class immediately after opening UI
	function activate() { addClass(overlay, 'active'); }
	if (smooth) 
		setTimeout(activate, 1);
	else 
		activate();
	
	overlay.addEventListener('click', function() { closeUI(!settings['instant_open']) }, false);
	document.body.appendChild(overlay);

	// Build side panel
	var panel = makePanel();
	overlay.appendChild(panel);

	window.addEventListener('resize', setPanelSize, false);
	setPanelSize();

	// Load UI info and switch to the main panel
	updateUI(true, true, true);
	switchPanel('main');
	initDrag();
	
	debug('TabVault UI opened');
}

function closeUI(smooth) {
	// If UI is not open, do nothing
	if (!active)
		return;
	debug('TabVault UI closed');

	var overlay = $('tabvlt_ov');

	function finishClose() {
		if (!closing)
			return;
		destroyDrag();
		overlay.parentNode.removeChild(overlay);
		removeCss();
		closing = false;
		active = false;
		activePanel = null;
	}

	// If already closing, close immediately
	if (closing) {
		finishClose();
		return;
	}

	// If closing smoothly, wait until panel finishes animation before finishing
	closing = true;
	if (smooth) {
		setTimeout(finishClose, 600);
		overlay.className = '';
	}
	else
		finishClose();

	// Clean up
	window.removeEventListener('resize', setPanelSize, false);
	tabs = trash = panels = buttons = null;
}

function updateUI(updateTabs, updateTrash, updateSettings) {
	// If UI is not open, do nothing
	if (!active)
		return;

	// If tabs updated, rebuild tab list
	if (updateTabs) {
		var list = $('tabvlt_tablist');
		list.innerHTML = '';
		for (var i = 0; i < tabs.length; i++) 
			list.appendChild(makeTab(tabs[i], i));
		setTabWidth();
	}
	
	// If trash updated, rebuild trash list
	if (updateTrash) {
		var trashlist = $('tabvlt_trashlist');
		trashlist.innerHTML = '';
		for (var i = 0; i < trash.length; i++) 
			trashlist.appendChild(makeTrash(trash[i], i));

		// Disable trash panel if trash is empty
		if (trash.length > 0)
			removeClass($('tabvlt_trashicon'), 'empty');
		else {
			addClass($('tabvlt_trashicon'), 'empty');
			if (activePanel == 'trash')
				switchPanel('main');
		}
	}

	// If settings updated, set settings to loaded values
	if (updateSettings) {
		var form = panels.settings.querySelector('form');
		var checkboxes = form.querySelectorAll('input[type=checkbox]');
		for (var i = 0; i < checkboxes.length; i++) {
			var name = checkboxes[i].name;
			if (typeof settings[name] != 'undefined')
				checkboxes[i].checked = settings[name];
		}
	}
	
	debug('TabVault UI updated: ' + tabs.length + ' tabs, ' + trash.length + ' trash');
}

function switchPanel(newPanel) {
	// Do nothing if switching to same panel or switching to empty trash
	if (newPanel == activePanel || (newPanel == 'trash' && trash.length == 0)) 
		return;

	if (activePanel) {
		if (panels[activePanel])
			removeClass(panels[activePanel], 'active');
		if (buttons[activePanel])
			removeClass(buttons[activePanel], 'active');
	}

	activePanel = newPanel;
	if (panels[newPanel])
		addClass(panels[newPanel], 'active');
	if (buttons[newPanel])
		addClass(buttons[newPanel], 'active');
}

// Set maximum height on panels to fix scrolling with long tab lists
function setPanelSize() {
	panels.main.style.maxHeight =
	panels.settings.style.maxHeight =
	panels.trash.style.maxHeight = (window.innerHeight - 33) + 'px';
	setTabWidth();
}

// Account for scroll bar with width of tabs
function setTabWidth() {
	if (panels.main.scrollHeight > panels.main.offsetHeight)
		addClass(panels.main, 'min');
	else 
		removeClass(panels.main, 'min');
}

// Builds a tab
function makeTab(data, index) {
	var tab = make('div', '.tab .tab' + index);

	function missing(img) {
		addClass(img, 'missing');
		img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII=';
	}

	// Make top section
	var top = make('div', '.top');
	var icon = make('img', '.icon');
	icon.onerror = function() { missing(icon) }
	icon.src = data.icon;
	icon.alt = '';
	if (!icon.src)
		missing(icon);

	var title = make('span', '.title');
	title.innerHTML = title.title = data.title;
	
	top.appendChild(icon);
	top.appendChild(title);
	tab.appendChild(top);

	// Make bottom section
	var bottom = make('div', '.btm')
	var url = make('span', '.url');
	url.innerHTML = url.title = data.url;

	var close = make('a', '.close');
	close.addEventListener('click', function(e) {
		trashTab(index);
	}, false);
	// Prevent close button from starting tab drag
	close.addEventListener('mousedown', function(e) {
		e.stopPropagation();
		e.preventDefault();
	}, true);

	bottom.appendChild(url);
	bottom.appendChild(close);
	tab.appendChild(bottom);

	// Make tab draggable
	new DraggableTab(tab, index);
	return tab;
}

// Builds a trash item
function makeTrash(data, index) {
	var trash = make('div', '.trash .trash' + index);
	var icon = make('img', '.icon');
	icon.src = data.icon;

	var title = make('span', '.title', data.title);

	trash.appendChild(icon);
	trash.appendChild(title);

	trash.title = data.url;
	trash.addEventListener('click', function(e) {restoreTab(index);}, false);
	return trash;
}

// Builds the UI panel
function makePanel() {
	var panel = make('div', '#tabvlt');
	panel.addEventListener('click', function(e) {e.stopPropagation()}, false);
	// disable text selection on panel
	panel.addEventListener('mousedown', function(e) {e.preventDefault()}, false);
	panel.appendChild(makeToolbar());
	makePanelContent(panel);
	return panel;
}

// Builds the toolbar
function makeToolbar() {
	var toolbar = make('div', '#tabvlt_bar');

	buttons = {
		main: null,
		settings: null,
		trash: null,
	};

	// Build the Add Current Tab button
	var add = buttons.add = make('a', '.btn .add');
	add.appendChild(make('span'));
	var text = make('span', '.text', 'Add Current Tab');
	add.appendChild(text);
	add.addEventListener('click', addCurrentTab, false);

	// Build the panel switcher buttons
	var main = buttons.main = make('a', '.btn .main');
	main.appendChild(make('span'));
	main.addEventListener('click', function() {switchPanel('main');}, false);
	main.title = 'Tab Vault';

	var settings = buttons.settings = make('a', '.btn .settings');
	settings.appendChild(make('span'));
	settings.addEventListener('click', function() {switchPanel('settings');}, false);
	settings.title = 'Settings';

	var trash = buttons.trash = make('a', '#tabvlt_trashicon .btn .trash');
	trash.appendChild(make('span'));
	trash.addEventListener('click', function() {switchPanel('trash');}, false);
	trash.title = 'Trash';

	toolbar.appendChild(add);
	toolbar.appendChild(trash);
	toolbar.appendChild(settings);
	toolbar.appendChild(main);
	return toolbar;
}

function makePanelContent(panel) {
	panels = {
		main: null,
		settings: null,
		trash: null,
	};

	// Build the main panel
	var main = panels.main = make('div', '.panel .active');
	var mainList = make('div', '#tabvlt_tablist');
	main.appendChild(mainList);
	panel.appendChild(main);

	// 
	var settings = panels.settings = make('div', '#tabvlt_settings .panel');
	settings.addEventListener('mousedown', function(e) {e.stopPropagation()}, false);
	var settingsForm = make('form');
    makeSettings(settingsForm);
	settings.appendChild(settingsForm);
	panel.appendChild(settings);

	var trash = panels.trash = make('div', '#tabvlt_trash .panel');
	var top = make('div', '.empty');
	var emptyLink = make('a', null, 'Clear List of Closed Tabs');
	emptyLink.addEventListener('click', clearTrash, false);
	
	var trashList = make('div', '#tabvlt_trashlist');
	
	top.appendChild(emptyLink);
	trash.appendChild(top);
	trash.appendChild(trashList);
	trash.appendChild(make('div'));
	panel.appendChild(trash);
}

function makeSettings(form) {
    form.innerHTML = '';
    var settings = [
        ['<h>', 'Panel Settings'],
        ['show_badge', 'Display badge on button'],
		['hide_zero', 'Hide badge when no tabs are stored'],
        ['trash_on_open', 'Send opened tabs to trash'],
		['close_on_add', 'Close current tab after storing'],
		['reopen_ui', 'Reopen panel after closing current tab'],
		['cache_styles', 'Cache CSS (use more memory, less disk IO)'],
        ['<h>', 'Miscellaneous'],
    ];
    
    // Build all settings boxes
    for (var i = 0; i < settings.length; i++) {
        var setting = settings[i][0];
        var text = settings[i][1];
        
        if (setting == '<h>') {
            var h = make('h4', null, text);
            form.appendChild(h);
            continue;
        }
        
        var p = make('p');
        var cb = make('input');
        cb.type = 'checkbox';
        cb.name = setting;
        cb.id = 'tabvlt_st_' + setting;
        
        cb.addEventListener('change', function(e) {
            settings[e.target.name] = e.target.checked;
            extension.postMessage({
                action: 'set_setting',
                name: e.target.name,
                value: e.target.checked
            });
        }, false);
        
        var label = make('label', null, text);
        label.htmlFor = 'tabvlt_st_' + setting;
        
        p.appendChild(cb);
        p.appendChild(label);
        form.appendChild(p);
    }
    
	// Make export button
    var p = make('p');
    var exp = make('button', null, 'Export Stored Tabs as Session');
    exp.addEventListener('click', exportSession, false);
    p.appendChild(exp);
    form.appendChild(p);
	
	// Make import button
	p = make('p');
	var imp = make('button', null, 'Import Session to Stored Tabs');
	imp.addEventListener('click', importSession, false);
	p.appendChild(imp);
	form.appendChild(p);
	
	p = make('p');
	var msg = 'Open a session file in a text editor, then copy and paste the session here before clicking Import.  This will temporarily open all the imported tabs to collect favicons.';
	var importText = make('textarea', '#tabvlt_import');
	importText.value = msg;
	importText.addEventListener('focus', function(e) {
		if (importText.value == msg)
			importText.value = '';
	}, false);
	importText.addEventListener('blur', function(e) {
		if (importText.value == '')
			importText.value = msg;
	}, false);
	p.appendChild(importText);
	form.appendChild(p);
}

// Gets the index of a stored tab
function getTabIndex(tab) {
	var container = tab.parentNode;
	for (var i = 0; i < container.childNodes.length; i++) {
		if (container.childNodes[i] == tab)
			return i;
	}
	return -1;
}

// Reindexes the tabs in the list
function reindexTabs() {
	var container = panels.main.querySelector('div');
	for (var i = 0; i < container.childNodes.length; i++) {
		var tab = container.childNodes[i];
		tab.className = 'tab tab' + i;
		tab.drag.setIndex(i);
	}
}


// Drag and Drop

var dragObject = null;
var dragShim = null;

var listBounds;
var pageBounds;
var trashBounds;

var scrollMousePos;
var scrolling = false;
var scrollSpeed = 0;
var scrollAccel = 1.08;
var startScrollSpeed = 4;
var maxScrollSpeed = 12;

// Initialize drag events
function initDrag() {
	dragObject = null;
	document.addEventListener('mouseup', dragMouseUp, false);
}

// Clean up when UI closed
function destroyDrag() {
	document.removeEventListener('mouseup', dragMouseUp, false);
	if (dragObject) 
		dragObject.drag.endDrag(null);

	if (dragShim) 
		dragShim.parentNode.removeChild(dragShim);

	dragObject = dragShim =
	listBounds = pageBounds = trashBounds = null;
}

// End drags on mouse up
function dragMouseUp(e) {
	if (!dragObject || e.button != 0)
		return;
	dragObject.drag.endDrag(e);
	dragObject = null;
	hideDragShim();
}

// Pass drag events to tab being dragged
function dragMove(e) {
	dragObject.drag.dragMove(e);
}

// Begin a tab drag
function startDrag(tab) {
	dragObject = tab;
	
	var trash = $('tabvlt_trashicon');
	trashBounds = getPosition(trash);
	trashBounds.width = trash.offsetWidth;
	trashBounds.height = trash.offsetHeight;

	var list = $('tabvlt');
	var bar = $('tabvlt_bar');
	listBounds = getPosition(list);
	listBounds.y += bar.offsetHeight;
	listBounds.width = window.innerWidth - listBounds.x;
	listBounds.height = window.innerHeight - listBounds.y;

	pageBounds = {
		x: 0,
		y: 0,
		width: window.innerWidth - listBounds.width,
		height: window.innerHeight
	};
}

// Gets the position of an element
function getPosition(el) {
	var x = 0, y = 0;
	while (el.offsetParent) {
		x += el.offsetLeft;
		y += el.offsetTop;
		el = el.offsetParent;
	}
	x += el.offsetLeft;
	y += el.offsetTop;

	return {x: x, y: y};
}

// Gets the position of the mouse
function getMousePosition(e) {
	if (!e)
		return {x: 0, y: 0};
	return {x: e.pageX, y: e.pageY};
}


// Returns true if pos is within the rectangle bounds
function testBounds(pos, bounds) {
	return (pos.x >= bounds.x && pos.y >= bounds.y
		&& pos.x <= bounds.x + bounds.width
		&& pos.y <= bounds.y + bounds.height);
}

// Builds the element that displays drag-and-drop feedback
function makeDragShim(tab, title) {
	if (!dragShim) {
		dragShim = make('div', '#tabvlt_drag');
		$('tabvlt').appendChild(dragShim);
	}

    // Build draggable tab
	dragShim.innerHTML = tab.outerHTML;
	dragShim.tab = dragShim.querySelector('.tab');
	changeDragShim('list');

    // Build 'Drop to trash' highlight
	var trash = make('div', '.trash');
	trash.appendChild(make('div'));
	dragShim.appendChild(trash);

    // Build 'Drop to open' highlight
    var panel = $('tabvlt');
	var panelX = getPosition(panel).x - window.scrollX;
	var page = make('div', '.page');
	page.style.top = '3px';
	page.style.left = '3px'
	page.style.height = (window.innerHeight - 6) + 'px';
	page.style.width = (panelX - 7) + 'px';
    var temp = make('div');
    
    // Build 'Drop to open' info
    var info = make('div', '.info');
    var infoTitle = make('div', '#tabvlt_infotitle', title);
    document.body.appendChild(infoTitle);
    info.style.width = Math.min(infoTitle.offsetWidth + 40, panelX - 67) + 'px';
    infoTitle.parentNode.removeChild(infoTitle);
    var infoMsg = make('div', null, 'Drop to open in current tab');
    info.appendChild(infoTitle);
    info.appendChild(infoMsg);
    
    temp.appendChild(info);
	page.appendChild(temp);
	dragShim.appendChild(page);
	
    // Center the 'Drop to open' info vertically
    info.style.marginTop = ((window.innerHeight - 6 - info.offsetHeight)/2) + 'px';

	// Make the dragged element start at the right position
	var pos = getPosition(tab);
	dragShim.tab.style.top = (pos.y - panels.main.scrollTop - 2) + 'px';
	// Make sure the dragged element has the same width
	dragShim.querySelector('.tab').style.minWidth = tab.offsetWidth;
}

// Hides the drag shim
function hideDragShim() {
	if (dragShim) {
		dragShim.parentNode.removeChild(dragShim);
		dragShim = null;
	}
	
	removeClass($('tabvlt_trashicon'), 'drop');
}

// Changes the drag shim visual (list, trash, or page)
function changeDragShim(target) {
	dragShim.className = target;

	if (target == 'trash') 
		addClass($('tabvlt_trashicon'), 'drop');
	else 
		removeClass($('tabvlt_trashicon'), 'drop');
}


function DraggableTab(tab, tabIndex) {
	var index = tabIndex;
	var dropTarget;
	var mouseOffset;
	var mouseStart;
	
	// Positions where dragging moves tab up/down
	var nextTabY;
	var prevTabY;

	function updateTabY() {
		if (!tab.previousSibling)
			prevTabY = -1;
		else 
			prevTabY = getPosition(tab.previousSibling).y + 
				(0.5 * tab.previousSibling.offsetHeight);
		
		if (!tab.nextSibling)
			nextTabY = -1;
		else
			nextTabY = getPosition(tab.nextSibling).y + 
				(0.5 * tab.nextSibling.offsetHeight);
	}
	
	this.setIndex = function(value) {
		index = value;
	}

	this.startDrag = function(e) {
		if (e.button != 0)
			return;
		
		startDrag(tab);

		var tabPos = getPosition(tab);
		mouseStart = getMousePosition(e);
		mouseOffset = {x: mouseStart.x - tabPos.x, y: mouseStart.y + panels.main.scrollTop - tabPos.y};
		dropTarget = 'list';

		document.addEventListener('mousemove', dragMove, true);
		makeDragShim(tab, tabs[index].title);
		addClass(tab, 'drag');
		
		updateTabY();

		debug('started drag ' + index);
		e.preventDefault();
	}

	this.endDrag = function(e) {
		document.removeEventListener('mousemove', dragMove, true);
		removeClass(tab, 'drag');

		var mouseEnd = getMousePosition(e);
		if (Math.abs(mouseEnd.x - mouseStart.x) <= 1 && 
			Math.abs(mouseEnd.y - mouseStart.y) <= 1) {
			//mouse didn't move, so stop drag and open tab
			openTab(index, true, e.ctrlKey);
		}
		else {
			//perform action based on where tab was dropped
			debug('drop: ' + dropTarget);
			switch (dropTarget) {
				case 'list':
					moveTab(index, getTabIndex(tab));
					break;
				case 'page':
					openTab(index, false);
					break;
				case 'trash':
					trashTab(index);
					removeClass($('tabvlt_trashicon'), 'drop');
					break;
			}
		}
	}

	this.dragMove = function(e) {
		var mousePos = getMousePosition(e);
		var newDropTarget = dropTarget;

		// Limit movement of tab
		var top = limitPosition(mousePos);
		dragShim.tab.style.top = (top - panels.main.scrollTop) + 'px';

		mousePos.y -= window.scrollY;
		mousePos.x -= window.scrollX;
		// Check which drag target the cursor is on
		if (testBounds(mousePos, listBounds))
			newDropTarget = 'list'
		else if (testBounds(mousePos, pageBounds))
			newDropTarget = 'page';
		else if (testBounds(mousePos, trashBounds))
			newDropTarget = 'trash';
		else
			newDropTarget = 'list';

		if (newDropTarget != dropTarget) {
			changeDragShim(newDropTarget);
			dropTarget = newDropTarget;
		}
		
		if (dropTarget == 'list') {
			var bottom = top + dragShim.tab.offsetHeight;
			while (true) {
				if (prevTabY != -1 && top < prevTabY) {
					tab.parentNode.insertBefore(tab, tab.previousSibling);
					updateTabY();
					continue;
				}
				else if (nextTabY != -1 && bottom > nextTabY) {
					tab.parentNode.insertBefore(tab, tab.nextSibling.nextSibling);
					updateTabY();
					continue;
				}
				break;
			}
			
			if (panels.main.scrollHeight > panels.main.offsetHeight) {
				scrollMousePos = mousePos;
				if (!scrolling) {
					scrollSpeed = startScrollSpeed;
					scrollPanel();
				}
			}
		}
	}
	
	function limitPosition(mousePos) {
		var scroll = panels.main.scrollTop;
		var top = mousePos.y - mouseOffset.y + scroll;
		top = Math.max(top, listBounds.y + scroll);
		top = Math.min(top, listBounds.y + scroll + listBounds.height - tab.offsetHeight - 4);
		return top;
	}
	
	function scrollPanel() {
		scrolling = false;
		var top = limitPosition(scrollMousePos) - panels.main.scrollTop;
		
		if (dropTarget != 'list')
			return;
		
		if (top <= listBounds.y + 1) {
			panels.main.scrollTop -= scrollSpeed;
		}
		else if (top >= listBounds.y + listBounds.height - tab.offsetHeight - 4) {
			panels.main.scrollTop += scrollSpeed;
		}
		else
			return;
		
		scrollSpeed = Math.min(scrollSpeed * scrollAccel, maxScrollSpeed);
		window.setTimeout(scrollPanel, 10);
		scrolling = true;
	}

	tab.addEventListener('mousedown', this.startDrag, false);
	tab.drag = this;
}