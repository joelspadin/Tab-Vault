
function $(sel) {
	return document.querySelector(sel);
}
	
addEventListener('DOMContentLoaded', function() {
	
	il8n.translatePage([
		['title', 'TitleHelp'],
		['loc:by', 'By'],
		['loc:help', 'TitleHelp2'],
		['loc:footer', 'Footer', 'html'],
	]);
	
	// attach special stuff to HTML elements
	dom.fixPlaceholders();
	
	var expanders = document.querySelectorAll('.expander');
	for (var i = 0; i < expanders.length; i++) 
		new Expander(expanders[i]);
	
	var internalLinks = document.querySelectorAll('a[href^="opera:"]');
	for (var i = 0; i < internalLinks.length; i++) {
		internalLinks[i].addEventListener('click', function(e) {
			opera.extension.postMessage({
				action: 'open_tab',
				url: e.target.href, 
				focused: true });
		}, false);
	}
	
	
	// set the textContent of an element
	function setText(id, txt) {
		var e = document.getElementById(id);
		if(e) 
			e.textContent = txt;
	}


	// populate the title, name, author, ...
	setText('widget-name', widget.name);
	setText('widget-author', widget.author);
	setText('widget-version', widget.version);
	
  
	if (window.location.hash != '#first')
		$('#first-time').style.display = 'none';
	
	$('#close').addEventListener('click', function(e) {
		window.close();
	}, false);
	
	
	
}, false);


