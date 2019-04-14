module.exports = (() => {
    const req = typeof(webpackJsonp) == 'function' ? webpackJsonp([], {'__extra_id__': (module, exports, req) => exports.default = req}, ['__extra_id__']).default : webpackJsonp.push([[], {'__extra_id__': (module, exports, req) => module.exports = req}, [['__extra_id__']]]);
    delete req.m['__extra_id__'];
    delete req.c['__extra_id__'];

    const webpackRequire = ((id) => webpackJsonp.push([
        [],
        { [id]: (_, e,r) => e.require =r },
        [[id]]
    ]).require
    )(Math.random());

    const find = (filter, options = {}) => {
        const {cacheOnly = true} = options;
        for (let i in req.c) {
            if (req.c.hasOwnProperty(i)) {
                let m = req.c[i].exports;
                if (m && m.__esModule && m.default && filter(m.default)) return m.default;
                if (m && filter(m))	return m;
            }
        }
        if (cacheOnly) {
            console.warn('Cannot find loaded module in cache');
            return null;
        }
        console.warn('Cannot find loaded module in cache. Loading all modules may have unexpected side effects');
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
        console.warn('Cannot find module');
        return null;
    };

    const filter = (filter, options = {}) => {
        const {cacheOnly = true} = options;
        const found = []
        for (let i in req.c) {
            if (req.c.hasOwnProperty(i)) {
                let m = req.c[i].exports;
                if (m && m.__esModule && m.default && filter(m.default)) found.push(m.default);
                if (m && filter(m)) found.push(m);
            }
        }
        if (found.length > 0) return found
        if (cacheOnly) {
            console.warn('Cannot find loaded module in cache');
            return null;
        }
        console.warn('Cannot find loaded module in cache. Loading all modules may have unexpected side effects');
        for (let i = 0; i < req.m.length; ++i) {
            try {
                let m = req(i);
                if (m && m.__esModule && m.default && filter(m.default)) return m.default;
                if (m && filter(m))    return m;
            }
            catch (e) {
                console.error(e);
            }
        }
        console.warn('Cannot find module');
        return null;
    };

    const findByUniqueProperties = (propNames, options) => find(module => propNames.every(prop => module[prop] !== undefined), options);

    // Just a shorthand alternative version of findByUniqueProperties
    const findByProps = (...props) => findByUniqueProperties(props);

    // Just a shorthand alternative version of findByUniqueProperties
    const getAll = (...props) => findByUniqueProperties(props);

    // This is a function to eliminate repetitive `get('x').x.something` calls.
    // If it uses more than one prop, the first prop is used for the second x.
    // i.e. `getAll('x', 'y', 'z').x()` is equivalent to `get('x', 'y', 'z')()`
    const get = (...props) => {
        const potentialModule = findByUniqueProperties(props);
        if (potentialModule) {
          return potentialModule[props[0]];
        }
        return null;
    };

    const findByDisplayName = (displayName, options) => find(module => module.displayName === displayName, options);

    // Only use for development purposes... webpack id's can change in subsequent versions
    const findById = (id) => webpackRequire(id);
    


    const modules = {
        get react () { return getAll('createElement', 'cloneElement'); },

        get routes () { return get('Routes'); },

        get activityStore () { return getAll('getApplicationActivity'); },
        get currentUserActivityStore () { return getAll('userPresence'); },

        get gameStore () { return getAll('getCurrentGame'); },
        get currentGameStore () { return get('getCurrentGame'); },
        get gameUtils () { return getAll('addGame', 'editName'); },

        get userStore () { return getAll('getUser'); },
        get currentUserStore () { return this.userStore.getCurrentUser(); },

        get guildStore () { return getAll('getGuild'); },
        get selectedGuildStore () { return getAll('getLastSelectedGuildId'); },
        get currentGuildStore () { return get('getGuild')(this.selectedGuildStore.getGuildId()); },
        
        get channelStore () { return getAll('getChannel'); },
        get selectedChannelStore () { return getAll('getLastSelectedChannelId'); },
        get currentVoiceChannelStore () { return get('getChannel')(this.selectedChannelStore.getVoiceChannelId()); },
        get currentChannelStore () { return get('getChannel')(this.selectedChannelStore.getChannelId()); },

        get userSettingsStore () { return getAll('guildPositions'); }
    };
    


    const userSettings = {
        open () {
            get('open', 'setSection', 'updateAccount')();
            get('setSection', 'open', 'updateAccount')(get('USER_SETTINGS_MY_ACCOUNT'));
        },
        close () {
            get('close', 'setSection', 'open', 'updateAccount')();
            get('popAllLayer', 'popLayer')();
        },

        get allowTts () { return modules.userSettingsStore.enableTTSCommand; },
        get theme () { return modules.userSettingsStore.theme; },
                  /**
             * Whether to automatically add accounts from other platforms running on the user's computer.
             * Configurable in the connections panel.
             */
        get detectPlatformAccounts () { return modules.userSettingsStore.detectPlatformAccounts; },
        get status () { return modules.userSettingsStore.status; },
    
        /**
         * The user's selected explicit content filter level.
         * 0 == off, 1 == everyone except friends, 2 == everyone
         * Configurable in the privacy and safety panel.
         */
        get explicitContentFilter() { return modules.userSettingsStore.explicitContentFilter; },
    
        /**
         * Whether to disallow direct messages from server members by default.
         */
        get defaultGuildsRestricted () { return modules.userSettingsStore.defaultGuildsRestricted; },
    
        /**
         * An array of guilds to disallow direct messages from their members.
         * This is bypassed if the member is has another mutual guild with this disabled, or the member is friends with the current user.
         * Configurable in each server's privacy settings.
         */
        get restrictedGuildIds() { return modules.userSettingsStore.restrictedGuilds; },
    
        /*
        get restrictedGuilds() {
            return structs__WEBPACK_IMPORTED_MODULE_1__['List'].from(this.restrictedGuildIds, id => _guild__WEBPACK_IMPORTED_MODULE_2__['Guild'].fromId(id) || id);
        }*/
    
        /**
         * An array of flags specifying who should be allowed to add the current user as a friend.
         * If everyone is checked, this will only have one item, 'all'. Otherwise it has either 'mutual_friends', 'mutual_guilds', both or neither.
         * Configurable in the privacy and safety panel.
         */
        get friendSourceFlags() { return Object.keys(modules.userSettingsStore.friendSourceFlags); },
        get friendSourceEveryone() { return this.friend_source_flags.include('all'); },
        get friendSourceMutual_friends() { return this.friend_source_flags.include('all') || this.friend_source_flags.include('mutual_friends'); },
        get friendSourceMutual_guilds() { return this.friend_source_flags.include('all') || this.friend_source_flags.include('mutual_guilds'); },
        get friendSourceAnyone() { return this.friend_source_flags.length > 0; },
    
        /**
         * The number of seconds Discord will wait for activity before sending mobile push notifications.
         * Configurable in the notifications panel.
         */
        get afkTimeout() { return modules.userSettingsStore.afkTimeout; },
    
        /**
         * Whether to display the currently running game as a status message.
         * Configurable in the games panel.
         */
        get showCurrentGame() { return modules.userSettingsStore.showCurrentGame; },
    
        /**
         * Whether to show images uploaded directly to Discord.
         * Configurable in the text and images panel.
         */
        get inlineAttachmentMedia() { return modules.userSettingsStore.inlineAttachmentMedia; },
    
        /**
         * Whether to show images linked in Discord.
         * Configurable in the text and images panel.
         */
        get inlineEmbedMedia() { return modules.userSettingsStore.inlineEmbedMedia; },
    
        /**
         * Whether to automatically play GIFs when the Discord window is active without having to hover the mouse over the image.
         * Configurable in the text and images panel.
         */
        get autoplayGifs() { return modules.userSettingsStore.gifAutoPlay; },
    
        /**
         * Whether to show content from HTTP[s] links as embeds.
         * Configurable in the text and images panel.
         */
        get showEmbeds() { return modules.userSettingsStore.renderEmbeds; },
    
        /**
         * Whether to show a message's reactions.
         * Configurable in the text and images panel.
         */
        get showReactions() { return modules.userSettingsStore.renderReactions; },
    
        /**
         * Whether to play animated emoji.
         * Configurable in the text and images panel.
         */
        get animateEmoji() { return modules.userSettingsStore.animateEmoji; },
    
        /**
         * Whether to convert ASCII emoticons to emoji.
         * Configurable in the text and images panel.
         */
        get convertEmoticons() { return modules.userSettingsStore.convertEmoticons; },
    
        /**
         * Whether to allow playing text-to-speech messages.
         * Configurable in the text and images panel.
         */
        get allowTts() { return modules.userSettingsStore.enableTTSCommand; },
    
        /**
         * The user's selected theme. Either 'dark' or 'light'.
         * Configurable in the appearance panel.
         */
        get theme() { return modules.userSettingsStore.theme; },
    
        /**
         * Whether the user has enabled compact mode.
         * `true` if compact mode is enabled, `false` if cozy mode is enabled.
         * Configurable in the appearance panel.
         */
        get displayCompact() { return modules.userSettingsStore.messageDisplayCompact; },
    
        /**
         * Whether the user has enabled developer mode.
         * Currently only adds a 'Copy ID' option to the context menu on users, guilds and channels.
         * Configurable in the appearance panel.
         */
        get developerMode() { return modules.userSettingsStore.developerMode; },
    
        /**
         * The user's selected language code.
         * Configurable in the language panel.
         */
        get locale() { return modules.userSettingsStore.locale; },
    
        /**
         * The user's timezone offset in hours.
         * This is not configurable.
         */
        get timezoneOffset() { return modules.userSettingsStore.timezoneOffset; }
    };



    const filters = {
        /**
         * 
         * @param {array} fields - array of prototype function names
         * @param {callable} [selector=x => x] - additional filter for confirming module
         * @returns {(*|null)} returns either the module or null if not found.
         */
        byPrototypeFields: (fields, selector = x => x) => (module) => {
            const component = selector(module);
            if (!component) return false;
            if (!component.prototype) return false;
            for (const field of fields) {
                if (!component.prototype[field]) return false;
            }
            return true;
        },
        
        /**
         * 
         * @param {regex} search - regex for searching through module code
         * @param {callable} [selector=x => x] - additional filter for confirming module
         * @returns {(*|null)} returns either the module or null if not found.
         */
        byCode: (search, selector = x => x) => (module) => {
            const method = selector(module);
            if (!method) return false;
            return method.toString().search(search) !== -1;
        },
        
        /**
         * 
         * @param {...utilities.filters} filters - series of filters to combine
         * @returns {(*|null)} returns either the module or null if not found.
         */
        and: (...filters) => (module) => {
            for (const filter of filters) {
                if (!filter(module)) return false;
            }
            return true;
        }
    };



    const utilities = {
        closeModals () { return get('popAll', 'push', 'update', 'pop', 'popWithKey')(); },
        closeContextMenus () { return get('closeContextMenu')(); },
        closePopouts () { return get('closeAll', 'open', 'close')(); },

        // Update Discord
        updateDiscord () { return get('quitAndInstall')(); },

        changeUserSettings (settings) {
            // Enable Dark theme
            // tc.webpack.UserSettings({theme: 'dark'});
            // Enable Light theme
            // tc.webpack.UserSettings({theme: 'light'});

            // Streamer Mode
            // [Enable]
            // tc.webpack.UserSettings({streamerMode: true});
            // [Disable]
            // tc.webpack.UserSettings({streamerMode: false});

            // 'Show Currently Playing Game' as status
            // [Enable]
            // tc.webpack.UserSettings({showCurrentGame: true});
            // [Disable]
            // tc.webpack.UserSettings({showCurrentGame: false});

            // Enable Cozy mode
            // tc.webpack.UserSettings({messageDisplayCompact: true});
            // Enable Compact mode
            // tc.webpack.UserSettings({messageDisplayCompact: false});

            // Enable Games tab
            // tc.webpack.UserSettings({disableGamesTab: false});
            // Disable Games tab
            // tc.webpack.UserSettings({disableGamesTab: true});

            if (typeof settings.streamerMode === 'boolean') {
                get('setEnabled', 'update')(settings.streamerMode);
            }

            return get('updateLocalSettings')(settings);
        }
    };



    return { find, findByDisplayName, findById, findByProps, findByUniqueProperties, get, getAll, filter, filters, modules, utilities, userSettings, require: req };
})();