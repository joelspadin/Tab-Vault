// Strings used by options, help, and upgrade pages

il8n.strings = {

	Title: 'Opciones de Tab Vault',				// Options page tab title
	By: 'By',
	
	TitleHelp: 'Ayuda de Tab Vault',			// Help page tab title
	TitleHelp2: 'Ayuda',
	TitleUpgrade: 'Actualizador de Tab Vault',		// Upgrade page tab title
	TitleUpgrade2: 'Actualizador',
	
	Default: 'Por defecto',						// Default button text
	ActionFailed: '¡Error!',				// Status message for errors
	ActionDone: '¡Hecho!',					// Status message for success
	
	Preferences: 'Preferencias',				// Preferences category header
	/* Translation needed */ VaultSettings: 'Vault Settings',			
	/* Translation needed */ DisplaySettings: 'Display Settings',	
	/* Translation needed */ OtherSettings: 'Other Settings',
	CompactTabs: '<Unused>',
	Tooltips: 'Mostrar ayuda en la ventana',
	VerboseTabTips: 'Mostrar titulo y URL en la ayuda emergente',
	TrashOnOpen: 'Enviar pestaña a cerradas luego de abrirlas',
	/* Translation needed */ AllowListDuplicates: 'Allow duplicate tabs in the main list',
	/* Translation needed */ AllowGroupDuplicates: 'Allow duplicate tabs in groups',
	/* Translation needed */ RemoveListDuplicates: 'When a tab is added to a group, remove duplicate tabs from the main list',
	/* Translation needed */ RemoveGroupDuplicates: 'When a tab is added to the main list, remove duplicate tabs from groups',
	DisableAnimation: 'Deshabilitar animación',
	SaveToTop: 'Añadir pestañas guardadas al comienzo de la lista',
	GroupToTop: 'Al agrupar pestañas, añadirlas al comienzo del grupo',
	CloseTabOnSave: 'Cerrar la pestaña actual al guardarla',
	CloseOnSave: 'Cerrar ventana al de guardar la pestaña actual',
	CloseOnPageOpen: 'Cerrar ventana al soltar una pestaña de la lista sobre la pagina',
	/* Translation needed */ CloseOnOpen: 'Close the popup after opening a tab in the foreground',
	KeepGroupsOpen: 'Keep groups expanded when reopening the popup',
	/* Translation needed */ OpenOneGroup: 'Allow only one expanded group',
	ShowBadge: 'Mostrar el numero de pestañas guardadas en el botón de la barra de herramientas',
	BackgroundColor: 'Color de fondo del botón',
	BackgroundAlpha: 'Opacidad del fondo del botón',
	TextColor: 'Color del texto del botón',
	TextAlpha: 'Opacidad del texto del botón',
	LimitHeight: 'Limitar la altura de la ventana',
	MaxHeight: 'Altura máxima de la ventana (px)',
	PopupWidth: 'Ancho de la ventana (px)',
	/* Translation needed */ LimitTrash: 'Limit the size of the trash list',
	/* Translation needed */ MaxTrash: 'Maximum trash size (tabs)',
	/* Translation needed */ MiddleClick: 'Middle click action',
	/* Translation needed */ MiddleClickOpen: 'Open tab in background',
	/* Translation needed */ MiddleClickClose: 'Delete tab',
	/* Translation needed */ MiddleClickNone: 'Do nothing',
	/* Translation needed */ CxMenuStyle: 'Context menu style',
	/* Translation needed */ Language: 'Language (requires restart)',
	
	/* Translation needed */ EnableClipboard: 'To enable copying tab URLs, go to the ' +
				'<a href="http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04a.html">Flash player settings manager</a> ' +
				'and add this URL to the list of trusted locations.',
	
	ImportExport: 'Importar/Exportar',			// Import/Export category header
	ImportNote: '<strong>Nota:</strong> Importar una sesión abrirá temporalmente cada pestaña guardada para recolectar los iconos.',
	ExportButton: 'Exportar Sesión',
	Export: 'Exportar sus pestañas guardadas a un archivo de Sesión',
	/* Translation needed */ ExportAdrButton: 'Export .adr',
	/* Translation needed */ ExportAdr: 'Export your saved tabs as a bookmarks file',
	ImportButton: 'Importar Sesión',
	Import: 'Importar un archivo de Sesión a sus pestañas guardadas',
	ImportWorking: 'Importando...',
	ImportPlaceholder: 'Abra un archivo de Sesión (.win) en un editor de texto, luego copie y pegue aquí los contenidos antes de clickear Importar.',
	
	
	Reset: 'Restaurar',							// Reset category header
	ResetSettingsButton: 'Restaurar Preferencias',
	ResetSettings: 'Restaura todas las preferencias a sus valores por defecto',
	ResetTabsButton: 'Limpiar Tab Vault',
	ResetTabs: 'Quita las pestañas guardadas de Tab Vault',
	ResetAllButton: 'Restaurar Todo',
	ResetAll: 'Restaura Tab Vault a su estado original',
	
	ExternalAccess: 'Botones y Atajos',
	EnableAccess: 'Establecer contraseña para permitir a los atajos acceder a Tab Vault',
	Password: 'Contraseña',
	NewPassword: 'Generar nueva contraseña',
	SaveTabAction: 'Accion guardar pestaña - Utilizar con atajos de teclado o gestos del raton',
	SaveTabButton: 'Boton guardar pestaña - Clickee para guardar, luego arrastre a una barra de herramientas en la ventana Aspecto',
	SaveButtonTitle: 'Guardar en Tab Vault',
	/* Translation needed */ CustomButton: 'Custom icon (enter the name of an icon from your skin)',
	
	
	Help: '¿Necesita Ayuda?',						// Help category header
	HelpLink: 'Clckee aquí para ver la pagina de ayuda para mas información sobre Tab Vault, como funciona y como usarla.',


	Upgrading: 'Actualizando sus preferencias',	// Upgrade explanation header
	UpgradeMessage: 'Tab Vault 2 almacena las preferencias en diferente manera a la versión 1, por lo tanto ' +
			'para evitar incompatibilidades, Tab Vault actualizara sus preferencias' +
			'al nuevo formato. Tab Vault ha exportado sus pestañas guardadas a un archivo de sesión. ' +
			'(mire a sus pestañas. Deberían estar abiertas al lado de esta) Si la actualización falla, ' +
			'puede importar esta sesión para recuperar sus pestañas.',

	UpgradeButton: '¡Actualizar Ahora!',
	UpgradeDone: '¡Tab Vault esta lista para su uso!',		// Upgrade success header
	UpgradeHelp: 'Vea las novedades de la Versión 2',
	UpgradePrefs: 'Cambie sus preferencias',
	UpgradeClose: 'Volver a la navegación',
	
	UpgradeStatus1: 'Obteniendo preferencias actuales...',		// Upgrade status message
	UpgradeStatus2: 'Obteniendo pestañas actuales...',
	UpgradeStatus3: 'Limpiando almacenamiento de la extensión...',
	UpgradeStatus4: 'Restaurando preferencias...',
	UpgradeStatus5: 'Restaurando pestañas...',
	
	UpgradeFail1: '¡Whoops! Algo salio mal. (o tiene una computadora muy lenta)',
	UpgradeFail2: 'Puede ayudar presionando Ctrl+Shift+O para abrir el informe de error ' + 
			'y posteando cualquier error posterior a "Starting upgrade" a la sección Reported Issues de ' +
			'<a href="https://addons.opera.com/addons/extensions/details/tab-vault/">La pagina de extensión ' +
			'de Tab Vault</a>. ¡Gracias!',

	Footer: '<a href="https://addons.opera.com/addons/extensions/details/tab-vault/">Tab Vault</a> ' +
			'is &copy; 2010&ndash;2011 <a href="http://chaosinacan.com">Joel Spadin</a>, ' +
			'images by <a href="http://dellustrations.deviantart.com/">Wendell Fernandes</a> ' +
			'and <a href="http://www.opera.com">Opera Software</a>',

}