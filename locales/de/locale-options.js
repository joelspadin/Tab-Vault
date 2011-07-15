// Strings used by options, help, and upgrade pages

il8n.strings = {

	Title: 'Tab Vault - Optionen',				// Options page tab title
	By: 'von',
	
	TitleHelp: 'Tab Vault - Hilfe',			// Help page tab title
	TitleHelp2: 'Hilfe',
	TitleUpgrade: 'Tab Vault - Upgrader',		// Upgrade page tab title
	TitleUpgrade2: 'Upgrader',
	
	Default: 'Default',						// Default button text
	ActionFailed: 'Fehlgeschlagen!',				// Status message for errors
	ActionDone: 'Fertig!',					// Status message for success
	
	Preferences: 'Einstellungen',				// Preferences category header
	CompactTabs: '<Unbenutzt>',
	Tooltips: 'Hilfe-Tooltips im Popup anzeigen',
	VerboseTabTips: 'Sowohl Titel als auch URL im Tab-Tooltip anzeigen',
	TrashOnOpen: 'Nach öffnen eines Tabs diesen aus der Tabliste entfernen',
	DisableAnimation: 'Animationen abschalten',
	SaveToTop: 'Hinzugefügte Tabs an den Anfang der Tabliste setzen',
	GroupToTop: 'Falls gruppiert wird neue Tabs an den Anfang der Gruppe setzen',
	CloseTabOnSave: 'Aktuellen Tab nach dem Hinzufügen schließen',
	CloseOnSave: 'Popup schließen, nachdem der aktuelle Tab zur Liste hinzugefügt wurde',
	CloseOnPageOpen: 'Popup schließen, nachdem ein Tab aus der Liste auf die aktuelle Seite gezogen wurde',
	KeepGroupsOpen: 'Erweitert Gruppen errinern',	// unsure about this translation
	ShowBadge: 'Anzahl der gespeicherten Tabs auf dem Toolbar-Symbol anzeigen',
	BackgroundColor: 'Hintergrundfarbe des Toolbar-Symbols',
	BackgroundAlpha: 'Deckkraft des Hintergrundes',
	TextColor: 'Farbe des Toolbar-Symboltextes',
	TextAlpha: 'Deckkraft des Symboltextes',
	LimitHeight: 'Die Höhe des Popups begrenzen',
	MaxHeight: 'Maximale Höhe (px)',
	PopupWidth: 'Breite des Popups (px)',
	MiddleClick: 'Bei mittlerem Mausklick ...',
	MiddleClickOpen: 'Tab im Hintergrund öffnen',
	MiddleClickClose: 'Tab löschen',
	MiddleClickNone: 'Nichts tun',
	CxMenuStyle: 'Kontextmenu Thema',				// is "Thema" correct here? Also not sure about this one
	Language: 'Sprache (braucht einen Neustart)',
	
	ImportExport: 'Import/Export',			// Import/Export category header
	ImportNote: '<strong>Anmerkung:</strong> Das Importieren einer Sitzung öffnet zwischenzeitlich alle importierten Tabs um deren Favicons zu erhalten.',
	ExportButton: 'Sitzung exportieren',
	Export: 'Ihre gespeicherten Tabs als Sitzungsdatei exportieren',
	ImportButton: 'Sitzung importieren',
	Import: 'Den Inhalt einer Sitzungsdatei ihrer Tablist hinzufügen',
	ImportWorking: 'Importiere...',
	ImportPlaceholder: 'Bevor sie "Importieren" klicken, öffnen Sie die Sitzungsdatei (.win) in einem Texteditor und übertragen sie deren Inhalt hierhin .',
	
	
	Reset: 'Zurücksetzen',							// Reset category header
	ResetSettingsButton: 'Einstellungen zurücksetzen',
	ResetSettings: 'Alle Einstellungen auf ihren ursprünglichen Wert setzen',
	ResetTabsButton: 'Tab Vault leeren',
	ResetTabs: 'Alle gespeicherten Tabs aus dem Tab Vault entfernen',
	ResetAllButton: 'Alles zurücksetzen',
	ResetAll: 'Die Erweiterung auf den Werkszustand zurücksetzen',
	
	ExternalAccess: 'Buttons und Hotkeys',
	EnableAccess: 'Passwort setzen, über welches der Zugriff auf TabVault mittles Hotkeys ermöglicht wird',
	Password: 'Passwort',
	NewPassword: 'neues Passwort erzeugen',
	SaveTabAction: 'Das wird zum Speichern eines Tabs ausgeführt. Kann für Hotkeys und Mausgesten gesetzt werden',
	SaveTabButton: 'Buttons zum Speichern eines Tabs. Anklicken um zu speichern, und  dann den neuen Button auf eine Leiste ziehen.',
	SaveButtonTitle: 'In TabVault speichern',
	
	
	Help: 'Brauchen Sie Hilfe?',						// Help category header
	HelpLink: 'Hier klicken, um zu lernen, wozu die Tab Vault da ist, wie sie funktioniert, und wie man sie anwendet',

	
	Upgrading: 'Einstellungen aktualisierung',	// Upgrade explanation header
	UpgradeMessage: 'Tab Vault 2 speichert seine Einstellung ein wenig anders als Version 1, weswegen ' +
			'Tab Vault zur Vermeidung von eventuellen Inkompatibilitäten Ihre Einstellungen jetzt' +
			'auf das neue Format aktualisieren wird. Ihre gespeicherten Tabs wurden als eine Sitzungsdatei exportiert. ' +
            '(schauen sie ihre Tableiste an, hier sollte ein neuer Tab geöffnet worden sein). Wenn das' + 
			'schiefgeht können sie diese Sitzung importieren um ihre Tabs wiederherzustellen.',

	UpgradeButton: 'Jetzt aktualiseren!',
	UpgradeDone: 'Tab Vault kann jetzt verwendet werden!',		// Upgrade success header
	UpgradeHelp: 'Was ist neu in Version 2',
	UpgradePrefs: 'Einstellungen ändern',
	UpgradeClose: 'Weiter surfen!',
	
	UpgradeStatus1: 'Aktuelle Einstellungen ermitteln...',		// Upgrade status message
	UpgradeStatus2: 'Aktuelle Tabs ermitteln...',
	UpgradeStatus3: 'Erweiterungsspeicher leeren...',
	UpgradeStatus4: 'Einstellungen zurücksetzen...',
	UpgradeStatus5: 'Tabs wiederherstellen...',
	
	UpgradeFail1: 'Hoppla, da ist was falsch gelaufen. (Oder sie haben einen wirklich langsamen Computer)',
	UpgradeFail2: 'Falls Sie den Fehler melden wollen können Sie Strg+Shift+O drücken um die Fehlerkonsole zu öffnen' + 
			'und jeden Fehler nach "Starting Upgrade" in der "Reported Issues" - Sektion auf der ' +
			'<a href="https://addons.opera.com/addons/extensions/details/tab-vault/">Tab Vault ' +
			'Erweiterungsseite</a> posten. Danke sehr!',

	Footer: '<a href="https://addons.opera.com/addons/extensions/details/tab-vault/">Tab Vault</a> ' +
			'is &copy; 2010&ndash;2011 <a href="http://chaosinacan.com">Joel Spadin</a>, ' +
			'images by <a href="http://dellustrations.deviantart.com/">Wendell Fernandes</a> ' +
			'and <a href="http://www.opera.com">Opera Software</a>',

}