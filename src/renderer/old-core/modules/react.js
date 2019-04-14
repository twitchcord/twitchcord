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
    
        let owner = this.getOwner(element);
    
        return owner ? owner.props : null;
    },
    
    getProp (element, propKey) {
        if(!(element instanceof Element)) return null;
    
        let owner = this.getOwner(element);
    
        if(!owner || !owner.props) return null;
    
        let split = propKey.split("."), obj = owner.props;
    
        for(let i = 0; i < split.length; i++) {
            obj = obj[split[i]];
            if(!obj) return null;
        }
    
        return obj;
    }
};