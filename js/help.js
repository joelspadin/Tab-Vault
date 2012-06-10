
var bg = opera.extension.bgProcess;

function setText(items) {
	for (var i = 0; i < items.length; i++)
		$(items[i][0]).text(items[i][1]);
}


$(document).ready(function() {
	setText([
		['#widget-name', widget.name],
		['#widget-version', widget.version],
		['#widget-author', widget.author],
	])
	
	if (storage.opt_topbar)
		$(document.body).addClass('nobar');
	
	//updateFavicon();
	
	il8n.translatePage();
	disableAnimation();
	
	// Set event listeners
	
	$('#opt_topbar').change(function(e) {
		if ($(this).is(':checked'))
			$(document.body).addClass('nobar');
		else
			$(document.body).removeClass('nobar');
	})
	
	$('a[href^="opera:"]').click(function() {
		bg.tabs.open(this.href, true);
	})
});

function disableAnimation() {
	if (settings.disable_animation) {
		var style = $('<style>');
		style.text('*{-o-transition-property:none !important}');
		$(document.head).append(style);
	}
}



