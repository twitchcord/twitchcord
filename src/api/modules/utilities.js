const { get, getAll, modules } = require('./webpack');

const currentWebContents = require('electron').remote.getCurrentWebContents();
const EventEmitter = require('eventemitter3');
class Nav extends EventEmitter {
    constructor () {
        super();
        currentWebContents.on("did-navigate-in-page", () => {
            this.emit(this.currentRoute);
            this.emit('all');
        });
    }

    // Go to different routes in Discord
    discover () { return get('transitionTo')(modules.routes.GUILD_DISCOVERY); };
    private () { return get('transitionTo')(modules.routes.CHANNEL('@me', get('getPrivateChannelIds')()[0])); };
    friends () { return get('transitionTo')(modules.routes.FRIENDS); };
    library () { return get('transitionTo')(modules.routes.APPLICATION_LIBRARY); };

    get routes () {
        const routes = {
            discover: '/guild-discovery',
            private: '/channels/@me/',
            friends: '/channels/@me',
            guild: '/channels/',
            library: '/library'
        };
        return routes;
    }

    get currentRoute () {
        const routes = this.routes;
        for (let location in routes) {
            if (window.location.href.includes(routes[location])) {
                return location;
                break;
            }
        }
        return console.warn('Current route unidentified.');
    };
};



  /* <div class="layer-v9HyYc da-layer" style="left: 234.5px; bottom: 51px;">
    <div class="tooltip-2QfLtc da-tooltip tooltipTop-XDDSxx tooltipBlack-PPG47z">
        <div class="tooltipPointer-3ZfirK da-tooltipPointer"></div>
        User Settings
    </div>
  </div> */

  class Tooltip {
  /**
   *
   * @constructor
   * @param {(HTMLElement|jQuery)} node - DOM node to monitor and show the tooltip on
   * @param {string} tip - string to show in the tooltip
   * @param {object} options - additional options for the tooltip
   * @param {string} [options.style=black] - correlates to the discord styling/colors (black, brand, green, grey, red, yellow)
   * @param {string} [options.side=top] - can be any of top, right, bottom, left
   * @param {boolean} [options.preventFlip=false] - prevents moving the tooltip to the opposite side if it is too big or goes offscreen
   * @param {boolean} [options.disabled=false] - whether the tooltip should be disabled from showing on hover
  */
  constructor(node, text, options = {}) {
    const {style = "black", side = "top", preventFlip = false, disabled = false} = options;
        this.node = node;
        this.label = node.hasAttribute('data-tc-tooltip') ? node.getAttribute('data-tc-tooltip') : text;
        this.style = style.toLowerCase();
        this.side = side.toLowerCase();
        this.preventFlip = preventFlip;
        this.disabled = disabled;

        this.element = tc.dom.createElement(`<div class="layer-v9HyYc">`);
        this.tooltipElement = tc.dom.createElement(`<div class="tooltip-2QfLtc ${this.style}"><div class="tooltipPointer-3ZfirK"></div>${this.label}</div>`);
        this.labelElement = this.tooltipElement.childNodes[1];
        this.element.append(this.tooltipElement);


    this.node.addEventListener("mouseenter", () => {
            if (this.disabled) return;
            this.show();

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          const nodes = Array.from(mutation.removedNodes);
          const directMatch = nodes.indexOf(this.node) > -1;
          const parentMatch = nodes.some(parent => parent.contains(this.node));
          if (directMatch || parentMatch) {
            this.hide();
            observer.disconnect();
          }
        });
      });

      observer.observe(document.body, {subtree: true, childList: true});
    });

    this.node.addEventListener("mouseleave", () => {
      this.hide();
    });
  }

  /** Container where the tooltip will be appended. */
  get container() { return document.querySelector('.layerContainer-yqaFcK'); }
  /** Boolean representing if the tooltip will fit on screen above the element */
  get canShowAbove() { return this.node.getBoundingClientRect().top + document.body.scrollTop - this.element.offsetHeight >= 0; }
  /** Boolean representing if the tooltip will fit on screen below the element */
  get canShowBelow() { return this.node.getBoundingClientRect().top + document.body.scrollTop + this.node.offsetHeight + this.element.offsetHeight <= Math.max(document.documentElement.clientHeight, window.innerHeight || 0); }
  /** Boolean representing if the tooltip will fit on screen to the left of the element */
  get canShowLeft() { return this.node.getBoundingClientRect().left + document.body.scrollLeft - this.element.offsetWidth >= 0; }
  /** Boolean representing if the tooltip will fit on screen to the right of the element */
  get canShowRight() { return this.node.getBoundingClientRect().left + document.body.scrollLeft + this.node.offsetWidth + this.element.offsetWidth <= Math.max(document.documentElement.clientWidth, window.innerWidth || 0); }

    /** Hides the tooltip. Automatically called on mouseleave. */
  hide() {
    this.element.remove();
    this.tooltipElement.className = this._className;
  }

    /** Shows the tooltip. Automatically called on mouseenter. Will attempt to flip if position was wrong. */
  show() {
    this.tooltipElement.className = `tooltip-2QfLtc ${this.style}`;
    this.labelElement.textContent = this.label;
    this.element.insertAdjacentHTML('afterbegin', this.container);

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

    /** Force showing the tooltip above the node. */
  showAbove() {
    this.tooltipElement.classList.add('tooltipTop-XDDSxx');
    this.element.style.top = this.node.getBoundingClientRect().top + document.body.scrollTop - this.element.offsetHeight - 10 + 'px';
    this.centerHorizontally();
  }

    /** Force showing the tooltip below the node. */
  showBelow() {
    this.tooltipElement.classList.add('tooltipBottom-3ARrEK');
    this.element.style.top = this.node.getBoundingClientRect().top + document.body.scrollTop + this.node.offsetHeight + 10 + 'px';
    this.centerHorizontally();
  }

    /** Force showing the tooltip to the left of the node. */
  showLeft() {
    this.tooltipElement.classList.add('tooltipRight-2JM5PQ');
    this.element.style.left = this.node.getBoundingClientRect().left + document.body.scrollLeft - this.element.offsetWidth - 10 + 'px';
    this.centerVertically();
  }

    /** Force showing the tooltip to the right of the node. */
  showRight() {
    this.tooltipElement.classList.add('tooltipRight-2JM5PQ');
    this.element.style.left = this.node.getBoundingClientRect().left + document.body.scrollLeft + this.node.offsetWidth + 10 + 'px';
    this.centerVertically();
  }

  centerHorizontally() {
    const nodecenter = this.node.getBoundingClientRect().left + document.body.scrollLeft + (this.node.offsetWidth / 2);
    this.element.style.left = nodecenter - (this.element.offsetWidth / 2) + 'px';
  }

  centerVertically() {
    const nodecenter = this.node.getBoundingClientRect().top + document.body.scrollTop + (this.node.offsetHeight / 2);
    this.element.style.top = nodecenter - (this.element.offsetHeight / 2) + 'px';
  }
};

// const commands = ({
//     config: {
//         prefix: '/',
//         actionPrefix: ' --'
//     },

//     commands: new Map(Object.entries({
//         'plugins': {
//             null: (args) => ({ send: false, result: 'whoa it works'}),
//             'echo': (args) => ({ send: false, result: args.join(' ')}),
//             'prefix': function(args) {
//                 this.config.prefix = args[0];
//                 send = false,
//                 result = `Commands prefix changed to ${args[0]}`;
//             }
//         },
//         'utils': {
//             'echo': (args) => ({ send: false, result: args.join(' ')}),
//             'prefix': function(args) {
//                 this.config.prefix = args[0];
//                 send = false,
//                 result = `Commands prefix changed to ${args[0]}`;
//             }
//         }
//     })),

//     init () {
//         const messages = getAll('sendBotMessage'),
//               sendBotMessage = get('sendBotMessage');

//         messages.sendMessage = (sendMessage => async (id, message) => {
//             if (message.content.startsWith(this.config.prefix)) {
//                 const command = message.content.slice(this.config.prefix.length).split(this.config.actionPrefix)[0];
//                 const action = message.content.slice(this.config.prefix.length).split(this.config.actionPrefix)[1].split(' ')[0];
//                 let [ ...args ] = message.content.slice(this.config.prefix.length).split(this.config.actionPrefix);
//                     args = args.toString().split(' ').slice(1);

//                 console.log(this.config.actionPrefix.split(' ').length);
//                 console.log('command: ' + command);
//                 console.log('action: ' + action);
//                 console.log('args: ' + args);
//                 if (this.commands.has(command)) {
//                     const result = await this.commands.get(command).call(this, args, command);
//                     if (result.send) {
//                         message.content = result.result;
//                     } else {
//                         return sendBotMessage(
//                             modules.currentChannelStore.id,
//                             result.result
//                         );    
//                     }
//                 }
//             }
//             return sendMessage(id, message);
//         })(this.oldSendMessage = messages.sendMessage);

//         return this;
//     }
// }).init();


module.exports = {
    // commands: commands,
    nav: new Nav()
};

// module.exports.tooltip = function(node, text, options) {
//   return new Tooltip(node, text, options)
// }