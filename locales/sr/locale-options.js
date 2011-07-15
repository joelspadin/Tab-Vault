﻿// Strings used by options, help, and upgrade pages

il8n.strings = {

	Title: 'Опције Tab Vaultа',				// Options page tab title
	By: 'Аутор:',
	
	TitleHelp: 'Помоћ за Tab Vault',			// Help page tab title
	TitleHelp2: '- Помоћ',
	TitleUpgrade: 'Ажурирање Tab Vault',		// Upgrade page tab title
	TitleUpgrade2: '- Ажурирање',
	
	Default: 'Подразумевано',						// Default button text
	ActionFailed: 'Неуспело!',				// Status message for errors
	ActionDone: 'Завршено!',					// Status message for success
	
	Preferences: 'Параметри',				// Preferences category header
	CompactTabs: '<Некоришћено>',
	Tooltips: 'Прикажи опис приликом преласка мишем',
	VerboseTabTips: 'Прикажи и наслов и URL адресу у описима страна',
	TrashOnOpen: 'Пошаљи стране у корпу по њиховом отварању',
	DisableAnimation: 'Онемогући анимацију корисничког интерфејса',
	SaveToTop: 'Додај сачуване стране на врх листе',
	GroupToTop: 'Приликом додавања стране у групу, смести је на врх групе',
	CloseTabOnSave: 'Затвори активну страну након њеног чувања',
	CloseOnSave: 'Затвори искачући прозор након чувања активне стране',
	CloseOnPageOpen: 'Затвори искачући прозор након превлачења стране из листе у Оперу',
	KeepGroupsOpen: 'Задржи групе проширене приликом поновног отварања искачућег прозора',
	ShowBadge: 'Прикажи број сачуваних страна на дугмету у траци алата',
	BackgroundColor: 'Боја позадине дугмета',
	BackgroundAlpha: 'Непрозирност позадине дугмета',
	TextColor: 'Боја текста дугмета',
	TextAlpha: 'Непрозирност текста дугмета',
	LimitHeight: 'Ограничи висину искачућег прозора',
	MaxHeight: 'Максимална висина прозора (у пикселима)',
	PopupWidth: 'Ширина прозора (у пикселима)',
	MiddleClick: 'Понашање средњег клика',
	MiddleClickOpen: 'Отвори страну у позадини',
	MiddleClickClose: 'Избриши страну',
	MiddleClickNone: 'Не ради ништа',
	CxMenuStyle: 'Стил контекстуалног менија',
	Language: 'Језик (захтева поновно покретање)',
	
	
	ImportExport: 'Увоз и извоз',			// Import/Export category header
	ImportNote: '<strong>Напомена:</strong> Увоз сесије ће привремено отворити сваку увезену страну ради прикупљања иконица.',
	ExportButton: 'Извези сесију',
	Export: 'Извезите своје сачуване стране као датотеку сесије',
	ImportButton: 'Увези сесију',
	Import: 'Увезите датотеку сесије међу своје сачуване стане',
	ImportWorking: 'Увоз...',
	ImportPlaceholder: 'Отворите датотеку сесије (.win) у уређивачу текста, затим копирајте и налепите њен садржај у поље пре него што кликнете Увези.',
	
	
	Reset: 'Поништавање поставки',							// Reset category header
	ResetSettingsButton: 'Поништи поставке',
	ResetSettings: 'Вратите све поставке на њихове почетне вредности',
	ResetTabsButton: 'Очисти складиште',
	ResetTabs: 'Уклоните све сачуване стране из складишта',
	ResetAllButton: 'Поништи све',
	ResetAll: 'Вратите Tab Vault у његово почетно стање',
	
	ExternalAccess: 'Дугмад и пречице',
	EnableAccess: 'Поставите лозинку да бисте дозволили приступ Tab Vault-у путем пречица',
	Password: 'Лозинка',
	NewPassword: 'Генериши нову лозинку',
	SaveTabAction: 'Команда за чување стране - користите са тастерским пречицама и гестовима мишем',
	SaveTabButton: 'Дугме за чување стране - кликните да сачувате, затим са прозора Изглед превуците на траку алата',
	SaveButtonTitle: 'Сачувај у Tab Vault',
	
	
	Help: 'Потребна вам је помоћ?',						// Help category header
	HelpLink: 'Кликните овде да бисте погледали страницу са информацијама о томе шта је Tab Vault, како ради и на који начин да га користите.',


	Upgrading: 'Пребацивање поставки',	// Upgrade explanation header
	UpgradeMessage: 'Tab Vault 2 чува поставке мало другачије од верзије 1, зато ће, ' +
			'како би се избегли проблеми са компатибилношћу, Tab Vault сада пребацити ваше поставке ' +
			'у нови формат. Tab Vault је извршио извоз ваших сачуваних страна у датотеку сесије. ' +
			'(Погледајте језичке страна. Страна треба да је отворена поред ове.) Ако пребацивање не успе, ' +
			'можете да увезете ову сесију како бисте повратили своје стране.',

	UpgradeButton: 'Пребаци сада!',
	UpgradeDone: 'Tab Vault је спреман за коришћење!',		// Upgrade success header
	UpgradeHelp: 'Прикажи новитете у верзији 2',
	UpgradePrefs: 'Промени поставке',
	UpgradeClose: 'Повратак на сурфовање!',
	
	UpgradeStatus1: 'Преузимање тренутних поставки...',		// Upgrade status message
	UpgradeStatus2: 'Преузимање активних страна...',
	UpgradeStatus3: 'Чишћење складишта екстензије...',
	UpgradeStatus4: 'Враћање поставки...',
	UpgradeStatus5: 'Враћање страна...',
	
	UpgradeFail1: 'Упс! Нешто није у реду (или имате јако спор рачунар)',
	UpgradeFail2: 'Можете помоћи тако што ћете отворити извештај о грешкама притиском на Ctrl+Shift+O и ' + 
			'све грешке после "Starting upgrade" пријавити међу Reported Issues на ' +
			'<a href="https://addons.opera.com/addons/extensions/details/tab-vault/">страници Tab Vault ' +
			'екстензије</a>. Хвала!',

	Footer: '<a href="https://addons.opera.com/addons/extensions/details/tab-vault/">Tab Vault</a> ' +
			'is &copy; 2010&ndash;2011 <a href="http://chaosinacan.com">Joel Spadin</a>, ' +
			'images by <a href="http://dellustrations.deviantart.com/">Wendell Fernandes</a> ' +
			'and <a href="http://www.opera.com">Opera Software</a>',
	
}