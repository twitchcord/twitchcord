let dragCounter = 0,
    fsTimeout;

const fs = require('./../node_modules/fs-extra'),
      path = require('path');

global.plugins = {};
global.bdplugins = plugins;
global.bdpluginErrors = [];
global.pluginCookie = {};

class PluginClass {
  start() {
    $('[class*=scrollerWrap]').on('click', '[class^=guilds] [class^=guild]:not([class*=selected])', this.switch);
    this.onStart();
  }
  stop() {
    $('[class*=scrollerWrap]').off('click', '[class^=guilds] [class^=guild]:not([class*=selected])', this.switch);
    this.onStop();
  }
  switch() {
    if(this.onSwitch) this.onSwitch();
  }
}
let pluginsPath
/**
* Manages plugins and it's settings page.
*/
class PluginModule {


  /**
  * Goes through saved plugins and loads them.
  */
  async startup() {
    pluginsPath = path.join(__dirname, '..', pcConfig.pluginsPath)

		api.linkCSS('bdCSS', 'https://cdn.rawgit.com/Jiiks/BetterDiscordApp/e9e362733939f12420e6b98fa57388e1e10aeec0/css/main.min.css');

    for(let filename of fs.readdirSync(pluginsPath)){

      if(!this.isBdV2(path.join(pluginsPath, filename)) && !filename.endsWith('.plugin.js')) continue;

      let bool = false;
      if(pcConfig.loadedPlugins.includes(filename)) bool = true;

      let pluginJSON = this.getPluginData(filename);

      try {
        this.updatePlugin(pluginJSON, false);

        if(bool) {
          this.startPlugin(pluginJSON.name);
        }
      } catch(err) {
        console.error(err);
        pcErrors.push({"name":pluginJSON.name,"type":"plugin","filename":filename,"error":err});
        this.stopPlugin(pluginJSON.name);
        continue;
      }

    }

    fs.watch(pluginsPath, async (eventType, filename) => {
      if(pcConfig.enabledSettings.autoReloadPlugins && eventType === 'change' && !fsTimeout) {

        let pluginJSON = this.getPluginData(filename);

        if(!plugins[pluginJSON.name]) {
          this.updatePlugin(pluginJSON, false);
        }

        if(plugins[pluginJSON.name].enabled) {
          this.stopPlugin(pluginJSON.name);

          this.updatePlugin(pluginJSON, false);
          this.updatePluginPage();

          this.startPlugin(pluginJSON.name);

        } else if (!plugins[pluginJSON.name].enabled) {
          this.updatePlugin(pluginJSON, false);
          this.updatePluginPage();
        }
        fsTimeout = setTimeout(function() { fsTimeout=null }, 500);
      }
    });
  }

  isBdV2(folder) {
    if(folder.endsWith('.bd')) return true;
    if(!fs.lstatSync(folder).isDirectory()) return false;
    if(!folder.endsWith('/') && !folder.endsWith('\\')) folder+='/';
    return fs.existsSync(path.join(folder, "config.json"));
  }

  /**
  * Loads/Prepares the Settings Tab for plugins.
  */
  async loadPluginPage() {
    const pluginContent = `
    <div id="cstmSettingsWindow" class="content-column default">
      <div class="user-settings-account" style="width: 100%;">
            <h2 class="${
          api.fixedClasses.h2.h2+
          api.fixedClasses.h2.defaultColor+
          api.fixedClasses.h2.defaultMarginh2+
          api.fixedClasses.h2.marginBottom20
        }">
                <!-- react-text: 438 -->
    
                PLUGINS<input type="file" class="addBtn" id="pluginAddBtn" multiple /><label for="pluginAddBtn">+</label>
    
                <!-- /react-text -->
        </h2>
            <div id="pluginContent" class="flex-vertical">
    
    
    
            </div>
            <h5 style="text-align: center; margin: 0;font-size: 1em;" class="pcH5">drag plugin files here</h5>
        </div>
    </div>
    `;
    
    if(document.querySelector('#Disc0rdSetting')) {
      document.querySelector('#Disc0rdSetting').closest('[class*=standardSidebarView-]').querySelector('[class*=contentColumn-][class*=contentColumnDefault-]').style = 'display: none;'
      document.querySelector('#Disc0rdSetting').closest('[class*=standardSidebarView-]').querySelector('[class*=contentColumn-][class*=contentColumnDefault-]').insertAdjacentHTML('beforeBegin', pluginContent);
    }

    this.updatePluginPage();

    document.querySelector('#app-mount').ondragenter = () => {
      dragCounter++;
      if(document.getElementById('darkerBg') == null){
        let darkerBg = document.createElement('div');
        darkerBg.innerHTML = `
        <div class="themePopup">
          <div class="themePopupInner">
            <div class="vertFlex">
              <img style="z-index: 15;flex: 0 0 auto;position: relative;top: -85px;" src="https://discordapp.com/assets/4ab2ee5027741df387151ca717ae5614.svg" width="140px">
            </div>
            <h3 style="position: relative;top: -55px;flex: 0 0 auto;" id="themeModalTxt" class="pcH3">Drop plugins here to install them.</h3>
          </div>
        </div>
        `;
        darkerBg.id = 'darkerBg';
        if(document.querySelector('#Disc0rdSetting')) document.querySelector('#Disc0rdSetting').closest('[class*=standardSidebarView-]').appendChild(darkerBg);
      }
    };
    document.querySelector('#app-mount').ondragleave = () => {
      if(!document.getElementById('pluginAddBtn')) return;

      dragCounter--;
      if(dragCounter == 0){
        document.getElementById('darkerBg').remove();
      }
    };
    document.querySelector('#app-mount').ondragend = () => {
      if(!document.getElementById('pluginAddBtn')) return;

      dragCounter = 0;
      document.getElementById('darkerBg').remove();
    };

    document.querySelector('#app-mount').ondrop = e => {
      if(!document.getElementById('pluginAddBtn')) return;

      dragCounter = 0;
      e.preventDefault();
      for (let f of e.dataTransfer.files) {
        if(path.basename(f.path).endsWith('.plugin.js')) {
          if(document.getElementById('darkerBg') !== null){
            document.getElementById('darkerBg').remove();
          }
          fs.renameSync(f.path, path.join(pluginsPath, path.basename(f.path)));
          this.updatePluginPage();
        }else{
          document.getElementById('themeModalTxt').innerHTML = 'File is not a plugin!';
          $('.themePopup').addClass('redBg');
          setTimeout(function(){
            document.getElementById('darkerBg').remove();
          }, 2000);
        }
      }
    };


    document.getElementById('pluginAddBtn').onchange = e => {
      if(!document.getElementById('pluginAddBtn')) return;

      for(let i in e.target.files){
        if(path.basename(e.target.files[i].path).endsWith('.plugins.js')) {
          fs.renameSync(e.target.files[i].path, path.join(pluginsPath, path.basename(e.target.files[i].path)));
          this.updatePluginPage();
        }else{
          alert('file is not a plugin');
          return;
        }
      }
    };
  }


  /**
   * return the meta data and javascript of a plugin
   *
   * @param {string} pluginFile the path to a plugin file
   */
  getPluginData(pluginFile) {
    let pluginJSON;

    if(pluginFile.endsWith('.plugin.js')) {

      let pluginFileContent = fs.readFileSync(path.join(pluginsPath, pluginFile)).toString();

      if(!pluginFileContent.includes('//META')) return alert('missing META in ' + pluginFile);

      let pluginJSONstart = pluginFileContent.search('//META')+6;

          pluginFileContent = pluginFileContent.substr(pluginJSONstart);

        let pluginJSONend = pluginFileContent.search('}')+1,
            pluginJSON = JSON.parse(pluginFileContent.substr(0, pluginJSONend));

      pluginFileContent = pluginFileContent.split('\n');
      pluginFileContent = pluginFileContent.splice(1);
      pluginFileContent = pluginFileContent.join('\n');
      pluginJSON.rawJS = pluginFileContent;
      pluginJSON.filename = pluginFile;
      pluginJSON.bdVersion = 'bdV1';

      return pluginJSON;

    } else if (this.isBdV2(path.join(pluginsPath, pluginFile))) {

      let config = api.load(path.join(pluginsPath, pluginFile, "config.json"));
      let authors = "";

      for(let i in config.info.authors) {
        authors += config.info.authors[i].name;
        if(i != config.info.authors.length-1) authors += " & ";
      }

      pluginJSON = {
        name: config.info.name,
        author: authors,
        bdVersion: "bdV2",
        description: config.info.description,
        filename: pluginFile,
        version: config.info.version
      }

      Object.assign(pluginJSON, config);
      return pluginJSON;
    }
  }

  /**
   * @param {string} json the meta of the plugin
   * @param {string} enabled if the plugin is enabled or not
   */
  updatePlugin(json, enabled) {
    if(this.isBdV2(path.join(pluginsPath, json.filename))) {
      let folder = path.join(pluginsPath, json.filename);
      if( !folder.endsWith('.bd') &&
          fs.lstatSync(folder).isDirectory() &&
          !folder.endsWith('/') &&
          !folder.endsWith('\\')) folder+='/';

      let localApi = require('./../api');

      let plugin = require(folder.replace('resources/twitchcord', '..'))(PluginClass, localApi, localApi.Vendors);
      plugins[json.name] = {plugin: new plugin, enabled: false};
    }

    if(!this.isBdV2(path.join(pluginsPath, json.filename))) {
      global.process  = process
      Object.defineProperty(global, "require", { value: require})
      $.globalEval(`${json.rawJS};
plugin = new ${json.name};
plugins["${json.name}"] = { "plugin": plugin, "enabled": ${enabled} };`);
    }

    Object.assign(plugins[json.name], json);
    if (!plugins[json.name].version && plugins[json.name].plugin.getVersion) {
      Object.defineProperty(plugins[json.name], "version", {get: () => {
        try {
          return plugins[json.name].plugin.getVersion();
        } catch (e) {
          return  "¯\\_(ツ)_/¯";
          console.error(e);
        }
      }});
    }
    if (!plugins[json.name].description && plugins[json.name].plugin.getDescription) {
      Object.defineProperty(plugins[json.name], "description", {get: () => {
        try {
          return plugins[json.name].plugin.getDescription();
        } catch (e) {
          return  "¯\\_(ツ)_/¯";
          console.error(e);
        }
      }});
    }
    if (!plugins[json.name].author && plugins[json.name].plugin.getAuthor) {
      Object.defineProperty(plugins[json.name], "author", { get: () => {
        try {
          return plugins[json.name].plugin.getAuthor();
        } catch (e) {
          return  "¯\\_(ツ)_/¯";
          console.error(e);
        }
      }});
    }
  }

  /**
  * Starts a plugin and updates its status for other plugins.
  *
  * @param {string} pluginName Name of the plugin to start.
  */
  startPlugin(pluginName) {
    if(plugins[pluginName]){
      try{
        plugins[pluginName].plugin.start();
      } catch(err) {
        console.error(err);
        if(pcConfig.enabledSettings.developer) require('electron').remote.getCurrentWindow().webContents.openDevTools();
        return;
      }
      plugins[pluginName].enabled = true;
      pluginCookie[pluginName] = true;
      if(!pcConfig.loadedPlugins.includes(plugins[pluginName].filename)){
        pcConfig.loadedPlugins.push(plugins[pluginName].filename);
        api.save('twitchcord', pcConfig);
        api.save('twitchcordBackup', pcConfig);
      }
    }
  }

  /**
  * Stops a plugin and updates its status for other plugins.
  *
  * @param {string} pluginName Name of the plugin to stop.
  */
  stopPlugin(pluginName) {
    if(plugins[pluginName]){
      if(pcConfig.loadedPlugins.includes(plugins[pluginName].filename)) {
        pcConfig.loadedPlugins.splice(pcConfig.loadedPlugins.indexOf(plugins[pluginName].filename), 1);
        api.save('twitchcord', pcConfig);
        api.save('twitchcordBackup', pcConfig);
      }
      plugins[pluginName].enabled = false;
      pluginCookie[pluginName] = false;
      try {
        plugins[pluginName].plugin.stop();
      } catch (error) {
        console.error(error);
        if(pcConfig.enabledSettings.developer) require('electron').remote.getCurrentWindow().webContents.openDevTools();
      }
    }
  }

  /**
  * Toggle a plugin to stop/start and update it's status.
  *
  * @param {string} pluginName Name of the plugin to stop.
  */
  togglePlugin(pluginName) {
    if(plugins[pluginName].enabled) {
      this.stopPlugin(pluginName);
    } else {
      this.startPlugin(pluginName);
    }
  }

  //outdated bdfunctions
  disablePlugin(pluginName) {this.stopPlugin(pluginName)};
  enablePlugin(pluginName) {this.startPlugin(pluginName)};
  savePluginData() {};

  /**
  * Executes the observer function on every active plugin
  *
  * @param {Element} mutation The DOM node to pass to the observer function
  */
  async execObservers(mutation) {
    for(let plugin in plugins) {
      if(plugins[plugin].enabled && plugins[plugin].plugin && plugins[plugin].plugin.observer) {
        plugins[plugin].plugin.observer(mutation);
      }
    }
  }

  /**
  * Update/add the list of plugins to the plugin settings tab.
  */
  async updatePluginPage(){

    if(document.getElementById('pluginContent')) document.getElementById('pluginContent').innerHTML = '';

    for(let filename of fs.readdirSync(pluginsPath)){

      let currentPluginState;
      let buttons;
      let pluginJSON = this.getPluginData(filename);

      if(!this.isBdV2(path.join(pluginsPath, filename)) && !filename.endsWith('.plugin.js')) continue;

      try {
        if(!plugins[pluginJSON.name]) this.updatePlugin(pluginJSON, false);
      } catch(err) {
        console.error(err);
        continue;
      }

      if(plugins[pluginJSON.name].enabled) {
        currentPluginState = api.fixedClasses.switchEnabled.valueChecked;
      }else{
        currentPluginState = api.fixedClasses.switchEnabled.valueUnchecked;
      }

      if(document.getElementById('pluginContent')) {

        if(plugins[pluginJSON.name].enabled && plugins[pluginJSON.name].plugin.getSettingsPanel && plugins[pluginJSON.name].plugin.getSettingsPanel() != ""){
          buttons = `<p id="${pluginJSON.name}Settings" class="pcH3 pcSettingsBtn" style="margin:2px 0 0 0;flex: 0 0 auto;">⚙</p
          ><p id="${pluginJSON.name}Del" class="pcH3 pcDelBtn" style="margin:2px 0 0 0;flex: 0 0 auto;">🗑</p>`
        } else {
          buttons = `<p id="${pluginJSON.name}Del" class="pcH3 pcDelBtn" style="margin:2px 0 0 0;flex: 0 0 auto;">🗑</p>`
        }

        let currentPluginItem = document.createElement('div');
        currentPluginItem.innerHTML = `
          <div class="pcListBg">
            <div class="pcHeadList">
              <span class="pcHeaderList" style="flex: 0 0 auto;">
                <h3 class="pcH3" style="flex: 0 0 auto;">${pluginJSON.name.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</h3>
                <h5 class="pcH5" style="flex: 0 0 auto;">by ${plugins[pluginJSON.name].author.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</h5>
                <h5 class="author pcH5" stlye="flex: 0 0 auto;">${plugins[pluginJSON.name].version.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</h5>
              </span>
              <div class="pcSettingsWrap">
                <div id="${pluginJSON.name+"Checkbox"}" style="flex: 0 0 auto;" class="${
                  api.fixedClasses.switchEnabled.switchEnabled+
                  currentPluginState+
                  " "+
                  api.fixedClasses.switchEnabled.sizeDefault+
                  api.fixedClasses.switchEnabled.themeDefault
                }" style="flex: 0 0 auto;">
                  <input type="checkbox" class="${api.fixedClasses.switchEnabled.checkboxEnabled}">
                </div>
                <span>
                ${buttons}
                </span>
              </div>
            </div>
            <p class="pcDesc">`+plugins[pluginJSON.name].description.replace(/</g, "&lt;").replace(/>/g, "&gt;")+`</p>

          </div>
        `;

        document.getElementById('pluginContent').appendChild(currentPluginItem);

        if(plugins[pluginJSON.name].enabled && plugins[pluginJSON.name].plugin.getSettingsPanel && plugins[pluginJSON.name].plugin.getSettingsPanel() != ""){
          document.getElementById(pluginJSON.name + 'Settings').onclick = (function(n){
            return function() {
              api.settingsBox(plugins[n].plugin.getSettingsPanel());
            }
          })(pluginJSON.name);
        }

        document.getElementById(pluginJSON.name + 'Del').onclick = (function(n){
          return function() {
            api.confirmationBox(`DELETE ${n.toUpperCase()}`, `Are you sure you want to delete <strong>${n}</strong>? This action cannot be undone.`, bool => {
              if(bool) {
                if(pcConfig.loadedPlugins.includes(plugins[n].filename)) {
                  pcConfig.loadedPlugins.splice(pcConfig.loadedPlugins.indexOf(plugins[n].filename), 1);
                  api.save('twitchcord', pcConfig);
                  api.save('twitchcordBackup', pcConfig);
                }
                fs.removeSync(path.join(pluginsPath, plugins[n].filename));
                if(plugins[n].enabled){
                  try {
                    pluginModule.stopPlugin(n);
                  }
                  catch(err) {
                    console.error(err);
                    if(pcConfig.enabledSettings.developer) require('electron').remote.getCurrentWindow().webContents.openDevTools();
                  }
                }
                pluginModule.updatePluginPage();
              }
            });
          }
        })(pluginJSON.name);

        document.getElementById(pluginJSON.name + 'Checkbox').onclick = (function(n){
          return function() {
            $(this).toggleClass(api.fixedClasses.switchEnabled.valueChecked+api.fixedClasses.switchEnabled.valueUnchecked);

            pluginModule.togglePlugin(n)
          }
        })(pluginJSON.name);
      }
    }
  }

}

module.exports = new PluginModule;
