
function LocaleDef(langcode, name, defaultText, hasHelp) {
	this.name = name;
	this.language = langcode || '';
	this.defaultText = defaultText || 'Default';
	this.hasHelp = hasHelp || false;
}

var locales = [
	new LocaleDef('de', 'Deutsch', 'Default', true),
	new LocaleDef('de-2', 'Deutsch 2', 'Default', true),
	new LocaleDef('el', 'Ελληνικά', 'Προεπιλογή'),
	new LocaleDef('en', 'English', 'Default', true),
	new LocaleDef('es', 'Español', 'Por defecto'),
	new LocaleDef('fr', 'Français', 'Par Défaut', true),
	new LocaleDef('it', 'Italiano', 'Default', true),
	new LocaleDef('ka', 'ქართული', 'ნაგულისხმევი', true),
	new LocaleDef('nl', 'Nederlands', 'Standaard', true),
	new LocaleDef('pl', 'Polski', 'Domyślne', true),
	new LocaleDef('pt', 'Portuguẽs', 'Por defeito'),
	new LocaleDef('ru', 'Pусский', 'По умолчанию', true),
	new LocaleDef('sr', 'Cрпски', 'Подразумевано', true),
	new LocaleDef('tr', 'Türkçe', 'Varsayılan', true),
]

function getLocaleDef(language) {
	for (var i = 0; i < locales.length; i++)
		if (locales[i].language == language)
			return locales[i];
	return null;
}