class Twitchcord {
  getName () { return 'Twitchcord'; }
  getVersion () { return '0.5.2'; }
  getAuthor () { return 'Twitchcord Developers'; }
  getDescription () { return 'Splargin! The official plugin for Twitchcord. Includes fixes and features and a full array of user theme settings options!'; }

  constructor () {
    this.initialized = false;

    this.BASE_URL = 'https://github.com/twitchcord/twitchcord/master';
    this.userProfileImages = {};
    this.userBadgeGroups = {};
    // this.SNIPPET_URL = `${this.BASE_URL}/pluginSnippets/snippets.json`;
    // this.PLUGIN_URL = `${this.BASE_URL}/plugin/Twitchcord.plugin.js`;
    
    window.fetch(tc.const.USER_BADGES_URL).then(async r =>  {
      let res = await r.json();
      if (!res.files) {
        return;
      } else { this.userBadgeGroups = JSON.parse(res.files['userBadges.json'].content); }
    });

    window.fetch(tc.const.USER_PROFILE_IMAGES_URL).then(async r =>  {
      let res = await r.json();
      if (!res.files) {
        return;
      } else { this.userProfileImages = JSON.parse(res.files['userProfileImages.json'].content); }
    });

    this.observers = [];
    this.contextObserver = new MutationObserver((changes) => {
      for (const change of changes) {
        this.observeContextMenus(change);
      }
    });
    this.observers.push(this.contextObserver);

    this.selectedTabClasses = 'itemDefaultSelected-1UAWLe item-PXvHYJ selected-3s45Ha';
    this.unselectedTabClasses = 'itemDefault-3NDwnY item-PXvHYJ notSelected-PgwTMa';
  }

  // async imageBtns () {
  //   const clipboard = require('electron').clipboard;
  //   const nativeImage = require('electron').nativeImage;
  //   const request = require('request');
  //   document.body.on('click', '.imageWrapper-2p5ogY.imageZoom-1n-ADA img, .imageWrapper-2p5ogY.imageZoom-1n-ADA video, .imageWrapper-2p5ogY.imageZoom-1n-ADA .imageError-2OefUi', async (e) => {
  //     while(!document.querySelector(".modal-3c3bKg > .inner-1ilYF7 > div > .imageWrapper-2p5ogY img") && !document.querySelector(".modal-3c3bKg > .inner-1ilYF7 > div > .imageWrapper-2p5ogY video")) await new Promise(p => setTimeout(p, 10));
  //     let parent = e.target.closest('.container-1YxwTf'),
  //         openOriginal = document.querySelector('.modal-3c3bKg > .inner-1ilYF7 > div > .imageWrapper-2p5ogY ~ .downloadLink-1ywL9o'),
  //         userImage = parent.getElementsByClassName('large-3ChYtB')[0],
  //         name = parent.getElementsByClassName('username-_4ZSMR')[0],
  //         timestamp = parent.querySelector('h2 time'),
  //         noClassDiv = document.querySelector(".modal-3c3bKg > .inner-1ilYF7 > div > .imageWrapper-2p5ogY").parentElement,
  //         imageCheck = document.querySelector(".modal-3c3bKg > .inner-1ilYF7 > div > .imageWrapper-2p5ogY img"),
  //         videoCheck = document.querySelector(".modal-3c3bKg > .inner-1ilYF7 > div > .imageWrapper-2p5ogY video"),
  //         inner = document.querySelector(".inner-1ilYF7");

  //     var imageUrl, imageName, videoUrl, videoName;

  //         if (imageCheck) {
  //           imageUrl = imageCheck.src;
  //           imageName = imageUrl.split('/').pop();
  //           imageName = imageName.split(/[?#]/)[0];
  //         } else if (videoCheck) {
  //           videoUrl = videoCheck.src;
  //           videoName = videoUrl.split('/').pop();
  //           videoName = videoName.split(/[?#]/)[0];
  //         } else {
  //           return;
  //         }

  //         document.querySelector('.inner-1ilYF7 > div > .imageWrapper-2p5ogY').insertAdjacentHTML('afterend', `
  //         <div class="tc-imageTopbar-container">
  //           <div class="tc-imageTopbar-avatar">
  //             ${userImage.outerHTML}
  //           </div>
  //           <div class="tc-imageTopbar-text">
  //             <div class="tc-imageTopbar-userdetails">
  //               ${name.outerHTML}
  //               ${timestamp.outerHTML}
  //             </div>
  //             <div class="tc-imageTopbar-imgname">
  //               ${imageName ? imageName : videoName}
  //             </div>
  //           </div>
  //           <div class="tc-imageTopbar-buttons">
  //             <a href="${imageUrl ? imageUrl : videoUrl}" download id="downloadA" data-tc-tooltip="Download"></a>
  //             <a id="copyImageAddress" data-tc-tooltip="Copy Link"></a>
  //             <a id="copyImage" data-tc-tooltip="Copy Image"></a>
  //             <div class="tc-imageTopbar-separator"></div>
  //             <a class="tc-imageTopbar-close"></a>
  //           </div>
  //         </div>
  //         `);

  //         // Fix for https://i.imgur.com/MftsSwV.png
  //         noClassDiv.classList.add('tc-imageTopbar');

  //         let newOpenOriginal = openOriginal.cloneNode(true);
  //         newOpenOriginal.setAttribute('id', 'openOriginal');
  //         newOpenOriginal.setAttribute('data-tc-tooltip', 'Open Original');

  //         inner.style.position = "relative";
  //         inner.style.top = "calc(var(--titlebar-height) / 2)";

  //         document.querySelector('.tc-imageTopbar .tc-imageTopbar-buttons').insertBefore(newOpenOriginal, document.querySelector('.tc-imageTopbar-separator'));

  //         new tcTooltip(newOpenOriginal);

  //         new tcTooltip(document.getElementById('downloadA'));

  //         new tcTooltip(document.getElementById('copyImageAddress'));

  //         document.getElementById('copyImageAddress').onclick = () => {
  //           clipboard.writeText(`${imageUrl ? imageUrl : videoUrl}`);
  //         }

  //         document.querySelector('.tc-imageTopbar-close').onclick = () => {
  //           document.querySelector('.backdrop-1wrmKB').click();
  //         }

  //         new tcTooltip(document.getElementById('copyImage'));

  //         document.getElementById('copyImage').onclick = () => {
  //           request({url: `${imageUrl ? imageUrl : videoUrl}`, encoding: null}, (error, response, buffer) => {
  //             if (error) {
  //                 return;
  //             }
  //             clipboard.write({image: nativeImage.createFromBuffer(buffer)});
  //         });
  //         }
  //   });
  // }

  injectUserBackgrounds () {
    const MO = new MutationObserver(async changes => {
      if (changes.some(change =>
        change.addedNodes && change.addedNodes[0] &&
        change.addedNodes[0].className === 'backdrop-1wrmKB'
      )) {
          this.injectUserModal();
      } else if (changes.some(change =>
        change.target && change.target.classList.contains('popouts-3dRSmE')
      )) {

        this.injectUserPopout();
      }
    });

    MO.observe(document.querySelector('#app-mount'), { childList: true, subtree: true });
    this.observers.push(MO);
  }

  async onSwitchViews () {
    var observertarget = null;
    this.viewsObserver = new MutationObserver((changes, _) => {
      changes.forEach(
        (change, i) => {
          if (change.target && (change.target.classList.contains('popouts-2bnG9Z') || change.target.classList.contains('layerContainer-yqaFcK'))) {
            let popouts = document.getElementsByClassName('popouts-2bnG9Z')[0];

            let tcAccountPanel = document.querySelector('.tc-titleWrapper-account-panel-outer');
            if (document.querySelector('.menu-Sp6bN1.alt-3btY0e')) {
              if (tcAccountPanel && !tcAccountPanel.classList.contains('opened')) tcAccountPanel.classList.add('opened');
            } else {
              if (tcAccountPanel && tcAccountPanel.classList.contains('opened')) tcAccountPanel.classList.remove('opened');
            }

            let recentMentionsFilterPopout = document.getElementsByClassName('recentMentionsFilterPopout-24_uDU')[0];
            if (recentMentionsFilterPopout) {
              recentMentionsFilterPopout.parentElement.parentElement.classList.add('tc-fixRecentMentionsFilterPopout');
            } else {
              if (popouts && popouts.children[0]) popouts.children[0].classList.remove('tc-fixRecentMentionsFilterPopout');
            }

            this.injectUserPopout();
            this.changeRoleStyle();
          }
          if (change.removedNodes) {
            change.removedNodes.forEach((node) => {
              if (node && node.tagName && node.classList.contains('backdrop-1wrmKB')) {
                let quickSwitcherInput = document.querySelector('.tc-titleWrapper-global-search-outer .input-2VB9rf');
                if (quickSwitcherInput) {
                  quickSwitcherInput.remove();
                }
              }
            });
          }
          if (change.addedNodes) {
            change.addedNodes.forEach(async (node) => {
                if (node && node.tagName && node.classList.contains('backdrop-1wrmKB')) {
                  let quickSwitcherInput = document.querySelector('.input-2VB9rf');
                  if (quickSwitcherInput) document.querySelector('.backdrop-1wrmKB').style.display = 'none';
                  this.injectUserModal();
                }

                function isDescendant(parent, child) {
                  let node = child.parentNode;
                  while (node != null) {
                      if (node == parent) {
                          return true;
                      }
                      node = node.parentNode;
                  }
                  return false;
                }
                
                let customCSSEditor = document.querySelector('#ccss'),
                    emojiPicker = document.querySelector('.emojiPicker-3m1S-j'),
                    inviteFriendsModal = document.querySelector('.wrapper-O5i5-0'),
                    settingsContent = document.querySelector('.content-region'),
                    channelMembersList = document.querySelector('.members-1998pB'),
                    quickswitcherInput = document.querySelector('.input-2VB9rf'),
                    quickswitcher = document.querySelector('.container-3qKHyN'),
                    autocomplete = document.querySelector('.autocomplete-1vrmpx'),
                    channelsList = document.querySelector('.channels-Ie2l6A');
                if (node && node.tagName && (
                    isDescendant(customCSSEditor, node) ||
                    isDescendant(autocomplete, node) ||
                    isDescendant(emojiPicker, node) ||
                    isDescendant(inviteFriendsModal, node) ||
                    isDescendant(settingsContent, node) ||
                    isDescendant(channelMembersList, node) ||
                    isDescendant(quickswitcherInput, node) ||
                    isDescendant(quickswitcher, node) ||
                    isDescendant(channelsList, node)
                  )) {
                  return;
                }

                if (node && node.tagName && node.classList.contains('autocomplete-1vrmpx')) {
                  while(!node.querySelector('.horizontalAutocompletes-x8hlrn.scrollbar-3dvm_9')) await new Promise(p => setTimeout(p, 10));
                    node.querySelector('.horizontalAutocompletes-x8hlrn.scrollbar-3dvm_9').addEventListener('wheel', function(e)
                    {
                      if(e.type != 'wheel')
                      {
                        return;
                      }
                      let delta = ((e.deltaY || -e.wheelDelta || e.detail) >> 10) || 1;
                      delta = delta * (-300);
                      node.querySelector('.horizontalAutocompletes-x8hlrn.scrollbar-3dvm_9').scrollLeft -= delta;
                      e.preventDefault();
                    });
                }

                var mentionspopout = null;
                if (node && node.tagName && (mentionspopout = node.querySelector(".recentMentionsPopout-2fmau1")) != null) {
                  this.clearAllMentions();
                }

                
                // Context menu opened
                let contextMenu = document.getElementsByClassName('contextMenu-HLZMGh')[0];
                if (node && node.tagName && contextMenu) {
                  this.setContextMenuItemClasses(contextMenu);
                }

                // Settings menu opened
                let settingsMenu = document.querySelector('.layer-3QrUeG + .layer-3QrUeG');
                if (node && node.tagName && settingsMenu) {
                  this.setSettingsMenuItemClasses();
                }

                // if (node && node.tagName && node.classList.contains("layer-3QrUeG")) {
                //   this.discordSettingsOpened();
                // }

                // Check if user has unread server mentions
                if (document.querySelector('.scroller-2TZvBN > .listItem-2P_4kh:not(:first-of-type) .badge-3dItlm')) {
                  document.documentElement.classList.add('newMentions');
                } else {
                  document.documentElement.classList.remove('newMentions');
                }

                // Prevent native fullscreen youtube videos
                let videoIframe = document.getElementById('tc-fixedVideo-player');
                if (node && node.tagName && videoIframe)
                  videoIframe.allowFullscreen = false;

                // Joined voice chat
                if (node && node.tagName && node.classList.contains("container-1UB9sr")) {
                  this.insertVoiceConnected();
                }

                if (node && node.tagName && document.querySelector('.guildsError-b7zR5H')) {
                  if (!document.querySelector('.guildsError-b7zR5H').closest('.listItem-2P_4kh').classList.contains('tc-guildsErrorButton')) {
                    document.querySelector('.guildsError-b7zR5H').closest('.listItem-2P_4kh').classList.add('tc-guildsErrorButton');
                  }
                }

                if (node && node.tagName && document.querySelector('.circleIcon-LvPL6c')) {
                  if (!document.querySelector('.circleIcon-LvPL6c').closest('.listItem-2P_4kh').classList.contains('tc-createJoinButton')) {
                    document.querySelector('.circleIcon-LvPL6c').closest('.listItem-2P_4kh').classList.add('tc-createJoinButton');
                  } 
                }
                
                // TODO: Change from the aria-label selector
                if (node && node.tagName && document.querySelector('.circleIconButton-jET_ig[aria-label="Server Discovery"]')) {
                  if (!document.querySelector('.circleIconButton-jET_ig[aria-label="Server Discovery"]').closest('.listItem-2P_4kh').classList.contains('tc-serverDiscoveryButton')) {
                    document.querySelector('.circleIconButton-jET_ig[aria-label="Server Discovery"]').closest('.listItem-2P_4kh').classList.add('tc-serverDiscoveryButton');
                  }
                }

                if (node && node.tagName && document.querySelector('.guildSeparator-3s64Iy')) {
                  if (!document.querySelector('.guildSeparator-3s64Iy').closest('.listItem-2P_4kh').classList.contains('tc-guildSeparatorContainer')) {
                    document.querySelector('.guildSeparator-3s64Iy').closest('.listItem-2P_4kh').classList.add('tc-guildSeparatorContainer');
                  }
                }

                if (node && node.tagName && document.querySelector('.button-OhfaWu')) {
                  if (!document.querySelector('.button-OhfaWu').closest('.listItem-2P_4kh').classList.contains('tc-guildHomeContainer')) {
                    document.querySelector('.button-OhfaWu').closest('.listItem-2P_4kh').classList.add('tc-guildHomeContainer');
                  }
                }

                // Add identifier classes to the sub nav buttons
                // if (document.getElementsByClassName('iconMargin-2YXk4F')) {
                //   let iconParent = document.getElementsByClassName('iconMargin-2YXk4F');
                //   for (var i = 0; i < iconParent.length; i++) {
                //     if (iconParent[i].querySelector('.icon-1R19_H[name="VideoCamera"]')) {
                //       iconParent[i].classList.add('tc-discordVideoCallButton');
                //     }
                //     if (iconParent[i].querySelector('.icon-1R19_H[name="NotificationBell"], .icon-1R19_H[name="NotificationBellOff"]')) {
                //       iconParent[i].classList.add('tc-discordNotificationsButton');
                //     }
                //     if (iconParent[i].querySelector('.icon-1R19_H[name="Pin"]')) {
                //       iconParent[i].classList.add('tc-discordPinButton');
                //     }
                //     if (iconParent[i].querySelector('.icon-1R19_H[name="People"]')) {
                //       iconParent[i].classList.add('tc-discordMembersListButton');
                //     }
                //     if (iconParent[i].querySelector('.icon-1R19_H[name="Phone"]')) {
                //       iconParent[i].classList.add('tc-discordCallButton');
                //     }
                //     if (iconParent[i].querySelector('.icon-1R19_H[name="PersonPlus"]')) {
                //       iconParent[i].classList.add('tc-discordGroupDMButton');
                //     }
                //     if (iconParent[i].querySelector('.icon-1R19_H[name="QuestionMark"]')) {
                //       iconParent[i].classList.add('tc-discordHelpButton');
                //     }
                //     if (iconParent[i].querySelector('.icon-1R19_H[name="Update"]')) {
                //       iconParent[i].classList.add('tc-discordUpdateButton');
                //       let tcUpdateBtn = document.getElementsByClassName('tc-titleWrapper-account-update-outer')[0];
                //       if (!tcUpdateBtn.classList.contains('listener-added')) {
                //         tcUpdateBtn.classList.add('listener-added');
                //         new tcTooltip(tcUpdateBtn, {side: 'bottom'});
                //         tcUpdateBtn.addEventListener('click', () => {
                //           let discordUpdateBtn = document.querySelector('.icon-1R19_H[name="Update"]').parentNode;
                //           tcUpdateBtn.getElementsByClassName('tc-titleWrapper-account-update').classList.add('updating');
                //           discordUpdateBtn.click();
                //         }, false);
                //       }
                //     }
                //     if (iconParent[i].querySelector('.icon-1R19_H[name="Mention"]')) {
                //       iconParent[i].classList.add('tc-discordMentionButton');
                //       let tcNotificationsBtn = document.getElementsByClassName('tc-titleWrapper-account-mentions-outer')[0];
                //       if (!tcNotificationsBtn.classList.contains('listener-added')) {
                //         tcNotificationsBtn.classList.add('listener-added');
                //         new tcTooltip(tcNotificationsBtn, {side: 'bottom'});
                //         tcNotificationsBtn.addEventListener('click', () => {
                //           let discordMentionBtn = document.querySelector('.icon-1R19_H[name="Mention"]').parentNode;
                //           discordMentionBtn.click();
                //         }, false);
                //       }
                //     }
                //   }
                // }

                // New message-group addeded
                if (node && node.tagName && node.classList.contains("groupStart-23k01U")) {
                  this.setUserIdAndBadges(node);
                }

                // Switch Channels
                if (node && node.tagName && node.classList.contains("messagesWrapper-3lZDfY")) {
                  this.setUserIdAndBadges();
                }

                // If bot badge added
                if (node && node.tagName && node.classList.contains('botTag-2WPJ74')) {
                    node.dataset.tcTooltip = "Bot User";
                    // new tcTooltip(badge);
                }

                // Switch to Servers
                if (node && node.tagName && document.querySelector('.container-2Rl01u')) {
                    this.switchToServers();
                    this.insertTopNav('serverView');
                }

                // Switch to Library
                if (node && node.tagName && document.querySelector('.gameLibrary-TTDw4Y')) {
                  this.switchToLibrary();
                  this.insertTopNav('libraryView');
                }

                // Switch to Server Discovery
                if (node && node.tagName && document.querySelector('.pageWrapper-1PgVDX')) {
                  this.switchToDiscover();
                  this.insertTopNav('discoverView');
                }

                // Switch to DMs
                if (node && node.tagName && document.querySelector('.privateChannels-1nO12o') && document.querySelector(".chat-3bRxxu")) {
                    this.switchToDMs();
                    this.insertTopNav('messagesView');
                }

                // Switch to Friends
                if (node && node.tagName && document.querySelector(".container-1D34oG")) {
                    this.switchToFriends();
                    this.insertTopNav('friendsView');
                }
            });
          }
        }
      );
    });
    if (observertarget = document.querySelector("#app-mount")) this.viewsObserver.observe(observertarget, {childList: true, subtree: true});
  }

  /*
  discordSettingsOpened () {
    let settingsInnerContainer = document.getElementsByClassName('ui-standard-sidebar-view')[0];
    if (!settingsInnerContainer) return;

    document.documentElement.classList.add('userSettingsActive');

    let itemSelected = document.getElementsByClassName('itemSelected-1qLhcL')[0];
    if (itemSelected) {
      itemSelected.classList.remove("itemSelected-1qLhcL", "selected-3s45Ha");
      itemSelected.classList.add("itemDefault-3Jdr52", "notSelected-1N1G5p");
    }

    let settingsItems = document.getElementsByClassName('itemDefault-3Jdr52');
    console.log('pie');
    if (settingsItems.length) {
      console.log('cheese');
      for (let item of settingsItems) {
        item.addEventListener('click', () => {
          console.log('okay');
          document.documentElement.classList.add('settingItemSelected');
        }, true);
      }
    }
  }
*/

  async insertVoiceConnected () {
    let channelStore = tc.webpack.getAll('getChannel', 'getChannels'),
        selectedChannelStore = tc.webpack.getAll('getChannelId', 'getVoiceChannelId'),
        selectedVoiceChannel = channelStore.getChannel(selectedChannelStore.getVoiceChannelId()),
        userStore = tc.webpack.getAll('getUser'),
        tcConnected = document.getElementsByClassName('tc-voiceConnected')[0],
        voiceConnectedContainer = document.getElementsByClassName('container-1UB9sr')[0];

    if ((!selectedVoiceChannel) || (!voiceConnectedContainer)) return;

    let dmVoiceConvo = Array.from(selectedVoiceChannel.recipients, uid => userStore.getUser(uid).username).join(", ");

    if (tcConnected) tcConnected.remove();

      let tcVoiceBar = `
        <div class="tc-voiceConnected">
          <div class="tc-voiceConnected-disconnect" data-tc-tooltip="Disconnect"></div>
          <div class="tc-voiceConnected-container">
              <div class="tc-voiceConnected-server-name">${(selectedVoiceChannel.name === "") ? dmVoiceConvo : selectedVoiceChannel.name}</div>
              <div class="tc-voiceConnected-time-connected">
                <span class="tc-voiceConnected-hours"></span><span class="tc-voiceConnected-minutes">00</span>:<span class="tc-voiceConnected-seconds">00</span>
              </div>
          </div>
          <div class="tc-voiceConnected-deafen" data-tc-tooltip="Deafen"></div>
          <div class="tc-voiceConnected-mute" data-tc-tooltip="Mute"></div>
        </div>`;

      voiceConnectedContainer.insertAdjacentHTML('beforeend', tcVoiceBar);

      var voiceDisconnect = document.getElementsByClassName('tc-voiceConnected-disconnect')[0],
          voiceDeafen = document.getElementsByClassName('tc-voiceConnected-deafen')[0],
          voiceMute = document.getElementsByClassName('tc-voiceConnected-mute')[0];

      // new tcTooltip(voiceDisconnect);
      // new tcTooltip(voiceDeafen);
      // new tcTooltip(voiceMute);

      voiceDisconnect.addEventListener('click', function () {
        let disconnectButton = document.getElementsByClassName('container-1UB9sr')[0].getElementsByClassName('buttonDisconnect-3W_SJc')[0];
        disconnectButton.click();
        let tooltip = document.getElementsByClassName('tooltip')[0];
        if (tooltip) tooltip.remove();
      });

      voiceDeafen.addEventListener('click', function () {
        let deafenButton = document.querySelector('.channels-Ie2l6A button.button-2b6hmh[style*="/assets/c7c47afdf35d5a3e06233319d3aa7674.svg"]'),
            undeafenButton = document.querySelector('.channels-Ie2l6A button.button-2b6hmh[style*="/assets/c8845c514bbf3f1e5bea064c1e40b08d.svg"]'),
            siblingMuteButton = this.nextSibling;
        if (this.classList.contains('deafened')) {
            this.classList.remove('deafened');
            this.dataset.tcTooltip = 'Deafen';
            undeafenButton.click();
            if (this.nextSibling.classList.contains('muted'))
              this.classList.remove('muted');
        } else {
          if (siblingMuteButton)
          this.classList.add('deafened');
          this.dataset.tcTooltip = 'Undeafen';
          deafenButton.click();
        }
      });

      voiceMute.addEventListener('click', function () {
        let muteButton = document.querySelector('.channels-Ie2l6A button.button-2b6hmh[style*="/assets/4bc527c257233fc69b94342d77bcb9ee.svg"]'),
            unmuteButton = document.querySelector('.channels-Ie2l6A button.button-2b6hmh[style*="/assets/896770bf2d6ed0358ed0adefdbe96a24.svg"]'),
            siblingDeafenButton = this.previousSibling;
        if (this.classList.contains('muted')) {
          this.classList.remove('muted');
          this.dataset.tcTooltip = 'Mute';
          unmuteButton.click();
        } else {
          this.classList.add('muted');
          this.dataset.tcTooltip = 'Unmute';
          muteButton.click();
        }
      });

      const hours = document.getElementsByClassName("tc-voiceConnected-time-connected")[0].getElementsByClassName('tc-voiceConnected-hours')[0],
            minutes = document.getElementsByClassName("tc-voiceConnected-time-connected")[0].getElementsByClassName('tc-voiceConnected-minutes')[0],
            seconds = document.getElementsByClassName("tc-voiceConnected-time-connected")[0].getElementsByClassName('tc-voiceConnected-seconds')[0];

      let count = 0;

      const renderTimer = () => {
        count += 1;
        if (count >= 3600) hours.innerHTML = (Math.floor(count / 3600).toString()) + ":";
        minutes.innerHTML = Math.floor((count / 60) % 60).toString().padStart(2, "0");
        seconds.innerHTML = (count % 60).toString().padStart(2, "0");
      }

      const timer = setInterval(renderTimer, 1000);
  }
  
  checkIfModerator(guildID, userID) {
    var moderator = false,
        kickMembersPerm = false,
        banMembersPerm = false,
        manageMessagesPerm = false;
    
    guildID = guildID.toString();
    userID = userID.toString();

    var rolesArray;

    tc.lib.waitForTruthy(() => { rolesArray = tc.webpack.get('getMember')(guildID, userID).roles}, 1000);

    if (!rolesArray) return;

    for (let role of rolesArray) {
      if ((role & tc.webpack.get('Permissions').KICK_MEMBERS) == tc.webpack.get('Permissions').KICK_MEMBERS) {
          kickMembersPerm = true;
      }
      if ((role & tc.webpack.get('Permissions').BAN_MEMBERS) == tc.webpack.get('Permissions').BAN_MEMBERS) {
          banMembersPerm = true;
      }
      if ((role & tc.webpack.get('Permissions').MANAGE_MESSAGES) == tc.webpack.get('Permissions').MANAGE_MESSAGES) {
          manageMessagesPerm = true;
      }
    }

    if (kickMembersPerm && banMembersPerm && manageMessagesPerm) return true;
  }

  setUserIdAndBadges (node) {
    if (!node) {
      let messageGroups = document.querySelectorAll('.groupStart-23k01U');
      let usernameWrapper = messageGroups.querySelector('.username-1A8OIy');

      if (messageGroups && usernameWrapper) {
        for(var x=0; x < messageGroups.length; x++) {
          this.setUserIdAndBadges(messageGroups[x]);
        }
      }
    } else {
      node.dataset.userId = tc.react.getProp(tc.react.get(node), "memoizedProps.children.1.props.message.author.id");

      let insertionPoint = node.querySelector('.username-1A8OIy');
      
      if (!insertionPoint) return;

      for(let group in this.userBadgeGroups) {
        for(let [key, value] of Object.entries(this.userBadgeGroups[group])) {
          if (tc.react.getProp(tc.react.get(node), "memoizedProps.children.1.props.message.author.id") == (key, value)) {
            
            let tcUserBadgeContainer = node.querySelector('.tc-userBadge-container'),
                tcUserBadges = node.querySelectorAll('.tc-userBadge-badge');
            if (!tcUserBadgeContainer && tcUserBadges.length < 2) {
              let groupFirstWord = group.replace(/ .*/,'');
              let tcUserBadgeContainerDivs = `
                <div class="tc-userBadge-container">
                  <div class="tc-userBadge-badge ${groupFirstWord.toLowerCase()}" data-tc-tooltip="${group}"></div>
                </div>
              `;
              insertionPoint.insertAdjacentHTML('beforebegin', tcUserBadgeContainerDivs);
              let tcBadge = node.querySelector('.tc-userBadge-badge');
              // tc.utils.tooltip(tcBadge, 'I like pie');
            } else if (tcUserBadgeContainer && tcUserBadges.length < 2) {
              let groupFirstWord = group.replace(/ .*/,'');
              if (tcUserBadges[0].classList.contains(groupFirstWord.toLowerCase())) { return; }
              else {
                tcUserBadgeContainer.insertAdjacentHTML('beforeend', `<div class="tc-userBadge-badge ${groupFirstWord.toLowerCase()}" data-tc-tooltip="${group}"></div>`);
                let tcBadge = node.querySelector('.tc-userBadge-badge:nth-of-type(2)');
                // new tcTooltip(tcBadge);
              }
            }
          }
        }
      }
      let badgeContainer = node.getElementsByClassName('tc-userBadge-container')[0],
          badge = node.getElementsByClassName('tc-userBadge-badge');
      if (badgeContainer && badge.length < 2) {
        if (badge.length == 0 || (badge.length == 1 && !badge[0].classList.contains('nitro'))) {
          let avatar = node.getElementsByClassName('avatar-1BDn8e')[0];
          if (avatar && avatar.style.backgroundImage.includes("/a_")) {
            badgeContainer.insertAdjacentHTML('beforeend', '<div class="tc-userBadge-badge nitro" data-tc-tooltip="Nitro User"></div>');
            let tcBadge = node.querySelector('.tc-userBadge-badge:nth-of-type(2)');
            // new tcTooltip(tcBadge);
          }
        }
      } else {
        if (!badgeContainer) {
          let avatar = node.getElementsByClassName('avatar-1BDn8e')[0];
          if (avatar && avatar.style.backgroundImage.includes("/a_")) {
            insertionPoint.insertAdjacentHTML('beforebegin', '<div class="tc-userBadge-container">' +
                                                              '<div class="tc-userBadge-badge nitro" data-tc-tooltip="Nitro User"></div>' +
                                                            '</div>');
            let tcBadge = node.querySelector('.tc-userBadge-badge');
            // new tcTooltip(tcBadge);
          }
          if (tc.react.getProp(tc.react.get(node), 'memoizedProps.children.1.props.channel.guild_id') &&
              tc.react.getProp(tc.react.get(node), 'memoizedProps.children.1.props.message.author.id')) {
            console.log('piss');
            if (this.checkIfModerator(tc.react.getProp(tc.react.get(node), 'memoizedProps.children.1.props.channel.guild_id'),
                                      tc.react.getProp(tc.react.get(node), 'memoizedProps.children.1.props.message.author.id'))) {
              console.log('poop');
              insertionPoint.insertAdjacentHTML('beforebegin', '<div class="tc-userBadge-container">' +
                                                  '<div class="tc-userBadge-badge moderator" data-tc-tooltip="Moderator"></div>' +
                                                '</div>');
            }
          }
        } else {
          if (tc.react.getProp(tc.react.get(node), 'memoizedProps.children.1.props.channel.guild_id') &&
              tc.react.getProp(tc.react.get(node), 'memoizedProps.children.1.props.message.author.id')) {
            console.log('vegeta');
            if (this.checkIfModerator(tc.react.getProp(tc.react.get(node), 'memoizedProps.children.1.props.channel.guild_id'),
                                      tc.react.getProp(tc.react.get(node), 'memoizedProps.children.1.props.message.author.id'))) {
              console.log('asjfa sjkkajsfjk asf');
              badgeContainer.insertAdjacentHTML('afterbegin', '<div class="tc-userBadge-badge moderator" data-tc-tooltip="Moderator"></div>');
            }
          }
        }
      }
    }
  }

  // checkMediaQueries () {
  //   function channelsHover (mediaCheck) {
  //     const channels = document.querySelector('.channels-Ie2l6A, .guilds-wrapper');
  //     if (mediaCheck.matches) { // If media query matches
  //       function channelsWidth(e) {
  //         var channelsGuilds = '.channels-Ie2l6A, .guilds-wrapper';

  //         if (e) {
  //           if (e.target.matches(channelsGuilds) && (e.relatedTarget.matches(channelsGuilds))) {
  //             document.documentElement.style.setProperty('--channels-width', '240px');
  //             channels.addEventListener("mouseleave", channelsWidth, false);
  //           } else {
  //             document.documentElement.style.setProperty('--channels-width', '0px');
  //           }
  //         } else {
  //           document.documentElement.style.setProperty('--channels-width', '0px');
  //         }
  //       }
  //       channels.addEventListener("mouseenter", channelsWidth, false);

  //     } else {
  //       document.documentElement.style.setProperty('--channels-width', '240px');
  //     }
  //   }
  //   var mediaCheck = window.matchMedia("(max-width: 1200px)");
  //   channelsHover(mediaCheck); // Call listener function at run time
  //   mediaCheck.addListener(channelsHover); // Attach listener function on state changes
  // }


clearAllMentions () {
  const clearAllMentionsBtn =
  `<button type="button" class="tc-clearAllMentions">
    <span class="tc-clearAllMentions-text">Clear all Mentions</span>
  </button>`;
  document.querySelector(".recentMentionsPopout-2fmau1 .title-3pkaKd").insertAdjacentHTML('beforeend', clearAllMentionsBtn);
  const clearAllMentionsBtnSelector = document.querySelector('.tc-clearAllMentions'),
        mentionspopout = document.querySelector(".recentMentionsPopout-2fmau1");
  clearAllMentionsBtnSelector.addEventListener("click", () => {
    var loadinterval = setInterval(() => {
      if (!mentionspopout || !mentionspopout.parentElement) clearInterval(loadinterval);
      var loadbutton = mentionspopout.querySelector(".hasMore-sul95G button");
      var closebuttons = mentionspopout.querySelectorAll(".closeButton-17RIVZ");
      if (!loadbutton) {
        closebuttons.forEach((btn) => {btn.click();});
        clearInterval(loadinterval);
      }
      else {
        closebuttons.forEach((btn,i) => {if (closebuttons.length-1 > i) btn.click();});
        loadbutton.click();
      }
    },2000);
  });
}

async switchToServers () {
  this.setServerAndDMNameAndAvatar('server');
}

async switchToDiscover () {

}

async switchToLibrary () {
  this.insertLibraryPlaceholders();

  let library = document.getElementsByClassName('gameLibrary-TTDw4Y')[0],
      headerBar = document.getElementsByClassName('libraryHeader-1y0rDV')[0],
      libraryOptionsContainer = document.getElementsByClassName('tc-libraryOptions-options')[0];
  let libraryOptions = `<div class="tc-libraryOptions-options">
                                <ul class="tc-libraryOptions-ul">
                                  <li class="tc-libraryOptions-li">
                                      <div class="tc-libraryOptions-item">
                                        <i class="tc-icon refresh tc-libraryOptions-refresh" data-tc-tooltip="Refresh"></i>
                                      </div>
                                  </li>
                                  <li class="tc-libraryOptions-li">
                                      <div class="tc-libraryOptions-item">
                                        <i class="tc-icon tile tc-libraryOptions-tile" data-tc-tooltip="Tile View"></i>
                                      </div>
                                  </li>
                                  <li class="tc-libraryOptions-li">
                                      <div class="tc-libraryOptions-item">
                                        <i class="tc-icon grid tc-libraryOptions-grid" data-tc-tooltip="Grid View"></i>
                                      </div>
                                  </li>
                                  <li class="tc-libraryOptions-li">
                                    <div class="tc-libraryOptions-item">
                                      <i class="tc-icon filter-options tc-libraryOptions-options" data-tc-tooltip="Filter Options"></i>
                                    </div>
                                  </li>
                                </ul>
                          </div>`;

  if (library && headerBar) {
    if (!libraryOptionsContainer) headerBar.insertAdjacentHTML('afterbegin', libraryOptions);
  } else {
    return;
  }
  let refreshFriends = document.getElementsByClassName('tc-libraryOptions-refresh')[0],
      tileButton = document.getElementsByClassName('tc-libraryOptions-tile')[0],
      gridButton = document.getElementsByClassName('tc-libraryOptions-grid')[0],
      filterOptions = document.getElementsByClassName('tc-libraryOptions-options')[0];

  // new tcTooltip(refreshFriends);
  // new tcTooltip(tileButton);
  // new tcTooltip(gridButton);
  // new tcTooltip(filterOptions);

  refreshFriends.addEventListener('click', function() {
    refreshFriends.classList.add('tc-refreshing');
    setTimeout(() => { refreshFriends.classList.remove('tc-refreshing'); }, 1000);
  }, false);

  tileButton.addEventListener('click', function() {
    document.documentElement.classList.add('libraryTile');
    document.documentElement.classList.remove('libraryGrid');
  }, false);

  gridButton.addEventListener('click', function() {
    document.documentElement.classList.add('libraryGrid');
    document.documentElement.classList.remove('libraryTile');
  }, false);

}

async switchToDMs () {
  this.setServerAndDMNameAndAvatar('dm');
}

insertLibraryPlaceholders () {
  let library = document.getElementsByClassName('gameLibrary-TTDw4Y')[0],
      libraryContainer = document.getElementsByClassName('table-1tDS6w')[0],
      gamePlaceholder = document.getElementsByClassName('tc-libraryGamePlaceholder')[0],
      gamePlaceholderDivs = `<div class="rowWrapper-2fB6P0 tc-libraryGamePlaceholder"><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs noWrap-3jynv6"><div class="gameIcon-gg34Dz noUserDrag-5Mb43F small-xOVx-r gameIcon-3XJ9fu"></div></div></div>
                             <div class="rowWrapper-2fB6P0 tc-libraryGamePlaceholder"><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs noWrap-3jynv6"><div class="gameIcon-gg34Dz noUserDrag-5Mb43F small-xOVx-r gameIcon-3XJ9fu"></div></div></div>
                             <div class="rowWrapper-2fB6P0 tc-libraryGamePlaceholder"><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs noWrap-3jynv6"><div class="gameIcon-gg34Dz noUserDrag-5Mb43F small-xOVx-r gameIcon-3XJ9fu"></div></div></div>
                             <div class="rowWrapper-2fB6P0 tc-libraryGamePlaceholder"><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs noWrap-3jynv6"><div class="gameIcon-gg34Dz noUserDrag-5Mb43F small-xOVx-r gameIcon-3XJ9fu"></div></div></div>
                             <div class="rowWrapper-2fB6P0 tc-libraryGamePlaceholder"><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs noWrap-3jynv6"><div class="gameIcon-gg34Dz noUserDrag-5Mb43F small-xOVx-r gameIcon-3XJ9fu"></div></div></div>
                             <div class="rowWrapper-2fB6P0 tc-libraryGamePlaceholder"><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs noWrap-3jynv6"><div class="gameIcon-gg34Dz noUserDrag-5Mb43F small-xOVx-r gameIcon-3XJ9fu"></div></div></div>
                             <div class="rowWrapper-2fB6P0 tc-libraryGamePlaceholder"><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs noWrap-3jynv6"><div class="gameIcon-gg34Dz noUserDrag-5Mb43F small-xOVx-r gameIcon-3XJ9fu"></div></div></div>
                             <div class="rowWrapper-2fB6P0 tc-libraryGamePlaceholder"><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs noWrap-3jynv6"><div class="gameIcon-gg34Dz noUserDrag-5Mb43F small-xOVx-r gameIcon-3XJ9fu"></div></div></div>
                             <div class="rowWrapper-2fB6P0 tc-libraryGamePlaceholder"><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs noWrap-3jynv6"><div class="gameIcon-gg34Dz noUserDrag-5Mb43F small-xOVx-r gameIcon-3XJ9fu"></div></div></div>
                             <div class="rowWrapper-2fB6P0 tc-libraryGamePlaceholder"><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs noWrap-3jynv6"><div class="gameIcon-gg34Dz noUserDrag-5Mb43F small-xOVx-r gameIcon-3XJ9fu"></div></div></div>
                             <div class="rowWrapper-2fB6P0 tc-libraryGamePlaceholder"><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs noWrap-3jynv6"><div class="gameIcon-gg34Dz noUserDrag-5Mb43F small-xOVx-r gameIcon-3XJ9fu"></div></div></div>
                             <div class="rowWrapper-2fB6P0 tc-libraryGamePlaceholder"><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs noWrap-3jynv6"><div class="gameIcon-gg34Dz noUserDrag-5Mb43F small-xOVx-r gameIcon-3XJ9fu"></div></div></div>
                             <div class="rowWrapper-2fB6P0 tc-libraryGamePlaceholder"><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs noWrap-3jynv6"><div class="gameIcon-gg34Dz noUserDrag-5Mb43F small-xOVx-r gameIcon-3XJ9fu"></div></div></div>
                             <div class="rowWrapper-2fB6P0 tc-libraryGamePlaceholder"><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs noWrap-3jynv6"><div class="gameIcon-gg34Dz noUserDrag-5Mb43F small-xOVx-r gameIcon-3XJ9fu"></div></div></div>
                             <div class="rowWrapper-2fB6P0 tc-libraryGamePlaceholder"><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs noWrap-3jynv6"><div class="gameIcon-gg34Dz noUserDrag-5Mb43F small-xOVx-r gameIcon-3XJ9fu"></div></div></div>`;

  if (library) {
    if (!gamePlaceholder && libraryContainer && libraryContainer.children.length > 0) libraryContainer.insertAdjacentHTML('beforeend', gamePlaceholderDivs);
    if (libraryContainer && libraryContainer.lastElementChild && !libraryContainer.lastElementChild.classList.contains("tc-libraryGamePlaceholder")) {
      let gamePlaceholder = document.getElementsByClassName('tc-libraryGamePlaceholder')[0];
      while (gamePlaceholder && gamePlaceholder.parentNode) {
        gamePlaceholder.parentNode.removeChild(gamePlaceholder);
      }
      libraryContainer.insertAdjacentHTML('beforeend', gamePlaceholderDivs);
    }
  }
}

async setServerAndDMNameAndAvatar (destination) {
  if (document.querySelector('.container-1D34oG')) return;
  let ChannelInfo = document.getElementsByClassName('title-3qD0b-')[0].getElementsByClassName('tc-channelInfo')[0];
  const activityTypes = ["Playing", "Streaming", "Listening to", "Watching"];

  
  function getChannelIconUrl (id = tc.webpack.getAll('getLastSelectedChannelId').getChannelId()) {
    let channel = tc.webpack.getAll("getChannel", "getChannels").getChannel(id);
    if (!channel) return "";
    let IconUtils = tc.webpack.getAll("getGuildIconURL", "getChannelIconURL");
    if (!channel.icon) {
        if (channel.type == 1) {
            let user = tc.webpack.getAll("getUser", "getUsers").getUser(channel.recipients[0]);
            if (!user) return window.location.origin + "/assets/322c936a8c8be1b803cd94861bdfa868.png";
            else return (user.avatar ? "" : window.location.origin) + IconUtils.getUserAvatarURL(user);
        }
        else if (channel.type == 3) return window.location.origin + IconUtils.getChannelIconURL(channel);
        else return "";
    }
    else return IconUtils.getChannelIconURL(channel);
  }

  switch (destination) {
    case 'server':
      var SelectedStore = tc.webpack.getAll('getLastSelectedGuildId'),
          Store = tc.webpack.getAll('getGuild'),
          Current = Store.getGuild(SelectedStore.getGuildId()),
          SelectedChannelStore = tc.webpack.getAll('getLastSelectedChannelId'),
          ChannelStore = tc.webpack.getAll('getChannel'),
          CurrentChannel = ChannelStore.getChannel(SelectedChannelStore.getChannelId()),
          avatarUrl = Current.getIconURL();
      break;
    case 'dm':
      var SelectedStore = tc.webpack.getAll('getLastSelectedChannelId'),
          Store = tc.webpack.getAll('getChannel'),
          Current = Store.getChannel(SelectedStore.getChannelId()),
          SelectedChannelStore = tc.webpack.getAll('getLastSelectedChannelId'),
          ChannelStore = tc.webpack.getAll('getChannel'),
          CurrentChannel = ChannelStore.getChannel(SelectedChannelStore.getChannelId()),
          userStore = tc.webpack.getAll('getUser'),
          obj = userStore.getUser(Current.recipients[0]),
          userPresence = tc.webpack.getAll('getApplicationActivity'),
          activity = userPresence.getPrimaryActivity(Current.recipients[0]),
          avatarUrl;

      avatarUrl = getChannelIconUrl();
      break;
  }

  if (!ChannelInfo) {
    let discordHeader = document.getElementsByClassName('title-3qD0b-')[0],
    ChannelInfoComplete = `
      <div class="tc-channelInfo">
        <div class="tc-channelInfo-ava-container">
          <div class="tc-channelInfo-ava image-33JSyf" style="${avatarUrl ? `background-image: url('${avatarUrl}');` : ""}"></div>
        </div>
        <div class="tc-channelInfo-name-and-topic-container">
          <header class="tc-channelInfo-header">
            <span class="tc-channelInfo-name">${destination == 'server' ? (Current.name) : (obj.username)}</span>
            <span class="tc-channelInfo-name-sub">${destination == 'server' ? (CurrentChannel.name) : ""}</span>
          </header>
          <div class="tc-channelInfo-topic-contain">
            <span class="tc-channelInfo-topic-type">${destination == 'server' ? "" : (activity) ? (activityTypes[activity.type]) : ""}</span>
            <span class="tc-channelInfo-listening-song">${destination == "server" ? "" : (activity && activity.type == "2") ? activity.details : ""}</span>
            <span class="tc-channelInfo-listening-by">by</span>
            <span class="tc-channelInfo-listening-artist">${destination == "server" ? "" : (activity && activity.type == "2") ? activity.state : ""}</span>
            <span class="tc-channelInfo-listening-on">on</span>
            <span class="tc-channelInfo-topic">${destination == 'server' ? (CurrentChannel.topic) : (activity) ? (activity.name) : ""}</div>
          </div>
        </div>
      </div>`;
    if (!discordHeader) return;
    discordHeader.insertAdjacentHTML('afterbegin', ChannelInfoComplete);
  } else {
    let currentName = document.getElementsByClassName('tc-channelInfo')[0].getElementsByClassName('tc-channelInfo-name')[0],
        currentAva = document.getElementsByClassName('tc-channelInfo')[0].getElementsByClassName('tc-channelInfo-ava')[0],
        currentChannel = document.getElementsByClassName('tc-channelInfo')[0].getElementsByClassName('tc-channelInfo-name-sub')[0],
        currentTopicType = document.getElementsByClassName('tc-channelInfo')[0].getElementsByClassName('tc-channelInfo-topic-type')[0],
        currentSong = document.getElementsByClassName('tc-channelInfo')[0].getElementsByClassName('tc-channelInfo-listening-song')[0],
        currentArtist = document.getElementsByClassName('tc-channelInfo')[0].getElementsByClassName('tc-channelInfo-listening-artist')[0],
        byText = document.getElementsByClassName('tc-channelInfo')[0].getElementsByClassName('tc-channelInfo-listening-by')[0],
        onText = document.getElementsByClassName('tc-channelInfo')[0].getElementsByClassName('tc-channelInfo-listening-on')[0],
        currentTopic = document.getElementsByClassName('tc-channelInfo')[0].getElementsByClassName('tc-channelInfo-topic')[0];

    //(destination == 'server') ? (currentName.textContent =  Current.name) : (currentName.textContent =  obj.username);
    //(destination == 'server') ? (currentChannel.textContent =  CurrentChannel.name) : (currentChannel.textContent =  "");
    //(destination == 'server') ? (currentTopicType.textContent =  "") : (activity) ? (currentTopicType.textContent =  (activityTypes[activity.type])) : (currentTopicType.textContent = "");
    //(destination == 'server') ? (currentSong.textContent =  "") : (activity && activity.type == '2') ? (currentSong.textContent =  activity.details) : (currentSong.textContent = "");
    //(destination == 'server') ? (currentArtist.textContent =  "") : (activity && activity.type == '2') ? (currentArtist.textContent =  activity.state) : (currentArtist.textContent = "");
    //(destination == 'server') ? (currentTopic.textContent =  CurrentChannel.topic) : (activity) ? (currentTopic.textContent =  activity.name) : (currentTopic.textContent = "");

    currentAva.style = `${avatarUrl ? `background-image: url('${avatarUrl}');` : ""}`;
    if (destination == 'server') {
      currentName.textContent =  Current.name;
      currentChannel.textContent =  CurrentChannel.name;
      currentTopic.textContent =  CurrentChannel.topic;
    } else {
      currentName.textContent =  obj.username;
      currentChannel.textContent =  "";
      if (activity) {
        currentTopicType.textContent =  (activityTypes[activity.type]);
        currentTopic.textContent =  activity.name;
        if (activity.type == '2') {
          currentSong.textContent =  activity.details;
          currentArtist.textContent =  activity.state;
        } else {
          currentSong.textContent = "";
          currentArtist.textContent = "";
        }
      } else {
        currentTopic.textContent = "";
        currentTopicType.textContent = "";
      }
    }
  }
}

  switchToFriends () {
    // let tabBar = document.getElementsByClassName('tabBar-1E2ExX')[0],
    //     addFriendContainer = document.getElementsByClassName('tc-addFriend')[0],
    //     friendsListOptionsContainer = document.getElementsByClassName('tc-friendsListOptions')[0],
    //     newGroupDMButton = document.querySelector('.container-1D34oG .headerBar-UHpsPw svg[name="Compose"]'),
    //     addFriendButton = document.querySelector('.container-1D34oG .headerBar-UHpsPw #addFriends'),
    //     friendPlaceholder = document.getElementsByClassName('tc-friendPlaceholder')[0],
    //     friendsRowContainer = document.querySelector('.container-1D34oG .friendsTableBody-1ZhKif>div'),
    //     DiscordAddFriendsButton = document.querySelector('.container-1D34oG .tabBar-1E2ExX .item-PXvHYJ.primary-3j8BhM');

    // let addFriendOptions = `<div class="tc-addFriend">
    //                           <div class="tc-addFriend-howmany">00</div>
    //                           <div class="tc-addFriend-text-contain">
    //                             <div class="tc-addFriend-peopleare">people are</div>
    //                             <div class="tc-addFriend-active">error</div>
    //                           </div>
    //                         </div>`;

    // let friendsListOptions = `<div class="tc-friendsListOptions">
    //                             <ul class="tc-friendsListOptions-ul">
    //                               <li class="tc-friendsListOptions-li">
    //                                   <div class="tc-friendsListOptions-item">
    //                                     <i class="tc-icon refresh tc-friendsListOptions-refresh" data-tc-tooltip="Refresh"></i>
    //                                   </div>
    //                               </li>
    //                               <li class="tc-friendsListOptions-li">
    //                                   <div class="tc-friendsListOptions-item">
    //                                     <i class="tc-icon userbgs tc-friendsListOptions-background-tile" data-tc-tooltip="Default View"></i>
    //                                   </div>
    //                               </li>
    //                               <li class="tc-friendsListOptions-li">
    //                                   <div class="tc-friendsListOptions-item">
    //                                     <i class="tc-icon tile tc-friendsListOptions-tile" data-tc-tooltip="Tile View"></i>
    //                                   </div>
    //                               </li>
    //                               <li class="tc-friendsListOptions-li">
    //                                   <div class="tc-friendsListOptions-item">
    //                                     <i class="tc-icon grid tc-friendsListOptions-grid" data-tc-tooltip="Grid View"></i>
    //                                   </div>
    //                               </li>
    //                               <li class="tc-friendsListOptions-li">
    //                                 <div class="tc-friendsListOptions-item">
    //                                   <i class="tc-icon filter-options tc-friendsListOptions-options" data-tc-tooltip="Filter Options"></i>
    //                                 </div>
    //                               </li>
    //                             </ul>
    //                             <div class="tc-friendsListOptions-filter-container">
    //                               <div class="tc-friendsListOptions-filter">
    //                                   <input type="text" class="tc-input filter tc-friendsListOptions-filter-input" value="" placeholder="Filter by name">
    //                                   <label class="tc-label search">
    //                                   <i class="tc-icon search"></i>
    //                                   </label>
    //                                   <div class="tc-input-reset">
    //                                   <i class="tc-icon close"></i>
    //                                 </div>
    //                               </div>
    //                             </div>
    //                         </div>`;

    // let friendPlaceholderDivs = `<div class="friendsRow-2yicud tc-friendPlaceholder"></div>
    //                              <div class="friendsRow-2yicud tc-friendPlaceholder"></div>
    //                              <div class="friendsRow-2yicud tc-friendPlaceholder"></div>
    //                              <div class="friendsRow-2yicud tc-friendPlaceholder"></div>
    //                              <div class="friendsRow-2yicud tc-friendPlaceholder"></div>
    //                              <div class="friendsRow-2yicud tc-friendPlaceholder"></div>
    //                              <div class="friendsRow-2yicud tc-friendPlaceholder"></div>
    //                              <div class="friendsRow-2yicud tc-friendPlaceholder"></div>`;

    // function addFriendsButton () {
    //   if (DiscordAddFriendsButton) DiscordAddFriendsButton.click();
    // }

    // if (newGroupDMButton && !addFriendButton) {
    //   const addFriend = document.createElement('div');
    //   addFriend.id = "addFriends";

    //   addFriend.dataset.tcTooltip = "Add Friend";

    //   newGroupDMButton.parentNode.prepend(addFriend);
    //   new tcTooltip(addFriend, {side: 'bottom'});
    //   addFriend.addEventListener('click', addFriendsButton, false);
    // }

    // if (tabBar) {
    //   if (!addFriendContainer) tabBar.insertAdjacentHTML('afterbegin', addFriendOptions);
    //   if (!friendsListOptionsContainer) tabBar.insertAdjacentHTML('afterend', friendsListOptions);
    //   if (!friendPlaceholder && friendsRowContainer && friendsRowContainer.children.length > 0) friendsRowContainer.insertAdjacentHTML('beforeend', friendPlaceholderDivs);
    //   if (friendsRowContainer && friendsRowContainer.lastElementChild && !friendsRowContainer.lastElementChild.classList.contains("tc-friendPlaceholder")) {
    //     let friendPlaceholder = document.getElementsByClassName('tc-friendPlaceholder')[0];
    //     while (friendPlaceholder && friendPlaceholder.parentNode) {
    //       friendPlaceholder.parentNode.removeChild(friendPlaceholder);
    //     }
    //     friendsRowContainer.insertAdjacentHTML('beforeend', friendPlaceholderDivs);
    //   }
    // }


    // let friendsFilterInput = document.getElementsByClassName('tc-friendsListOptions-filter-input')[0];

    // friendsFilterInput.addEventListener('input', friendsNameFilter, false);

    // function friendsNameFilter() {
    //   var input = document.getElementsByClassName('tc-friendsListOptions-filter-input')[0],
    //       filter = input.value.toUpperCase(),
    //       friendsRowContainer = document.querySelector('.container-1D34oG .scroller-2FKFPG > div'),
    //       item = friendsRowContainer.querySelectorAll('.friendsRow-2yicud:not(.tc-friendPlaceholder)'),
    //       friendsContainer = document.getElementByClassName('container-1D34oG').getElementsByClassName('scroller-2FKFPG')[0];

    //   // Loop through all list items, and hide those who don't match the search query
    //   let counter = 0;
    //   for (let i = 0; i < item.length; i++) {
    //       var username = item[i].getElementsByClassName("username")[0];
    //       if (username.innerHTML.toUpperCase().indexOf(filter) > -1) {
    //           item[i].style.display = "flex";
    //           counter++;
    //       } else {
    //           item[i].style.display = "none";
    //       }
    //   }
    //   if (counter == 0) {
    //     friendsContainer.dataset.noResults = 'No results match your search criteria.';
    //   } else {
    //     friendsContainer.dataset.noResults = '';
    //   }
    // }

    // if (friendsRowContainer) {
    //     var countKeeper = 0;
    //     for (var i = 0; i < friendsRowContainer.children.length; i++) {
    //       if (friendsRowContainer.children[i].classList.contains("friendsRow-2yicud") && !friendsRowContainer.children[i].classList.contains("tc-friendPlaceholder")) {
    //         countKeeper++;
    //       }
    //     }
    //   document.getElementsByClassName('tc-addFriend')[0].getElementsByClassName('tc-addFriend-howmany')[0].textContent = countKeeper;
    // }

    // let currentlyActive = document.querySelector('.container-1D34oG .item-PXvHYJ.itemSelected-1qLhcL').childNodes[0].nodeValue;
    // document.getElementsByClassName('tc-addFriend-active')[0].textContent = ((currentlyActive == 'All') ? (currentlyActive = 'Friends') : currentlyActive);

    // let refreshFriends = document.getElementsByClassName('tc-friendsListOptions-refresh')[0],
    //     backgroundTileButton = document.getElementsByClassName('tc-friendsListOptions-background-tile')[0],
    //     tileButton = document.getElementsByClassName('tc-friendsListOptions-tile')[0],
    //     gridButton = document.getElementsByClassName('tc-friendsListOptions-grid')[0],
    //     filterOptions = document.getElementsByClassName('tc-friendsListOptions-options')[0];

    // new tcTooltip(refreshFriends);
    // new tcTooltip(backgroundTileButton);
    // new tcTooltip(tileButton);
    // new tcTooltip(gridButton);
    // new tcTooltip(filterOptions);

    // refreshFriends.addEventListener('click', function() {
    //   refreshFriends.classList.add('tc-refreshing');
    //   setTimeout(() => { refreshFriends.classList.remove('tc-refreshing'); }, 1000);
    // }, false);

    // backgroundTileButton.addEventListener('click', function() {
    //   document.documentElement.classList.add('friendsBackgroundTile');
    //   document.documentElement.classList.remove('friendsTile');
    //   document.documentElement.classList.remove('friendsGrid');
    // }, false);

    // tileButton.addEventListener('click', function() {
    //   document.documentElement.classList.add('friendsTile');
    //   document.documentElement.classList.remove('friendsBackgroundTile');
    //   document.documentElement.classList.remove('friendsGrid');
    // }, false);

    // gridButton.addEventListener('click', function() {
    //   document.documentElement.classList.add('friendsGrid');
    //   document.documentElement.classList.remove('friendsTile');
    //   document.documentElement.classList.remove('friendsBackgroundTile');
    // }, false);

    // const friends = document.querySelectorAll('.friends-row .friends-column-name');
    // friends.forEach(el => {
    //   const id = el.children[0].children[0].style.backgroundImage.split('/')[4];
    //   if (this.userProfileImages[id]) {
    //     el.style.backgroundImage = `url("${this.userProfileImages[id]}")`;
    //   }
    // });

    /*
    tabBar.getElementsByClassName('tab-bar-item').addEventListener('click', function() {
      friends.forEach(el => {
        const id = el.children[0].children[0].style.backgroundImage.split('/')[4];
        if (this.userProfileImages[id]) {
          el.style.backgroundImage = `url("${this.userProfileImages[id]}")`;
        }
      });
    }, false);
    */

  }

  async injectUserPopout () {
    const header = document.querySelector('.userPopout-3XzG_A .avatarWrapper-3H_478');
    if (!header) {
      return;
    }

    var avatar = header.querySelector('.avatar-VxgULZ');
    var id = avatar.src.split('/')[4];

    if (this.userProfileImages[id]) {
      header.style.backgroundColor = `var(--popout-user-background)`;
      header.style.backgroundImage = `url("${this.userProfileImages[id]}")`;
    }
  }

  imageModalCheck () {

  }

  keyBindFunctions (e) {
    const globalSearchInput = document.getElementsByClassName('tc-titleWrapper-global-search-input')[0];

      let ctrlFlag = 0;
      let altFlag = 0;

      if (e.ctrlKey)
        ctrlFlag = 1;

      if (e.altKey)
        altFlag = 1;

      if (e.keyCode == 27) {
        if (document.documentElement.classList.contains('videoMaximized'))
        document.documentElement.classList.remove('videoMaximized');
      }

      if ((ctrlFlag === 1) && e.keyCode == 84) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (((ctrlFlag === 1) && e.keyCode == 75) || ((ctrlFlag === 1) && e.keyCode == 84)) {
        if (globalSearchInput) globalSearchInput.focus();
      }

      // if ((ctrlFlag === 1) && e.keyCode == 70) {
      //   document.documentElement.classList.add('localSearch');
      // }

      if ((altFlag === 1) && e.keyCode == 90) {
        let zenBtnSelect = document.querySelector('.title-3qD0b- #zenBtn, .headerBar-UHpsPw #zenBtn, .titleCall-_b9o8P #zenBtn');
        zenBtn.click();
      }
  }

 async globalSearch () {
    const globalSearchInput = document.getElementsByClassName('tc-titleWrapper-global-search-input')[0],
          globalSearchOuter = document.getElementsByClassName('tc-titleWrapper-global-search-outer')[0];

    if (!globalSearchOuter) return;

    var openQuickswitcher = tc.webpack.get('QUICKSWITCHER_SHOW'),
        closeAllModals = tc.webpack.getAll('push', 'update', 'pop', 'popWithKey');

    function sendInput() {
        // The QuickSwitcher input
        var quickSwitcherInput = document.querySelector('.input-2VB9rf');

        /*
        function sendCtrlK() {
          var options = { key: "k", code: "k", which: 75, keyCode: 75, "ctrlKey": true, bubbles: true };
          var down = new KeyboardEvent("keydown", options);
          Object.defineProperty(down, "keyCode", {value: 75});
          Object.defineProperty(down, "which", {value: 75});
          Object.defineProperty(down, "ctrlKey", {value: true});
          var press = new KeyboardEvent("keypress", options);
          Object.defineProperty(press, "keyCode", {value: 75});
          Object.defineProperty(press, "which", {value: 75});
          Object.defineProperty(press, "ctrlKey", {value: true});
          document.querySelector('#app-mount').dispatchEvent(down);
          document.querySelector('#app-mount').dispatchEvent(press);
        }
        */

        // Check if it's time to close the QuickSwitcher
        function checkForClosed(e) {
          // QuickSwitcher container and all of its children
          var quickSwitcher = '.tc-titleWrapper-global-search-input, .container-3qKHyN, .container-3qKHyN *',
          clickTarget = e.target;
          if (clickTarget.matches(quickSwitcher)) {
            return;
          } else {
            document.removeEventListener('click', checkForClosed);
            globalSearchOuter.classList.remove('opened');
            closeAllModals.popAll();
          }
        }

        if (!quickSwitcherInput) {
          // Open the QuickSwitcher modal
          openQuickswitcher.action();
          globalSearchOuter.classList.add('opened');
          document.addEventListener('click', checkForClosed);
          var quickSwitcherInput = document.querySelector('.input-2VB9rf');
          if (quickSwitcherInput) {
            var quickParent = quickSwitcherInput.parentElement,
                quickSwitcherContainer = '.quickswitcher-3JagVE';

            if (quickParent.matches(quickSwitcherContainer)) {
              quickSwitcherInput.placeholder = "Search";
              globalSearchInput.before(quickSwitcherInput);
            }
          }
        }
    }
    globalSearchInput.addEventListener('focus', sendInput);
  }

  localSearch () {
    const searchBtnSelect = document.querySelector('.chat-3bRxxu .search-l1Wz-Q');

    if (!searchBtnSelect) return;

    function searchClicked () {

      // Open the Local search area
      function sendCtrlF() {
        var options = { key: "f", code: "f", which: 70, keyCode: 70, "ctrlKey": true, bubbles: true };
        var down = new KeyboardEvent("keydown", options);
        Object.defineProperty(down, "keyCode", {value: 70});
        Object.defineProperty(down, "which", {value: 70});
        Object.defineProperty(down, "ctrlKey", {value: true});
        var press = new KeyboardEvent("keypress", options);
        Object.defineProperty(press, "keyCode", {value: 70});
        Object.defineProperty(press, "which", {value: 70});
        Object.defineProperty(press, "ctrlKey", {value: true});
        document.querySelector('#app-mount').dispatchEvent(down);
        document.querySelector('#app-mount').dispatchEvent(press);
      }

      sendCtrlF();
      // document.documentElement.classList.add('localSearch');
    }

    function closeSearch (e) {
      var search = document.querySelector('.chat-3bRxxu .search-l1Wz-Q .search');

      e.preventDefault();
      e.stopPropagation();

      search.classList.remove('open', 'focused');
      document.documentElement.classList.remove('localSearch');
    }

    if (!searchBtnSelect.classList.contains('listener-added')) {
      searchBtnSelect.classList.add("listener-added");

      searchBtnSelect.addEventListener('click', searchClicked, false);
    }
    if (document.documentElement.classList.contains('localSearch')) {
      var search = document.querySelector('.chat-3bRxxu .search-l1Wz-Q .search'),
          clearSearchBtn = document.querySelector('.icon-search-bar-clear'),
          clearSearchBtnActive = document.querySelector('.icon-search-bar-clear.visible');
      if (clearSearchBtn) document.querySelector('.search .search-bar-icon').addEventListener('click', closeSearch, false);
      if (!clearSearchBtnActive && !search.classList.contains('focused') && !search.classList.contains('open')) {
        document.documentElement.classList.remove('localSearch');
      }
    }
  }
  //
  // zenMode () {
  //     var iconCheck = document.querySelector('.title-3qD0b- svg[name="QuestionMark"], .headerBar-UHpsPw svg[name="QuestionMark"], .titleCall-_b9o8P svg[name="QuestionMark"]'),
  //         zenBtnSelect = document.querySelector('.title-3qD0b- #zenBtn, .headerBar-UHpsPw #zenBtn, .titleCall-_b9o8P #zenBtn');
  //
  //     function goZen () {
  //       if (!document.documentElement.classList.contains('zenMode')) {
  //         var zenModeContainer = document.getElementsByClassName('tc-zen-mode')[0],
  //             zenModeDivs = `<div class="tc-zenmode">
  //                             <div class="tc-zenmode-txt-container">
  //                               <div class="tc-zenmode-one-two">
  //                                 <div class="tc-zenmode-zen-txt">Zen</div>
  //                                 <div class="tc-zenmode-mode-txt">Mode</div>
  //                               </div>
  //                               <div class="tc-zenmode-three-four">
  //                                 <div class="tc-zenmode-has-been-txt">has been</div>
  //                                 <div class="tc-zenmode-activated-txt">Activated</div>
  //                               </div>
  //                             </div>
  //                             <div class="tc-zenmode-buddha"></div>
  //                           </div>`;
  //
  //         if (!zenModeContainer) {
  //           document.body.insertAdjacentHTML('beforeend', zenModeDivs);
  //         }
  //
  //         document.documentElement.classList.add('zenMode');
  //
  //         var zenModeContainer = document.getElementsByClassName('tc-zen-mode-container')[0]
  //
  //         const callback = () => {
  //                   zenModeContainer.removeEventListener("animationend", callback, false);
  //                   zenModeContainer.classList.remove("activated");
  //                   zenModeContainer.classList.add("activated-in");
  //                 }
  //
  //                 zenModeContainer.addEventListener("animationend", callback, false);
  //
  //                 zenModeContainer.classList.add("activated");
  //
  //         setTimeout(() => zenModeContainer.classList.remove('activated-in'), 2000);
  //       } else {
  //         document.documentElement.classList.remove('zenMode');
  //       }
  //     }
  //
  //     if (iconCheck && !zenBtnSelect) {
  //       const zenBtn = document.createElement('div');
  //       zenBtn.id = "zenBtn";
  //       zenBtn.dataset.tcTooltip = "Zen Mode";
  //
  //       iconCheck.parentNode.prepend(zenBtn);
  //       new tcTooltip(zenBtn, {side: 'bottom'});
  //
  //       zenBtn.addEventListener('click', goZen, false);
  //
  //     }
  // }

  async changeRoleStyle () {
    let roles = document.getElementsByClassName('role-2irmRk');
    if (!roles.length) return;
    for (let role of roles) {
      let roleColor = role.style.borderColor.replace(/[^,]+(?=\))/, '1'),
          roleName = role.getElementsByClassName('roleName-32vpEy')[0];
      if (roleName) {
        roleName.style.color = roleColor;
      }
    }
  }

  // giphy () {
  //   const emojiBtn = document.querySelector('.channelTextArea-rNsIhG .emojiButtonNormal-TdumYh'),
  //         giphyBtnSelect = document.querySelector('.channelTextArea-rNsIhG #giphyBtn');
  //
  //       function showGiphy () {
  //         const command = "/giphy ",
  //               choices = [
  //                 'dank memes',
  //                 'video game',
  //                 'wtf',
  //                 'lol',
  //                 'dank meme',
  //                 'cat',
  //                 'wink',
  //                 'trump',
  //                 'dog',
  //                 'omg',
  //                 'funny',
  //                 'spongebob',
  //                 'funny',
  //                 'dancing',
  //                 'eyeroll',
  //                 'deal with it',
  //                 'cool story bro',
  //                 'perfectloop'
  //               ],
  //               randomChoice = Math.floor(Math.random() * choices.length);
  //
  //         tc.react.getOwner(document.getElementsByTagName('form')[0]).setState({textValue: command + choices[randomChoice]});
  //         tc.react.getOwner(document.getElementsByTagName('form')[0]).props.onFocus();
  //       }
  //
  //   if (emojiBtn && !giphyBtnSelect) {
  //     const giphyBtn = document.createElement('div');
  //     giphyBtn.id = "giphyBtn";
  //
  //     emojiBtn.before(giphyBtn);
  //     giphyBtn.addEventListener('click', showGiphy, false);
  //   }
  // }


  async injectUserModal () {
    const header = document.querySelector('.root-SR8cQa .header-QKLPzZ');
    if (!header) { return; }

    const avatar = header.querySelector('.avatar-VxgULZ'),
          id = avatar.src.split('/')[4];

    if (this.userProfileImages[id]) {
      header.style.backgroundImage = `url("${this.userProfileImages[id]}")`;
    }
  }

  async injectUserStatus () {
    const tcTitlewrapperheader = document.getElementsByClassName('tc-titleWrapper')[0];
    if (!tcTitlewrapperheader) {
      return;
    }

      let userPresence = tc.webpack.getAll('getPresence'),
          activity = userPresence.getPrimaryActivity(),
          userActivityDiv = document.getElementsByClassName('tc-titleWrapper-account-activity')[0];
      if (tcTitlewrapperheader) {
        if (userActivityDiv) {
          setInterval(() => {
            activity = userPresence.getPrimaryActivity();
            var activityTypeText;
            if (activity) {
              if (activity.type == '0') activityTypeText = 'playing ';
              if (activity.type == '1') activityTypeText = 'streaming ';
              if (activity.type == '2') activityTypeText = 'listening to ';
              if (activity.type == '3') activityTypeText = 'watching ';
              if (userActivityDiv.innerHTML == activityTypeText + activity.name) {
                return;
              } else {
                userActivityDiv.innerHTML = activityTypeText + activity.name;
              }
            } else {
              if (userActivityDiv.innerHTML == "") {
                return;
              } else {
                userActivityDiv.innerHTML = "";
              }
            }
          }, 7000);
        }
      }
  }

/*
  get hamburgerMenu () {
    const e = window.BDV2.react.createElement;
    return class HamburgerMenu extends window.BDV2.react.Component {
      get socialUL () {
        const socialInfo = [
          ['Facebook', 'https://www.facebook.com/BakedPVP'],
          ['Twitter', 'https://twitter.com/BakedPVP_'],
          ['Discord', 'https://www.discord.me/twitchcord'],
          ['GitHub', 'https://github.com/dperolio/twitchcordTheme'],
          ['Twitch', 'https://twitch.tv/bakedpvp'],
          ['Patreon', 'https://www.patreon.com/twitchcord'],
          ['Website', 'https://twitchcord.com']
        ];

        const socialLIs = socialInfo.map(item => {
          return e('li', { className: 'tc-hamburger-social-li' },
            e('a', {
              className: `tc-hamburger-social-a ${item[0].toLowerCase()}`,
              href: item[1],
              target: '_blank',
            },
              e('span', { className: 'tc-hamburger-social-a-span tooltip tooltip-black' }, item[0])
            )
          );
        });

        return e('ul', { className: 'tc-hamburger-social-ul' },
          ...socialLIs
        );
      }

      render () {
        return e('div', { id: 'twitchcord-hamburger-menu-container', style: { display: 'none' } },
          e('div', { className: 'tc-logo-bg' }),

          e('div', { className: 'tc-hamburger-top' },
            e('div', { className: 'tc-hamburger-heading options' }),
            e('div', { className: 'tc-hamburger-options-inner' })
          ),

          e('div', { className: 'tc-hamburger-middle' },
            e('div', { className: 'tc-hamburger-heading support' }),
            e('div', { className: 'tc-hamburger-support-inner' },
              e('p', { className: 'tc-hamburger-p' }, 'Running into a problem while using Twitchcord or have a suggestion to make? Click the button below to head on over to our official Discord server.',
                e('a', { href: 'https://www.discord.me/twitchcord', target: '_blank', className: 'tc-hamburger-a' }, 'https://www.discord.me/twitchcord')
              )
            )
          ),

          e('div', { className: 'tc-hamburger-bottom' },
            e('div', { className: 'tc-hamburger-heading social' }),
            e('div', { className: 'tc-hamburger-social-inner' },
              this.socialUL
            )
          )

        );
      }
    };
  }
*/

getDiscordLanguage () {
	var languageCode = document.querySelector("html").lang || "en-US";
	var codeParts = languageCode.split("-");
	var prefix = codeParts[0];
	var suffix = codeParts[1] ? codeParts[1] : "";
	languageCode = suffix && prefix.toUpperCase() != suffix.toUpperCase() ? prefix + "-" + suffix : prefix;
	return this.languages[languageCode] || this.languages["en-US"];
}

getLanguageTable(lang) {
	var ti = {
		"bg":		"холандски",		//bulgarian
		"cs":		"Nizozemština",		//czech
		"da":		"Hollandsk",		//danish
		"de":		"Niederländisch",	//german
		"el":		"Ολλανδικά",		//greek
		"en-GB":	"Dutch",			//english
		"en-US":	"Dutch",			//english
		"es":		"Holandés",			//spanish
		"fi":		"hollanti",			//finnish
		"fr":		"Néerlandais",		//french
		"hr":		"Nizozemski",		//croatian
		"hu":		"Holland",			//hungarian
		"it":		"Olandese",			//italian
		"ja":		"オランダ語",			//japanese
		"ko":		"네덜란드어",			//korean
		"lt":		"Olandų",			//lithuanian
		"nl":		"Nederlands",		//dutch
		"no":		"Nederlandsk",		//norwegian
		"pl":		"Holenderski",		//polish
		"pt-BR":	"Holandês",			//portuguese(brazil)
		"ro":		"Olandeză",			//romanian
		"ru":		"Голландский",		//russian
		"sv":		"Holländska",		//swedish
		"tr":		"Flemenkçe",		//turkish
		"uk":		"Нідерландська",	//ukranian
		"zh-CN":	"荷兰语",			//chinese(china)
		"zh-TW":	"荷蘭文"				//chinese(traditional)
	};
	lang = lang ? lang : this.getDiscordLanguage().id;
	return tc.webpack.find(function (m) {
    return m.nl === ti[lang];
	});
};


setContextMenuItemClasses (contextMenu) {
  var UserStore = tc.webpack.getAll('getUser', 'getUsers');
  var strings = this.getLanguageTable();
  var enstrings = this.getLanguageTable("en-US");
  let contentMenuItems = document.getElementsByClassName("itemBase-tz5SeC");
  var items = contentMenuItems;
  var instance = tc.react.get(contextMenu);
  var user = tc.lib.waitForTruthy(() =>  instance.memoizedProps.children.props.children[0].props.children[1].props.user, 1000);
  var channel = (instance && instance.return && instance.return.stateNode && instance.return.stateNode.props && instance.return.stateNode.props.channel) || null;
  var username = user ? user.username : null;
  var channelname = channel ? channel.name : null;
  if (channel && !channelname && channel.recipients.length > 0) {
    for (let dmmemberID of channel.recipients) {
      channelname = channelname ? channelname + ", " : channelname;
      channelname = channelname + UserStore.getUser(dmmemberID).username;
    }
  }
  else if (channelname && channel.type == 0) channelname = "#" + channelname;
  else if (!channelname && channel && channel.type == 3) channelname = strings.UNNAMED ? strings.UNNAMED : enstrings.UNNAMED;
  for (let item of items) {
    let label = item.firstElementChild ? item.firstElementChild : item;
    for (let key in strings) {
      let string = strings[key] ? strings[key] : enstrings[key];
      if ((username || channelname) && key.indexOf("FORM_LABEL") == -1 && string.indexOf("**!!{") > -1) {
        let regex = /\*\*\!\!\{[A-z0-9]*?\}\!\!\*\*/.exec(string);
        if (regex && username) string = string.replace(regex[0], username);
        if (regex && channelname) string = string.replace(regex[0], channelname);
      }
      if ((string == label.textContent) || (user && (string == (label.textContent + " " + username)))) {
        let newKey = key.toLowerCase().replace(/_/g, '-');
        item.classList.add("tc-contextItem", "context-" + newKey);
        break;
      }
    }
  }
}

setSettingsMenuItemClasses () {
  var strings = this.getLanguageTable();
  var enstrings = this.getLanguageTable("en-US");
  let serverMenu = document.getElementsByClassName("side-8zPYf6")[0],
      serverMenuItems = document.getElementsByClassName("item-PXvHYJ");
  for (let item of serverMenuItems) {
      let label = item.firstElementChild ? item.firstElementChild : item;
      for (let key in strings) {
          let string = strings[key] ? strings[key] : enstrings[key];
          if (string == label.textContent) {
              let newKey = key.toLowerCase().replace(/_/g, '-');
              item.classList.add("tc-settingsItem", "settings-" + newKey);
              break;
          }
      }
  }
}

  // async renderToggles () {
  //   const _this = this;
  //   const e = window.BDV2.react.createElement;
  //   class settingsToggle extends window.BDV2.react.Component {
  //     constructor (props) {
  //       super(props);

  //       this.checked = _this.getState(this.props.title) === !this.props.inverted;
  //     }

  //     click () {
  //       this.checked = !this.checked;
  //       _this.toggleSnippet(this.props.title);
  //       this.setState(() => ({
  //         checked: this.checked
  //       }));
  //     }

  //     render () {
  //       const style = { flex: '1 1 auto' };
  //       const style2 = { flex: '0 0 auto' };

  //       return e('div', {
  //         className: 'flex-1xMQg5 flex-1O1GKY vertical-V37hAW flex-1O1GKY directionColumn-35P_nr justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6 margin-top-8 margin-bottom-40',
  //         style
  //       },
  //         e('div', {
  //           className: 'flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignStart-H-X2h- noWrap-3jynv6',
  //           style
  //         },
  //           e('h3', {
  //             className: 'titleDefault-a8-ZSr title-31JmR4 marginReset-236NPn weightMedium-2iZe9B size16-14cGz5 height24-3XzeJx flexChild-faoVW3',
  //             style
  //           }, this.props.title),
  //           e('div', {
  //             className: `flexChild-faoVW3 switchEnabled-V2WDBB switch-3wwwcV value-2hFrkk sizeDefault-2YlOZr size-3rFEHg themeDefault-24hCdX
  //                       ${this.checked ? 'valueChecked-m-4IJZ' : 'valueUnchecked-2lU_20'}`,
  //             style: style2,
  //             onClick: this.click.bind(this)
  //           },
  //             e('input', {
  //               type: 'checkbox',
  //               className: 'checkboxEnabled-CtinEn checkbox-2tyjJg',
  //               value: this.checked ? 'on' : 'off'
  //             })
  //           )
  //         ),
  //         e('div', { className: 'divider-3573oO dividerDefault-3rvLe- marginTop20-3TxNs6' })
  //       );
  //     }
  //   }

  //   class settingsToggles extends window.BDV2.react.Component {
  //     render () {
  //       const settingToggles = _this.buttons.map(button => {
  //         return e(settingsToggle, {
  //           title: button.title,
  //           inverted: button.inverted
  //         });
  //       });

  //       return e('div', {},
  //         ...settingToggles);
  //     }
  //   }

  //   window.BDV2.reactDom.render(e(settingsToggles), document.querySelector('.tc-hamburger-options-inner'));
  // }
/*
  async addHamburgerMenu () {
    if (!window.BDV2) {
      return setTimeout(this.addHamburgerMenu.bind(this), 2000);
    }
    const qSA = document.querySelectorAll('#twitchcord-hamburger-menu-vessel, #twitchcord-hamburger-clicker, #twitchcord-hamburger-menu-container, #tc-hamburger-backdrop');
    if (qSA) { // todo: remove this
      Array.from(qSA).map(e => e.remove());
    }

    const titleBar = document.querySelector('div[class*=titleBar]');
    if (!titleBar) {
      return;
    }

    const menuVessel = this.createElement('div', { id: 'twitchcord-hamburger-menu-vessel' });
    titleBar.insertBefore(menuVessel, titleBar.children[0]);

    const hamburger = this.createElement('div', {
      id: 'twitchcord-hamburger-clicker',
      style: 'z-index: 100 !important'
    });

    const hamburgerBackdrop = this.createElement('div', { id: 'tc-hamburger-backdrop' });

    titleBar.insertBefore(hamburgerBackdrop, titleBar.children[0]);
    titleBar.insertBefore(hamburger, titleBar.children[0]);

    await window.BDV2.reactDom.render(window.BDV2.react.createElement(this.hamburgerMenu), menuVessel);
    titleBar.replaceChild(document.querySelector('#twitchcord-hamburger-menu-container'), menuVessel);


    const container = document.querySelector('#twitchcord-hamburger-menu-container');
    const openContainer = () => {
      container.setAttribute('opened', '');
      document.body.setAttribute('tc-opened', '');
      this.renderToggles();
    };

    const closeContainer = () => {
      container.removeAttribute('opened');
      document.body.removeAttribute('tc-opened');
      setTimeout(() => {
        document.querySelector('.tc-hamburger-options-inner').innerHTML = '';
      }, 500);
    };

    hamburger.onclick = () => {
      if (container.hasAttribute('opened')) {
        closeContainer();
      } else {
        openContainer();
      }
    };

    const app = document.querySelector('.layer-3QrUeG').parentNode.parentNode.parentNode;
    app.onclick = () => {
      if (container.hasAttribute('opened')) {
        closeContainer();
      }
    };

    this.keyDownEvent = (event) => {
      if (event.key === 'Escape') {
        if (container.hasAttribute('opened')) {
          closeContainer();
        }
      }
      if (event.altKey) {
        if (event.key === 'ArrowLeft') {
          closeContainer();
        }
        if (event.key === 'ArrowRight') {
          openContainer();
        }
      }
    };
    document.body.addEventListener('keydown', this.keyDownEvent.bind(this));
  }
  */
  //
  // loadSnippets () {
  //   this.buttons
  //     .filter(snippet => bdPluginStorage.get('Twitchcord', snippet.title) && bdPluginStorage.get('Twitchcord', snippet.title).state)
  //     .forEach(snippet => {
  //       document.documentElement.classList.add(`${snippet.classToAdd}`);
  //       bdPluginStorage.set('Twitchcord', snippet.title, { state: true });
  //     });
  //
  //   this.buttons
  //     .filter(snippet => snippet.default)
  //     .filter(snippet => bdPluginStorage.get('Twitchcord', snippet.title) === null)
  //     .forEach(snippet => {
  //       this.toggleSnippet(snippet.title);
  //     });
  // }
  //
  // createElement (type, properties) {
  //   const element = document.createElement(type);
  //   for (const prop in properties) {
  //     element[prop] = properties[prop];
  //   }
  //   return element;
  // }
  //
  // getState (key) {
  //   const stuff = bdPluginStorage.get('Twitchcord', key);
  //   return stuff ? stuff.state : false;
  // }
  //
  // toggleSnippet (title) {
  //   const snippet = bdPluginStorage.get('Twitchcord', title),
  //         classToAdd = this.buttons.find(b => b.title === title).classToAdd;
  //   if (snippet && snippet.state) {
  //     document.documentElement.classList.remove(classToAdd);
  //   } else {
  //     document.documentElement.classList.add(classToAdd);
  //   }
  //   bdPluginStorage.set('Twitchcord', title, { state: snippet ? !snippet.state : true });
  // }

  // get buttons () {
  //   return $
  //     .ajax({
  //       url: this.SNIPPET_URL,
  //       async: false
  //     })
  //     .responseJSON
  //     .map(r => ({
  //       default: r.default,
  //       title: r.title,
  //       inverted: r.inverted,
  //       description: r.description,
  //       classToAdd: r.classToAdd
  //     }));
  // }
  //
  // reset () {
  //   for (const button of this.buttons) {
  //     bdPluginStorage.set('Twitchcord', button.title, { state: button.default ? true : false });
  //   }
  //   this.loadSnippets();
  // }

  /*
  async update (code) {
    const { writeFileSync } = require('fs');
    const { join } = require('path');
    let pluginPath;

    switch (process.platform) {
      case 'win32':
        pluginPath = join(process.env.appdata, 'twitchcord', 'plugins');
        break;
      case 'darwin':
        pluginPath = join(process.env.HOME, 'Library', 'Preferences', 'twitchcord', 'Plugins');
        break;
      default:
        pluginPath = join(process.env.HOME, '.config', 'twitchcord', 'plugins');
    }

    pluginPath = join(pluginPath, 'Twitchcord.plugin.js');
    writeFileSync(pluginPath, code);


  }

  async checkForUpdate () {
    const GHPlugin = await window.fetch(this.PLUGIN_URL).then(r => r.text());
    const versionRegex = /getVersion \(\) {\n {4}return '([^]*?)';/;
    const GHVersions = versionRegex.exec(GHPlugin)[1].split('.').map(Number);
    const localVersions = this.getVersion().split('.').map(Number);
    for (const version of GHVersions) {
      if (version > localVersions[GHVersions.indexOf(version)]) {
        this.update(GHPlugin);
        break;
      }
    }
  }
*/

  onMaximize () {
		document.documentElement.dataset.tcWindowMaximized = '';
	}

	onRestore () {
    delete document.documentElement.dataset.tcWindowMaximized;
    document.documentElement.dataset.tcWindowRestored = '';
  }

  // mouseMoveHandler (e) {
  //   function showGuildsOnHover () {
  //     document.documentElement.classList.remove('hideGuildsUntilHover');
  //   }

  //   function hideGuildsOnHoverOut () {
  //     document.documentElement.classList.add('hideGuildsUntilHover');
  //   }

  //   var guildsHover = document.querySelector('.guildsWrapper-5TJh6A:hover');
  //   if (e.pageX < 20 || guildsHover) {
  //       // Show the guilds if mouse is within 20 pixels
  //       // from the left or we are hovering over it
  //       clearTimeout(this.guildsTimeout);
  //       this.guildsTimeout = null;
  //       showGuildsOnHover();
  //   } else if (this.guildsTimeout === null) {
  //       // Hide the menu if the mouse is further than 20 pixels
  //       // from the left and it is not hovering over the menu
  //       // and we aren't already scheduled to hide it
  //       this.guildsTimeout = setTimeout(hideGuildsOnHoverOut, 300);
  //   }
  // }

  listener = (ev, cmd) => {
    var bw, wc, backdrop;

    bw = require("electron").remote.getCurrentWindow();
    wc = bw.webContents;

    if (cmd !== 'browser-backward' && cmd !== 'browser-forward')
      return;
    if (cmd === 'browser-backward' && wc.canGoBack())
      tc.webpack.get('history').back();
    else if (cmd === 'browser-forward' && wc.canGoForward())
      tc.webpack.get('history').forward();
  }

  start () {
    // const FriendsComponent = tc.webpack.find(m => m.displayName == "Friends");
    // const cancel = DiscordInternals.monkeyPatch(FriendsComponent.prototype, "render", {before: ({thisObject}) => {thisObject.state.relationshipCount = 60;}});

    this.oldRatio = window.devicePixelRatio;
    window.devicePixelRatio = 2;

    function pixelRatio () {
      const zoomClassList = ['zoomLevel-5', 'zoomLevel-4', 'zoomLevel-3', 'zoomLevel-2', 'zoomLevel-1', 'zoomLevel-0', 'zoomLevel-1', 'zoomLevel-2', 'zoomLevel-3', 'zoomLevel-4', 'zoomLevel-5', 'zoomLevel-unknown'];
      var screenCssPixelRatio = (window.outerWidth - 8) / window.innerWidth;
      switch (true) {
        case (screenCssPixelRatio >= .46 && screenCssPixelRatio <= .54):
          document.documentElement.classList.remove(...zoomClassList);
          document.documentElement.classList.add('zoomLevel-5');
          break;
        case (screenCssPixelRatio <= .70):
          document.documentElement.classList.remove(...zoomClassList);
          document.documentElement.classList.add('zoomLevel-4');
          break;
        case (screenCssPixelRatio <= .77):
          document.documentElement.classList.remove(...zoomClassList);
          document.documentElement.classList.add('zoomLevel-3');
          break;
        case (screenCssPixelRatio <= .84):
          document.documentElement.classList.remove(...zoomClassList);
          document.documentElement.classList.add('zoomLevel-2');
          break;
        case (screenCssPixelRatio <= .92):
          document.documentElement.classList.remove(...zoomClassList);
          document.documentElement.classList.add('zoomLevel-1');
          break;
        case (screenCssPixelRatio <= 1):
          document.documentElement.classList.remove(...zoomClassList);
          document.documentElement.classList.add('zoomLevel-0');
          break;
        case (screenCssPixelRatio <= 1.16):
          document.documentElement.classList.remove(...zoomClassList);
          document.documentElement.classList.add('zoomLevel-1');
          break;
        case (screenCssPixelRatio <= 1.32):
          document.documentElement.classList.remove(...zoomClassList);
          document.documentElement.classList.add('zoomLevel-2');
          break;
        case (screenCssPixelRatio <= 1.64):
          document.documentElement.classList.remove(...zoomClassList);
          document.documentElement.classList.add('zoomLevel-3');
          break;
        case (screenCssPixelRatio <= 1.80):
          document.documentElement.classList.remove(...zoomClassList);
          document.documentElement.classList.add('zoomLevel-4');
          break;
        case (screenCssPixelRatio <= 2.12):
          document.documentElement.classList.remove(...zoomClassList);
          document.documentElement.classList.add('zoomLevel-5');
          break;
        default:
          document.documentElement.classList.remove(...zoomClassList);
          document.documentElement.classList.add('zoomLevel-unknown');
      }
    }

    window.onresize = function(event) {
      pixelRatio();
    }

this.languages = {
	"$discord":	{name:"Discord (English (US))",		id:"en-US",		ownlang:"English (US)",				       integrated:false,		  dic:false,		deepl:false},
	"af":		    {name:"Afrikaans",					      id:"af",		  ownlang:"Afrikaans",				         integrated:false,		  dic:true,		  deepl:false},
  "sq":		    {name:"Albanian",					        id:"sq",		  ownlang:"Shqiptar",					         integrated:false,		  dic:false,		deepl:false},
  "am":		    {name:"Amharic",					        id:"am",		  ownlang:"አማርኛ",					            integrated:false,		   dic:false,		 deepl:false},
  "ar":		    {name:"Arabic",						        id:"ar",		  ownlang:"اللغة العربية",			       integrated:false,		  dic:false,		deepl:false},
  "hy":		    {name:"Armenian",					        id:"hy",		  ownlang:"Հայերեն",					         integrated:false,		  dic:false,		deepl:false},
  "az":		    {name:"Azerbaijani",				      id:"az",		  ownlang:"آذربایجان دیلی",			       integrated:false,		  dic:false,		deepl:false},
  "eu":		    {name:"Basque",						        id:"eu",		  ownlang:"Euskara",					         integrated:false,		  dic:false,		deepl:false},
  "be":		    {name:"Belarusian",					      id:"be",		  ownlang:"Беларуская",				         integrated:false,		  dic:false,		deepl:false},
  "bn":		    {name:"Bengali",					        id:"bn",		  ownlang:"বাংলা",						          integrated:false,		   dic:false,		 deepl:false},
  "bs":		    {name:"Bosnian",					        id:"bs",		  ownlang:"Босански",					         integrated:false,		  dic:false,		deepl:false},
  "bg":		    {name:"Bulgarian",					      id:"bg",		  ownlang:"български",				         integrated:true,		    dic:false,		deepl:false},
  "my":		    {name:"Burmese",					        id:"my",		  ownlang:"မြန်မာစာ",					           integrated:false,		  dic:false,		deepl:false},
  "ca":		    {name:"Catalan",					        id:"ca",		  ownlang:"Català",					           integrated:false,		  dic:false,		deepl:false},
	"ceb":		  {name:"Cebuano",					        id:"ceb",		  ownlang:"Bisaya",					           integrated:false,		  dic:false,		deepl:false},
	"ny":		    {name:"Chewa",						        id:"ny",		  ownlang:"Nyanja",					           integrated:false,		  dic:false,		deepl:false},
	"zh-HK":	  {name:"Chinese (Hong Kong)",		  id:"zh-HK",		ownlang:"香港中文",					          integrated:false,		   dic:false,		 deepl:false},
	"zh-CN":	  {name:"Chinese (Simplified)",		  id:"zh-CN",		ownlang:"简体中文",					          integrated:false,		   dic:false,		 deepl:false},
	"zh-TW":	  {name:"Chinese (Traditional)",		id:"zh-TW",		ownlang:"繁體中文",					          integrated:true,		   dic:false,		 deepl:false},
	"co":		    {name:"Corsican",					        id:"co",		  ownlang:"Corsu",					           integrated:false,	    dic:false,		deepl:false},
	"hr":		    {name:"Croatian",					        id:"hr",		  ownlang:"Hrvatski",					         integrated:true,		    dic:false,		deepl:false},
	"cs":		    {name:"Czech",						        id:"cs",		  ownlang:"Čeština",					         integrated:true,		    dic:false,		deepl:false},
	"da":		    {name:"Danish",						        id:"da",		  ownlang:"Dansk",					           integrated:true,		    dic:true,		  deepl:false},
	"nl":		    {name:"Dutch",						        id:"nl",		  ownlang:"Nederlands",				         integrated:true,		    dic:true,		  deepl:true},
	"en":		    {name:"English",					        id:"en",		  ownlang:"English",					         integrated:false,		  dic:true,		  deepl:true},
	"en-GB":	  {name:"English (UK)",				      id:"en-GB",		ownlang:"English (UK)",				       integrated:true,		    dic:true,		  deepl:false},
	"en-US":	  {name:"English (US)",				      id:"en-US",		ownlang:"English (US)",				       integrated:true,		    dic:true,		  deepl:false},
	"eo":		    {name:"Esperanto",					      id:"eo",		  ownlang:"Esperanto",				         integrated:false,		  dic:false,		deepl:false},
	"et":		    {name:"Estonian",					        id:"et",		  ownlang:"Eesti",					           integrated:false,		  dic:false,		deepl:false},
	"fil":		  {name:"Filipino",					        id:"fil",		  ownlang:"Wikang Filipino",			     integrated:false,		  dic:false,		deepl:false},
	"fi":		    {name:"Finnish",					        id:"fi",		  ownlang:"Suomi",					           integrated:true,		    dic:false,		deepl:false},
	"fr":		    {name:"French",						        id:"fr",		  ownlang:"Français",					         integrated:true,		    dic:true,		  deepl:true},
	"fr-CA":	  {name:"French (Canadian)",			  id:"fr-CA",		ownlang:"Français Canadien",		     integrated:false,		  dic:false,		deepl:false},
	"fy":		    {name:"Frisian",					        id:"fy",		  ownlang:"Frysk",					           integrated:false,		  dic:false,		deepl:false},
	"gl":		    {name:"Galician",					        id:"gl",		  ownlang:"Galego",					           integrated:false,		  dic:false,		deepl:false},
	"ka":		    {name:"Georgian",					        id:"ka",		  ownlang:"ქართული",				          integrated:false,		   dic:false,		 deepl:false},
	"de":		    {name:"German",						        id:"de",		  ownlang:"Deutsch",					         integrated:true,		    dic:true,		  deepl:true},
	"de-AT":	  {name:"German (Austria)",			    id:"de-AT",		ownlang:"Österreichisch Deutsch",	   integrated:false,		  dic:false,		deepl:false},
	"de-CH":	  {name:"German (Switzerland)",		  id:"de-CH",		ownlang:"Schweizerdeutsch",			     integrated:false,		  dic:false,		deepl:false},
	"el":		    {name:"Greek",						        id:"el",		  ownlang:"Ελληνικά",				           integrated:false,		  dic:false,		deepl:false},
	"gu":		    {name:"Gujarati",					        id:"gu",		  ownlang:"ગુજરાતી",					          integrated:false,		   dic:false,		 deepl:false},
	"ht":		    {name:"Haitian Creole",				    id:"ht",		  ownlang:"Kreyòl Ayisyen",			       integrated:false,		  dic:false,		deepl:false},
	"ha":		    {name:"Hausa",						        id:"ha",		  ownlang:"حَوْسَ",						            integrated:false,		   dic:false,		 deepl:false},
	"haw":		  {name:"Hawaiian",					        id:"haw",		  ownlang:"ʻŌlelo Hawaiʻi",			       integrated:false,		  dic:false,		deepl:false},
	"iw":		    {name:"Hebrew",						        id:"iw",		  ownlang:"עברית",					           integrated:false,		  dic:false,		deepl:false},
	"hi":		    {name:"Hindi",						        id:"hi",		  ownlang:"हिन्दी",						           integrated:false,		  dic:false,		deepl:false},
	"hmn":		  {name:"Hmong",						        id:"hmn",		  ownlang:"lol Hmongb",				         integrated:false,		  dic:false,		deepl:false},
	"hu":		    {name:"Hungarain",					      id:"hu",		  ownlang:"Magyar",					           integrated:false,		  dic:false,		deepl:false},
	"is":		    {name:"Icelandic",					      id:"is",		  ownlang:"Íslenska",					         integrated:false,		  dic:false,		deepl:false},
	"ig":		    {name:"Igbo",						          id:"ig",		  ownlang:"Asụsụ Igbo",				         integrated:false,		  dic:false,		deepl:false},
	"id":		    {name:"Indonesian",					      id:"id",		  ownlang:"Bahasa Indonesia",			     integrated:false,		  dic:false,		deepl:false},
	"ga":		    {name:"Irish",						        id:"ga",		  ownlang:"Gaeilge",					         integrated:false,		  dic:false,		deepl:false},
	"it":		    {name:"Italian",					        id:"it",		  ownlang:"Italiano",					         integrated:true,		    dic:true,		  deepl:true},
	"ja":		    {name:"Japanese",					        id:"ja",		  ownlang:"日本語",					          integrated:true,		    dic:false,		deepl:false},
	"jv":		    {name:"Javanese",					        id:"jv",		  ownlang:"ꦧꦱꦗꦮ",					         integrated:false,		   dic:false,		 deepl:false},
	"kn":		    {name:"Kannada",					        id:"kn",		  ownlang:"ಕನ್ನಡ",						        integrated:false,		    dic:false,		deepl:false},
	"kk":		    {name:"Kazakh",						        id:"kk",		  ownlang:"Қазақ Tілі",			          integrated:false,		    dic:false,		deepl:false},
	"km":		    {name:"Khmer",						        id:"km",		  ownlang:"ភាសាខ្មែរ",					        integrated:false,		    dic:false,		deepl:false},
	"ko":		    {name:"Korean",						        id:"ko",		  ownlang:"한국어",					          integrated:true,		    dic:false,		deepl:false},
	"ku":		    {name:"Kurdish",					        id:"ku",		  ownlang:"کوردی",					          integrated:false,		    dic:false,		deepl:false},
	"ky":		    {name:"Kyrgyz",						        id:"ky",		  ownlang:"кыргызча",					        integrated:false,		    dic:false,		deepl:false},
	"lo":		    {name:"Lao",						          id:"lo",		  ownlang:"ພາສາລາວ",					        integrated:false,		    dic:false,		deepl:false},
	"la":		    {name:"Latin",						        id:"la",		  ownlang:"Latina",					          integrated:false,		    dic:false,		deepl:false},
	"lv":		    {name:"Latvian",					        id:"lv",		  ownlang:"Latviešu",					        integrated:false,		    dic:false,		deepl:false},
	"lt":		    {name:"Lithuanian",					      id:"lt",		  ownlang:"Lietuvių",					        integrated:false,		    dic:false,		deepl:false},
	"lb":		    {name:"Luxembourgish",				    id:"lb",		  ownlang:"Lëtzebuergesch",			      integrated:false,		    dic:false,		deepl:false},
	"mk":		    {name:"Macedonian",					      id:"mk",		  ownlang:"Mакедонски",				        integrated:false,		    dic:false,		deepl:false},
	"mg":		    {name:"Malagasy",					        id:"mg",		  ownlang:"Malagasy",                 integrated:false,		    dic:false,		deepl:false},
	"ms":		    {name:"Malay",						        id:"ms",		  ownlang:"بهاس ملايو",				         integrated:false,		   dic:false,		 deepl:false},
	"ml":		    {name:"Malayalam",					      id:"ml",		  ownlang:"മലയാളം",					       integrated:false,		   dic:false,		 deepl:false},
	"mt":		    {name:"Maltese",					        id:"mt",		  ownlang:"Malti",					          integrated:false,		    dic:false,		deepl:false},
	"mi":		    {name:"Maori",						        id:"mi",		  ownlang:"te Reo Māori",				      integrated:false,		    dic:false,		deepl:false},
	"mr":		    {name:"Marathi",					        id:"mr",		  ownlang:"मराठी",						         integrated:false,		   dic:false,		 deepl:false},
	"mn":		    {name:"Mongolian",					      id:"mn",		  ownlang:"Монгол Хэл",				        integrated:false,		    dic:false,		deepl:false},
	"ne":		    {name:"Nepali",						        id:"ne",		  ownlang:"नेपाली",						          integrated:false,		    dic:false,		deepl:false},
	"no":		    {name:"Norwegian",					      id:"no",		  ownlang:"Norsk",					          integrated:true,		    dic:false,		deepl:false},
	"ps":		    {name:"Pashto",						        id:"ps",		  ownlang:"پښتو",						          integrated:false,		    dic:false,		deepl:false},
	"fa":		    {name:"Persian",					        id:"fa",		  ownlang:"فارسی",					          integrated:false,		    dic:false,		deepl:false},
	"pl":		    {name:"Polish",						        id:"pl",	  	ownlang:"Polski",					          integrated:true,		    dic:false,		deepl:true},
	"pt":		    {name:"Portuguese",					      id:"pt",	  	ownlang:"Português",				        integrated:false,		    dic:true,		  deepl:false},
	"pt-BR":	  {name:"Portuguese (Brazil)",		  id:"pt-BR",		ownlang:"Português do Brasil",		  integrated:true,		    dic:true,		  deepl:false},
	"pt-PT":	  {name:"Portuguese (Portugal)",		id:"pt-PT",		ownlang:"Português do Portugal",	  integrated:false,		    dic:false,		deepl:false},
	"pa":		    {name:"Punjabi",					        id:"pa",		  ownlang:"पंजाबी",						          integrated:false,		    dic:false,		deepl:false},
	"ro":		    {name:"Romanian",					        id:"ro",		  ownlang:"Română",					          integrated:false,		    dic:false,		deepl:false},
	"ru":		    {name:"Russian",					        id:"ru",		  ownlang:"Pусский",					        integrated:true,		    dic:true,		  deepl:false},
	"sm":		    {name:"Samoan",						        id:"sm",		  ownlang:"Gagana Sāmoa",				      integrated:false,		    dic:false,		deepl:false},
	"gd":		    {name:"Scottish Gaelic",			    id:"gd",		  ownlang:"Gàidhlig",					        integrated:false,		    dic:false,		deepl:false},
	"sr":		    {name:"Serbian",					        id:"sr",		  ownlang:"Српски",					          integrated:false,		    dic:false,		deepl:false},
	"st":		    {name:"Sotho",						        id:"st",		  ownlang:"Sesotho",				        	integrated:false,		    dic:false,		deepl:false},
	"sn":		    {name:"Shona",						        id:"sn",		  ownlang:"Shona",					          integrated:false,		    dic:false,		deepl:false},
	"sd":		    {name:"Sindhi",						        id:"sd",		  ownlang:"سنڌي",						          integrated:false,		    dic:false,		deepl:false},
	"si":		    {name:"Sinhala",					        id:"si",		  ownlang:"සිංහල",					          integrated:false,		    dic:false,		deepl:false},
	"sk":		    {name:"Slovak",						        id:"sk",		  ownlang:"Slovenčina",				        integrated:false,		    dic:false,		deepl:false},
	"sl":		    {name:"Slovenian",					      id:"sl",		  ownlang:"Slovenščina",				      integrated:false,		    dic:false,		deepl:false},
	"es":		    {name:"Spanish",					        id:"es",		  ownlang:"Español",					        integrated:true,		    dic:true,		  deepl:true},
	"es-419":	  {name:"Spanish (Latin America)",	id:"es-419",	ownlang:"Español latinoamericano",	integrated:false,		    dic:false,		deepl:false},
	"sw":		    {name:"Swahili",					        id:"sw",		  ownlang:"Kiswahili",				        integrated:false,		    dic:false,		deepl:false},
	"sv":		    {name:"Swedish",					        id:"sv",		  ownlang:"Svenska",					        integrated:true,		    dic:true,		  deepl:false},
	"tg":		    {name:"Tajik",						        id:"tg",	  	ownlang:"тоҷикӣ",					          integrated:false,		    dic:false,		deepl:false},
	"ta":		    {name:"Tamil",						        id:"ta",		  ownlang:"தமிழ்",						        integrated:false,		    dic:false,		deepl:false},
	"te":		    {name:"Telugu",						        id:"te",		  ownlang:"తెలుగు",					          integrated:false,		    dic:false,		deepl:false},
	"th":	    	{name:"Thai",						          id:"th",		  ownlang:"ภาษาไทย",					        integrated:false,		   dic:false,		  deepl:false},
	"tr":	    	{name:"Turkish",					        id:"tr",		  ownlang:"Türkçe",					          integrated:true,		    dic:false,		deepl:false},
	"uk":	    	{name:"Ukrainian",					      id:"uk",		  ownlang:"Yкраїнський",				      integrated:true,		    dic:false,		deepl:false},
	"ur":	    	{name:"Urdu",						          id:"ur",		  ownlang:"اُردُو",						          integrated:false,		    dic:false,		deepl:false},
	"uz":	    	{name:"Uzbek",						        id:"uz",	  	ownlang:"اوزبیک",					          integrated:false,		    dic:false,		deepl:false},
	"vi":	    	{name:"Vietnamese",					      id:"vi",		  ownlang:"Tiếng Việt Nam",			      integrated:false,		    dic:false,		deepl:false},
	"cy":	    	{name:"Welsh",						        id:"cy",		  ownlang:"Cymraeg",					        integrated:false,		    dic:false,		deepl:false},
	"xh":	    	{name:"Xhosa",						        id:"xh",		  ownlang:"Xhosa",					          integrated:false,		    dic:false,		deepl:false},
	"yi":	    	{name:"Yiddish",					        id:"yi",		  ownlang:"ייִדיש ייִדיש‬",				      integrated:false,		    dic:false,		 deepl:false},
	"yo":	    	{name:"Yoruba",						        id:"yo",		  ownlang:"Èdè Yorùbá",				        integrated:false,		    dic:false,		deepl:false},
	"zu":	    	{name:"Zulu",						          id:"zu",		  ownlang:"Zulu",						          integrated:false,		    dic:false,		deepl:false}
};

    const currentWindow = require("electron").remote.getCurrentWindow();
		if (currentWindow.isMaximized()) this.onMaximize();

		currentWindow.on("maximize", this.onMaximize);
    currentWindow.on("unmaximize", this.onRestore);

    var bw, wc, backdrop;

    bw = require("electron").remote.getCurrentWindow();
    wc = bw.webContents;
    bw.on("app-command", this.listener);


    document.addEventListener('keydown', this.keyBindFunctions, false);

    var location;

    if (document.querySelector(".container-2Rl01u")) {
      location = 'serverView';
    } else if (document.querySelector(".privateChannels-1nO12o") && document.querySelector(".chat-3bRxxu")) {
      location = 'messagesView';
    } else if (document.querySelector(".container-1D34oG")) {
      location = 'friendsView';
    } else if (document.querySelector(".container-3Mxszk")) {
      location = 'libraryView';
    }

    pixelRatio();
    // this.loadSnippets();
    this.injectUserBackgrounds();
    //this.checkForUpdate();
    this.onSwitchViews();
    this.insertTopNav(location);
    this.insertTitlebar();
    // this.giphy();
    // this.zenMode();
    this.injectUserStatus();
    // this.imageBtns();

    clearTimeout(this.startupTimeout);
    this.startupTimeout = setTimeout(()=> {
      this.setUserIdAndBadges.bind(this);
      this.insertVoiceConnected.bind(this);
    }, 3000);

    document.documentElement.classList.add('friendsBackgroundTile', 'libraryTile');
    this.routeWatcher();
  }

  allViews () {
    var can;
    let bw = require('electron').remote.getCurrentWindow();
    let wc = bw.webContents;
    let backButton = document.querySelector('.tc-titlebar-button-container.back');
    let forwardButton = document.querySelector('.tc-titlebar-button-container.forward');

    can = wc.canGoBack();
    backButton.classList.toggle('disabled', !can);
    can = wc.canGoForward();
    forwardButton.classList.toggle('disabled', !can);

    let channelHeaderButtons = document.querySelectorAll('.toolbar-1t6TWx .iconWrapper-2OrFZ1');
    console.log('turtle');
    if (!channelHeaderButtons) return;
    console.log('pizza');
    for (let channelHeaderButton of channelHeaderButtons) {
      switch (tc.react.getProp(tc.react.get(channelHeaderButton), 'memoizedProps.aria-label')) {
        case 'Start Voice Call':
            console.log('wtf');
          channelHeaderButton.classList.add('tc-startVoiceCall');
          break;
        case 'Start Video Call':
          channelHeaderButton.classList.add('tc-startVideoCall');
          break;
        case 'Pinned Messages':
          channelHeaderButton.classList.add('tc-pinnedMessages');
          break;
        case 'Add Friends to DM':
          channelHeaderButton.classList.add('tc-addFriendsToDM');
          break;
        case 'Muting a channel prevents unread indicators and notifications from appearing unless you are mentioned.\n':
            channelHeaderButton.classList.add('tc-channelUnmuted');
            break;
        case 'Member List':
            channelHeaderButton.classList.add('tc-membersListToggle');
            break;
      }
    }
  }

  friendsView () {
    console.log('friends?');
  }

  routeWatcher () {
    tc.utils.nav.on('all', this.allViews);
      // .on('friends', this.friendsView)
      // .on('guilds', this.guildsView)
      // .on('library', this.libraryView)
      // .on('messages', this.messagesView)
      // .on('storeBrowse', this.storeBrowseView)
  };

  insertTitlebar () {
    let discordTitlebar = document.querySelector('.titleBar-AC4pGV'),
        app = document.querySelector('.app-1q1i1E'),
        tcTitlebar = document.querySelector('.tc-titlebar');

    if (discordTitlebar && app) discordTitlebar.remove();
    if (tcTitlebar) return;

    tcTitlebar =
      `<tc-titlebar class="tc-titlebar">
        <tc-titlebar class="tc-titlebar-section-left">
          <tc-titlebar class="tc-titlebar-button-container menu" title="View menu">
            <icon class="menu"></icon>
          </tc-titlebar>
          <tc-titlebar class="tc-titlebar-button-container back small disabled" title="Navigate back">
            <icon class="back"></icon>
          </tc-titlebar>
          <tc-titlebar class="tc-titlebar-button-container forward small disabled" title="Navigate forward">
            <icon class="forward"></icon>
          </tc-titlebar>
          <tc-titlebar class="tc-titlebar-button-container reload small" title="Reload the app">
            <icon class="reload"></icon>
          </tc-titlebar>
        </tc-titlebar>
        <tc-titlebar class="tc-titlebar-section-middle"></tc-titlebar>
        <tc-titlebar class="tc-titlebar-section-right">
          <tc-titlebar class="tc-titlebar-button-container minimize">
            <icon class="minimize"></icon>
          </tc-titlebar>
          <tc-titlebar class="tc-titlebar-button-container maximize">
            <icon class="maximize"></icon>
          </tc-titlebar>
          <tc-titlebar class="tc-titlebar-button-container close">
            <icon class="close"></icon>
          </tc-titlebar>
        </tc-titlebar>
      </tc-titlebar>`;

    app.insertAdjacentHTML('beforebegin', tcTitlebar);

    let menuButton = document.querySelector('.tc-titlebar-button-container.menu'),
        backButton = document.querySelector('.tc-titlebar-button-container.back'),
        forwardButton = document.querySelector('.tc-titlebar-button-container.forward'),
        reloadButton = document.querySelector('.tc-titlebar-button-container.reload'),
        minimizeButton = document.querySelector('.tc-titlebar-button-container.minimize'),
        maximizeButton = document.querySelector('.tc-titlebar-button-container.maximize'),
        closeButton = document.querySelector('.tc-titlebar-button-container.close');

    backButton.addEventListener('click', () => {
      tc.webpack.get('history').back();
    });

    forwardButton.addEventListener('click', () => {
      tc.webpack.get('history').forward();
    });

    reloadButton.addEventListener('click', () => {
      window.reloadElectronApp();
    });

    minimizeButton.addEventListener('click', () => {
      DiscordNative.window.minimize();
    });

    maximizeButton.addEventListener('click', () => {
      DiscordNative.window.maximize();
    });

    closeButton.addEventListener('click', () => {
      DiscordNative.window.close();
    });
  }

  insertTopNav () {
    let topNavWrapper = document.querySelector('.tc-titleWrapper-nav');

    let userStore = tc.webpack.getAll('getUser'),
        userName = userStore.getCurrentUser()

    if (!userName) {
      return
    }

    let userAvatarURL = userStore.getUser(userName.id).getAvatarURL(),
        userStatusStore = tc.webpack.getAll('getStatus'),
        userStatus = userStatusStore.getStatus(userName.id),
        userPresence = tc.webpack.getAll('getPresence'),
        activity = userPresence.getPrimaryActivity();

    var activityTypeText;
    if (activity) {
      if (activity.type == '0') activityTypeText = 'playing ';
      if (activity.type == '1') activityTypeText = 'streaming ';
      if (activity.type == '2') activityTypeText = 'listening to ';
      if (activity.type == '3') activityTypeText = 'watching ';
    }

    if (topNavWrapper) {
      for (var j = 0; j < topNavWrapper.children.length; j++) {
        topNavWrapper.children[j].classList.remove("active");
      }

      this.globalSearch();
      this.localSearch();

      // Remove all view classes except the current view from <html>
      // document.documentElement.classList.remove(...locationClasses.tc.helpers.except(whereAt));
      // Add the current view class to <html>
      // document.documentElement.classList.add(whereAt);
      // Checking if the view is any view but server
      // if (locationClasses.tc.helpers.except('serverView').includes(whereAt)) {
        // Slice off the 'View' in the current view and add active class to the corresponding nav button
        // document.getElementsByClassName(`tc-titleWrapper-nav-${whereAt.slice(0, -4)}-btn`)[0].classList.add('active');
      // }

      let userStatusBox = document.getElementsByClassName('tc-titleWrapper-account-status-indicator')[0];
      userStatusBox.className = `${userStatus} tc-titleWrapper-account-status-indicator`;

      return;
    }

    const topNav =
      `<div class="tc-titleWrapper">
        <div class="tc-titleWrapper-nav">
          <div class="tc-titleWrapper-nav-logo-settings">
            <svg class="tc-titleWrapper-nav-logo-svg" viewBox="0 0 1000 1000" x="0px" y="0px">
              <g transform="scale(35) translate(0, -2)">
                <path clip-rule="evenodd" d="M5.568,3L4,7v17h5v3h3.886L16,24h5l6-6V3H5.568z M25,16l-4,4h-6l-3,3v-3H8V5h17V16z" fill-rule="evenodd"/>
              </g>
              <g transform="scale(0.5) translate(650, 350)">
                <path d="M 361.9857,0.00138389 C 348.73055,0.05478389 239.07459,3.1670339 123.39327,89.124664 123.39327,89.124664 0,311.06297 0,584.4136 c 0,0 71.978249,123.39208 261.35281,129.39038 0,0 31.70511,-37.7037 57.41206,-70.26582 C 209.93876,610.97599 168.80785,543.28361 168.80785,543.28361 c 0,0 8.5708,5.99726 23.99498,14.56626 0.85689,0 1.71122,0.85558 3.42502,1.7125 2.57069,1.71377 5.1422,2.57081 7.7129,4.28459 21.42246,11.99658 42.84423,21.42368 62.5529,29.13581 35.13283,14.56729 77.12215,27.41951 125.96536,36.84541 64.26736,11.9966 139.67306,16.28044 221.93532,0.85625 40.27424,-7.71208 81.40794,-18.85053 124.25286,-36.84541 29.99142,-11.13969 63.40925,-27.41914 98.54205,-50.55541 0,0 -42.84417,69.40888 -155.09786,101.11413 25.70697,31.70521 56.55581,68.54998 56.55581,68.54998 C 928.02173,706.94949 1000,583.55668 1000,584.4136 1000,311.06297 876.60671,89.124664 876.60671,89.124664 754.07028,-2.5634661 636.67349,0.00803389 636.67349,0.00803389 L 624.67932,13.718014 C 770.35209,57.419834 838.04548,121.6888 838.04548,121.6888 748.92802,73.702484 661.52634,49.707644 580.121,40.281764 c -61.69669,-6.85519 -120.82499,-5.13937 -173.09576,1.71581 -5.14137,0 -9.42484,0.85563 -14.56623,1.7125 -29.99144,3.42762 -102.82721,13.70953 -194.51535,53.98375 -31.70523,13.710366 -50.55871,23.994976 -50.55871,23.994976 0,0 70.26568,-67.697276 224.50739,-111.399106 L 363.32318,0.00803389 c 0,0 -0.4538,-0.0102 -1.33748,-0.007 z M 340.18778,316.20414 c 48.8432,0 88.26098,41.98669 87.40413,94.25746 0,52.27084 -38.56093,94.2608 -87.40413,94.2608 -47.98632,0 -87.40413,-41.98996 -87.40413,-94.2608 0,-52.27077 38.56091,-94.25746 87.40413,-94.25746 z m 312.76778,0 c 47.98631,0 87.40413,41.98669 87.40413,94.25746 0,52.27084 -38.56089,94.2608 -87.40413,94.2608 -47.9863,0 -87.40413,-41.98996 -87.40413,-94.2608 0,-52.27077 38.56091,-94.25746 87.40413,-94.25746 z"/>
              </g>
            </svg>
          </div>
          <div class="tc-titleWrapper-nav-discover-btn tc-titleWrapper-nav-btns" data-tc-tooltip="Discover"><icon class="tc-icon tc-titleWrapper-nav-icon-discover"></icon><p class="tc-titleWrapper-nav-view-name">Discover</p></div>
          <div class="tc-titleWrapper-nav-friends-btn tc-titleWrapper-nav-btns" data-tc-tooltip="Friends"><icon class="tc-icon tc-titleWrapper-nav-icon-friends"></icon><p class="tc-titleWrapper-nav-view-name">Friends</p></div>
          <div class="tc-titleWrapper-nav-library-btn tc-titleWrapper-nav-btns" data-tc-tooltip="Library"><icon class="tc-icon tc-titleWrapper-nav-icon-library"></icon><p class="tc-titleWrapper-nav-view-name">Library</p></div>
        </div>
        <div class="tc-titleWrapper-global-search">
        <div class="tc-titleWrapper-global-search-outer">
          <div class="tc-titleWrapper-global-search-inner">
            <input class="tc-titleWrapper-global-search-input" type="text" placeholder="Search">
            <div class="tc-titleWrapper-global-search-icon">
              <icon class="tc-icon search"></icon>
            </div>
            <icon class="tc-icon search-close"></icon>
          </div>
        </div>
      </div>
        <div class="tc-titleWrapper-account">
          <div class="tc-titleWrapper-account-update-outer" data-tc-tooltip="Discord Update Ready!">
            <div class="tc-titleWrapper-account-update-inner">
              <icon class="tc-titleWrapper-account-update"></icon>
            </div>
          </div>
          <div class="tc-titleWrapper-account-messages-outer" data-tc-tooltip="Messages">
            <div class="tc-titleWrapper-account-messages-inner">
              <icon class="tc-icon tc-titleWrapper-account-messages"></icon>
              <div class="tc-titleWrapper-account-messages-new-indicator"></div>
            </div>
          </div>
          <div class="tc-titleWrapper-account-mentions-outer" data-tc-tooltip="Mentions">
            <div class="tc-titleWrapper-account-mentions-inner">
              <icon class="tc-icon tc-titleWrapper-account-mentions"></icon>
              <div class="tc-titleWrapper-account-mentions-new-indicator"></div>
            </div>
          </div>
          <div class="tc-titleWrapper-account-panel-outer">
            <div class="tc-titleWrapper-account-panel-inner">
              <div class="tc-titleWrapper-account-avatar-container">
                  <div class="tc-titleWrapper-account-avatar image-33JSyf" style="background-image: url(${userAvatarURL});"></div>
              </div>
              <div class="tc-titleWrapper-account-details-outer">
                <div class="tc-titleWrapper-account-details-inner">
                    <div class="tc-titleWrapper-account-username-container">
                        <span class="tc-titleWrapper-account-username">${userName}</span>
                    </div>
                    <div class="tc-titleWrapper-account-status-container">
                        <div class="${userStatus} tc-titleWrapper-account-status-indicator"></div>
                        <div class="tc-titleWrapper-account-activity-container">
                            <span class="tc-titleWrapper-account-activity">${activity ? activityTypeText + activity.name : ''}</span>
                        </div>
                    </div>
                </div>
                <icon class="tc-icon tc-titleWrapper-account-arrow"></icon>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="tc-updateBar">
        <p class="tc-updateBar-p">Grab the latest version of Twitchcord!
          <button class="tc-updateBar-btn">Update Now</button>
        </p>
        <button class="tc-updateBar-btn-dismiss">Dismiss</button>
      </div>`;

      document.querySelector('.wrapper-1Rf91z').parentNode.insertAdjacentHTML('beforebegin', topNav);

      document.getElementsByClassName(`${tc.classes.twitchcord.titleWrapper}-nav-discover-btn`)[0].addEventListener('click', () => tc.utils.nav.discover());
      document.getElementsByClassName(`${tc.classes.twitchcord.titleWrapper}-nav-friends-btn`)[0].addEventListener('click', () => tc.utils.nav.friends());
      document.getElementsByClassName(`${tc.classes.twitchcord.titleWrapper}-nav-library-btn`)[0].addEventListener('click', () => tc.utils.nav.library());

      document.getElementsByClassName(`${tc.classes.twitchcord.titleWrapper}-account-messages-outer`)[0].addEventListener('click', () => tc.utils.nav.private());

      let tcAccountPanel = document.getElementsByClassName(`${tc.classes.twitchcord.titleWrapper}-account-panel-outer`)[0];
      if (tcAccountPanel) {
        tcAccountPanel.addEventListener('click', () => {
          let tcAccountPanelFresh = document.querySelector('.tc-titleWrapper-account-panel-outer');
          if (tcAccountPanelFresh && tcAccountPanelFresh.classList.contains('opened')) {
            document.body.click();
          } else {
            document.querySelector('.container-3baos1 .avatarWrapper-2yR4wp').click();
          }
        });
      }

      let tcNotificationsButton = document.getElementsByClassName(`${tc.classes.twitchcord.titleWrapper}-account-mentions-outer`)[0];
      if (tcNotificationsButton) {
        tcNotificationsButton.addEventListener('click', () => {
          
          const fs = require('fs');
          tc.webpack.getAll('instantBatchUpload').upload(tc.webpack.modules.channelStore.getDMFromUserId(tc.const.TWITCHCORD_BOT_USER_ID), new File([fs.readFileSync('C:\\okay.txt')], 'okay.txt'), { content: 'Hi I am a test, this message was sent automatically', tts: false });
        });
      }

      let titleWrapperNav = document.querySelector('.tc-titleWrapper-nav'),
          titleWrapper = document.querySelector('.tc-titleWrapper'),
          guildsWrapper = document.querySelector('.wrapper-1Rf91z');


      for (var i = 0; i < titleWrapperNav.children.length; i++) {
        titleWrapperNav.children[i].classList.remove("active");
      }

    this.globalSearch();
    this.localSearch();

    // Remove all view classes except the current view from <html>
    // document.documentElement.classList.remove(...locationClasses.tc.helpers.except(whereAt));
    // Add the current view class to <html>
    // document.documentElement.classList.add(whereAt);
    // Checking if the view is any view but server
    // if (locationClasses.except('serverView').includes(whereAt)) {
    //   // Slice off the 'View' in the current view and add active to the corresponding nav button
    //   document.getElementsByClassName(`tc-titleWrapper-nav-${whereAt.slice(0, -4)}-btn`)[0].classList.add('active');
    // }
  }

  stop () {
    window.devicePixelRatio = this.oldRatio;

    for (const observer of this.observers) {
      observer.disconnect();
    }

    document.body.removeEventListener('keydown', this.keyDownEvent.bind(this));

    tc.webpack.get('handleVoiceChannelSelect').unpatch();
  }
}

module.exports = new Twitchcord
