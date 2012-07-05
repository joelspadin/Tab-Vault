
var il8n = {}
var localestore = {}

scriptNames = {
	options: 'locale-options.js',
	popup: 'locale-dropdown.js',
	misc: 'locale-misc.js',
}


function loadLocaleScripts(locale, callback) {
	localestore[locale] = {}

	includeScript(locale + '/' + scriptNames.options, function() {
		localestore[locale].options = il8n.strings;
		includeScript(locale + '/' + scriptNames.popup, function() {
			localestore[locale].popup = il8n.strings;
			includeScript(locale + '/' + scriptNames.misc, function() {
				localestore[locale].misc = localesettings;
				if (callback)
					callback(localestore[locale])
			})
		})
	})
}


function includeScript(script, callback) {
	s = $('<script>').attr('src', script);
	$(document.body).append(s);
	if (callback) 
		window.setTimeout(callback, 50);
}

function testLocales() {
	$(document.body).css({ columns: Math.floor(window.innerWidth / 350).toString() });

	baseLocale = localestore['en'];
	for (locale in localestore) {
		if (!localestore.hasOwnProperty(locale) || locale == 'en')
			continue;

		info = getLocaleDef(locale)
		section = $('<section>').append($('<h1>').css({ marginTop: 0 }).text(info.name + ' (' + info.language + ')'));
		section.css({ breakInside: 'avoid-column' });
		$(document.body).append(section);

		['options', 'popup', 'misc'].forEach(function(item) {
			section.append($('<h4>').text(scriptNames[item]))
			missing = findMissingProperties(baseLocale[item], localestore[locale][item]);
			if (missing.length > 0) {
				list = $('<ul>')
				missing.forEach(function(key) {
					list.append($('<li style="color:red">').text(key));
				})
				section.append(list);
			} else {
				section.append($('<p>Okay</p>'));
			}
		})
	}
}

function findMissingProperties(base, test) {
	missing = [];
	for (key in base) {
		if (!base.hasOwnProperty(key))
			continue;

		if (!test.hasOwnProperty(key))
			missing.push(key);
	}
	return missing;
}


$(function() {
	var loading = $('<p>').text('loading...')
	$(document.body).append(loading);

	localeQueue = locales.map(function(item) { return item.language })

	function processNext() {
		if (localeQueue.length > 0) {
			locale = localeQueue.shift();
			loading.text('loading ' + locale + '...');
			loadLocaleScripts(locale, processNext);
		}
		else {
			loading.remove();
			testLocales();
		}
	}

	processNext();
})