

var mb = {
	left: 0,
	center: 1,
	right: 2,
}

var scrolldir = {
	up: -1,
	none: 0,
	down: 1,
}

var dragdrop = new function DragHandler() {
	
	this.clickTolerance = 1;	// If mouse has moved <= this, click instead of drag
	this.dragSwapDistance = 1;	
	this.dragMaxChecks = 25;		// Maximum number of position changes that can occur in one step
	this.middleClickClose = settings.get('middle_click') == 'close';
	this.middleClickOpen = settings.get('middle_click') == 'open';
	this.trashOnOpen = settings.get('trash_on_open');
	this.groupToTop = settings.get('group_to_top');
	this.list = null;
	
	this.__defineGetter__('shim', function() {return tabShim});
	this.__defineGetter__('listBounds', function() {return listBounds});
	this.__defineGetter__('groupBounds', function() {return groupBounds});
	
	// Called when a group is created or an item is moved into a collapsed group
	this.onresize = null;
	
	
	var padding = 10;
	var trashPadding = 5;
	var listTopSpace = 3;
	var groupWidth = 60;
	var groupRightOverflow = 18;
	var trashBounds = {};
	var listBounds = {};
	var groupBounds = {};
	var dragShim;
	var tabShim;
	
	var hideTimer;
	var scrollTimer;
	var scrollArea = 24;
	var scrollDir = scrolldir.none;
	var scrollInterval = 30;
	var scrollDelta = 10;
	var scrollSpeed = 1;
	
	this.startDrag = function(e, tab) {
		dragShim.className = 'list';
		dragdrop.list.addClass('drag');
		
		if (tab.group)
			dragdrop.list.addClass('draggroup');
		
		tabShim.innerHTML = tab.el.innerHTML;
		tabShim.className = tab.el.className;
		tabShim.title = '';
		tabShim.querySelector('.close').title = '';
		
		// Make the dragged element start at the right position
		var pos = dom.position(tab.el);
		tabShim.style.top = pos.y + 'px';
		// Make sure the dragged element has the same width
		tabShim.style.minWidth = tab.el.offsetWidth + 'px';
		
		//correct the position of the grouping area if the scroll bar is present
		groupBounds.x = listBounds.x + listBounds.width + groupRightOverflow - groupWidth;
		if (dragdrop.list.hasClass('scroll')) {
			groupBounds.x -= 14;
			tabShim.addClass('scroll');
			debug(tabShim.id + ' ' + tabShim.className);
		}
		
		if (hideTimer) {
			clearTimeout(hideTimer);
			hideTimer = null;
		}
		dragShim.style.display = 'block';
		listBounds.height = dragdrop.list.offsetHeight + listTopSpace;
	}
	
	
	this.endDrag = function(e) {
		dragShim.className = 'hidden';
		dragdrop.list.removeClass('drag');
		dragdrop.list.removeClass('draggroup');
		dragdrop.scroll(scrolldir.none);

		setTimeout(function() {
			dragShim.style.display = 'none';
		}, 300);
		
	}
	
	this.changeTarget = function(oldTarget, newTarget, tab) {
		debug(oldTarget + '-> ' + newTarget);
		
		// Can't drop groups on page
		//if (tab instanceof TabGroup && newTarget == 'page')
		//	newTarget = oldTarget;
		var isGroup = tab instanceof TabGroup;
		
		// Clean up old target
		switch (oldTarget) {
			case 'list':
				dragdrop.list.removeClass('drag');
				break;
			case 'page':
				opera.extension.postMessage({action: 'leave_page'});
				break;
			case 'trash':
				$('#button-trash').removeClass('drop');
				break;
		}
		
		// Set new target
		switch(newTarget) {
			case 'list':
				dragdrop.list.addClass('drag');
				break;
			case 'page':
				opera.extension.postMessage({
					action: 'enter_page', 
					title: tab.title,
					group: isGroup,
					tabs: isGroup ? tab.tabs.length : 0,
				});
				break;
			case 'trash':
				$('#button-trash').addClass('drop');
				break;
		}
		
		if (newTarget != 'list')
			dragdrop.scroll(scrolldir.none);
		
		dragShim.className = newTarget;
	}
	
	this.getTarget = function(pos) {
		
		if (pos.x < -padding /*|| pos.y < -padding */
			/*|| pos.x > window.innerWidth + padding*/
			|| pos.y > window.innerHeight + padding) 
			return 'page';
			
		if (dom.testBounds(pos, trashBounds))
			return 'trash';
		
		/*
		if (pos.x > 0 && pos.y > listBounds.y
			&& pos.x < window.outerWidth
			&& pos.y < window.outerHeight)
			return 'list';
		*/
		return 'list';
	}
	
	this.handleScroll = function(pos) {
		var dir = scrolldir.none;
		
		var diff = Math.min(scrollArea, (listBounds.y + scrollArea) - pos.y);
		if (diff > 0) {
			dir = scrolldir.up; 
			scrollSpeed = 0.1 + (0.9 * diff / scrollArea);
		}
		
		diff = Math.min(scrollArea, pos.y - (listBounds.y + listBounds.height - scrollArea));
		if (diff > 0) {
			dir = scrolldir.down;
			scrollSpeed = 0.1 + (0.9 * diff / scrollArea);
		}
		
		if (dir != scrollDir)
			dragdrop.scroll(dir);
	}
	
	this.scroll = function(dir) {
		if (dir == scrollDir) 
			return;
		
		scrollDir = dir;
		
		function doScroll() {
			dragdrop.list.scrollTop += scrollDir * scrollSpeed * scrollDelta;
		}
		
		if (scrollTimer)
			clearInterval(scrollTimer);
		
		if (dir != scrolldir.none)
			scrollTimer = setInterval(doScroll, scrollInterval);
	}

	this.callResize = function() {
		if (dragdrop.onresize)
			dragdrop.onresize();
	}
	
	this.correctListPosition = function() {
		var temp = dom.position(dragdrop.list);
		listBounds.y = temp.y - listTopSpace;
	}
	
	function init() {
		var tb = $('#button-trash');
		trashBounds = dom.position(tb);
		trashBounds.x -= trashPadding;
		trashBounds.y -= trashPadding;
		trashBounds.width = tb.offsetWidth + 2*trashPadding;
		trashBounds.height = tb.offsetHeight + 2*trashPadding;

		dragdrop.list = $('#tab-list');
		listBounds = dom.position(dragdrop.list);
		listBounds.y -= listTopSpace;
		listBounds.width = dragdrop.list.offsetWidth;
		listBounds.height = dragdrop.list.offsetHeight + listTopSpace;
		
		//groupBounds.x = listBounds.x + listBounds.width - groupWidth;
		groupBounds.y = Number.MIN_VALUE;
		groupBounds.width = groupWidth;
		groupBounds.height = Number.MAX_VALUE;
		
		dragShim = $('#drag-shim');
		tabShim = $('#tab-shim');
		
	}
	
	addEventListener('load', init, false);
}




function DraggableTab(tab) {
	var self = this;
	
	var dropTarget;			// place item goes if dropped (page,list,trash)
	var grouping = false;	// true if mouse is over grouping arrow
	var dropGroup;				// element item will be grouped with if dropped
	var inGroup = null;		// group element item is inside (null if in main list)
	var expanded = false;
	var cannotGroup = false;
	var mouseOffset;			// mouse offset when dragging starts
	var mouseStart;			// position of mouse when dragging starts
	var hidden = false;		// true if dragging has started and item is replaced by shim
	
	var nextItem = {el: null, bounds: null, center: null, expanded: false};
	var prevItem = {el: null, bounds: null, center: null, expanded: false};
	var parentItem = {bounds: null};
	
	this.startDrag = function(e) {
		if (e.button == mb.right)
			return;
		
		if (e.button == mb.center) {
			if (dragdrop.middleClickClose) 
				self.trash();
			else if (dragdrop.middleClickOpen) 
				tab.open(true, dragdrop.trashOnOpen);
			return;
		}
		
		hidden = false;
		
		var pos = dom.position(tab.el);
		mouseStart = dom.mousePosition(e);
		mouseOffset = {x: mouseStart.x - pos.x, y: mouseStart.y + dragdrop.list.scrollTop - pos.y};
		
		dropTarget = 'list';
		dropGroup = null;
		expanded = tab.el.hasClass('tabgroup') && !tab.el.hasClass('collapsed');
		
		self.updateNeighbors();
		
		addEventListener('mousemove', self.dragMove, false);
		addEventListener('mouseup', self.endDrag, false);
	}
	
	this.endDrag = function(e) {
		removeEventListener('mousemove', self.dragMove, false);
		removeEventListener('mouseup', self.endDrag, false);
		
		dragdrop.endDrag(e);
		tab.el.removeClass('drag');
		
		var mouseEnd = dom.mousePosition(e);
		if (!hidden
			&& Math.abs(mouseEnd.x - mouseStart.x) <= dragdrop.clickTolerance
			&& Math.abs(mouseEnd.y - mouseStart.y) <= dragdrop.clickTolerance) 
			self.click(e);
		else {
			switch (dropTarget) {
				case 'page':
					self.cancelMove();
					if (tab instanceof TabGroup)
						opera.extension.postMessage({action: 'leave_page'});
					
					tab.openCurrent(dragdrop.trashOnOpen);
					break;
					
				case 'trash':
					self.cancelMove();
					self.trash();
					break;
					
				case 'list':
					self.applyMove();
					break;
			}
		}
	
		tab.el.removeClass('group-hover');
		tab.el.removeClass('grouping');
		if (dropGroup)
			dropGroup.removeClass('grouping');
		
	}
	
	this.dragMove = function(e) {
		var mouse = dom.mousePosition(e);
		
		if (!hidden) {
			hidden = true;
			tab.el.addClass('drag');
			dragdrop.startDrag(e, tab);
			
			if (tab.el.parentNode.parentNode.tabInfo instanceof TabGroup) {
				inGroup = tab.parent.el;
				dragdrop.shim.addClass('in-group');
				self.updateNeighbors();
			}
		}
		
		var newDropTarget = dragdrop.getTarget(mouse) || dropTarget;
		
		if (newDropTarget != dropTarget) {
			dragdrop.changeTarget(dropTarget, newDropTarget, tab);
			dropTarget = newDropTarget;
		}
		
		switch (dropTarget) {
			case 'list':
				var y = self.limitPosition(mouse);
				dragdrop.shim.style.top = (y - dragdrop.list.scrollTop) + 'px';
				dragdrop.handleScroll(mouse);
				
				// Check if cursor is over the grouping area
				if (dom.testBounds(mouse, dragdrop.groupBounds)) 
					self.startGrouping();
				else 
					self.stopGrouping();
				
				self.updatePosition(mouse);
				break;
			
			default:
				self.stopGrouping();
				break;
		}
		
		
		
	}
	
	
	this.limitPosition = function(mousePos) {
		var scroll = dragdrop.list.scrollTop;
		var top = mousePos.y - mouseOffset.y + scroll;
		top = Math.max(top, dragdrop.listBounds.y + scroll);
		top = Math.min(top, dragdrop.listBounds.y + scroll + dragdrop.listBounds.height - tab.el.offsetHeight);
		
		return top;
	}
	
	this.updateNeighbors = function() {
		prevItem.el = tab.el.previousElementSibling || null;
		nextItem.el = tab.el.nextElementSibling || null;
		
		if (prevItem.el) {
			prevItem.bounds = dom.getBounds(prevItem.el);
			prevItem.center = dom.getCenter(prevItem.bounds);
			prevItem.expanded = prevItem.el.hasClass('tabgroup') 
				&& !prevItem.el.hasClass('collapsed');
			if (prevItem.expanded) {
				var list = prevItem.el.querySelector('ul');
				if (list.childNodes.length)
					prevItem.innerBounds = dom.getBounds(list);
				else
					prevItem.innerBounds = prevItem.bounds;
			}	
		}
		if (nextItem.el) {
			nextItem.bounds = dom.getBounds(nextItem.el);
			nextItem.center = dom.getCenter(nextItem.bounds);
			nextItem.expanded = nextItem.el.hasClass('tabgroup')
				&& !nextItem.el.hasClass('collapsed');
			if (nextItem.expanded) {
				var list = nextItem.el.querySelector('ul');
				if (list.childNodes.length)
					nextItem.innerBounds = dom.getBounds(list);
				else
					nextItem.innerBounds = nextItem.bounds;
			}
		}
		if (inGroup) {
			parentItem.bounds = dom.getBounds(inGroup);
		}
	}

	this.updatePosition = function(mouse) {
		var scroll = dragdrop.list.scrollTop;
		
		var bounds = dom.getBounds(dragdrop.shim, scroll);
		var center = dom.getCenter(bounds);
		
		function resetAfterMoveOut() {
			cannotGroup = false;
			self.updateNeighbors();
		}
		
		
		for (var i = 0; i < dragdrop.dragMaxChecks; i++) {
			var refPt, swapPt;
			
			if (prevItem.el) {
				// Test for moving into group
				if (prevItem.expanded && center.y < prevItem.innerBounds.bottom - dragdrop.dragSwapDistance) {
					if (self.moveIntoGroup(prevItem.el, true))
						continue;
				}
				
				if (expanded && prevItem.expanded) {
					refPt = bounds.y;
					swapPt = prevItem.center.y;
				}
				else {
					refPt = grouping ? center.y : bounds.y;
					swapPt = grouping ? prevItem.bounds.y : prevItem.center.y - dragdrop.dragSwapDistance;
				}
				
				if (refPt < swapPt) {
					tab.el.parentNode.swapChildren(tab.el, prevItem.el);
					self.updateNeighbors();
					continue;
				}
			}
			else if (inGroup) {
				// Check for moving out top of group
				if (bounds.y < parentItem.bounds.y - dragdrop.dragSwapDistance) {
					self.moveOutOfGroup(true);
					continue;
				}
				
				if (mouse.y < parentItem.bounds.top && !parentItem.previousElementSibling) {
					self.moveOutOfGroup(true);
					cannotGroup = true;
					setTimeout(resetAfterMoveOut, tabs.animLength);
				}
			}
			
			if (nextItem.el) {
				// Test for moving into group
				if (nextItem.expanded && bounds.bottom > nextItem.innerBounds.y + dragdrop.dragSwapDistance) {
					if (self.moveIntoGroup(nextItem.el, false))
						continue;
				}
				
				if (expanded && nextItem.expanded) {
					refPt = bounds.bottom;
					swapPt = nextItem.center.y;
				}
				else {
					refPt = grouping ? center.y : bounds.bottom;
					swapPt = grouping ? nextItem.bounds.bottom : nextItem.center.y + dragdrop.dragSwapDistance;
				
				}
				
				if (refPt > swapPt) {
					tab.el.parentNode.swapChildren(tab.el, nextItem.el);
					self.updateNeighbors();
					continue;
				}
			}
			else if (inGroup) {
				// Check for moving out bottom of group
				if (center.y > parentItem.bounds.bottom + dragdrop.dragSwapDistance) {
					self.moveOutOfGroup(false);
					continue;
				}
				
				if (mouse.y > parentItem.bounds.bottom && !parentItem.nextElementSibling) {
					self.moveOutOfGroup(false);
					cannotGroup = true;
					setTimeout(resetAfterMoveOut, tabs.animLength);
				}
			}
			
			
			break;
		}
		
		if (grouping) {
			if (prevItem.el && !prevItem.expanded && bounds.y < prevItem.center.y) 
				self.changeDropGroup(prevItem.el);
			else if (nextItem.el && !nextItem.expanded && bounds.bottom > nextItem.center.y)
				self.changeDropGroup(nextItem.el);
			else
				self.changeDropGroup(null);
		}
		
		
	}
	
	
	this.startGrouping = function() {
		if (!grouping && !inGroup) {
			// start grouping
			grouping = true;
			dragdrop.shim.addClass('group-hover');
			self.changeDropGroup(null);
		}
	}
	
	this.stopGrouping = function() {
		if (grouping) {
			// stop grouping
			grouping = false;
			dragdrop.shim.removeClass('group-hover');
			self.changeDropGroup(null);
		}
}
	
	
	this.changeDropGroup = function(newTab) {
		if (dropGroup) 
			dropGroup.removeClass('grouping');
		
		dropGroup = newTab;
		
		if (dropGroup) {
			dropGroup.addClass('grouping');
			dragdrop.shim.addClass('grouping');
		} 
		else
			dragdrop.shim.removeClass('grouping');
		
	}

	this.moveIntoGroup = function(group, up) {
		if (cannotGroup || tab instanceof TabGroup)
			return false;
		
		var list = group.querySelector('ul');
		tab.el.removeSelf();
		if (up) 
			list.appendChild(tab.el);
		else
			list.insertBefore(tab.el, list.firstChild);
		
		inGroup = group;
		group.tabInfo.updateHeight(true);
		self.updateNeighbors();
		self.stopGrouping();
		
		dragdrop.shim.addClass('in-group');
		return true;
	}
	
	this.moveOutOfGroup = function(up) {
		var list = $('#tab-list');
		tab.el.removeSelf();
		if (up)
			list.insertBefore(tab.el, inGroup);
		else
			list.insertBefore(tab.el, inGroup.nextElementSibling);		
		
		inGroup.tabInfo.updateHeight(false);
		inGroup = null;
		self.updateNeighbors();
		
		dragdrop.shim.removeClass('in-group');
	}
	
	this.cancelMove = function() {
		var startParent = tab.parent;
		var startIndex = tab.parent.tabs.indexOf(tab);
		
		var list = (startParent instanceof TabGroup) ? startParent.dom.tabs : startParent.el;
		debug(list);
		debug(startIndex);
		
		tab.el.removeSelf();
		list.insertBefore(
			tab.el,
			list.childNodes[startIndex]);
		
	}
	
	this.applyMove = function() {
		var startGroup = 0;
		var startIndex = tab.parent.tabs.indexOf(tab);
		var startParent = tab.parent;
		var endGroup = 0;
		var endIndex = tab.el.parentNode.childNodes.indexOf(tab.el);
		var endParent = tabs;
		var domchange = false;
		var makeGroup = false;
		
		if (tab.parent instanceof TabGroup) 
			startGroup = tab.parent.group;

		
		if (!dropGroup) {
			// If dropping performs reordering
			var container = tab.el.parentNode.parentNode;
			if (container.tabInfo instanceof TabGroup) {
				endGroup = container.tabInfo.group;
				endParent = container.tabInfo;
			}
		}
		else {
			debug('performing grouping');
			// If dropping performs grouping...
			if (dropGroup.tabInfo instanceof TabGroup) {
				// dropping item onto group
				if (tab instanceof Tab) {
					// dropping tab onto group
					endGroup = dropGroup.tabInfo.group;
					endParent = dropGroup.tabInfo;
					if (dragdrop.groupToTop)
						endIndex = 0;
					else
						endIndex = dropGroup.tabInfo.tabs.length;
				}
				else {
					// dropping group onto group
					tabs.el.moveChild(endIndex, startIndex);
					dropGroup.tabInfo.mergeGroup(tab, dragdrop.groupToTop);
					dragdrop.callResize();
					return;
				}
				
			}
			else {
				// dropping item onto tab
				debug('making new group');
				makeGroup = true;
			}
		}
		
		debug(startGroup + ':' + startIndex + ' -> ' + endGroup + ':' + endIndex);
		
		// Move tab into correct group
		if (startGroup != endGroup) {
			var temp = startIndex;
			startIndex = storage.tabs.changeGroup(startIndex, startGroup, endGroup);
			
			var tempTab = startParent.tabs[temp];
			startParent.remove(temp, true, true);
			endParent.attachTab(tempTab);
			domchange = true;
		}
		
		// Move tab into correct position
		if (startIndex != endIndex) 
			endParent.move(startIndex, endIndex, !domchange);
		
		// If start group is now empty, remove it
		if (startGroup != 0 && startParent.tabs.length == 0) {
			debug('startgroup is empty');
			startParent.removeSelf();
			dragdrop.callResize();
		}
		
		if (makeGroup) {
			var dropIndex = tabs.el.childNodes.indexOf(dropGroup);
			self.buildGroup(dropGroup.tabInfo, dropIndex, tab, endIndex);
			dragdrop.callResize();
		}
	}
	
	this.buildGroup = function(parent, parentIndex, item, itemIndex) {
		var groupName = parent.info.title;
		debug('make group ' + itemIndex + ' -> ' + parentIndex + ' ' + groupName);
		// turn parent tab into group
		var g = tabs.makeGroup(parentIndex, groupName);
		
		// add dropped tab/group to new group
		if (tab instanceof Tab) {
			// add tab to group
			var i = storage.tabs.changeGroup(itemIndex, 0, g.group);
			var tempTab = tabs.tabs[itemIndex];
			tabs.remove(itemIndex, true, true);
			g.attachTab(tempTab);
			
			if (dragdrop.groupToTop)
				g.move(g.tabs.length - 1, 0);
		}
		else {
			// merge group with new group
			g.mergeGroup(item, dragdrop.groupToTop);
		}
		
	}
	
	this.click = function(e) {

		if (tab.url) {
			var background = e.ctrlKey;
			if (!background && !tabs.allowOpen)
				return;
			
			tab.open(background, dragdrop.trashOnOpen);

			e.preventDefault();
		}
		else if (tab.group) 
			tab.toggleExpand();
	}
	
	this.trash = function() {
		tab.trash();
	}
	
	function init() {
		var grabEl = tab.group ? tab.dom.top : tab.el;
		grabEl.addEventListener('mousedown', self.startDrag, false);
	}
	init();
}


