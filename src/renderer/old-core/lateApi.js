/*V2 Premature*/

class V2 {

    constructor() {
        this.WebpackModules = (() => {
            //__webpack_require__ = window.webpackJsonp.push([[id], {[id]: (module, exports, req) => module.exports = req}, [[id]]]);
            const req = typeof(webpackJsonp) == "function" ? webpackJsonp([], {__extra_id__: (module, exports, req) => exports.default = req}, ["__extra_id__"]).default :
                        webpackJsonp.push([[], {__extra_id__: (module, exports, req) => module.exports = req}, [["__extra_id__"]]]);
            delete req.m.__extra_id__;
            delete req.c.__extra_id__;
            const find = (filter, options = {}) => {
                const {cacheOnly = true} = options;
                for (let i in req.c) {
                    if (req.c.hasOwnProperty(i)) {
                        let m = req.c[i].exports;
                        if (m && m.__esModule && m.default && filter(m.default)) return m.default;
                        if (m && filter(m))	{
                            return m;
                        }
                    }
                }
                if (cacheOnly) {
                    return null;
                }
                console.warn("Cannot find loaded module in cache. Loading all modules may have unexpected side effects");
                for (let i = 0; i < req.m.length; ++i) {
                    try {
                        let m = req(i);
                        if (m && m.__esModule && m.default && filter(m.default)) return m.default;
                        if (m && filter(m))	return m;
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
                console.warn("Cannot find module");
                return null;
            };
			
            const findByUniqueProperties = (propNames, options) => find(module => propNames.every(prop => module[prop] !== undefined), options);
            const findByDisplayName = (displayName, options) => find(module => module.displayName === displayName, options);
                
            return {find, findByUniqueProperties, findByDisplayName};
        })();

        this.internal = {
            react: this.WebpackModules.findByUniqueProperties(["Component", "PureComponent", "Children", "createElement", "cloneElement"]),
            reactDom: this.WebpackModules.findByUniqueProperties(["findDOMNode"])
        };
        this.getInternalInstance = e => e[Object.keys(e).find(k => k.startsWith("__reactInternalInstance"))];
    }

    get messageClasses() {
        return this.WebpackModules.findByUniqueProperties(["message", "containerCozy"]) || {};
    }

    get MessageContentComponent() {return BDV2.WebpackModules.find(m => m.defaultProps && m.defaultProps.hasOwnProperty("disableButtons"));}

    get TimeFormatter() {return BDV2.WebpackModules.findByUniqueProperties(["dateFormat"]);}

    get TooltipWrapper() {return BDV2.WebpackModules.find(m => m.prototype && m.prototype.showDelayed);}

    get NativeModule() {return BDV2.WebpackModules.findByUniqueProperties(["setBadge"]);}

    get reactComponent() {
        return this.internal.react.Component;
    }

    get react() {
        return this.internal.react;
    }

    get reactDom() {
        return this.internal.reactDom;
    }

    parseSettings(cat) {
        return Object.keys(settings).reduce((arr, key) => { 
            let setting = settings[key];
            if (setting.cat === cat && setting.implemented && !setting.hidden) { 
                setting.text = key;
                arr.push(setting);
            } return arr; 
        }, []);
    }


}

window.BDV2 = new V2();