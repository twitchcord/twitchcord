class customCss {

	async startup() {
		api.injectCSS("customCSS", pcConfig.cstmCSS, true);

		let script = document.createElement("SCRIPT");
		script.src = 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.1/ace.js';
		script.type = 'text/javascript';
		document.getElementsByTagName("head")[0].appendChild(script);

		document.onkeydown = (e) => {
			if (e.keyCode == 83 && e.ctrlKey) {
				pcConfig.cstmCSS = csseditor.getValue();
				let error = api.injectCSS('customCSS', pcConfig.cstmCSS, true);
                if(error) {
                    document.querySelector('.scssErrorConsole').innerHTML = error;
                } else {
                    document.querySelector('.scssErrorConsole').innerHTML = "";
                }
				api.save('twitchcord', pcConfig);
				api.save('twitchcordBackup', pcConfig);
			};
		};
	}

	async loadCustomCssPage() {
        const customCssContent = `
        <div id="cstmSettingsWindow" class="content-column default">
            <div class="user-settings-account" style="width: 100%;">
                <h2 class="${
                    api.fixedClasses.h2.h2+
                    api.fixedClasses.h2.defaultColor+
                    api.fixedClasses.h2.defaultMarginh2+
                    api.fixedClasses.h2.marginBottom20
                  }">
                    <!-- react-text: 438 -->
        
                    CUSTOM CSS
        
                    <!-- /react-text -->
                </h2>
                <div id="ccss">
                    <div id="customCssContent" class="flex-vertical">
        
        
                    </div>
                    <div class="pcCssButtonContainer">
                        <button id="update">Save and Update</button>
                        <button id="detach">Popout</button>
                      </div>
                </div>
            </div>
        </div>
        `;

        const path = require('path');
        const amdLoader = require('../node_modules/monaco-editor/min/vs/loader.js');

        const electron = require('electron');

        function uriFromPath(_path) {
            var pathName = path.resolve(_path).replace(/\\/g, '/');
            if (pathName.length > 0 && pathName.charAt(0) !== '/') {
                pathName = '/' + pathName;
            }
            return encodeURI('file://' + pathName);
        }
        amdLoader.config({
            baseUrl: uriFromPath(path.join(__dirname, '../node_modules/monaco-editor/min'))
        });
        // workaround monaco-css not understanding the environment
        self.module = undefined;

		document.querySelector('#Disc0rdSetting').closest('[class*=standardSidebarView-]').querySelector('[class*=contentColumn-][class*=contentColumnDefault-]').style = "display: none;"
		document.querySelector('#Disc0rdSetting').closest('[class*=standardSidebarView-]').querySelector('[class*=contentColumn-][class*=contentColumnDefault-]').insertAdjacentHTML('beforeBegin', customCssContent );

		if(pcConfig.enabledSettings.developer) document.querySelector('.pcCssButtonContainer').insertAdjacentHTML("beforeend", `<div class="scssErrorConsole"></div>`);
		amdLoader(['vs/editor/editor.main'], function() {
			window.csseditor = monaco.editor.create(document.getElementById('customCssContent'), {
				value: pcConfig.cstmCSS,
				language: 'scss'
			});
			if(document.querySelector('.theme-dark')) csseditor._themeService.setTheme('vs-dark');
			if(document.querySelector('.theme-light')) csseditor._themeService.setTheme('vs-light');
		});

		for(let electronWindow of electron.remote.BrowserWindow.getAllWindows()) {
			if(electronWindow.getTitle() === "CSS Popout") {
				document.getElementById('ccss').style.display = 'none';
				break;
			}
		}

		document.getElementById('update').onclick = () => {
			pcConfig.cstmCSS = csseditor.getValue();
            let error = api.injectCSS('customCSS', pcConfig.cstmCSS, true);
            if(document.getElementById('scssErrorConsole')) {
                if(error) {
                    document.getElementById('scssErrorConsole').innerHTML = error;
                } else {
                    document.getElementById('scssErrorConsole').innerHTML = "";
                }
            }
			api.save('twitchcord', pcConfig);
			api.save('twitchcordBackup', pcConfig);
		}

		document.getElementById('detach').onclick = () => {
			document.getElementById('ccss').style.display = 'none';

			let {BrowserWindow} = require('electron').remote;
			let path = require('path');

			global.cssPopout = new BrowserWindow(cssPopoutSettings);
			cssPopout.setMenu(null);
			cssPopout.loadURL(path.resolve('./', 'resources/', 'twitchcord/', 'cssPopout/', 'cssPopout.html'));
		}
	}
}

global.cssPopoutSettings = {webPreferences: {webSecurity: false}};
module.exports = new customCss;
