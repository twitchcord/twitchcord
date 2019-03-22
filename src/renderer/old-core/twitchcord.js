
global.api = require('./api.js');
global.pcErrors = [];
const fs = require('fs');
window.themeModule = require('./modules/themeModule.js');
window.pluginModule = require('./modules/pluginModule.js');
const customCSSModule = require('./modules/customCSS.js');
const emoteModule = require('./modules/emoteModule.js');

let pluginLoadTriggered = false;
/**
* The main proccess of the client mod.
*/
class twitchcord {

	/**
    * The initial load event fired from discords main proccess.
	* Loads jquery, the emote module, and initializes the mutation observer.
    */
	async load() {
        console.log('loading started');

        let check = () => {
            if(!window.webpackJsonp || window.webpackJsonp.length < 10) setTimeout(check, 20);
            else this.main()
        }
        check();

		try {
			global.pcConfig = api.load('twitchcord');
		} catch (err) {
			console.error(err);
			pcErrors.push({"name":"Main config","error":err});;
        }

		let mainObserver = new MutationObserver(mutations => {
			mutations.forEach(mutation => {
				this.nodeFilter(mutation);
			});
		});
		mainObserver.observe(document, {
			childList: true,
			subtree: true
		});

        if(pcConfig.enabledSettings.classNormalizer) classNormalizer.start();
    }

    /**
     * Inits stuff that needs the page to load first.
     */
     async init() {
        global.jQuery = require('jquery');
        global.$ = jQuery;
		if(pcConfig.enabledSettings.twitchcord) {
			this.enableTwitchTheme();
		}

		api.injectCSS('twitchcord', fs.readFileSync(__dirname + "/twitchcord.css"));

		emoteModule.startup();
		themeModule.startup();
		customCSSModule.startup();
     }

	/**
    * Most of discord is loaded. Loads functions that require most of discord to be loaded.
    */
	async main(){
		require('./lateApi.js');
		global.ts = require('./api2');

		if(!pluginLoadTriggered) pluginModule.startup();
		pluginLoadTriggered = true;
		pluginModule.startPlugin("Twitchcord");
	}

	/**
    * Inserts settings tabs.
    */
	async clickedSettings() {
		let disc0rdSettings = `
			<div class="${api.fixedClasses.notSelected.itemDefault}" id="Disc0rdSetting">Twitchcord</div>
			<div class="${api.fixedClasses.notSelected.itemDefault}" id="ThemesSetting">Themes</div>
			<div class="${api.fixedClasses.notSelected.itemDefault}" id="PluginsSetting">Plugins</div>
			<div class="${api.fixedClasses.notSelected.itemDefault}" id="cstmCSS">Custom CSS</div>
			<div class="${api.fixedClasses.notSelected.separator}"></div>
			`;

		let disc0rdContent = `
			<div id="cstmSettingsWindow" class="content-column default">
				<div class="user-settings-account" style="width: 100%;">
					<h2 class="${
						api.fixedClasses.h2.h2+
						api.fixedClasses.h2.defaultColor+
						api.fixedClasses.h2.defaultMarginh2+
						api.fixedClasses.h2.marginBottom20
					}">
						<!-- react-text: 438 -->

						TWITCHCORD

						<!-- /react-text -->
					</h2>
					<div class="flex-vertical">

						<div class="flex-vertical user-info-viewing" style="flex-direction: row; padding: 5px;">
							<div class="bolt"></div>
							<div style="flex-direction: column;justify-content: center;display: flex;">
								<p class="titleThing" style="font-size: 13px;font-weight: 600;letter-spacing: .5px;margin: 0 0 4px 0;height:14px;">TWITCHCORD V1.0</p>
								<p class="descThing" style="margin: 0 0;height:14px;">Change twitchcord settings</p>
							</div>
						</div>

					</div>
					<div id="settingsList">

					</div>
				</div>
			</div>
		`;

		api.getReactElement(document.querySelectorAll("[class*=itemDefault-][class*=item-][class*=notSelected-]")).forEach(e => {
			if(!e.return || !e.return.stateNode || !e.return.stateNode.props || !e.return.stateNode.props.id) return;
			if(e.return.stateNode.props.id === 'changelog') e.stateNode.insertAdjacentHTML('beforeBegin', disc0rdSettings );
		});
		$("[class*=item-]").mousedown(function(){
			document.querySelector('[class*=standardSidebarView-]').ondrop = null;
			document.querySelector('[class*=standardSidebarView-]').ondragleave = null;
			document.querySelector('[class*=standardSidebarView-]').ondragend = null
			document.querySelector('[class*=standardSidebarView-]').ondragenter = null;

			if(document.querySelector("#cstmSettingsWindow")) document.querySelector("#cstmSettingsWindow").remove();
			document.querySelector('#Disc0rdSetting').closest('[class*=standardSidebarView-]').querySelector('[class*=contentColumn-][class*=contentColumnDefault-]').style = "display: block;";
			document.querySelectorAll( "[class*=item-]" ).forEach(function(elem){
				elem.style.backgroundColor = "";
				if(elem.style.color == "rgb(255, 255, 255)") elem.style.color = "rgb(114, 137, 218)";
				elem.className = api.fixedClasses.notSelected.itemDefault;
			});

			this.className = api.fixedClasses.notSelected.itemSelected;


			if(this.id  == 'Disc0rdSetting') {
				document.querySelector('#Disc0rdSetting').closest('[class*=standardSidebarView-]').querySelector('[class*=contentColumn-][class*=contentColumnDefault-]').style = "display: none;"
				document.querySelector('#Disc0rdSetting').closest('[class*=standardSidebarView-]').querySelector('[class*=contentColumn-][class*=contentColumnDefault-]').insertAdjacentHTML('beforeBegin', disc0rdContent );
				twitchcord.prototype.loadSettings();
			}

			if(this.id  == 'PluginsSetting') {
				pluginModule.loadPluginPage();
			}

			if(this.id  == 'ThemesSetting') {
				themeModule.loadThemePage();
			}

			if(this.id  == 'cstmCSS') {
				customCSSModule.loadCustomCssPage();
			}
		});
	}


	/**
    * Loads the general settings page for the client mod.
    */
	async loadSettings() {
		document.querySelector('#settingsList').innerHTML = '';

		let settingsMeta = [
			"Twitchcord Theme",
			"Twitch Emotes",
			"Twitch Channel Emotes",
			"Better TwitchTV Emotes",
			"Better TwitchTV Channel Emotes",
			"FrankerFacez Emotes",
			"Emote Blacklist",
			"Normalize classes",
			"Disable smooth scrolling",
			"Developer Mode",
			"Automaticaly Reload Plugins",
			"Automticaly Reload Theme snippets"
		];

		let settingsDesc = [
			"Enable/Disable the Twitchcord theme",
			"Use Twitch Emotes in text chats",
			"Use Sub Emotes from Twitch channels in text chats",
			"Use BetterTwitchTV Emotes in text chats",
			"Use User emotes from BetterTwitchTV in text chats",
			"Use FrankerFacez Emotes in text chats",
			"This Blacklist is here to keep normal words from being replaced in conversations. You can customize it as you want or disable it completely.",
			"Add fixed classnames to existing ones. This should be kept enabled for full theme and plugin compatibility.",
			"Disables smooth scrolling for discord",
			"Enables Tools usefull for Theme and Plugin developers.",
			"Automaticly reloads a plugin once it gets changed. Usefull for plugin updates and developers.",
			"Automaticly reloads a theme once it gets changed. Usefull for theme updates and developers."
		]

		let setting = Object.keys(pcConfig.enabledSettings);

		for(let i in setting){

			let switchState = api.fixedClasses.switchEnabled.valueUnchecked;
			if(pcConfig.enabledSettings[setting[i]]) switchState = api.fixedClasses.switchEnabled.valueChecked;


			if(setting[i] == "emoteBlackList") {
				document.querySelector('#settingsList').insertAdjacentHTML('beforeEnd', `
				<div id="${setting[i]}" class="pcListBg">
					<div class="pcHeadList">
						<span class="pcHeaderList" style="flex: 0 0 auto;">
							<h3 class="pcH3" style="flex: 0 0 auto;">${settingsMeta[i]}</h3>
						</span>
						<div class="pcSettingsWrap">
							<div id="${setting[i]+"Checkbox"}" style="flex: 0 0 auto;" class="${
								api.fixedClasses.switchEnabled.switchEnabled+
								switchState+
								" "+
								api.fixedClasses.switchEnabled.sizeDefault+
								api.fixedClasses.switchEnabled.themeDefault
							}" style="flex: 0 0 auto;">
								<input type="checkbox" class="${api.fixedClasses.switchEnabled.checkboxEnabled}">
							</div>
							<span>
								<p id="BlacklistSettings" class="pcH3 pcSettingsBtn" style="margin:2px 0 0 0;flex: 0 0 auto;">⚙</p>
							</span>
						</div>
					</div>
					<p class="pcDesc">${settingsDesc[i]}</p>
				</div>
				`);

			} else {
				document.querySelector('#settingsList').insertAdjacentHTML('beforeEnd', `
				<div id="${setting[i]}" class="pcListBg">
					<div class="pcHeadList">
						<span class="pcHeaderList" style="flex: 0 0 auto;">
							<h3 class="pcH3" style="flex: 0 0 auto;">${settingsMeta[i]}</h3>
						</span>
						<div class="pcSettingsWrap">
							<div id="${setting[i]+"Checkbox"}" style="flex: 0 0 auto;" class="${
								api.fixedClasses.switchEnabled.switchEnabled+
								switchState+
								" "+
								api.fixedClasses.switchEnabled.sizeDefault+
								api.fixedClasses.switchEnabled.themeDefault
							}" style="flex: 0 0 auto;">
								<input type="checkbox" class="${api.fixedClasses.switchEnabled.checkboxEnabled}">
							</div>
						</div>
					</div>
					<p class="pcDesc">${settingsDesc[i]}</p>
				</div>
				`);
			}
			if(setting[i] == "twitchcord") {
				document.getElementById(setting[i]+"Checkbox").addEventListener('click', function() {
					pcUtils.twitchcord.prototype.toggleTwitchTheme();
				});
			}

			document.getElementById(setting[i]+"Checkbox").onclick = (function (n) {
				return function () {
					$(this).toggleClass(api.fixedClasses.switchEnabled.valueChecked+api.fixedClasses.switchEnabled.valueUnchecked);
					if(pcConfig.enabledSettings[n]) {
						pcConfig.enabledSettings[n] = false;
						api.save('twitchcord', pcConfig);
						api.save('twitchcordBackup', pcConfig);
					} else {
						pcConfig.enabledSettings[n] = true;
						api.save('twitchcord', pcConfig);
						api.save('twitchcordBackup', pcConfig);
					}
				}
			})(setting[i])

			if(setting[i] == "disableSmoothScrolling") {
				if(process.platform === "win32" && fs.existsSync(__dirname+'./../../Discord.exe')){
					document.getElementById(setting[i]+"Checkbox").addEventListener('click', function() {
						fs.renameSync(__dirname+'./../../Discord.exe', __dirname+'./../../wDiscord.exe');
						fs.renameSync(__dirname+'./../../rDiscord.exe', __dirname+'./../../Discord.exe');
						fs.renameSync(__dirname+'./../../wDiscord.exe', __dirname+'./../../rDiscord.exe');

						require('electron').shell.openItem(__dirname+'./../../Discord.exe');
						setTimeout(require('electron').remote.app.exit, 500);
					});
				} else {
					document.getElementById(setting[i]).remove();
				}
			}
		}

		document.getElementById('BlacklistSettings').onclick = () => {
			api.settingsBox(`
			<h3 class="${
				api.fixedClasses.h2.h2+
				api.fixedClasses.h2.defaultColor+
				api.fixedClasses.h2.defaultMarginh2+
				api.fixedClasses.h2.marginBottom20
			  }">EMOTE BLACKLIST</h3>
			<div class="pcInputWrap"><input id="pcAddBlackInput" /><button id="pcAddBlackBtn">Add to blacklist</button></div>
			<div id="pcBlackTable"></div>`);

			this.loadBlackSettings();

			document.querySelector('#pcAddBlackInput').onkeyup = e => {
				if(e.keyCode === 13) {
					document.querySelector('button#pcAddBlackBtn').click();
				}
			}

			document.querySelector('button#pcAddBlackBtn').onclick = () => {
				let value = document.querySelector('input#pcAddBlackInput').value;
				if(value !== '' && !pcConfig.emoteBlacklist.includes(value)) {
					if(emotesTwitch.hasOwnProperty(value) || emotesTwitchSub.hasOwnProperty(value) || bttvEmotesChannel.hasOwnProperty(value) || value in emotesFFZ) {
						pcConfig.emoteBlacklist.push(value);
						pcConfig.emoteBlacklist.sort();
						api.save('twitchcord', pcConfig);
						api.save('twitchcordBackup', pcConfig);
						this.loadBlackSettings();
					} else {
						let isAnEmote = false;
						for(let i of bttvEmotes.emotes) {
							if (i.code == value) {
								pcConfig.emoteBlacklist.push(value);
								pcConfig.emoteBlacklist.sort();
								api.save('twitchcord', pcConfig);
								api.save('twitchcordBackup', pcConfig);
								isAnEmote = true;
								this.loadBlackSettings();
							}
						}
						if(isAnEmote == false) alert(value+' is not an emote');
					}
					document.querySelector('input#pcAddBlackInput').value = '';
				} else if (pcConfig.emoteBlacklist.includes(value)) {
					alert(value+' is already blacklisted');
				}
			}
			$('#pcBlackTable').on('click', 'button.pcRemoveBlack', async function() {
				if(pcConfig.emoteBlacklist.includes(this.id)) {
					pcConfig.emoteBlacklist.splice(pcConfig.emoteBlacklist.indexOf(this.id), 1);
                    api.save('twitchcord', pcConfig);
					api.save('twitchcordBackup', pcConfig);
				}
				this.closest('.pcBlackTableContent').remove();
			});
		}


		document.querySelector('#settingsList').insertAdjacentHTML('beforeEnd', `
		<input style="display: none;" type="file" webkitdirectory id="changeThemePath" />
		<label id="themePathContainer" for="changeThemePath">
			<div class="pcPath pcListBg" id="themePath">
				<span>
					${pcConfig.themePath}
				</span>
				<div class="pcBluBtn">Change</div>
			</div>
		</label>
		`);

		document.getElementById('changeThemePath').onchange = e => {
			pcConfig.themePath = e.target.files[0].path+'\\';
			api.save('twitchcord', pcConfig);
			api.save('twitchcordBackup', pcConfig);
			document.querySelector('#themePath span').innerHTML = pcConfig.themePath;
		};


		document.querySelector('#settingsList').insertAdjacentHTML('beforeEnd', `
		<input style="display: none;" type="file" webkitdirectory id="changePluginPath" />
		<label id="pluginPathContainer" for="changePluginPath">
			<div class="pcPath pcListBg" id="pluginPath">
				<span>
					${pcConfig.pluginsPath}
				</span>
				<div class="pcBluBtn">Change</div>
			</div>
		</label>
		`);

		document.getElementById('changePluginPath').onchange = e => {
			pcConfig.pluginsPath = e.target.files[0].path+'\\';
			api.save('twitchcord', pcConfig);
			api.save('twitchcordBackup', pcConfig);
			document.querySelector('#pluginPath span').innerHTML = pcConfig.pluginsPath;
		};
	}

	/**
    * Loads the emote blacklist settings page with emotes.
    */
	loadBlackSettings() {
		if(document.querySelector('#pcBlackTable')){
			document.querySelector('#pcBlackTable').innerHTML = '';
			pcConfig.emoteBlacklist.some(word => {
				if (emotesTwitch.hasOwnProperty(word)) {
					document.querySelector('#pcBlackTable').insertAdjacentHTML('beforeEnd', '<div class="pcBlackTableContent"><span class="pcTableImg"><img alt="'+word+'" class="emoji jumboable pcTableImg" src="' + twitchEmoteUrlStart + emotesTwitch[word] + twitchEmotePickerEnd + '" /><span class="pcBlackTableText">'+word+'</span></span><button class="pcRemoveBlack" id="'+word+'">Remove from Blacklist</button></div>');
					return;
				}
				if (emotesTwitchSub.hasOwnProperty(word)) {
					document.querySelector('#pcBlackTable').insertAdjacentHTML('beforeEnd', '<div class="pcBlackTableContent"><span class="pcTableImg"><img alt="'+word+'" class="emoji jumboable pcTableImg" src="' + twitchEmoteUrlStart + emotesTwitchSub[word] + twitchEmotePickerEnd + '" /><span class="pcBlackTableText">'+word+'</span></span><button class="pcRemoveBlack" id="'+word+'">Remove from Blacklist</button></div>');
					return;
				}
				for(let i of bttvEmotes.emotes) {
					if (i.code == word) {
						document.querySelector('#pcBlackTable').insertAdjacentHTML('beforeEnd', '<div class="pcBlackTableContent"><span class="pcTableImg"><img alt="'+word+'" class="emoji jumboable" src="' + bttvEmoteUrlStart + i.id + bttvEmotePickerEnd + '" /><span class="pcBlackTableText">'+word+'</span></span><button class="pcRemoveBlack" id="'+word+'">Remove from Blacklist</button></div>');
						return;
					}
				}
				if (bttvEmotesChannel.hasOwnProperty(word)) {
					document.querySelector('#pcBlackTable').insertAdjacentHTML('beforeEnd', '<div class="pcBlackTableContent"><span class="pcTableImg"><img alt="'+word+'" class="emoji jumboable pcTableImg" src="' + bttvEmoteUrlStart + bttvEmotesChannel[word] + bttvEmotePickerEnd + '" /><span class="pcBlackTableText">'+word+'</span></span><button class="pcRemoveBlack" id="'+word+'">Remove from Blacklist</button></div>');
					return;
				}
				if (word in emotesFFZ) {
					document.querySelector('#pcBlackTable').insertAdjacentHTML('beforeEnd', '<div class="pcBlackTableContent"><span class="pcTableImg"><img alt="'+word+'" class="emoji jumboable pcTableImg" src="' + emotesFFZUrlStart + emotesFFZ[word] + emotesFFZUrlEnd  + '" /><span class="pcBlackTableText">'+word+'</span></span><button class="pcRemoveBlack" id="'+word+'">Remove from Blacklist</button></div>');
					return;
				}
			});

			//look away
			document.querySelectorAll('.emoji.pcTableImg')[14].onclick = () => {
				//i swear if you just click the link without actually "finding" the refrence i will be personally offended. Also pm me if you get it.
				let audio = new Audio("https://s0.vocaroo.com/media/download_temp/Vocaroo_s00mTyHoTfee.mp3");
				audio.play();
			}
		}
	}

	async toggleTwitchTheme () {
		if(document.querySelector('#twitchcordTheme')) {
			this.disableTwitchTheme();
			return;
		}
		this.enableTwitchTheme();
	}

	async enableTwitchTheme() {
		api.injectCSS('twitchcordTheme', fs.readFileSync(__dirname + "/latest-version.css"));
		api.linkCSS('twitchcordFont', 'https://fonts.googleapis.com/css?family=Roboto+Mono');
	}

	async disableTwitchTheme() {
		api.removeCSS('twitchcordTheme');
		api.removeCSS('twitchcordFont');
	}

	/**
    * Filters through the mutation observer to execute functions.
    * @param {element} mutation the element to filter.
    */
    async nodeFilter(mutation) {
        pluginModule.execObservers(mutation);
        if(mutation.addedNodes.length !== 0 && mutation.addedNodes[0].querySelector) {
            if(mutation.addedNodes[0] === document.head) {
                this.init();
            }
			if(pcConfig.enabledSettings.twitchcord) {
				let startUpLoading = `<div class="tc-appLoading-container">
										<span class="tc-appLoading-square tc-appLoading-square-4"></span>
										<span class="tc-appLoading-square tc-appLoading-square-3"></span>
										<span class="tc-appLoading-square tc-appLoading-square-2"></span>
										<span class="tc-appLoading-square tc-appLoading-square-1"></span>
									</div>`;

				let loadingContainer = document.getElementsByClassName('container-16j22k')[0],
				loadingCheck = document.getElementsByClassName('tc-appLoading-container')[0];

				if (loadingContainer && !loadingCheck) {
					loadingContainer.insertAdjacentHTML('afterbegin', startUpLoading);
				}
			}

            if(mutation.addedNodes[0].querySelector('div[class*=markup]')) {
                for(let i of mutation.addedNodes[0].querySelectorAll('div[class*=markup]')) {
                    emoteModule.replaceEmote(i);
                }
			}
			if(document.querySelector('[class^=container] [class^=button] svg') && mutation.addedNodes[0].classList.contains(api.fixedClasses.contextMenu.contextMenu)) {
				emoteModule.insertFavBtn(mutation.addedNodes[0]);
			}
			if(mutation.addedNodes[0].querySelector("[class*=emojiPicker-]") != null) {
				emoteModule.insertEmoteBtns();
			}
			if(mutation.addedNodes[0] === document.querySelector('[class^=container] [class^=button] svg')) {
				setTimeout(this.main, 10000);
			}
			if(mutation.addedNodes[0].querySelectorAll("[class*=itemDefault-][class*=item-][class*=notSelected-]") && mutation.addedNodes[0].querySelectorAll("[class*=itemDefault-][class*=item-][class*=notSelected-]").length > 12) {
				this.clickedSettings();
			}
        }
    }
}

window.pcUtils = {customCSSModule, emoteModule, twitchcord, version:{core: 1.0, loader: 1.0}};

module.exports = new twitchcord;
