module.exports = {
    // Helpful utilities for dealing with getting react information from DOM objects.

    get (element) {
        if(!(element instanceof Element)) return null;
        return element[Object.keys(element).find(key => key.startsWith("__reactInternalInstance"))];
    },
    
    getEvents (element) {
        if(!(element instanceof Element)) return null;
    
        return element[Object.keys(element).find(key => key.startsWith("__reactEventHandlers"))];
    },
    
    getOwner (element) {
        if(!(element instanceof Element)) return null;
        
        let reactData = this.get(element);
    
        if(reactData == undefined) return null;
    
        for(let c = reactData.return; !_.isNil(c); c = c.return) {
            if(_.isNil(c)) continue;
            let owner = c.stateNode;
            if(!_.isNil(owner) && !(owner instanceof HTMLElement)) return owner;
        }
    },
    
    getProps (element) {
        if(!(element instanceof Element)) return null;
    
        return element ? element.props : null;
    },
    
    // getProp (element, propKey) {
    //     if(!(element instanceof Element)) return null;
    
    //     let owner = this.getOwner(element);
    
    //     if(!owner || !owner.props) return null;
    
    //     let split = propKey.split("."), obj = owner.props;
    
    //     for(let i = 0; i < split.length; i++) {
    //         obj = obj[split[i]];
    //         if(!obj) return null;
    //     }
    
    //     return obj;
    // }
    getProp (element, propKey) {
      return propKey.split(/\s?\.\s?/).reduce((function(element, propKey) {
        return element && element[propKey]
      }), element)
    },

    /**
       * Finds a value, subobject, or array from a tree that matches a specific filter. Great for patching render functions.
       * @param {object} tree React tree to look through. Can be a rendered object or an internal instance.
       * @param {callable} searchFilter Filter function to check subobjects against.
       */
    findInReactTree(tree, searchFilter) {
        return this.findInTree(tree, searchFilter, {walkable: ["props", "children", "child", "sibling"]});
    },

    /**
     * Finds a value, subobject, or array from a tree that matches a specific filter.
     * @param {object} tree Tree that should be walked
     * @param {callable} searchFilter Filter to check against each object and subobject
     * @param {object} options Additional options to customize the search
     * @param {Array<string>|null} [options.walkable=null] Array of strings to use as keys that are allowed to be walked on. Null value indicates all keys are walkable
     * @param {Array<string>} [options.ignore=[]] Array of strings to use as keys to exclude from the search, most helpful when `walkable = null`.
     */
    findInTree(tree, searchFilter, {walkable = null, ignore = []} = {}) {
        if (typeof searchFilter === "string") {
            if (tree.hasOwnProperty(searchFilter)) return tree[searchFilter];
        }
        else if (searchFilter(tree)) {
            return tree;
        }

        if (typeof tree !== "object" || tree == null) return undefined;

        let tempReturn = undefined;
        if (tree instanceof Array) {
            for (const value of tree) {
                tempReturn = this.findInTree(value, searchFilter, {walkable, ignore});
                if (typeof tempReturn != "undefined") return tempReturn;
            }
        }
        else {
            const toWalk = walkable == null ? Object.keys(tree) : walkable;
            for (const key of toWalk) {
                if (!tree.hasOwnProperty(key) || ignore.includes(key)) continue;
                tempReturn = this.findInTree(tree[key], searchFilter, {walkable, ignore});
                if (typeof tempReturn != "undefined") return tempReturn;
            }
        }
        return tempReturn;
    },
    
    findProp(obj, what) {
      if (obj.hasOwnProperty(what)) return obj[what];
      if (obj.props && !obj.children) return this.findProp(obj.props, what);
      if (!obj.children) return null;
      if (!(obj.children instanceof Array)) return this.findProp(obj.children, what);
      for (const child of obj.children) {
          if (!child) continue;
          const findInChild = this.findProp(child, what);
          if (findInChild) return findInChild;
      }
      return null;
    }
};