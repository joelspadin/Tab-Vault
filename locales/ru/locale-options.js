// Strings used by options, help, and upgrade pages

il8n.strings = {

	Title: 'Tab Vault - Настройки',				// Options page tab title
	By: 'By',
	
	TitleHelp: 'Помощь по Tab Vault',			// Help page tab title
	TitleHelp2: 'Помощь',
	TitleUpgrade: 'Обновление Tab Vault',		// Upgrade page tab title
	TitleUpgrade2: 'Обновление',
	
	Default: 'По умолчанию',						// Default button text
	ActionFailed: 'Ошибка!',				// Status message for errors
	ActionDone: 'Готово!',					// Status message for success
	
	Preferences: 'Опции',				// Preferences category header
	CompactTabs: '<Unused>',
	Tooltips: 'Показывать подсказки',
	VerboseTabTips: 'Показывать заголовок страницы и адрес при наведении на сохраненную вкладку',
	TrashOnOpen: 'Переносить вкладки в корзину после открытия',
	DisableAnimation: 'Выключить анимацию интерфейса',
	SaveToTop: 'Новые вкладки добавлять в начало списка',
	GroupToTop: 'При группировке, добавлять вкладку в начало списка',
	CloseTabOnSave: 'Закрыть вкладку после добавления в виджет',
	CloseOnSave: 'Закрыть виджет после добавления вкладки',
	CloseOnPageOpen: 'Закрывать виждет после добавления вкладки со страницы',
	KeepGroupsOpen: 'Не сворачивать группы при закрытии Tab Vault',
	ShowBadge: 'Показывать количество сохраненных вкладок на кнопке',
	BackgroundColor: 'Цвет фона кнопки',
	BackgroundAlpha: 'Прозрачность фона кнопки',
	TextColor: 'Цвет текста на кнопке',
	TextAlpha: 'Прозрачность текста на кнопке',
	LimitHeight: 'Ограничивать высоту виджета',
	MaxHeight: 'Максимальная высота виджета (пикс)',
	PopupWidth: 'Ширина виджета (пикс)',
	MiddleClick: 'Действие средней кнопки мыши в виджете',
	MiddleClickOpen: 'Открывает вкладку в фоне',
	MiddleClickClose: 'Удаляет вкладку',
	MiddleClickNone: 'Ничего не делает',
	// 2.3 
	CxMenuStyle: 'Стиль контекстного меню (меню правой кнопки мыши)', // Translation note. Ужос, а не перевод. Но выбора нет.
	Language: 'Язык (потребуется перезапуск браузера)',

	
	
	ImportExport: 'Импорт/Экспорт',			// Import/Export category header
	ImportNote: '<strong>Внимание:</strong> Импорт сессии вызовет временное открытие всех сохраненных вкладок для обновления иконок сайтов.',
	ExportButton: 'Экспортировать сессию',
	Export: 'Сохраняет все ваши вкладки в файле сессии',
	ImportButton: 'Импортировать сессию',
	Import: 'Импортировать сохраненные вкладки',
	ImportWorking: 'Импортирую...',
	ImportPlaceholder: 'Открой файл сессии с помощью Блокнота (.win), затем скопируйте всё содержимое, вставьте сюда и нажмите "Импортировать сессию"',
	
	
	Reset: 'Сброс',							// Reset category header
	ResetSettingsButton: 'Сбросить настройки',
	ResetSettings: 'Возврат всех значений к стандартным',
	ResetTabsButton: 'Удалить вкладки',
	ResetTabs: 'Удаление всех сохранных вкладок',
	ResetAllButton: 'Полный сброс',
	ResetAll: 'Возвращение к первоначальному сосотоянию',
	
	ExternalAccess: 'Кнопки и ярлыки',
	EnableAccess: 'Установите пароль, чтобы разрешить ярлыкам и кнопкам доступ к хранилищу Tab Vault',
	Password: 'Пароль',
	NewPassword: 'Генерировать пароль',
	SaveTabAction: 'Сохранить вкладку - используйте с сочетаниями клавиш и с жестами мыши',
	SaveTabButton: 'Кнопка "Сохранить вкладку"  - щелкните на любую кнопку, чтобы сохранить, затем разместите её на нужное место в меню "Инструменты" - "Оформление" - "Кнопки"',
	SaveButtonTitle: 'Сохранить вкладку',
	
	
	Help: 'Нужна помощь?',						// Help category header
	HelpLink: 'Нажмите сюда, чтобы получить больше информации о Tab Vault и понять принцип работы расширения.',


	Upgrading: 'Обновление настроек',	// Upgrade explanation header
	UpgradeMessage: 'Tab Vault 2 сохраняет свои настройки по-другому, поэтому, ' +
			'чтобы избежать проблем, Tab Vault, переведет ваши настройки в новый формат. ' +
			'Tab Vault сохранит ваши настройки во временный файл сессии.' +
			'(Посмотрите на вкладки. Должна открытся новая вкладка в фоне.)' +
			'Если обновление завершится неудачей, вы сможете восстановить ваши табы из файла сессии.',

	UpgradeButton: 'Обновить!',
	UpgradeDone: 'Tab Vault готов к работе!',		// Upgrade success header
	UpgradeHelp: 'Узнайте, что нового в версии 2',
	UpgradePrefs: 'Измените свои настройки',
	UpgradeClose: 'Закрыть эту вкладку',
	
	UpgradeStatus1: 'Получаю настройки...',		// Upgrade status message
	UpgradeStatus2: 'Получаю сохраненные вкладки...',
	UpgradeStatus3: 'Очищаю временный файл расширения...',
	UpgradeStatus4: 'Восстанавливаю настройки...',
	UpgradeStatus5: 'Восстанавливаю вкладки...',
	
	UpgradeFail1: 'Опаньки! Что-то пошло не так (или у вас очень слабый компьютер)!',
	UpgradeFail2: 'Вы можете нажать Ctrl+Shift+O что открыть журнал ошибок и ' + 
			'отправить все информацию из секции "Starting upgrade" в раздел "Reported Issues" на сайте ' +
			'<a href="https://addons.opera.com/addons/extensions/details/tab-vault/">Tab Vault\'s ' +
			'extension page</a>. Спасибо!',

	Footer: '<a href="https://addons.opera.com/addons/extensions/details/tab-vault/">Tab Vault</a> ' +
			'is &copy; 2010&ndash;2011 <a href="http://chaosinacan.com">Joel Spadin</a>, ' +
			'images by <a href="http://dellustrations.deviantart.com/">Wendell Fernandes</a> ' +
			'and <a href="http://www.opera.com">Opera Software</a>',
	
}