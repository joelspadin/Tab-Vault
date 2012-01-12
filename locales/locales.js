
function LocaleDef(langcode, name, defaultText) {
	this.name = name;
	this.language = langcode || '';
	this.defaultText = defaultText || 'Default';
}

var locales = [
	new LocaleDef('de', 'Deutsch', 'Default'),
	new LocaleDef('el', 'Ελληνικά', 'Προεπιλογή'),
	new LocaleDef('en', 'English', 'Default'),
	new LocaleDef('es', 'Español', 'Por defecto'),
	new LocaleDef('it', 'Italiano', 'Default'),
	new LocaleDef('ka', 'ქართული', 'ნაგულისხმევი'),
	new LocaleDef('nl', 'Nederlands', 'Standaard'),
	new LocaleDef('pl', 'Polski', 'Domyślne'),
	new LocaleDef('pt', 'Portuguẽs', 'Por defeito'),
	new LocaleDef('ru', 'Pусский', 'По умолчанию'),
	new LocaleDef('sr', 'Cрпски', 'Подразумевано'),
	new LocaleDef('tr', 'Türkçe', 'Varsayılan'),
]

function getLocaleDef(language) {
	for (var i = 0; i < locales.length; i++)
		if (locales[i].language == language)
			return locales[i];
	return null;
}