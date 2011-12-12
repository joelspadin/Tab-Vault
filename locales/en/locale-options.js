// Strings used by options, help, and upgrade pages

il8n.strings = {

	Title: 'Tab Vault Options',				// Options page tab title
	By: 'By',
	
	TitleHelp: 'Tab Vault Help',				// Help page tab title
	TitleHelp2: 'Help',
	TitleUpgrade: 'Tab Vault Upgrader',		// Upgrade page tab title
	TitleUpgrade2: 'Upgrader',
	
	Default: 'Default',							// Default button text
	ActionFailed: 'Failed!',					// Status message for errors
	ActionDone: 'Done!',							// Status message for success
	
	Preferences: 'Preferences',				// Preferences category header
	VaultSettings: 'Vault Settings',			
	DisplaySettings: 'Display Settings',	
	OtherSettings: 'Other Settings',
	CompactTabs: '<Unused>',
	Tooltips: 'Show help tooltips in the popup',
	VerboseTabTips: 'Show both title and URL in tab tooltips',
	TrashOnOpen: 'Send tabs to the trash after opening them',
	AllowListDuplicates: 'Allow duplicate tabs in the main list',
	AllowGroupDuplicates: 'Allow duplicate tabs in groups',
	RemoveListDuplicates: 'When a tab is added to a group, remove duplicate tabs from the main list',
	RemoveGroupDuplicates: 'When a tab is added to the main list, remove duplicate tabs from groups',
	DisableAnimation: 'Disable UI Animation',
	SaveToTop: 'Add saved tabs to the top of the list',
	GroupToTop: 'When grouping tabs, add tabs to the top of the group',
	CloseTabOnSave: 'Close the current tab after saving it',
	CloseOnSave: 'Close the popup after saving the current tab',
	CloseOnPageOpen: 'Close the popup after dropping a tab from the list onto the page',
	CloseOnOpen: 'Close the popup after opening a tab in the foreground',
	KeepGroupsOpen: 'Keep groups expanded when reopening the popup',
	OpenOneGroup: 'Allow only one expanded group',
	ShowBadge: 'Show the number of saved tabs on the toolbar button',
	BackgroundColor: 'Button background color',
	BackgroundAlpha: 'Button background opacity',
	TextColor: 'Button text color',
	TextAlpha: 'Button text opacity',
	LimitHeight: 'Limit the height of the popup',
	MaxHeight: 'Maximum popup height (px)',
	PopupWidth: 'Popup width (px)',
	LimitTrash: 'Limit the size of the trash list',
	MaxTrash: 'Maximum trash size (tabs)',
	MiddleClick: 'Middle click action',
	MiddleClickOpen: 'Open tab in background',
	MiddleClickClose: 'Delete tab',
	MiddleClickNone: 'Do nothing',
	CxMenuStyle: 'Context menu style',
	Language: 'Language (requires a restart for all changes to take effect)',
	
	EnableClipboard: 'To enable copying tab URLs, go to the ' +
				'<a href="http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04a.html">Flash player settings manager</a> ' +
				'and add this URL to the list of trusted locations.',
	
	ImportExport: 'Import/Export',			// Import/Export category header
	ImportNote: '<strong>Note:</strong> Importing a session will temporarily open each imported tab to collect favicons.',
	ExportButton: 'Export Session',
	Export: 'Export your saved tabs as a session file',
	ExportAdrButton: 'Export .adr',
	ExportAdr: 'Export your saved tabs as a bookmarks file',
	ImportButton: 'Import Session',
	Import: 'Import a session or bookmarks (.win or .adr) file to your saved tabs',
	ImportWorking: 'Importing...',
	ImportPlaceholder: 'Open a session file (.win or .adr) in a text editor, then copy and paste the contents here before clicking Import.',
	
	
	Reset: 'Reset',							// Reset category header
	ResetSettingsButton: 'Reset Settings',
	ResetSettings: 'Reset all settings to their default values',
	ResetTabsButton: 'Clear Vault',
	ResetTabs: 'Remove all saved tabs from the vault',
	ResetAllButton: 'Reset Everything',
	ResetAll: 'Reset Tab Vault to its original state',
	
	ExternalAccess: 'Buttons and Shortcuts',
	EnableAccess: 'Set a password to allow shortcuts to access Tab Vault',
	Password: 'Password',
	NewPassword: 'Generate New Password',
	SaveTabAction: 'Save tab action - use with keyboard shortcuts and mouse gestures',
	SaveTabButton: 'Save tab button - click to save, then drag to a toolbar from the Appearance window',
	SaveButtonTitle: 'Save to Tab Vault',
	CustomButton: 'Custom icon (enter the name of an icon from your skin)',
	
	
	Help: 'Need Help?',						// Help category header
	HelpLink: 'Click here to view the help page for more information about what Tab Vault is, how it works, and how to use it.',


	Upgrading: 'Upgrading Your Settings',	// Upgrade explanation header
	UpgradeMessage: 'Tab Vault 2 stores its settings slightly differently than version 1, so ' +
			'to avoid possible incompatibilities, Tab Vault will now upgrade your settings ' +
			'to the new format. Tab Vault has exported your saved tabs as a session file. ' +
			'(Look at your tabs. It should be open next to this one.) If the upgrade fails, ' +
			'you can import this session to recover your tabs.',

	UpgradeButton: 'Upgrade Now!',
	UpgradeDone: 'Tab Vault is now ready to use!',		// Upgrade success header
	UpgradeHelp: 'See what\'s new in version 2',
	UpgradePrefs: 'Change your preferences',
	UpgradeClose: 'Get back to browsing!',
	
	UpgradeStatus1: 'Getting current settings...',		// Upgrade status message
	UpgradeStatus2: 'Getting current tabs...',
	UpgradeStatus3: 'Cleaning extension storage...',
	UpgradeStatus4: 'Restoring settings...',
	UpgradeStatus5: 'Restoring tabs...',
	
	UpgradeFail1: 'Whoops! Something wen\'t wrong (or you have a really slow computer)',
	UpgradeFail2: 'You can help by pressing Ctrl+Shift+O to open the error log and ' + 
			'posting any errors after "Starting upgrade" to the Reported Issues section of ' +
			'<a href="https://addons.opera.com/addons/extensions/details/tab-vault/">Tab Vault\'s ' +
			'extension page</a>. Thanks!',

	Footer: '<a href="https://addons.opera.com/addons/extensions/details/tab-vault/">Tab Vault</a> ' +
			'is &copy; 2010&ndash;2011 <a href="http://chaosinacan.com">Joel Spadin</a>, ' +
			'images by <a href="http://dellustrations.deviantart.com/">Wendell Fernandes</a> ' +
			'and <a href="http://www.opera.com">Opera Software</a>',
	
}