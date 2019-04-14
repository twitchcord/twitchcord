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
    activity () { return get('transitionTo')(modules.routes.ACTIVITY); };
    library () { return get('transitionTo')(modules.routes.APPLICATION_LIBRARY); };
    store () { return get('transitionTo')(modules.routes.APPLICATION_STORE); };

    get routes () {
        const routes = {
            discover: '/guild-discovery',
            private: '/channels/@me/',
            friends: '/channels/@me',
            guild: '/channels/',
            activity: '/activity',
            library: '/library',
            store: '/store'
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