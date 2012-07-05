// Strings used by options, help, and upgrade pages

il8n.strings = {

	Title: 'Tab Vault - Preferências',				// Options page tab title
	By: 'Por',
	
	TitleHelp: 'Ajuda de Tab Vault',			// Help page tab title
	TitleHelp2: 'Ajuda',
	TitleUpgrade: 'Actualizações - Tab Vault',		// Upgrade page tab title
	TitleUpgrade2: 'Actualizações',
	
	Default: 'Por defeito',						// Default button text
	ActionFailed: 'Falhou!',				// Status message for errors
	ActionDone: 'Finalizado!',					// Status message for success

	Preferences: 'Preferências',				// Preferences category header
	/* Translation needed */ VaultSettings: 'Vault Settings',			
	/* Translation needed */ DisplaySettings: 'Display Settings',	
	/* Translation needed */ OtherSettings: 'Other Settings',
	CompactTabs: '<Não Utilizado>',
	Tooltips: 'Mostrar ajudas de tooltip em popup',
	VerboseTabTips: 'Mostrar título e URL no separador das tooltips',
	/* Translation needed */ OpenNextToActive: 'Open new tabs next to the active tab',
	TrashOnOpen: 'Enviar os separadores para a reciclagem depois de terem sido abertos',
	/* Translation needed */ AllowListDuplicates: 'Allow duplicate tabs in the main list',
	/* Translation needed */ AllowGroupDuplicates: 'Allow duplicate tabs in groups',
	/* Translation needed */ RemoveListDuplicates: 'When a tab is added to a group, remove duplicate tabs from the main list',
	/* Translation needed */ RemoveGroupDuplicates: 'When a tab is added to the main list, remove duplicate tabs from groups',
	DisableAnimation: 'Desactivar animações no interface do utilizador',
	SaveToTop: 'Adicionar os separadores guardados para o topo da lista',
	GroupToTop: 'Quando se agrupa separadores, esses deverão ir para o topo do grupo',
	CloseTabOnSave: 'Fechar o separador actual depois de ter sido guardado',
	CloseOnSave: 'Fechar o popup depois de se ter guardado o separador currente',
	CloseOnPageOpen: 'Fechar o popup depois de se arrastado um separador da lista para uma página',
	/* Translation needed */ CloseOnOpen: 'Close the popup after opening a tab in the foreground',
	KeepGroupsOpen: 'Manter os grupos expandidos na popup',
	/* Translation needed */ OpenOneGroup: 'Allow only one expanded group',
	ShowBadge: 'Mostrar o número de separadores gravados no botão da extensão',
	BackgroundColor: 'Cor de fundo do botão',
	BackgroundAlpha: 'Opacidade de fundo do botão',
	TextColor: 'Cor do texto do botão',
	TextAlpha: 'Opacidade do texto do botão',
	/* Translation needed */ FeatherweightIcon: 'Use featherweight style icon',
	LimitHeight: 'Limitar a altura do popup',
	MaxHeight: 'Altura máxima do popup (px)',
	PopupWidth: 'Largura do popup (px)',
	/* Translation needed */ LimitTrash: 'Limit the size of the trash list',
	/* Translation needed */ MaxTrash: 'Maximum trash size (tabs)',
	MiddleClick: 'Acção do Cliques do meio',
	MiddleClickOpen: 'Abrir separador em plano de fundo',
	/* Translation needed */ MiddleClickOpenCurrent: 'Open in current tab',
	MiddleClickClose: 'Remover separador',
	MiddleClickNone: 'Fazer nada',
	CxMenuStyle: 'Estilo do menu de contexto',
	Language: 'Tradução (precisa de reinicialização)',
	
	/* Translation needed */ EnableClipboard: 'To enable copying tab URLs, go to the ' +
				'<a href="http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04a.html">Flash player settings manager</a> ' +
				'and add this URL to the list of trusted locations.',
	
	ImportExport: 'Importar/Exportar',			// Import/Export category header
	ImportNote: '<strong>Nota:</strong> Importar a sessão irá temporáriamente abrir cada separador importado para obter favicons.',
	ExportButton: 'Exportar Sessão',
	Export: 'Exporta os separadores guardados como um ficheiro de sessão',	
	/* Translation needed */ ExportAdrButton: 'Export .adr',
	/* Translation needed */ ExportAdr: 'Export your saved tabs as a bookmarks file',
	ImportButton: 'Importar Sessão',
	Import: 'Importar o ficheiro de sessão para os separadores guardados',	
	ImportWorking: 'Importar...',
	ImportPlaceholder: 'Abrir um ficheiro de sessão (.win) num editor de texto, depois copia e cola os conteúdos antes de clicar para Importar ',
		
	
	Reset: 'Reset',							// Reset category header
	ResetSettingsButton: 'Repor valores por defeito',
	ResetSettings: 'Repor todos os valores por defeito',
	ResetTabsButton: 'Apagar Vault',
	ResetTabs: 'Remover todos separadores guardados no Vault',
	ResetAllButton: 'Apagar Tudo',
	ResetAll: 'Repor o Tab Vault para o seu estado original',
	/* Translation needed */ ConfirmResetSettings: 'Reset all settings?',
	/* Translation needed */ ConfirmResetTabs: 'Delete all saved tabs?',
	/* Translation needed */ ConfirmResetAll: 'Reset Tab Vault completely? You will lose your settings and all saved tabs.',

	ExternalAccess: 'Botões e atalhos',
	EnableAccess: 'Configurar uma palavra-passe para atalhos acederem Tab Valt',
	Password: 'Palavra-passe',
	NewPassword: 'Gerar Nova Palavra-passe',
	SaveTabAction: 'Acção Guardar Separador - utilizar atalhos de teclas e mouse gestures',
	SaveTabButton: 'Acção Guardar Separador - clicar para guardar, depois arraste para barra de ferramentas da janela',
	SaveButtonTitle: 'Guardar para Tab Vault',	
	/* Translation needed */ CustomButton: 'Custom icon (enter the name of an icon from your skin)',
	
	
	Help: 'Presisa de ajuda?',						// Help category header
	HelpLink: 'Clique aqui para visitar a página de ajuda.',


	Upgrading: 'Actualizar as suas Prefências',	// Upgrade explanation header
	UpgradeMessage: 'Tab Vault 2 guarda as prefêrencias de uma maneira ligeiramente diferente do que a versão 1, e para ' +
			'evitar incompatibilidades, Tab Vault irá actualizar as prefêrencias para um novo formato.' +
			'Tab Vault  acabou de exportar os separadores guardados em um ficheiro de sessão. ' +
			'(olhe para os separadores. Deverão estar abertos a seguir a este) Se a actualização falhou, ' +
			'pode importar esta sessão para recuperar os seus separadores.',			

	UpgradeButton: 'Actualizar Agora!',
	UpgradeDone: 'A extensão Tab Vault está pronta para ser utilizada!',		// Upgrade success header
	UpgradeHelp: 'Veja o que há de novo na versão 2',
	UpgradePrefs: 'Alterar preferências',
	UpgradeClose: 'Voltar para navegação!',
	
	UpgradeStatus1: 'A obter as preferências currentes...',		// Upgrade status message
	UpgradeStatus2: 'A obter os separadores currentes...',
	UpgradeStatus3: 'A apagar o espaço em utilização...',
	UpgradeStatus4: 'Recuperar preferências...',
	UpgradeStatus5: 'Recuperar separadores...',
	
	UpgradeFail1: 'Ora bolas! algo correu de mal. (ou o teu computador é uma lesma)',	
	UpgradeFail2: 'Para ajudar pode utilizar a seguinte combinção de teclas Ctrl+Shift+O para abrir a consola de erros ' + 
			'e enviar qualquer erro do processo de actualização para a secção de erros da ' +
			'<a href="https://addons.opera.com/addons/extensions/details/tab-vault/">página da extensão Tab Vault\'s ' +
			'</a>. Muito obrigado!',			

	Footer: '<a href="https://addons.opera.com/addons/extensions/details/tab-vault/">Tab Vault</a> ' +
			'is &copy; 2010&ndash;2011 <a href="http://chaosinacan.com">Joel Spadin</a>, ' +
			'images by <a href="http://dellustrations.deviantart.com/">Wendell Fernandes</a> ' +
			'and <a href="http://www.opera.com">Opera Software</a>',

}