
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
	il8n.localizeLinks('[data-loc=HelpLink], #first_help');
	
	disableAnimation();
	setDefaults();
	buildExpanders();
	buildLocales();
	
	file.init();
	access.update();
	
	$('#zeroclipboard_url').val(location.protocol + '//' + location.hostname + '/window/ZeroClipboard.swf');
	
	// Set event listeners
	
	$('#opt_topbar').change(function(e) {
		if ($(this).is(':checked'))
			$(document.body).addClass('nobar');
		else
			$(document.body).removeClass('nobar');
	})
	
	//$('#featherweight_icon').change(updateFavicon);
	
	$('#export').click(file.exportSession);
	$('#export_adr').click(file.exportAdr);
	$('#import').click(file.importTabs);
	
	$('#password, #custombutton, #ext_close_on_save').change(access.update);
	$('#custombutton').bind('input', access.onInput);
	$('#new_pass').click(function() {
		$('#password').val(access.generatePassword()).triggerChange();
		access.update();
	})
	$('#opera_action, #zeroclipboard_url').click(function(e) {
		$(this).select();
	});
	
	$('#reset').click(function() {
		if (!confirm(_('ConfirmResetAll')))
			return;
		
		bg.resetAll();
		window.location.reload();
	})
	
	$('#reset_tabs').click(function() {
		if (!confirm(_('ConfirmResetTabs')))
			return;
		
		storage.tabs.clear();
		storage.trash.clear();
		status.close('reset_tabs');
	});
	
	$('#reset_settings').click(function() {
		if (!confirm(_('ConfirmResetSettings')))
			return;
		
		settings.resetAll();
		window.location.reload();
	});
});






$(window).keypress(function(e) {
	if (e.target.nodeName == 'INPUT' || e.target.nodeName == 'TEXTAREA')
		return;
	
	if (e.keyCode == 96 || e.keyCode == 126) {
		$('#storage_list').empty().append(OptionsPage.debugStorage(natcompare));
	}
	
	if (e.keyCode == 96)
		$('#debug').toggle();
})


$.fn.triggerChange = function() {
	this.each(function() {
		var evt = document.createEvent("HTMLEvents");
		evt.initEvent("change", false, true);
		this.dispatchEvent(evt);
	})
}

function updateFavicon() {
	var icon = settings.featherweight_icon ? 'img/icon_16b.png' : 'img/icon_16.png';
	$('link[rel=icon]').attr('href', icon);
}

function setDefaults() {
	$('#max_height').attr('max', screen.height);
	$('#popup_width').attr('min', localesettings.PopupWidth).attr('max', screen.width);
}

function buildExpanders() {
	$('[data-expandsetting]').each(function(i) {
		var elem = $(this);
		var setting = elem.attr('data-expandsetting');
		var input = $('[name=' + setting + ']');
		
		input.closest('p').addClass('expander');
		
		function update(first) {
			var value = settings.get(setting);
			var expandValue = elem.attr('data-expandvalue');
			var collapseValue = elem.attr('data-collapsevalue');
			var expand = false;
			
			if (expandValue !== undefined) {
				expand = (value.toString() == expandValue);
			}
			else if (collapseValue !== undefined) {
				expand = (value.toString() != collapseValue);
			}
			else {
				expand = !!value;
			}
			
			if (expand)
				elem.slideDown(first === true ? 0 : 200);
			else
				elem.slideUp(first === true ? 0 : 200);
		}
		
		input.change(update);
		update(true);
	})	
}

function disableAnimation() {
	if (settings.disable_animation) {
		var style = $('<style>');
		style.text('*{-o-transition-property:none !important}');
		$(document.head).append(style);
	}
}

function buildLocales() {
	
	function name(lang, def) {
		return (def ? lang.defaultText : lang.name) + ' (' + lang.language + ')';
	}
	
	var select = $('#locale');
	
	var currentLang = settings.locale;
	var defaultLang = getLocaleDef(navigator.language);
	if (defaultLang === null)
		defaultLang = getLocaleDef('en');
	
	select.append($('<option>').val('').text(name(defaultLang, true)));
	
	for (var i = 0; i < locales.length; i++) {
		select.append($('<option>').val(locales[i].language).text(name(locales[i])));
		
		if (currentLang == locales[i].language)
			select[0].selectedIndex = i + 1;
	}
}


var status = new function StatusDisplay() {
	this.length = 5000;
	
	this.find = function(id) {
		return $('#' + id + ' ~ .status');
	}
	
	this.open = function(id) {
		status.find(id).addClass('working open');
	}
	
	this.close = function(id) {
		var el = status.find(id);
		el.removeClass('working').addClass('complete open');
		window.setTimeout(function() {
			el.removeClass('open');
		}, status.length);
	}
	
	this.error = function(id) {
		var el = status.find(id);
		el.removeClass('working').addClass('error open');
		window.setTimeout(function() {
			el.removeClass('open');
		}, status.length);
	}
}


var file = new function ImportExport() {
	
	var importing = false;
	this.useFileAPI = false;
	
	this.init = function() {
		if (!!window.FileReader) {
			$('#import_textarea').hide();
			$('#import_fileselect').show();
			file.useFileAPI = true;
		}
	}
	
	this.exportSession = function() {
		bg.tabutils.exportTabs('win', true);
	}
	
	this.exportAdr = function() {
		bg.tabutils.exportTabs('adr', true);
	}
	
	this.importTabs = function() {
		if (importing)
			return;
		
		if (file.useFileAPI) {
			var sel = $('#import_fileselect')[0];
			var importFile = sel.files[0];
			
			if (!importFile)
				return;
			
			var reader = new FileReader();
			reader.onload = function(e) {
				bg.tabutils.importTabs(e.target.result, file.onImportDone, file.onImportFailed);
			}
			reader.onerror = file.onImportFailed;
			reader.readAsText(importFile);
		}
		else {
			var session = $('#import_textarea').val();
			bg.tabutils.importTabs(session, file.onImportDone, file.onImportFailed);
		}
		
		file.startImport();
	}
	
	this.onImportDone = function() {
		status.close('import');
		file.endImport();
	}
	
	this.onImportFailed = function() {
		status.error('import');
		file.endImport();
	}
	
	this.startImport = function() {
		status.open('import');
		$('#import_fileselect, #import_textarea, #import').attr('disabled', true);
		importing = true;
	}
	
	this.endImport = function() {
		$('#import_fileselect, #import_textarea, #import').removeAttr('disabled');
		importing = false;
	}
}


var access = new function ExternalAccess() {
	this.makeAction = function(closeOnSave) {
		var pass = settings.password;
		return 'Go to page,"javascript:window.opera.tabvault.save' + (closeOnSave ? 'AndClose' : '') + '(\'' + pass + '\')"';
	}
	
	this.makeButton = function(label, icon, closeOnSave) {
		return access.makeAction(closeOnSave) + ',,' + (label ? '"' + label + '"' : '') + ',' + (icon ? '"' + icon + '"' : '');
	}
	
	this.makeButtonLink = function(label, icon, closeOnSave) {
		var link = $('<a class="o-button">');
		var img = $('<span class="icon">');
		
		if (icon.substr(0,3) == '16:') {
			icon = icon.substr(3);
			link.addClass('small');
		}
		
		link.attr('href', 'opera:/button/' + access.makeButton(label, icon, closeOnSave));
		
		if (icon)
			img.css('background', '-o-skin("' + icon + '")');
		else {
			img.text(label);
			img.addClass('text');
		}
		
		link.append(img);
		return link[0];
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
	
	this.makeButtons = function(container, closeOnSave, custom) {
		var label = _('SaveButtonTitle');
		var icons = [
			'Add to bookmarks',
			'New page',
			'Bookmarks',
			'Save',
			'Goto Public Page',
			'Forward Mail',
			'Reply',
			'Get Mail',
			'Send Mail',
			'Panel Notes',
			'',
			'16:Bookmark Visited',
			'16:Bookmark Unvisited',
			'16:Search Bookmark',
			'16:Note',
			'16:Panel Notes Inverted',
			'16:Note Web',
			'16:Menu Window',
			'16:Extensions Panel Button Get More',
			'16:Menu File',
			'16:Menu Transfers',
		];
		
		if (custom)
			icons.push(custom);
		
		var items = [];
		
		for (var i = 0; i < icons.length; i++) {
			items.push(access.makeButtonLink(label, icons[i], closeOnSave));
		}
		
		container.empty().append($(items));
	}
	
	this.update = function() {
		if (settings.password) {
			var close = $('#ext_close_on_save').is(':checked');
			
			$('#opera_action').val(access.makeAction(close));
			access.makeButtons($('#save_buttons'), close, $('#custombutton').val());
		}
		else {
			$('#opera_action').val('');
			$('#save_buttons').empty();
		}
	}
	
	var inputTimer = null;
	this.onInput = function() {
		if (inputTimer)
			clearTimeout(inputTimer);
		
		inputTimer = setTimeout(access.update, 100);
	}
	
}