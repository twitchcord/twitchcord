const { inject, uninject } = require('./injector')
const sleep  = require('./sleep')
const getOwnerInstance = require('./getOwnerInstance')
const { getModule } = require('./webpack')

const electron = require('electron')


class ModuleHelper {
  static get GuildStore () { return this._GuildStore || (this._GuildStore = getModule(['getGuild'], false)) }
  static get GuildMemberStore () { return this._GuildMemberStore || (this._GuildMemberStore = getModule(['getMember'], false)) }
  static get ChannelStore () { return this._ChannelStore || (this._ChannelStore = getModule(['getChannels', 'getDMFromUserId'], false)) }
  static get UserStore () { return this._UserStore || (this._UserStore = getModule(['getCurrentUser'], false)) }
  static get UserStatusStore () { return this._UserStatusStore || (this._UserStatusStore = getModule(['getStatus', 'getState'], false)) }
  static get UserActivityStore () { return this._UserActivityStore || (this._UserActivityStore = getModule(['getActivity'], false)) }
}

class ModuleHandler {
  static handleURL (url) {
    document.body.removeAttribute('data-tc-channel-id')
    document.body.removeAttribute('data-tc-guild-id')

    const navigation = url
      .replace(/https?:\/\/(?:(canary|ptb|)\.?)discordapp.com\//, '')
      .split('/')

    if (navigation[0] === 'channels') {
      if (navigation[1] !== '@me') document.body.setAttribute('data-tc-guild-id', navigation[1])
      if (navigation[2]) document.body.setAttribute('data-tc-channel-id', navigation[2])
    }

    // @TODO: Attributes for other activity page
    // Hopefully includes things like Store ID and such.
  }

  static handleChannel (channel, returnValue) {
    const { props } = returnValue

    props['data-tc-channel-id'] = channel.id
    props['data-tc-channel-name'] = channel.name || null

    // Location
    if ([0, 2, 4, 5, 6].includes(channel.type)) props.className += ' tc-attr-isGuildChannel'
    if ([1, 3].includes(channel.type)) props.className += ' tc-attr-isPrivateChannel'
    if ([3].includes(channel.type)) props.className += ' tc-attr-isGroupChannel'
    
    // Channel type
    /// Honestly the plan was to make this into an attribute,
    /// but considering that the news channel is a special text channel,
    /// it's better to make it this way instead.
    if ([0, 5].includes(channel.type)) props.className += ' tc-attr-isTextChannel'
    if (channel.type === 2) props.className += ' tc-attr-isVoiceChannel'
    if (channel.type === 5) props.className += ' tc-attr-isNewsChannel'
    if (channel.type === 6) props.className += ' tc-attr-isStoreListingChannel'
  }
}


const ModulePatches = {
  UserProfile: {
    select: '.userPopout-3XzG_A, .root-SR8cQa',
    func: ['render'],
    patch: (data) => {
      const { thisObject } = data

      // Filtering by Profile Popout only is necessary,
      // Because it seems like we're also injecting into unrelated trash as well.
      if (!thisObject.props.section || !thisObject.props.section === 'Profile Popout') return
      if (!thisObject._reactInternalFiber || !thisObject._reactInternalFiber.return || !thisObject._reactInternalFiber.return.memoizedProps) return
      
      const { user, guild, guildMember } = thisObject._reactInternalFiber.return.memoizedProps
      if (!user) return

      const root = thisObject.props.children

      root.props['data-tc-user-id'] = user.id
      if (user.email) root.props.className += ' tc-attr-isCurrentUser'
      if (user.bot) root.props.className += ' tc-attr-isBot'
      
      if (guild) {
        root.props['data-tc-guild-id'] = guild.id

        if (guildMember) root.props.className += ' tc-attr-isGuildMember'
        if (user.id === guild.ownerId) root.props.className += ' tc-attr-isGuildOwner'
        if (guildMember && guildMember.roles.length) root.props.className += ' tc-attr-hasRoles'
      }

      // I expect the top-most activity to be last on the array
      // Hence the reversal of array
      const activities = ModuleHelper.UserStatusStore.getActivities(user.id)

      for (const activity of activities.reverse()) {
        const activityType = ['PLAYING', 'STREAMING', 'LISTENING', 'WATCHING'][activity.type]

        if (activityType) root.props['data-tc-activity-type'] = activityType
        root.props['data-tc-activity-name'] = activity.name

        if (activity.party && activity.party.id && activity.party.id.startsWith('spotify:'))
          root.props.className += ' tc-attr-isPlayingSpotify'
      }
    },
  },
  UserRole: {
    select: '.role-2irmRk',
    func: ['render'],
    patch: (data) => {
      const { thisObject, returnValue } = data
      const { props } = returnValue

      const { role } = thisObject.props
      if (!role) return

      props['data-tc-role-id'] = role.id
      props['data-tc-role-name'] = role.name
      props['data-tc-role-color'] = role.colorString

      if (role.colorString) props.style.color = role.colorString;

      if (role.hoist) props.className += ' tc-attr-isHoisted'
      if (role.mentionable) props.className += ' tc-attr-isMentionable'
    },
  },
  DMChannel: {
    select: '.channel-2QD9_O[style]',
    func: ['render'],
    patch: (data) => {
      const { thisObject, returnValue } = data
      const { props } = returnValue

      if (!props.className) return
      if (!props.className.includes('channel-2QD9_O')) return

      const { getChannel, getDMChannelId } = ModuleHelper.ChannelStore
      let { channel, user } = thisObject._reactInternalFiber.return.memoizedProps

      if (!channel) channel = getChannel(getDMChannelId(user.id))

      if (user) {
        props['data-tc-user-id'] = user.id
        if (user.bot) props.className += ' tc-attr-isBot'
      }

      ModuleHandler.handleChannel(channel, returnValue)
    },
  },
  Guild: {
    select: '.container-2td-dC',
    func: ['render'],
    patch: (data) => {
      const { thisObject, returnValue } = data
      const { props } = returnValue

      if (thisObject.props && thisObject.props.draggableId) return
      if (!thisObject.props || !thisObject.props.guild) return
      const { guild } = thisObject.props

      props['data-tc-guild-id'] = guild.id
      props['data-tc-guild-name'] = guild.name
    },
  },
  GuildTextChannel: {
    select: '.wrapperConnectedText-3NUF2g, .wrapperDefaultText-2IWcE8, .wrapperHoveredText-2geN_M, .wrapperLockedText-wfOnM5, .wrapperMutedText-1YBpvv, .wrapperSelectedText-3dSUjC, .wrapperUnreadText-2zuiuD',
    readjust: (elem) => elem.parentElement,
    func: ['render'],
    patch: (data) => {
      const { thisObject, returnValue } = data

      const { channel } = thisObject.props
      if (!channel) return

      ModuleHandler.handleChannel(channel, returnValue)
    },
  },
  GuildVoiceChannel: {
    select: '.wrapperConnectedVoice-2mvQJY, .wrapperDefaultVoice-1yvceo, .wrapperHoveredVoice-3ItgyI, .wrapperLockedVoice-3QrBs-, .wrapperMutedVoice-10gPcW, .wrapperSelectedVoice-xzxa2u, .wrapperUnreadVoice-23GIYe',
    readjust: (elem) => elem.parentElement,
    func: ['render'],
    patch: (data) => {
      const { thisObject, returnValue } = data

      const { channel } = thisObject.props
      if (!channel) return

      ModuleHandler.handleChannel(channel, returnValue)
    },
  },
  GuildStoreListingChannel: {
    select: '.wrapper-KpKNwI .icon-sxakjD[name="StoreTag"]',
    readjust: (elem) => elem.parentElement.parentElement.parentElement.parentElement,
    func: ['render'],
    patch: (data) => {
      const { thisObject, returnValue } = data

      const { channel } = thisObject.props
      if (!channel) return

      ModuleHandler.handleChannel(channel, returnValue)
    },
  },
  ChannelMember: {
    select: '.content-OzHfo4:not(.placeholder-oNR4zO)',
    func: ['render'],
    patch: (data) => {
      const { thisObject, returnValue } = data
      const { props } = returnValue

      const { user, colorString, isOwner } = thisObject.props
      if (!user) return

      props['data-tc-user-id'] = user.id
      props['data-tc-colorstring'] = colorString
      if (user.email) props.className += ' tc-attr-isCurrentUser'
      if (isOwner) props.className += ' tc-attr-isGuildOwner'
    },
  },
  Chat: {
    select: '.chat-3bRxxu',
    func: ['render'],
    patch: (data) => {
      const { thisObject, returnValue } = data

      const { channel } = thisObject.props
      if (!channel) return

      ModuleHandler.handleChannel(channel, returnValue)
    },
  },
  MessageGroup: {
    select: '.container-1YxwTf',
    func: ['render'],
    patch: (data) => {
      const { thisObject, returnValue } = data
      const { props } = returnValue

      const { messages } = thisObject.props
      if (!messages || !messages.length) return

      const { author, type, channel_id } = messages[0]
      const channel = ModuleHelper.ChannelStore.getChannel(channel_id)

      props['data-tc-author-id'] = author.id
      if (author.email) props.className += ' tc-attr-isCurrentUser'
      if (type !== 0) props.className += ' tc-attr-isSystemMessage'

      if (channel && channel.guild_id) {
        const guild = ModuleHelper.GuildStore.getGuild(channel.guild_id)
        const member = ModuleHelper.GuildMemberStore.getMember(channel.guild_id, author.id)

        if (member) props.className += ' tc-attr-isGuildMember'
        if (author.id === guild.ownerId) props.className += ' tc-attr-isGuildOwner'
      }
    },
  },
  MessageContent: {
    select: '.message-1PNnaP',
    func: ['render'],
    patch: (data) => {
      const { thisObject, returnValue } = data
      const { props } = returnValue

      const { message, channel } = thisObject.props
      const { author } = message

      props['data-tc-message-id'] = message.id
      props['data-tc-author-id'] = author.id
      props['data-tc-colorstring'] = message.colorString

      if (author.email) props.className += ' tc-attr-isCurrentUser'
      if (author.bot) props.className += ' tc-attr-isBot'
      if (message.attachments.length) props.className += ' tc-attr-hasAttachments'
      if (message.embeds.length) props.className += ' tc-attr-hasEmbeds'

      if (channel && channel.guild_id) {
        const guild = ModuleHelper.GuildStore.getGuild(channel.guild_id)
        const member = ModuleHelper.GuildMemberStore.getMember(channel.guild_id, author.id)

        if (member) props.className += ' tc-attr-isGuildMember'
        if (author.id === guild.ownerId) props.className += ' tc-attr-isGuildOwner'
      }
    },
  },
}
const WindowListeners = {
  'blur': () => document.body.classList.add('tc-attr-isUnfocused'),
  'focus': () => document.body.classList.remove('tc-attr-isUnfocused'),

  'hide': () => document.body.classList.add('tc-attr-isHidden'),
  'show': () => document.body.classList.remove('tc-attr-isHidden'),

  'maximize': () => document.body.classList.add('tc-attr-isMaximized'),
  'unmaximize': () => document.body.classList.remove('tc-attr-isMaximized'),

  'minimize': () => document.body.classList.add('tc-attr-isMinimized'),
  'restore': () => document.body.classList.remove('tc-attr-isMinimized'),
}
const ContentListeners = {
  'did-navigate-in-page': (event, url) => ModuleHandler.handleURL(url),
}


class DataAttributes /*extends Plugin*/ {
  constructor () {
    //super()

    this.currentWindow = electron.remote.getCurrentWindow()
  }

  get ModuleHelper () { return ModuleHelper }
  get ModuleHandler () { return ModuleHandler }

  get ModulePatches () { return ModulePatches }
  get WindowListeners () { return WindowListeners }
  get ContentListeners () { return ContentListeners }

  get patchedFunctions () { return this._patchedFunctions || (this._patchedFunctions = []) }


  hookDataAttributes () {
    this.initialized = true

    this.applyModulePatches()
    this.applyWindowListeners()
    this.applyContentListeners()

    this.ModuleHandler.handleURL(document.URL)
  }

  unhookDataAttributes () {
    this.initialized = false
    this.cancelModulePatches()
    this.cancelWindowListeners()
    this.cancelContentListeners()

    this.destroyAttributes()
  }

  destroyAttributes () {
    document.body.classList.remove('tc-attr-isDark', 'tc-attr-isLight')
    document.body.classList.remove('tc-attr-isUnfocused', 'tc-attr-isHidden', 'tc-attr-isMaximized', 'tc-attr-isMinimized')
    document.body.classList.remove('tc-attr-powercord')
    document.body.removeAttribute('data-tc-channel-id')
    document.body.removeAttribute('data-tc-guild-id')
  }


  // Window listeners
  applyWindowListeners () {
    if (this.ready) return false

    Object.entries(this.WindowListeners)
      .forEach(([eventName, func]) => this.currentWindow.on(eventName, func))
  }

  cancelWindowListeners () {
    Object.entries(this.WindowListeners)
      .forEach(([eventName, func]) => this.currentWindow.off(eventName, func))
  }


  // Content listeners
  applyContentListeners () {
    if (this.ready) return false

    Object.entries(this.ContentListeners)
      .forEach(([eventName, func]) => this.currentWindow.webContents.on(eventName, func))
  }

  cancelContentListeners () {
    Object.entries(this.ContentListeners)
      .forEach(([eventName, func]) => this.currentWindow.webContents.off(eventName, func))
  }


  // Module patches
  applyModulePatches () {
    if (this.ready) return false

    Object.entries(this.ModulePatches)
      .forEach(async ([modName, mod]) => {
        // Wait for the mod's element
        let elem

        while (!(elem = document.querySelector(mod.select))) {
          await sleep(2500)
        }

        // Don't continue if
        // - plugin is not enabled
        if (!this.initialized) return

        // If the mod indicates readjustment to the element,
        // run through that function first.
        if (mod.readjust && typeof mod.readjust === 'function')
          elem = mod.readjust(elem)

        // Get the element's instance
        const instance = getOwnerInstance(elem)

        // Now we patch
        for (const funcName of mod.func) {
          const patchID = `tc-dataAttributes_${modName}-${funcName}`
          
          // Don't continue if
          // - function is already patched
          if (this.patchedFunctions.includes(patchID)) return

          inject(
            patchID,
            Object.getPrototypeOf(instance),
            funcName,
            function patch (args, returnValue) {
              const data = {
                thisObject: this,
                methodArguments: args,
                returnValue: returnValue,
                currentFunction: funcName,
              }

              const returnData = mod.patch(data)

              return returnData && returnData.returnValue ?
                returnData.returnValue : data.returnValue
            }
          )

          this.patchedFunctions.push(patchID)
        }

        // After patching, we force update all elements
        for (let elem of document.querySelectorAll(mod.select)) {
          if (mod.readjust && typeof mod.readjust === 'function')
            elem = mod.readjust(elem)

          const instance = getOwnerInstance(elem)
          instance.forceUpdate()
        }
      })
  }

  cancelModulePatches () {
    for (const patchID of this.patchedFunctions) {
      uninject(patchID)
    }
  }
}

module.exports = DataAttributes
