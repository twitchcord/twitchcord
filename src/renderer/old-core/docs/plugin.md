# Usage and information
For users:
Plugins are installed by either dragging them into the plugins folder, dragging them into the plugins settings tab or by selecting them with the + button on the plugins settings tab.

Once a plugin is installed you can enable them by flipping the switch of the plugins container.
If a plugin is enabled it can be disabled using the same switch.

For developers:
A plugin consists of at least meta tag and a class containing a start function and a stop function.
The start function gets called every time you enable the plugin or discord loads, while the stop function gets called every time the plugin gets disabled.

Discord uses the javascript frameworks electron and react which both have api's you can also use in your plugin. We also provide a small api you can use in your plugins.
https://electronjs.org/docs
https://reactjs.org/docs

# Plugin API
This documentation will show what function you can use in your plugins

## Meta tag
The meta tag is required for every plugin. It has to at least contain your plugin name but also your plugin description, version and author if you don't use their functions to define them.

## Plugin functions
These are function you can use inside of your plugin class

 - `start()` (required) - Gets executed everytime the plugin is started
 
 - `stop()` (required) - Gets executed everytime the plugin gets stopped
 
 - `obeserver(e)`(optional) - Returns the raw mutation observer
 
 - `getAuthor()` (optional) - Should return the author of the plugin. It is recommended to define the author in the meta tag of the plugin instead
 
 - `getDescription()` (optional) - Should return the description of the plugin. It is recommended to define the description in the meta tag of the plugin instead
 
 - `getVersion()` (optional) - Should return the version of the plugin. It is recommended to define the version in the meta tag of the plugin instead
 
- `getSettingsPanel()` (optional) - Should return a html string that is used for the plugins settings panel


## General API
These are functions and classes you can use anywhere in your code.

### API
The api class has multiple function you can use in your plugins.

- `api`
	 - `linkCSS(id, url)`  - links a css file from an url
	 
	 - `injectCSS(id, css)` - injects css into the html header

	 - `removeCSS(id)` - removes a style element

	 - `getPlugin(name)` - returns the internal plugin class of the specified name

	 - `load(name)` - loads a config file from the config folder and returns its json

	 - `save(name, json)` - saves json to a config file

	 - `settingsBox(content)` - Displays a modal with a back button in the style of the plugin settings window

	 - `confirmationBox(title, text, callback(bool))` - Displays a deletion confirmation box

	- `getFixedIndex(value)` - returns the fixedIndex of a class for the fixedClasses/fixedSelectors array if it contains the value

	- `getFixedIndexContaining(value)` - returns the fixedIndex of a class for the fixedClasses/fixedSelectors array if it contains part of the value

	- `getReactElement(elements)` - returns the react instance of a NodeList or a single element.

### themeModule
- `themeModule`
	- `disableTheme(themeName)` - disables a theme
	- `toggleTheme(themeName)` - toggles a theme
	- `enableTheme(themeName)` - enables a theme

### pluginModule
- `pluginModule`
	- `stopPlugin(pluginName)` - disables and stops a plugin
	- `startPlugin(pluginName)` - enables and starts a plugin
	- `togglePlugin(pluginName)` - toggles a plugin
	- `execObservers(mutation)` - executes the observer function in all plugins


## Usefull data
- `plugins` - an object that stores all plugins and their data
	- `"pluginName"` - the plugin object containing data
		- `enabled` - weither or not the plugin is enabled (bool)
		- `filename` - the name of the file inside the plugins folder
		- `name` - the name of the plugin class
		- `plugin` - the object containing the plugin class

- `themes` - an object that stores all themes and their data
	- `author` - the author of the theme
	- `css` - the css of the theme file
	- `description` - the description of the theme
	- `enabled` - weither or not the theme is enabled (bool)
	- `filename` - the name of the file inside the themes folder
	- `name` - the name of the theme class
	- `version` - the version of the theme

 - `pcConfig` - pcConfig stores all of the user settings from the main modules such as:
	 - `cstmCSS` - This contains the saved custom css from the built in css editor
	 - `favEmotes` - an array of favorited emotes
	 - `loadedPlugins` - an array of filenames of the enabled plugins
	 - `loadedThemes` - an array of filenames of the enabled themes
	 -  `emoteBlacklist` - This contains an array of emote names that are blacklisted to not replace text
	 -  `enabledSettings` - enabled settings of the main modules (all of them are bool)
		 - `autoReloadPlugins` - weither or not the plugin auto reloading is enabled
		 - `autoReloadThemes` - weither or not the theme auto reloading is enabled
		 - `twitchEmotes` - weither or not to use Twitch emotes
		 - `twitchEmotesSub` - weither or not to use Twitch Sub emotes
		 - `emotesFFZ` - weither or not to use FrankerFaceZ emotes
		 - `bttvEmotes` - weither or not to use Better TwitchTV emotes
		 - `bttvEmotesChannel` - weither or not to use Better TwitchTV Channel emotes
		 - `emotesFFZ` - weither or not to use FrankerFaceZ emotes
		 - `emoteBlackList` - weither or not to use emote blacklist
		 - `developer` - wheiter or not the user is a developer
		 - `twitchcord` - wheiter or not the twitchcord theme is enabled
	 - `pluginsPath` - the path of where the plugins are located
	 - `themesPath` - the path of where the themes are located

### There are more functions and objects you can use that are documented in the source code of the loader. But because you would rarely find them usefull they are not documented here, sorry :(