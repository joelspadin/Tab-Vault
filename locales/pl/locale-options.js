// Strings used by options, help, and upgrade pages

il8n.strings = {

	Title: 'Tab Vault - Preferencje',				// Options page tab title
	By: 'Autor: ',
	
	TitleHelp: 'Tab Vault - Pomoc',			// Help page tab title
	TitleHelp2: '- Pomoc',
	TitleUpgrade: 'Tab Vault - Aktualizacja',		// Upgrade page tab title
	TitleUpgrade2: '- Aktualizacja',
	
	Default: 'Domyślne',						// Default button text
	ActionFailed: 'Wystąpił błąd!',				// Status message for errors
	ActionDone: 'Zakończono!',					// Status message for success
	
	
	Preferences: 'Preferencje',				// Preferences category header
	CompactTabs: '<Nieużywane>',
	Tooltips: 'Pokazuj dymki z podpowiedziami',
	VerboseTabTips: 'Pokazuj w dymku zarówno tytuł jak i adres strony',
	TrashOnOpen: 'Po otwarciu karty przenieś ją do kosza',
	DisableAnimation: 'Wyłącz animacje interfejsu użytkownika',
	SaveToTop: 'Dodawaj nowe karty na górze listy',
	GroupToTop: 'Przy grupowaniu kart, dodawaj nowe karty na górze',
	CloseTabOnSave: 'Zamknij kartę po dodaniu do listy',
	CloseOnSave: 'Zamykaj wyskakujące okienko po dodaniu karty',
	CloseOnPageOpen: 'Zamykaj okienko po upuszczeniu karty na stronie',
	KeepGroupsOpen: 'Pozostaw grupy otwarte po ponownym otwarciu wyskakującego okienka',
	ShowBadge: 'Pokazuj na przycisku etykietkę z liczbą zapamiętanych kart',
	BackgroundColor: 'Tło etykietki',
	BackgroundAlpha: 'Nieprzezroczystość etykietki',
	TextColor: 'Kolor tekstu etykietki',
	TextAlpha: 'Nieprzezroczystość tekstu etykietki',
	LimitHeight: 'Ogranicz wysokość wyskakującego okienka',
	MaxHeight: 'Maksymalna wysokość okienka (px)',
	PopupWidth: 'Szerokość okienka (px)',
	MiddleClick: 'Akcja środkowego przycisku myszy',
	MiddleClickOpen: 'Otwórz na karcie w tle',
	MiddleClickClose: 'Usuń kartę',
	MiddleClickNone: 'Nie rób nic',
	CxMenuStyle: 'Styl menu kontekstowego',
	Language: 'Język (zmiana wymaga ponownego uruchomienia)',
	
	ImportExport: 'Import/Eksport',			// Import/Export category header
	ImportNote: '<strong>Uwaga:</strong> Import sesji spowoduje chwilowe otwarcie każdej ze stron znajdujących się w niej, w celu załadowania favikonek.',
	ExportButton: 'Eksportuj sesję',
	Export: 'Eksportuje zapamiętane strony do pliku sesji',
	ImportButton: 'Importuj sesję',
	Import: 'Importuje strony z sesji do listy zapamiętanych stron',
	ImportWorking: 'Importowanie...',
	ImportPlaceholder: 'Otwórz plik sesji (.win) w edytorze tekstu, skopiuj jego zawartość do tego pola tekstowego, a następnie kliknij przycisk "Importuj sesję"',
	
	
	Reset: 'Przywracanie ustawień domyślnych',							// Reset category header
	ResetSettingsButton: 'Preferencje',
	ResetSettings: 'Przywraca domyślne wartości ustawień',
	ResetTabsButton: 'Karty',
	ResetTabs: 'Całkowicie i bezpowrotnie usuwa wszystkie zapamiętane karty',
	ResetAllButton: 'Wszystko',
	ResetAll: 'Resetuje Tab Vault do stanu po instalacji',
	
	ExternalAccess: 'Przyciski i skróty',
	EnableAccess: 'Ustaw hasło dostępu aby umożliwić skrótom komunikację z Tab Vault',
	Password: 'Hasło:',
	NewPassword: 'Losowe',
	SaveTabAction: 'Akcja "Dodaj kartę" - używaj ze skrótami klawiaturowymi i gestami myszy:',
	SaveTabButton: 'Przycisk "Dodaj kartę" - kliknij, aby zapisać przycisk, a następnie przeciągnij i upuść go na pasek narzędzi:',
	SaveButtonTitle: 'Dodaj do Tab Vault',
	
	
	Help: 'Potrzebujesz pomocy?',						// Help category header
	HelpLink: 'Kliknij tutaj, aby wyświetlić stronę pomocy i uzyskać informacje: czym jest rozszerzenie Tab Vault, jak działa i jak go używać.',


	Upgrading: 'Zaktualizuj swoje ustawienia',	// Upgrade explanation header
	UpgradeMessage: 'Tab Vault 2 przechowuje dane nieco inaczej niż wersja 1 więc ' +
			'aby zapobiec możliwym problemom z kompatybilnością, Tab Vault zaktualizuje teraz twoje ustawienia ' +
			'do nowego formatu. Tab Vault wyeksportował zapamiętane strony jako plik sesji. ' +
			'(Przyjrzyj się otwartym kartom. Plik sesji powinien być otwarty obok bieżącej karty.) Jeśli podczas aktualizacji wystąpi błąd, ' +
			'możesz zaimportować ten plik na stronie ustawień, aby odzyskać zapamiętane karty.',

	UpgradeButton: 'Aktualizuj teraz!',
	UpgradeDone: 'Tab Vault jest teraz gotowy do pracy!',		// Upgrade success header
	UpgradeHelp: 'Zobacz co nowego w tej wersji',
	UpgradePrefs: 'Zmień ustawienia',
	UpgradeClose: 'Wróć do przeglądania stron!',
	
	UpgradeStatus1: 'Pobieranie aktualnych preferencji...',		// Upgrade status message
	UpgradeStatus2: 'Pobieranie zapamiętanych kart...',
	UpgradeStatus3: 'Czyszczenie pamięci ustawień...',
	UpgradeStatus4: 'Przywracanie preferencji...',
	UpgradeStatus5: 'Przywracanie kart...',
	
	UpgradeFail1: 'Ups! Coś poszło nie tak (albo masz naprawdę wolny komputer).',
	UpgradeFail2: 'Możesz pomoć w rozwiązaniu problemu, wciskając Ctrl+Shift+O aby wyświetlić Konsolę Błędów ' + 
			'i umieszczając błędy które wystąpiły po "Starting upgrade", w sekcji "Reported issues" na ' +
			'<a href="https://addons.opera.com/addons/extensions/details/tab-vault/">stronie rozszerzenia Tab Vault</a>. Dzięki!',

	Footer: '<a href="https://addons.opera.com/addons/extensions/details/tab-vault/">Tab Vault</a> ' +
			'is &copy; 2010&ndash;2011 <a href="http://chaosinacan.com">Joel Spadin</a>, ' +
			'images by <a href="http://dellustrations.deviantart.com/">Wendell Fernandes</a> ' +
			'and <a href="http://www.opera.com">Opera Software</a>',

}