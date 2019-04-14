const fs = require("fs");
const _Vue = require('vue');
const _lodash = require('lodash');
const EventEmitter = require('events');
const nodeSass = require('node-sass');
let styleArray = [];

class api {
    constructor() {
        this.classCache;
    }

    /**
     * updates the shared mouse x and y position
     * @param {Event} e the mouse event. 
     */
    async updateMouse(e) {
        e = event || window.event;
        global.mousePos = {
            x: e.clientX,
            y: e.clientY
        };
    }

    /**
     * links a css file from an url
     * @param {string} id the name / id of the css element
     * @param {*} url the url to the css stylesheet
     */
    linkCSS(id, url) {
        styleArray.push(id);
        var link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = url;
        link.media = 'all';
        document.head.appendChild(link);
    }

    /**
     * injects css into the html header
     * @param {string} id the name / id of the css element
     * @param {*} css the css of the style element
     * @param {bool} sass whether or not the content is in sass or css format.
     */
    injectCSS(id, css, sass = false) {
        styleArray.push(id);
        if (sass) {
            try {
                if (css === "") {
                    if (document.getElementById(id)) document.getElementById(id).remove();

                    return false;
                }
                css = this.compileSass(css);
            } catch (err) {
                console.error(err);
                return err.toString();
            }
        }
        if (document.getElementById(id) == null) {
            var s = document.createElement('style');
            s.setAttribute('type', 'text/css');
            s.id = id;
            s.appendChild(document.createTextNode(css));
            document.head.appendChild(s);
            s = null;
        } else {
            document.getElementById(id).innerHTML = css;
        }
        return false;
    }

    get fixedClasses() {
        if(!this.classCache) {
            //this was so anoying
            function arrayToUniqueObj(array) {

                function isUnique(key, excludeObj) {

                    for (let group of array) {
                        if (group === excludeObj) continue;

                        let newKeys = Object.keys(group);

                        for (let newKey of newKeys) {
                            if (newKey == key) {
                                return false
                            }
                        }
                    }

                    return true;

                }

                let ret = {};

                for (let classGroup of array) {
                    let keys = Object.keys(classGroup);

                    for (let keyName of keys) {
                        if (isUnique(keyName, classGroup)) {
                            ret[keyName] = classGroup;
                            break;
                        }
                    }
                }

                return ret;
            }

            let classArray = []

            BDV2.WebpackModules.find(moduleObj => {
                if (moduleObj instanceof Object) {
                    let valid = false;
                    for (let i in moduleObj) {
                        let prop = moduleObj[i];
                        if (typeof prop === "string" && prop.includes && prop.includes('-') && prop.indexOf('-') === prop.length - 7 && prop.length > 7) {
                            valid = true;
                        } else {
                            valid = false;
                            continue;
                        }
                    }
                    if (valid) classArray.push(moduleObj);
                }
            });

            this.classCache = arrayToUniqueObj(classArray);
        }
        return this.classCache;
    }

    /**
     * removes a style element
     * @param {string} id the name of the element to remove
     */
    removeCSS(id) {
        styleArray.splice(styleArray.indexOf(id), 1);
        if (document.getElementById(id) !== null) document.getElementById(id).remove();
    }

    /**
     * removes every custom css element
     */
    removeAllStyles() {
        for (let i of styleArray) {
            this.removeCSS(i);
        }
    }


    /**
     * Returns css from sass. It is like magic except that it isn't.
     * @param {string} sass the sass string to compile
     */
    compileSass(sass) {
        return nodeSass.renderSync({
            data: sass
        }).css.toString();
    }

    /**
     * returns the internal plugin class of the specified name
     * @param {string} name the name of the plugin
     */
    getPlugin(name) {
        if (plugins.hasOwnProperty(name)) {
            return plugins[name].plugin;
        }
        return null;
    }
    /**
     * loads a config file from the config folder and returns its json
     * @param {string} name the name of the config to load
     */
    load(name) {
        let path = name;
        if (!/[\\\/]/.test(name)) path = __dirname + "/config/" + name + ".config.json";
        return JSON.parse(require('fs').readFileSync(path, 'utf8'));
    }

    /**
     *
     * @param {string} name the name of the config to save to the config folder
     * @param {*} json the json you want to save
     */
    save(name, json) {
        require('fs').writeFile(__dirname + "/config/" + name + ".config.json", JSON.stringify(json), function (err) {
            if (err) {
                return alert(err);
            } else {
                return "all done";
            }
        });
    }

    /**
     * Displays a modal with a back button in the style of the plugin settings window
     * @param {string} content the html to display inside the popup
     */
    settingsBox(content) {
        if (document.getElementById('darkerBg') == null) {
            let darkerBg = document.createElement('div');
            darkerBg.innerHTML = `<div id="bd-settingspane-container" class="settingsPopup floatIn">
        <div id="plSettings"></div>
        <div style="flex-direction: row;" class="noticeFooter">
          <button id="back">🡸 Back</button>
        </div>
      </div>`;
            darkerBg.id = 'darkerBgNotice';

            document.querySelector('[class*=standardSidebarView-]').appendChild(darkerBg);
            $('#plSettings').prepend(content);

        }
        document.getElementById('back').onclick = () => {
            $('.settingsPopup').removeClass('floatIn');

            setTimeout(() => {
                $('.settingsPopup').addClass('floatOut');
            }, 1);

            setTimeout(() => {
                document.getElementById('darkerBgNotice').remove();
            }, 400);

            return;
        }
    }

    /**
     * Displays a deletion confirmation box
     * @param {string} title the title of the confirmation box
     * @param {string} text the text to display inside the confirmation box
     * @param {function} callback return either false or true
     */
    confirmationBox(title, text, callback) {
        if (document.getElementById('darkerBg') == null) {
            let darkerBg = document.createElement('div');
            darkerBg.innerHTML = `
      <div class="noticePopup floatIn">
        <div class="noticeHead">
          <h2 class="pcH2">${title}</h2>
        </div>
        <div class="noticeMiddle">
          <div class="pcH4" style="">${text}</div>
        </div>
        <div class="noticeFooter">
          <button id="delete">Delete</button>
          <button id="cancelDel">Cancel</button>
        </div>
      </div>
      `;
            darkerBg.classList = "pcFadeIn";
            darkerBg.id = 'darkerBgNotice';
            document.querySelector('[class*=popouts]').appendChild(darkerBg);

            document.getElementById('cancelDel').onclick = () => {
                $('.noticePopup').removeClass('floatIn');

                setTimeout(() => {
                    $('.noticePopup').addClass('floatOut');
                }, 15);

                setTimeout(() => {
                    document.getElementById('darkerBgNotice').remove();
                }, 400);

                callback(false);
            }
            document.getElementById('delete').onclick = () => {
                $('.noticePopup').removeClass('floatIn');

                setTimeout(() => {
                    $('.noticePopup').addClass('floatOut');
                }, 15);

                setTimeout(() => {
                    document.getElementById('darkerBgNotice').remove();
                }, 400);

                callback(true);
            }
        }
    }

    /**
     * Returns the react instance of an element
     * @param {element} elem the element to get the react instance from
     */
    getReactElement(elem) {
        if (!elem instanceof Element || !elem instanceof NodeList) return;
        if (elem instanceof NodeList) {
            let retArray = [];
            elem.forEach(element => {
                if (element[Object.keys(element).find((key) => key.startsWith("__reactInternalInstance"))])
                    retArray.push(element[Object.keys(element).find((key) => key.startsWith("__reactInternalInstance"))]);
            });
            return retArray;
        }
        if (elem instanceof Element) return elem[Object.keys(elem).find((key) => key.startsWith("__reactInternalInstance"))];
    }

    /**
     * get the fixed value of a class
     * @param {string} value a dynamic class
     */
    getFixedIndex(value) {
        for(let obj in this.fixedClasses) {
            for(let keyName of Object.keys(this.fixedClasses[obj])) {
                if(this.fixedClasses[obj][keyName] === value) {
                    console.log(this.fixedClasses[obj])
                    return "api.fixedClasses."+obj+"."+keyName;
                }
            }
        }
    }

    /**
     * get the fixed value of a class
     * @param {string} value a part of a dynamic class
     */
    getFixedIndexContaining(value) {
        for(let obj in this.fixedClasses) {
            for(let keyName of Object.keys(this.fixedClasses[obj])) {
                if(this.fixedClasses[obj][keyName].includes(value)) {
                    console.log(this.fixedClasses[obj])
                    return "api.fixedClasses."+obj+"."+keyName;
                }
            }
        }
    }

    get CssUtils() {
        return {
            injectSass: (id, sass) => {
                this.injectCSS(id, sass, true)
            },
            compileSass: this.compileSass,
            deleteStyle: this.removeCSS,
            injectStyle: (id, css) => {
                this.injectCSS(id, css, false)
            },
            deleteAllStyles: this.removeAllStyles
        }
    }

    get Vendors() {
        return new Vendors;
    }

    get Logger() {
        return new Logger;
    }

    get Api() {
        return this;
    }

    get Events() {
        return new Events;
    }
}

class Event {
    constructor() {
        this.subList = [];
        this.emitter = new EventEmitter();
    }

    get eventSubs() {
        return this.subList;
    }

    get on() {
        return this.subscribe;
    }

    subscribe(event, callback) {
        if (this.subList.find(sub => sub.event === event && suv.callback === callback)) return;
        this.subList.push({
            event: event,
            callback: callback
        });
        this.emitter.on(event, callback);
    }

    once(event, callback) {
        if (this.subList.find(sub => sub.event === event && suv.callback === callback)) return;
        this.subList.push({
            event: event,
            callback: callback
        });

        this.emitter.once(event, () => {
            callback();

            this.subList.splice(

                this.subList.indexOf(
                    this.subList.find(sub => sub.event === event && suv.callback === callback)
                ),

                1

            );
        });

    }

    get off() {
        return this.unsubscribe
    }
    unsubscribe(event, callback) {
        this.emitter.removeListener(event, callback);

        this.subList.splice(

            this.subList.indexOf(
                this.subList.find(sub => sub.event === event && suv.callback === callback)
            ),

            1

        );
    }

    unsubscribeAll() {
        this.eventSubs = [];
        this.emitter.removeAllListeners();
    }
}

class Logger {
    dbg(message) {
        return console.debug(message);
    }
    debug(message) {
        return this.dbg(message);
    }

    err(message) {
        return console.error(message);
    }
    error(message) {
        return this.err(message);
    }

    info(message) {
        return console.info(message);
    }

    log(message) {
        return console.log(message);
    }

    warn(message) {
        return console.warn(message);
    }
}

class Vendors {

    get jQuery() {
        return $;
    }
    get $() {
        return this.jQuery;
    }

    get lodash() {
        return _lodash;
    }

    get _() {
        return _lodash;
    }

    get Vue() {
        return _Vue;
    }
}


//stealing stuff from zere again - no really it just straight up stole it, sorry.
class ClassNormalizer {
    constructor() {
        this.classFormat = new RegExp(`^(?!da-)[A-Za-z]+-([A-Za-z]|[0-9]|-|_){6}$`);
        this.normFormat = new RegExp(`^(?!da-)(?:-?[a-z])+$`);
        this.mainObserver = new MutationObserver((changes) => {
            for (let c = 0; c < changes.length; c++) {
                const change = changes[c];
                const elements = change.addedNodes;
                if (!elements) continue;
                for (let n = 0; n < elements.length; n++) {
                    if (!(elements[n] instanceof Element) || !elements[n].classList) continue;
                    this.normalizeClasses(elements[n]);
                }
            }
        });

        this.cache = {};
        this.isActive = false;
    }

    stop() {
        if (!this.isActive) return;
        this.isActive = false;
        this.mainObserver.disconnect();
        this.revertClasses(document.querySelector("#app-mount"));
    }

    start() {
        if (this.isActive) return;
        this.isActive = true;
        this.normalizeClasses(document.querySelector("#app-mount"));
        this.mainObserver.observe(document.querySelector("#app-mount"), {
            childList: true,
            subtree: true
        });
    }

    toCamelCase(className) {
        return className.split("-").map((s, i) => i ? s[0].toUpperCase() + s.slice(1) : s).join("");
    }

    isRandomizedClass(className) {
        return this.classFormat.test(className);
    }

    isNormalClass(className) {
        return this.normFormat.test(className);
    }

    normalizeClasses(element) {
        if (!(element instanceof Element)) return;
        if (element.children && element.children.length) this.normalizeClasses(element.children[0]);
        if (element.nextElementSibling) this.normalizeClasses(element.nextElementSibling);
        const classes = element.classList;
        const toAdd = [];
        for (let c = 0; c < classes.length; c++) {
            if (this.cache[classes[c]]) {
                toAdd.push(this.cache[classes[c]]);
            } else if (this.isNormalClass(classes[c])) {
                const newClass = "da-" + this.toCamelCase(classes[c]);
                toAdd.push(newClass);
                this.cache[classes[c]] = newClass;
            } else if (this.isRandomizedClass(classes[c])) {
                const newClass = "da-" + classes[c].split("-")[0];
                toAdd.push(newClass);
                this.cache[classes[c]] = newClass;
            }
        }
        element.classList.add(...toAdd);
    }

    revertClasses(element) {
        if (!(element instanceof Element)) return;
        if (element.children && element.children.length) this.revertClasses(element.children[0]);
        if (element.nextElementSibling) this.revertClasses(element.nextElementSibling);
        const classes = element.classList;
        const toRemove = [];
        for (let c = 0; c < classes.length; c++) {
            if (classes[c].startsWith("da-")) toRemove.push(classes[c]);
        }
        element.classList.remove(...toRemove);
    }

};

class PluginStorage {
    constructor() {
        this.pluginStorage = {};
        if (!fs.existsSync(this._getStorageFile())) {
            fs.mkdirSync(this._getStoragePath());
            fs.writeFileSync(this._getStorageFile(), JSON.stringify(this.pluginStorage));
        }
        this.pluginStorage = JSON.parse(fs.readFileSync(this._getStorageFile()));
    }

    get(pluginName, key) {
        // Grab the config stuff from memory
        if (!this.pluginStorage[pluginName]) {
            this.pluginStorage[pluginName] = {};
        }
        this._writeFile();
        return this.pluginStorage[pluginName][key];
    }

    set(pluginName, key, value) {
        if (!this.pluginStorage[pluginName]) {
            this.pluginStorage[pluginName] = {};
        }
        this.pluginStorage[pluginName][key] = value;
        this._writeFile();
    }

    _writeFile() {
        fs.writeFile(this._getStorageFile(), JSON.stringify(this.pluginStorage), (err) => {
            if (err) {
                console.log(err);
            }
        });
    }

    _getStorageFile() {
        return this._getStoragePath() + 'pluginStorage.json';
    }

    _getStoragePath() {
        if (process.platform === 'win32') {
            return process.env.APPDATA + '/TwitchCord/';
        }
        if (process.platform === 'darwin') {
            return process.env.HOME + '/Library/Preferences/TwitchCord/'
        }
        return process.env.HOME + '/.TwitchCord/';
    }
}

class Tooltip {
    constructor(element, options = {}, tip) {
        const {
            style = "black", side = "top", preventFlip = false
        } = options;
        this.element = element;
        this.tip = element.hasAttribute('data-tc-tooltip') ? element.getAttribute('data-tc-tooltip') : tip;
        this.side = side;
        this.preventFlip = preventFlip;
        this.tooltip = document.createElement('div');
        this.tooltip.className = `tooltip tooltip-${style}`;
        this.tooltip.textContent = this.tip;

        element.addEventListener('mouseenter', () => {
            this.show();

            var observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    var nodes = Array.from(mutation.removedNodes);
                    var directMatch = nodes.indexOf(element[0]) > -1;
                    var parentMatch = nodes.some(parent => parent.contains(element[0]));
                    if (directMatch || parentMatch) {
                        if (this.tooltip && this.tooltip.parentNode) this.tooltip.parentNode.removeChild(this.tooltip);
                        observer.disconnect();
                    }
                });
            });
            observer.observe(document.body, {
                subtree: true,
                childList: true
            });
        });

        element.addEventListener('mouseleave', () => {
            if (this.tooltip && this.tooltip.parentNode) this.tooltip.parentNode.removeChild(this.tooltip);
        });
    }

    /** Boolean representing if the tooltip will fit on screen above the element */
    get canShowAbove() {
        return this.element.getBoundingClientRect().top - this.tooltip.offsetHeight >= 0;
    }
    /** Boolean representing if the tooltip will fit on screen below the element */
    get canShowBelow() {
        return this.element.getBoundingClientRect().top + this.element.offsetHeight + this.tooltip.offsetHeight <= Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    }
    /** Boolean representing if the tooltip will fit on screen to the left of the element */
    get canShowLeft() {
        return this.element.getBoundingClientRect().left - this.tooltip.offsetWidth >= 0;
    }
    /** Boolean representing if the tooltip will fit on screen to the right of the element */
    get canShowRight() {
        return this.element.getBoundingClientRect().left + this.element.offsetWidth + this.tooltip.offsetWidth <= Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    }

    /** Hides the tooltip. Automatically called on mouseleave. */
    hide() {
        this.tooltip.style.display = 'none';
    }

    /** Shows the tooltip. Automatically called on mouseenter. Will attempt to flip if position was wrong. */
    show() {
        this.tooltip.style.display = 'block';
        this.tooltip.classList.remove("tooltip-bottom");
        this.tooltip.classList.remove("tooltip-top");
        this.tooltip.classList.remove("tooltip-left");
        this.tooltip.classList.remove("tooltip-right");
        document.querySelector('.tooltips').appendChild(this.tooltip);

        if (this.side == "top") {
            if (this.canShowAbove || (!this.canShowAbove && this.preventFlip)) this.showAbove();
            else this.showBelow();
        }

        if (this.side == "bottom") {
            if (this.canShowBelow || (!this.canShowBelow && this.preventFlip)) this.showBelow();
            else this.showAbove();
        }

        if (this.side == "left") {
            if (this.canShowLeft || (!this.canShowLeft && this.preventFlip)) this.showLeft();
            else this.showRight();
        }

        if (this.side == "right") {
            if (this.canShowRight || (!this.canShowRight && this.preventFlip)) this.showRight();
            else this.showLeft();
        }
    }

    /** Force showing the tooltip above the element. */
    showAbove() {
        this.tooltip.classList.add("tooltip-top");
        this.tooltip.style.top = this.element.getBoundingClientRect().top - this.tooltip.offsetHeight + "px";
        this.centerHorizontally();
    }

    /** Force showing the tooltip below the element. */
    showBelow() {
        this.tooltip.classList.add("tooltip-bottom");
        this.tooltip.style.top = this.element.getBoundingClientRect().top + this.element.offsetHeight + "px";
        this.centerHorizontally();
    }

    /** Force showing the tooltip to the left of the element. */
    showLeft() {
        this.tooltip.classList.add("tooltip-left");
        this.tooltip.style.left = this.element.getBoundingClientRect().left - this.tooltip.offsetWidth + "px";
        this.centerVertically();
    }

    /** Force showing the tooltip to the right of the element. */
    showRight() {
        this.tooltip.classList.add("tooltip-right");
        this.tooltip.style.left = this.element.getBoundingClientRect().left + this.element.offsetWidth + "px";
        this.centerVertically();
    }

    centerHorizontally() {
        var nodecenter = this.element.getBoundingClientRect().left + (this.element.offsetWidth / 2);
        this.tooltip.style.left = nodecenter - (this.tooltip.offsetWidth / 2) + "px";
    }

    centerVertically() {
        var nodecenter = this.element.getBoundingClientRect().top + (this.element.offsetHeight / 2);
        this.tooltip.style.top = nodecenter - (this.tooltip.offsetHeight / 2) + "px";
    }
}

global.tcTooltip = Tooltip;

global.bdPluginStorage = new PluginStorage();

global.BdApi = api.prototype;
global.BdApi.clearCSS = api.prototype.removeCSS;

global.classNormalizer = new ClassNormalizer;

window.onmousemove = api.prototype.updateMouse;

module.exports = new api;
