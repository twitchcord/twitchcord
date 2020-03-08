const fs = require('./../node_modules/fs-extra');
const path = require("path")

let themeFileContent,
		themeJSON,
		themeJSONstart,
		themeJSONend,
		currentThemeItem,
		currentThemeState,
		darkerBg,
    dragCounter = 0,
    fsTimeout;

global.themes = {};
window.bdthemes = themes;
window.themeCookie = {};

class ThemeModule {
  
  async startup() {
    const themePath = path.join(__dirname, '..', pcConfig.themePath)

    for (let filename of fs.readdirSync(themePath)) {
			if(filename.endsWith('.theme.css')){
        themeFileContent = fs.readFileSync(path.join(themePath, filename)).toString();

        if(themeFileContent.search("//META") == -1){
          alert('missing META in' + filename);
          return
        } else {
          themeJSONstart = themeFileContent.search("//META")+6;
          themeJSONend = themeFileContent.substr(themeJSONstart).search("}")+1;

          themeJSON = JSON.parse(themeFileContent.substr(themeJSONstart, themeJSONend));
          themeFileContent = themeFileContent.split("\n");
          themeFileContent = themeFileContent.splice(1);
          themeFileContent = themeFileContent.join("\n");
          
          let bool = false;
          if(pcConfig.loadedThemes.includes(filename)) bool = true;

          themeCookie[themeJSON.name] = bool;

          themes[themeJSON.name] = {
            "author": themeJSON.author, 
            "css": themeFileContent,
            "description": themeJSON.description,
            "enabled": bool,
            "name": themeJSON.name,
            "filename": filename,
            "version": themeJSON.version
          }

          if(bool) this.enableTheme(themeJSON.name);
        }
      }
    }

    fs.watch(themePath, async (eventType, filename) => {
      if(pcConfig.enabledSettings.autoReloadThemes && eventType === 'change' && !fsTimeout) {
        if(filename.endsWith('.theme.css')){
          themeFileContent = fs.readFileSync(path.join(themePath, filename)).toString();
  
          if(themeFileContent.search("//META") == -1){
            alert('missing META in' + filename);
            return
          } else {
            themeJSONstart = themeFileContent.search("//META")+6;
            themeJSONend = themeFileContent.substr(themeJSONstart).search("}")+1;
  
            themeJSON = JSON.parse(themeFileContent.substr(themeJSONstart, themeJSONend));
            themeFileContent = themeFileContent.split("\n");
            themeFileContent = themeFileContent.splice(1);
            themeFileContent = themeFileContent.join("\n");
            
            let bool = false;
            if(pcConfig.loadedThemes.includes(filename)) bool = true;
  
            themeCookie[themeJSON.name] = bool;
  
            themes[themeJSON.name] = {
              "author": themeJSON.author, 
              "css": themeFileContent,
              "description": themeJSON.description,
              "enabled": bool,
              "name": themeJSON.name,
              "filename": filename,
              "version": themeJSON.version
            }
  
            if(bool) this.enableTheme(themeJSON.name);
            fsTimeout = setTimeout(function() { fsTimeout=null }, 500);
          }
        }
      }
    });
	}

  async loadThemePage() {
    const themeContent = `
    <div id="cstmSettingsWindow" class="content-column default">
        <div class="user-settings-account" style="width: 100%;">
        <h2 class="${
        api.fixedClasses.h2.h2+
        api.fixedClasses.h2.defaultColor+
        api.fixedClasses.h2.defaultMarginh2+
        api.fixedClasses.h2.marginBottom20
      }">
                <!-- react-text: 438 -->
    
                THEMES <input type="file" class="addBtn" id="themeAddBtn" multiple /><label for="themeAddBtn">+</label>
    
                <!-- /react-text -->
            </h2>
            <div id="themeContent" class="flex-vertical">
    
    
    
            </div>
            <h5 style="text-align: center; margin: 0;font-size: 1em;" class="pcH5">drag theme files here</h5>
        </div>
    </div>
    `;

    if(document.querySelector('#Disc0rdSetting')) {
      document.querySelector('#Disc0rdSetting').closest('[class*=standardSidebarView-]').querySelector('[class*=contentColumn-][class*=contentColumnDefault-]').style = "display: none;"
      document.querySelector('#Disc0rdSetting').closest('[class*=standardSidebarView-]').querySelector('[class*=contentColumn-][class*=contentColumnDefault-]').insertAdjacentHTML('beforeBegin', themeContent );
    }

    this.updateThemePage();

    document.querySelector('#app-mount').ondragenter = () => {
      dragCounter++;
      if(document.getElementById("darkerBg") == null){
        darkerBg = document.createElement('div');
        darkerBg.innerHTML = `
        <div class="themePopup">
          <div class="themePopupInner">
            <div class="vertFlex">
              <img style="transform: rotate(-20deg); margin-right:-60px;flex: 0 0 auto;position: relative;top: -85px;" src="https://i.imgur.com/fZfQIN9.png" width="110px">
              <img style="margin-right:-60px;z-index: 15;flex: 0 0 auto;position: relative;top: -85px;" src="https://discordapp.com/assets/4ab2ee5027741df387151ca717ae5614.svg" width="140px">
              <img style="transform: rotate(20deg); flex: 0 0 auto;position: relative;top: -85px;" src="https://i.imgur.com/G56Yltd.png" width="110px">
            </div>
            <h3 style="position: relative;top: -55px;flex: 0 0 auto;" id="themeModalTxt" class="pcH3">Drop themes here to install them.</h3>
          </div>
        </div>
        `;
        darkerBg.id = "darkerBg";
        if(document.querySelector('#Disc0rdSetting')) document.querySelector('#Disc0rdSetting').closest('[class*=standardSidebarView-]').appendChild(darkerBg);
      }
    };

    document.querySelector('#app-mount').ondragleave = () => {
      if(!document.getElementById("themeAddBtn")) return;

      dragCounter--;
      if(dragCounter == 0){
        document.getElementById("darkerBg").remove();
      }
    };
    document.querySelector('#app-mount').ondragend = () => {
      if(!document.getElementById("themeAddBtn")) return;

      dragCounter = 0;
     document.getElementById("darkerBg").remove();
    };

    document.querySelector('#app-mount').ondrop = (e) => {
      if(!document.getElementById("themeAddBtn")) return;

      dragCounter = 0;
      e.preventDefault();
      for (let f of e.dataTransfer.files) {
        if(require('path').basename(f.path).search('.theme.css') !== -1) {
          if(document.getElementById("darkerBg") !== null){
           document.getElementById("darkerBg").remove();
          }
          fs.renameSync(f.path, pcConfig.themePath + require('path').basename(f.path));
          this.updateThemePage();
        }else{
          document.getElementById('themeModalTxt').innerHTML = "File is not a theme!";
          $('.themePopup').addClass('redBg');
          setTimeout(function(){
            document.getElementById("darkerBg").remove();
          }, 2000);
        }
      }
    };

    document.getElementById("themeAddBtn").onchange = (e) => {
      if(!document.getElementById("themeAddBtn")) return;

      for(var i=0;i < e.target.files.length;i++){
        if(require('path').basename(e.target.files[i].path).search('.theme.css') !== -1) {
          fs.renameSync(e.target.files[i].path, pcConfig.themePath + require('path').basename(e.target.files[i].path));
          this.updateThemePage();
        }else{
          alert('file is not a theme');
        }
      }
    }
  }

  /**
  * Starts a theme and updates its status for plugins.
  * 
  * @param {string} themeName Name of the theme to enable.
  */
  enableTheme(themeName) {
    themeCookie[themeName] = true;
    themes[themeName].enabled = true;

    themes[themeName].enabled = true;

    api.injectCSS(themeName, themes[themeName].css);

    if(!pcConfig.loadedThemes.includes(themes[themeName].filename)){
      pcConfig.loadedThemes.push(themes[themeName].filename);
      api.save('twitchcord', pcConfig);
      api.save('twitchcordBackup', pcConfig);
    }
  }

  /**
  * Stops a theme and updates its status for plugins.
  * 
  * @param {string} themeName Name of the theme to disable.
  */
  disableTheme(themeName) {
    themeCookie[themeName] = false;
    themes[themeName].enabled = false;

    themes[themeName].enabled = false;

    if(document.getElementById(themeName)) api.removeCSS(themeName);

    if(pcConfig.loadedThemes.includes(themes[themeName].filename)){
      pcConfig.loadedThemes.splice(pcConfig.loadedThemes.indexOf(themes[themeName].filename), 1);
      api.save('twitchcord', pcConfig);
      api.save('twitchcordBackup', pcConfig);
    }
  }

  /**
  * Toggle a theme to stop/start and update it's status.
  * 
  * @param {string} themeName Name of the theme to disable.
  */
  toggleTheme(themeName) {
    if(!themes[themeName].enabled) {
      this.enableTheme(themeName);
    } else {
      this.disableTheme(themeName);
    }
  }

  //outdated bdfunctions
  loadThemeData() {}
  loadThemes() {}
  saveThemeData() {}

	async updateThemePage(){
    
    if(document.getElementById("themeContent")) {
      document.getElementById("themeContent").innerHTML = "";

      for (let filename of fs.readdirSync(pcConfig.themePath)) {
        if(filename.endsWith('.theme.css')){
          themeFileContent = fs.readFileSync(pcConfig.themePath + filename).toString();
          if(themeFileContent.search("//META") == -1){
            alert('missing META in' + filename);
            return
          } else {
            themeJSONstart = themeFileContent.search("//META")+6;
            themeFileContent = themeFileContent.substr(themeJSONstart);
            themeJSONend = themeFileContent.search("}")+1;

            themeJSON = JSON.parse(themeFileContent.substr(0, themeJSONend));
            
            themeFileContent = themeFileContent.split("\n");
            themeFileContent = themeFileContent.splice(1);
            themeFileContent = themeFileContent.join("\n");

            if(!themes[themeJSON.name]){
              themes[themeJSON.name] = {
                "author": themeJSON.author, 
                "css": themeFileContent,
                "description": themeJSON.description,
                "enabled": false,
                "name": themeJSON.name,
                "filename": filename,
                "version": themeJSON.version
              }
            }

            if(document.getElementById(themeJSON.name) == null){
              currentThemeState = api.fixedClasses.switchEnabled.valueUnchecked;
            }else{
              currentThemeState = api.fixedClasses.switchEnabled.valueChecked;
            }

            currentThemeItem = document.createElement('div');
            currentThemeItem.innerHTML = `
              <div class="pcListBg">
                <div class="pcHeadList">
                  <span class="pcHeaderList" style="flex: 0 0 auto;">
                    <h3 class="pcH3" style="flex: 0 0 auto;">`+themeJSON.name.replace(/</g, "&lt;").replace(/>/g, "&gt;")+`</h3>
                    <h5 class="pcH5" style="flex: 0 0 auto;">by `+themeJSON.author.replace(/</g, "&lt;").replace(/>/g, "&gt;")+`</h5>
                    <h5 class="author pcH5" stlye="flex: 0 0 auto;">`+themeJSON.version.replace(/</g, "&lt;").replace(/>/g, "&gt;")+`</h5>
                  </span>
                  <div class="pcSettingsWrap">
                    <div id="`+themeJSON.name + "Checkbox"+`" style="flex: 0 0 auto;" class="${
                      api.fixedClasses.switchEnabled.switchEnabled+
                      currentThemeState+
                      " "+
                      api.fixedClasses.switchEnabled.sizeDefault+
                      api.fixedClasses.switchEnabled.themeDefault
                    }" style="flex: 0 0 auto;">
                      <input type="checkbox" class="${api.fixedClasses.switchEnabled.checkboxEnabled}">
                    </div>
                    <span>
                      <p id="${themeJSON.name}Del" class="pcH3 pcDelBtn" style="margin:2px 0 0 0;flex: 0 0 auto;">🗑</p>
                    </span>
                  </div>
                </div>
                <p class="pcDesc">`+themeJSON.description.replace(/</g, "&lt;").replace(/>/g, "&gt;")+`</p>

              </div>
            `;

            document.getElementById("themeContent").appendChild(currentThemeItem);

            document.getElementById(themeJSON.name + 'Del').onclick = (function(n,g){
              return function() {
                api.confirmationBox(`DELETE ${n.toUpperCase()}`, `Are you sure you want to delete <strong>${n}</strong>? This action cannot be undone.`, bool => {
                  if(bool) {
                    if(document.getElementById(n) != null){
                      api.removeCSS(n);
                    }
                    
                    if(pcConfig.loadedThemes.includes(g)) {
                      pcConfig.loadedThemes.splice(pcConfig.loadedThemes.indexOf(g), 1);
                      api.save('twitchcord', pcConfig);
                      api.save('twitchcordBackup', pcConfig);
                    }
                    
                    require('fs').unlinkSync(pcConfig.themePath+g);
                    
                    themeModule.updateThemePage();
                  }
                });
              }
            })(themeJSON.name, filename);

            document.getElementById(themeJSON.name + "Checkbox").onclick = (function(n){
              return function() {
                $(this).toggleClass(api.fixedClasses.switchEnabled.valueChecked+api.fixedClasses.switchEnabled.valueUnchecked);

                themeModule.toggleTheme(n);
                
                api.save('twitchcord', pcConfig);
                api.save('twitchcordBackup', pcConfig);
              }
            })(themeJSON.name);

          }
        }
      }
    }
	}
}
module.exports = new ThemeModule;
