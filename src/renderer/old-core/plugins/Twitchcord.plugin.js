<<<<<<< HEAD
//META{"name":"Twitchcord"}*//
/* global bdPluginStorage, $, PluginUtilities, PluginContextMenu */

class Twitchcord {
  getName () { return 'Twitchcord'; }
  getVersion () { return '0.5.2'; }
  getAuthor () { return 'Twitchcord Developers'; }
  getDescription () { return 'Splargin! The official plugin for Twitchcord. Includes fixes and features and a full array of user theme settings options!'; }

  constructor () {
    this.initialized = false;

    // this.BASE_URL = 'https://rawgit.com/twitchcord/twitchcord/master';
    // this.userProfileImages = {};
    // this.userBadgeGroups = {};
    // this.SNIPPET_URL = `${this.BASE_URL}/pluginSnippets/snippets.json`;
    // this.USER_PROFILE_IMAGE_URL = 'https://api.github.com/gists/aaa364d4cae7e5c0cf7799c6fd5310d3';
    // this.USER_BADGE_GROUPS_URL = 'https://api.github.com/gists/52a83b5e7ff443d6edbdbde77f4cd51d';
    // this.PLUGIN_URL = `${this.BASE_URL}/plugin/Twitchcord.plugin.js`;
    //
    // window.fetch(this.USER_BADGE_GROUPS_URL).then(async r =>  {
    //   let res = await r.json();
    //   if (!res.files) {
    //     return;
    //   } else { this.userBadgeGroups = JSON.parse(res.files['userBadges.json'].content); }
    // });
    //
    // window.fetch(this.USER_PROFILE_IMAGE_URL).then(async r =>  {
    //   let res = await r.json();
    //   if (!res.files) {
    //     return;
    //   } else { this.userProfileImages = JSON.parse(res.files['userProfileImages.json'].content); }
    // });

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

  async imageBtns () {
    const clipboard = require('electron').clipboard;
    const nativeImage = require('electron').nativeImage;
    const request = require('request');
    $(document).on('click', '.imageWrapper-2p5ogY.imageZoom-1n-ADA img, .imageWrapper-2p5ogY.imageZoom-1n-ADA video, .imageWrapper-2p5ogY.imageZoom-1n-ADA .imageError-2OefUi', async (e) => {
      while(!document.querySelector(".modal-1UGdnR > .inner-1JeGVc > div > .imageWrapper-2p5ogY img") && !document.querySelector(".modal-1UGdnR > .inner-1JeGVc > div > .imageWrapper-2p5ogY video")) await new Promise(p => setTimeout(p, 10));
      let parent = e.target.closest('.container-1YxwTf'),
          openOriginal = document.querySelector('.modal-1UGdnR > .inner-1JeGVc > div > .imageWrapper-2p5ogY ~ .downloadLink-1ywL9o'),
          userImage = parent.getElementsByClassName('large-3ChYtB')[0],
          name = parent.getElementsByClassName('username-_4ZSMR')[0],
          timestamp = parent.querySelector('h2 time'),
          noClassDiv = document.querySelector(".modal-1UGdnR > .inner-1JeGVc > div > .imageWrapper-2p5ogY").parentElement,
          imageCheck = document.querySelector(".modal-1UGdnR > .inner-1JeGVc > div > .imageWrapper-2p5ogY img"),
          videoCheck = document.querySelector(".modal-1UGdnR > .inner-1JeGVc > div > .imageWrapper-2p5ogY video"),
          inner = document.querySelector(".inner-1JeGVc");

      var imageUrl, imageName, videoUrl, videoName;

          if (imageCheck) {
            imageUrl = imageCheck.src;
            imageName = imageUrl.split('/').pop();
            imageName = imageName.split(/[?#]/)[0];
          } else if (videoCheck) {
            videoUrl = videoCheck.src;
            videoName = videoUrl.split('/').pop();
            videoName = videoName.split(/[?#]/)[0];
          } else {
            return;
          }

          document.querySelector('.inner-1JeGVc > div > .imageWrapper-2p5ogY').insertAdjacentHTML('afterend', `
          <div class="tc-imageTopbar-container">
            <div class="tc-imageTopbar-avatar">
              ${userImage.outerHTML}
            </div>
            <div class="tc-imageTopbar-text">
              <div class="tc-imageTopbar-userdetails">
                ${name.outerHTML}
                ${timestamp.outerHTML}
              </div>
              <div class="tc-imageTopbar-imgname">
                ${imageName ? imageName : videoName}
              </div>
            </div>
            <div class="tc-imageTopbar-buttons">
              <a href="${imageUrl ? imageUrl : videoUrl}" download id="downloadA" data-tc-tooltip="Download"></a>
              <a id="copyImageAddress" data-tc-tooltip="Copy Link"></a>
              <a id="copyImage" data-tc-tooltip="Copy Image"></a>
              <div class="tc-imageTopbar-separator"></div>
              <a class="tc-imageTopbar-close"></a>
            </div>
          </div>
          `);

          // Fix for https://i.imgur.com/MftsSwV.png
          noClassDiv.classList.add('tc-imageTopbar');

          let newOpenOriginal = openOriginal.cloneNode(true);
          newOpenOriginal.setAttribute('id', 'openOriginal');
          newOpenOriginal.setAttribute('data-tc-tooltip', 'Open Original');

          inner.style.position = "relative";
          inner.style.top = "calc(var(--titlebar-height) / 2)";

          document.querySelector('.tc-imageTopbar .tc-imageTopbar-buttons').insertBefore(newOpenOriginal, document.querySelector('.tc-imageTopbar-separator'));

          new tcTooltip(newOpenOriginal);

          new tcTooltip(document.getElementById('downloadA'));

          new tcTooltip(document.getElementById('copyImageAddress'));

          document.getElementById('copyImageAddress').onclick = () => {
            clipboard.writeText(`${imageUrl ? imageUrl : videoUrl}`);
          }

          document.querySelector('.tc-imageTopbar-close').onclick = () => {
            document.querySelector('.backdrop-1wrmKB').click();
          }

          new tcTooltip(document.getElementById('copyImage'));

          document.getElementById('copyImage').onclick = () => {
            request({url: `${imageUrl ? imageUrl : videoUrl}`, encoding: null}, (error, response, buffer) => {
              if (error) {
                  return;
              }
              clipboard.write({image: nativeImage.createFromBuffer(buffer)});
          });
          }
    });
  }

  // injectUserBackgrounds () {
  //   const MO = new MutationObserver(async changes => {
  //     if (changes.some(change =>
  //       change.addedNodes && change.addedNodes[0] &&
  //       change.addedNodes[0].className === 'backdrop-1wrmKB'
  //     )) {
  //         this.injectUserModal();
  //     } else if (changes.some(change =>
  //       change.target && change.target.className.includes('popouts-3dRSmE')
  //     )) {
  //       let popouts = document.getElementsByClassName('popouts-3dRSmE')[0];

  //       let gamePreviewPopout = document.getElementsByClassName('popouts-3dRSmE')[0].getElementsByClassName('gamePreview-9weYR2')[0];
  //       if (gamePreviewPopout) {
  //         gamePreviewPopout.parentElement.parentElement.classList.add('tc-gamePopout');
  //       } else {
  //         if (popouts) popouts.classList.remove('tc-gamePopout');
  //       }

  //       this.injectUserPopout();
  //     }
  //   });

  //   MO.observe(document.querySelector('#app-mount'), { childList: true, subtree: true });
  //   this.observers.push(MO);
  // }

  async onSwitchViews () {
    var observertarget = null;
    this.viewsObserver = new MutationObserver((changes, _) => {
      changes.forEach(
        (change, i) => {
          if (change.target && change.target.classList.contains('popouts-3dRSmE')) {
            let popouts = document.getElementsByClassName('popouts-3dRSmE')[0];

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

            let gamePreviewPopout = document.getElementsByClassName('popouts-3dRSmE')[0].getElementsByClassName('gamePreview-9weYR2')[0];
            if (gamePreviewPopout) {
              gamePreviewPopout.parentElement.parentElement.classList.add('tc-gamePopout');
            } else {
              if (popouts) popouts.classList.remove('tc-gamePopout');
            }

            this.injectUserPopout();
            this.changeRoleStyle();
          }
          if (change.removedNodes) {
            change.removedNodes.forEach((node) => {
              if (node && node.tagName && node.classList.contains('backdrop-1wrmKB')) {
                let quickSwitcherInput = document.querySelector('.tc-titleWrapper-nav-global-search-outer .input-2VB9rf');
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
                    isDescendant(channelsList, node)
                  )) {
                  return;
                }

                if (node && node.tagName && node.classList.contains('autocomplete-1vrmpx')) {
                  console.log('pie');
                  while(!node.querySelector('.horizontalAutocompletes-x8hlrn.scrollbar-3dvm_9')) await new Promise(p => setTimeout(p, 10));
                  console.log('hmmm');
                    node.querySelector('.horizontalAutocompletes-x8hlrn.scrollbar-3dvm_9').addEventListener('wheel', function(e)
                    {
                      if(e.type != 'wheel')
                      {
                        return;
                      }
                      console.log('cheese');
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
                if (document.querySelector('.scroller-2TZvBN > .container-2td-dC:not(:first-of-type) .badge-3dItlm')) {
                  document.documentElement.classList.add('newMentions');
                } else {
                  document.documentElement.classList.remove('newMentions');
                }

                // Prevent native fullscreen youtube videos
                let videoIframe = document.getElementById('tc-fixedVideo-player');
                if (node && node.tagName && videoIframe)
                  videoIframe.allowFullscreen = false;

                // Injecting inline SVG into Discord's question block icons for user activities so we can use rgb(var(--tc-color-7)) and rgb(var(--tc-color-10))
                var questionBlock = `<svg viewBox="0 0 400 400"><path d="M22.800 11.600 L 22.800 23.200 11.400 23.200 L 0.000 23.200 0.000 200.200 L 0.000 377.200 11.400 377.200 L 22.800 377.200 22.800 388.600 L 22.800 400.000 200.000 400.000 L 377.200 400.000 377.200 388.600 L 377.200 377.200 388.600 377.200 L 400.000 377.200 400.000 201.200 L 400.000 25.200 388.600 25.200 L 377.200 25.200 377.200 12.600 L 377.200 0.000 200.000 0.000 L 22.800 0.000 22.800 11.600 M325.200 24.303 C 338.510 24.477,349.440 24.659,349.490 24.709 C 350.618 25.850,350.800 27.557,350.800 37.011 L 350.800 46.862 351.969 48.031 L 353.138 49.200 363.069 49.205 C 374.232 49.212,374.604 49.261,375.416 50.831 C 376.300 52.541,376.300 347.459,375.416 349.169 C 374.604 350.739,374.232 350.788,363.069 350.795 L 353.138 350.800 351.969 351.969 L 350.800 353.138 350.800 363.740 L 350.800 374.342 349.746 375.171 L 348.692 376.000 200.000 376.000 L 51.308 376.000 50.254 375.171 L 49.200 374.342 49.200 363.830 C 49.200 353.540,49.181 353.290,48.285 351.959 L 47.370 350.600 36.726 350.400 C 26.982 350.217,26.011 350.136,25.241 349.438 L 24.400 348.676 24.400 200.000 L 24.400 51.324 25.241 50.562 C 26.016 49.860,26.914 49.791,36.629 49.681 L 47.176 49.563 48.369 48.370 L 49.562 47.176 49.681 36.753 L 49.800 26.330 50.922 25.365 L 52.045 24.400 62.922 24.372 C 68.905 24.356,74.160 24.188,74.600 23.998 C 75.553 23.587,290.236 23.848,325.200 24.303 M302.430 125.944 C 302.137 126.491,302.000 134.394,302.000 150.729 C 302.000 173.738,301.969 174.750,301.236 175.656 C 300.473 176.599,300.459 176.600,288.736 176.833 C 282.281 176.961,276.955 177.096,276.900 177.133 C 276.845 177.170,276.799 182.015,276.798 187.900 C 276.796 198.593,276.795 198.601,275.836 199.800 L 274.876 201.000 251.055 201.112 L 227.234 201.224 227.117 212.981 L 227.000 224.737 226.030 225.769 C 224.379 227.526,223.366 227.595,199.533 227.598 C 187.066 227.599,176.581 227.709,176.233 227.843 C 175.391 228.166,175.264 246.536,176.100 247.076 C 176.375 247.254,187.822 247.490,201.538 247.600 L 226.476 247.800 227.374 248.926 L 228.271 250.052 238.322 249.926 C 251.161 249.765,249.746 251.248,250.000 237.686 C 250.143 230.035,250.346 226.744,250.714 226.100 L 251.228 225.200 274.379 225.200 L 297.529 225.200 298.564 223.969 L 299.600 222.739 299.600 211.813 L 299.600 200.887 301.208 200.243 C 302.539 199.711,304.578 199.600,313.034 199.600 C 319.313 199.600,323.551 199.440,324.026 199.186 C 325.143 198.588,325.254 126.875,324.139 125.949 C 322.903 124.922,302.979 124.917,302.430 125.944 M152.267 126.667 C 152.120 126.813,152.000 131.907,152.000 137.985 L 152.000 149.038 150.483 150.519 L 148.966 152.000 126.044 152.000 C 105.777 152.000,102.963 152.075,101.760 152.646 L 100.400 153.291 100.400 162.458 C 100.400 171.782,100.704 173.983,102.116 174.880 C 102.382 175.049,112.717 175.191,125.082 175.194 L 147.564 175.200 149.038 174.200 L 150.512 173.200 161.156 173.170 C 168.647 173.148,172.215 172.990,173.200 172.635 L 174.600 172.130 174.800 161.678 C 174.979 152.342,175.076 151.151,175.714 150.514 C 176.380 149.848,177.981 149.793,199.570 149.691 L 222.712 149.581 222.950 148.691 C 223.082 148.201,223.192 142.985,223.195 137.100 L 223.200 126.400 187.867 126.400 C 168.433 126.400,152.413 126.520,152.267 126.667 M227.724 275.700 C 227.546 275.975,227.310 281.750,227.200 288.533 C 227.012 300.154,226.955 300.899,226.224 301.433 C 225.574 301.908,221.509 302.000,201.297 302.000 C 185.415 302.000,176.883 302.142,176.374 302.414 C 174.863 303.222,175.340 323.480,176.893 324.466 C 177.770 325.022,248.960 324.880,249.520 324.320 C 250.213 323.627,250.213 276.373,249.520 275.680 C 248.817 274.977,228.179 274.996,227.724 275.700" stroke="none" fill="#000000" fill-rule="evenodd"></path><path d="M74.600 23.998 C 74.160 24.188,68.905 24.356,62.922 24.372 L 52.045 24.400 50.922 25.365 L 49.800 26.330 49.681 36.753 L 49.562 47.176 48.369 48.370 L 47.176 49.563 36.629 49.681 C 26.914 49.791,26.016 49.860,25.241 50.562 L 24.400 51.324 24.400 200.000 L 24.400 348.676 25.241 349.438 C 26.011 350.136,26.982 350.217,36.726 350.400 L 47.370 350.600 48.285 351.959 C 49.181 353.290,49.200 353.540,49.200 363.830 L 49.200 374.342 50.254 375.171 L 51.308 376.000 200.000 376.000 L 348.692 376.000 349.746 375.171 L 350.800 374.342 350.800 363.740 L 350.800 353.138 351.969 351.969 L 353.138 350.800 363.069 350.795 C 374.232 350.788,374.604 350.739,375.416 349.169 C 376.300 347.459,376.300 52.541,375.416 50.831 C 374.604 49.261,374.232 49.212,363.069 49.205 L 353.138 49.200 351.969 48.031 L 350.800 46.862 350.800 37.011 C 350.800 27.557,350.618 25.850,349.490 24.709 C 348.841 24.054,76.104 23.348,74.600 23.998 M299.307 27.014 L 300.800 28.029 300.800 37.037 C 300.800 42.274,300.615 46.779,300.359 47.797 C 299.530 51.091,309.275 50.800,199.813 50.800 C 133.393 50.800,102.101 50.932,101.574 51.214 C 100.838 51.608,100.800 52.161,100.800 62.562 L 100.800 73.495 102.300 73.743 C 103.125 73.880,142.269 73.993,189.286 73.996 C 273.392 74.000,274.779 74.012,275.186 74.774 C 275.441 75.251,275.602 79.657,275.606 86.274 C 275.610 92.320,275.777 97.262,275.991 97.600 C 276.307 98.101,278.177 98.233,287.357 98.400 C 302.628 98.678,301.737 97.691,301.415 113.970 C 301.299 119.816,301.069 135.710,300.902 149.289 L 300.600 173.978 299.690 174.889 C 298.797 175.783,298.569 175.804,287.650 176.000 C 279.036 176.155,276.371 176.324,275.860 176.749 C 275.276 177.235,275.200 178.556,275.200 188.226 C 275.200 199.066,275.193 199.160,274.311 199.777 C 273.532 200.323,270.602 200.400,250.537 200.400 C 236.636 200.400,227.249 200.553,226.626 200.790 L 225.600 201.180 225.600 211.816 C 225.600 222.782,225.535 223.283,223.880 225.100 L 223.061 226.000 200.030 226.005 C 180.995 226.009,176.618 226.112,174.800 226.600 C 173.114 227.053,170.023 227.192,161.570 227.195 L 150.539 227.200 149.570 226.165 L 148.600 225.130 148.722 201.065 L 148.845 177.000 149.831 176.000 L 150.817 175.000 163.909 174.676 C 171.109 174.497,187.254 174.269,199.787 174.169 C 214.666 174.050,222.717 173.844,222.987 173.574 C 223.389 173.173,223.720 163.730,224.226 138.203 C 224.446 127.067,224.443 127.002,223.579 126.303 C 222.691 125.584,155.071 125.252,151.800 125.951 L 150.600 126.208 150.494 137.255 L 150.388 148.303 149.339 149.352 L 148.291 150.400 124.045 150.401 C 100.521 150.403,99.761 150.427,98.490 151.201 C 97.269 151.946,96.470 152.000,86.604 152.000 C 76.557 152.000,76.007 152.039,75.614 152.774 C 75.334 153.297,75.200 173.000,75.200 213.698 C 75.200 273.679,75.198 273.852,74.384 274.725 C 73.570 275.599,53.490 276.147,51.418 275.352 C 49.505 274.618,49.600 280.502,49.600 162.539 L 49.600 52.238 50.878 50.919 L 52.157 49.600 62.888 49.600 L 73.620 49.600 74.010 48.574 C 74.225 48.009,74.400 43.175,74.400 37.828 C 74.400 28.600,74.442 28.055,75.229 27.054 L 76.058 26.000 186.936 26.000 L 297.814 26.000 299.307 27.014 M76.000 75.991 C 75.497 76.309,75.379 78.081,75.271 86.970 L 75.141 97.570 76.071 97.797 C 76.582 97.923,81.680 97.974,87.400 97.912 L 97.800 97.800 97.913 87.600 C 97.974 81.990,97.926 76.995,97.805 76.500 L 97.585 75.600 87.092 75.606 C 81.189 75.610,76.338 75.778,76.000 75.991 M324.139 125.949 C 325.254 126.875,325.143 198.588,324.026 199.186 C 323.551 199.440,319.313 199.600,313.034 199.600 C 304.578 199.600,302.539 199.711,301.208 200.243 L 299.600 200.887 299.600 211.813 L 299.600 222.739 298.564 223.969 L 297.529 225.200 274.379 225.200 L 251.228 225.200 250.714 226.100 C 250.346 226.744,250.143 230.035,250.000 237.686 C 249.746 251.248,251.161 249.765,238.322 249.926 L 228.271 250.052 227.374 248.926 L 226.476 247.800 201.538 247.600 C 187.822 247.490,176.375 247.254,176.100 247.076 C 175.264 246.536,175.391 228.166,176.233 227.843 C 176.581 227.709,187.066 227.599,199.533 227.598 C 223.366 227.595,224.379 227.526,226.030 225.769 L 227.000 224.737 227.117 212.981 L 227.234 201.224 251.055 201.112 L 274.876 201.000 275.836 199.800 C 276.795 198.601,276.796 198.593,276.798 187.900 C 276.799 182.015,276.845 177.170,276.900 177.133 C 276.955 177.096,282.281 176.961,288.736 176.833 C 300.459 176.600,300.473 176.599,301.236 175.656 C 301.969 174.750,302.000 173.738,302.000 150.729 C 302.000 134.394,302.137 126.491,302.430 125.944 C 302.979 124.917,322.903 124.922,324.139 125.949 M223.195 137.100 C 223.192 142.985,223.082 148.201,222.950 148.691 L 222.712 149.581 199.570 149.691 C 177.981 149.793,176.380 149.848,175.714 150.514 C 175.076 151.151,174.979 152.342,174.800 161.678 L 174.600 172.130 173.200 172.635 C 172.215 172.990,168.647 173.148,161.156 173.170 L 150.512 173.200 149.038 174.200 L 147.564 175.200 125.082 175.194 C 112.717 175.191,102.382 175.049,102.116 174.880 C 100.704 173.983,100.400 171.782,100.400 162.458 L 100.400 153.291 101.760 152.646 C 102.963 152.075,105.777 152.000,126.044 152.000 L 148.966 152.000 150.483 150.519 L 152.000 149.038 152.000 137.985 C 152.000 131.907,152.120 126.813,152.267 126.667 C 152.413 126.520,168.433 126.400,187.867 126.400 L 223.200 126.400 223.195 137.100 M173.904 248.800 C 175.924 249.568,176.979 249.600,200.235 249.600 L 224.462 249.600 225.631 250.769 L 226.800 251.938 226.800 262.382 C 226.800 270.760,226.681 273.110,226.200 274.262 C 225.711 275.431,225.600 277.951,225.600 287.830 L 225.600 299.962 224.100 300.379 C 223.141 300.645,214.234 300.798,199.400 300.802 C 180.012 300.808,175.877 300.907,174.236 301.404 C 170.940 302.404,150.818 302.267,149.544 301.236 L 148.600 300.471 148.481 276.536 C 148.355 251.096,148.374 250.650,149.640 249.041 L 150.458 248.000 161.129 248.000 C 170.831 248.000,171.991 248.073,173.904 248.800 M249.520 275.680 C 250.213 276.373,250.213 323.627,249.520 324.320 C 248.960 324.880,177.770 325.022,176.893 324.466 C 175.340 323.480,174.863 303.222,176.374 302.414 C 176.883 302.142,185.415 302.000,201.297 302.000 C 221.509 302.000,225.574 301.908,226.224 301.433 C 226.955 300.899,227.012 300.154,227.200 288.533 C 227.310 281.750,227.546 275.975,227.724 275.700 C 228.179 274.996,248.817 274.977,249.520 275.680" stroke="none" fill="rgb(var(--tc-color-7))" fill-rule="evenodd"></path><path d="M75.229 27.054 C 74.442 28.055,74.400 28.600,74.400 37.828 C 74.400 43.175,74.225 48.009,74.010 48.574 L 73.620 49.600 62.888 49.600 L 52.157 49.600 50.878 50.919 L 49.600 52.238 49.600 162.539 C 49.600 280.502,49.505 274.618,51.418 275.352 C 53.490 276.147,73.570 275.599,74.384 274.725 C 75.198 273.852,75.200 273.679,75.200 213.698 C 75.200 173.000,75.334 153.297,75.614 152.774 C 76.007 152.039,76.557 152.000,86.604 152.000 C 96.470 152.000,97.269 151.946,98.490 151.201 C 99.761 150.427,100.521 150.403,124.045 150.401 L 148.291 150.400 149.339 149.352 L 150.388 148.303 150.494 137.255 L 150.600 126.208 151.800 125.951 C 155.071 125.252,222.691 125.584,223.579 126.303 C 224.443 127.002,224.446 127.067,224.226 138.203 C 223.720 163.730,223.389 173.173,222.987 173.574 C 222.717 173.844,214.666 174.050,199.787 174.169 C 187.254 174.269,171.109 174.497,163.909 174.676 L 150.817 175.000 149.831 176.000 L 148.845 177.000 148.722 201.065 L 148.600 225.130 149.570 226.165 L 150.539 227.200 161.570 227.195 C 170.023 227.192,173.114 227.053,174.800 226.600 C 176.618 226.112,180.995 226.009,200.030 226.005 L 223.061 226.000 223.880 225.100 C 225.535 223.283,225.600 222.782,225.600 211.816 L 225.600 201.180 226.626 200.790 C 227.249 200.553,236.636 200.400,250.537 200.400 C 270.602 200.400,273.532 200.323,274.311 199.777 C 275.193 199.160,275.200 199.066,275.200 188.226 C 275.200 178.556,275.276 177.235,275.860 176.749 C 276.371 176.324,279.036 176.155,287.650 176.000 C 298.569 175.804,298.797 175.783,299.690 174.889 L 300.600 173.978 300.902 149.289 C 301.069 135.710,301.299 119.816,301.415 113.970 C 301.737 97.691,302.628 98.678,287.357 98.400 C 278.177 98.233,276.307 98.101,275.991 97.600 C 275.777 97.262,275.610 92.320,275.606 86.274 C 275.602 79.657,275.441 75.251,275.186 74.774 C 274.779 74.012,273.392 74.000,189.286 73.996 C 142.269 73.993,103.125 73.880,102.300 73.743 L 100.800 73.495 100.800 62.562 C 100.800 52.161,100.838 51.608,101.574 51.214 C 102.101 50.932,133.393 50.800,199.813 50.800 C 309.275 50.800,299.530 51.091,300.359 47.797 C 300.615 46.779,300.800 42.274,300.800 37.037 L 300.800 28.029 299.307 27.014 L 297.814 26.000 186.936 26.000 L 76.058 26.000 75.229 27.054 M273.986 75.974 C 274.239 76.447,274.401 80.601,274.402 86.674 C 274.404 95.943,274.632 98.507,275.586 100.000 C 275.907 100.501,277.787 100.633,287.018 100.800 C 297.366 100.987,298.102 101.049,298.633 101.776 C 299.559 103.044,299.471 171.404,298.542 173.354 L 297.883 174.734 286.906 174.867 L 275.928 175.000 275.164 175.944 C 274.454 176.822,274.400 177.655,274.400 187.795 C 274.400 196.360,274.286 198.796,273.870 199.142 C 273.502 199.448,266.093 199.615,249.512 199.691 C 226.725 199.795,225.647 199.833,224.842 200.562 C 224.025 201.301,224.000 201.652,224.000 212.200 C 224.000 222.059,223.935 223.133,223.300 223.685 C 222.372 224.492,153.126 225.114,151.406 224.330 C 149.934 223.659,149.969 224.302,150.089 199.600 L 150.200 177.000 151.600 176.523 C 152.640 176.168,161.920 176.039,187.720 176.023 C 226.512 175.997,224.531 176.142,224.949 173.309 C 225.072 172.479,225.290 161.630,225.435 149.200 L 225.697 126.600 224.807 125.800 C 223.901 124.987,158.708 124.273,152.500 125.009 C 149.076 125.414,149.200 124.951,149.200 137.380 C 149.200 145.638,149.078 148.399,148.700 148.700 C 147.840 149.385,75.886 149.533,75.063 148.851 C 74.460 148.351,74.400 146.220,74.400 125.180 L 74.400 102.058 75.454 101.229 C 76.460 100.438,76.991 100.400,87.048 100.400 L 97.587 100.400 98.894 99.234 L 100.200 98.067 100.400 87.398 C 100.599 76.778,100.604 76.724,101.544 75.964 C 103.039 74.755,273.339 74.765,273.986 75.974 M97.805 76.500 C 97.926 76.995,97.974 81.990,97.913 87.600 L 97.800 97.800 87.400 97.912 C 81.680 97.974,76.582 97.923,76.071 97.797 L 75.141 97.570 75.271 86.970 C 75.379 78.081,75.497 76.309,76.000 75.991 C 76.338 75.778,81.189 75.610,87.092 75.606 L 97.585 75.600 97.805 76.500 M149.640 249.041 C 148.374 250.650,148.355 251.096,148.481 276.536 L 148.600 300.471 149.544 301.236 C 150.818 302.267,170.940 302.404,174.236 301.404 C 175.877 300.907,180.012 300.808,199.400 300.802 C 214.234 300.798,223.141 300.645,224.100 300.379 L 225.600 299.962 225.600 287.830 C 225.600 277.951,225.711 275.431,226.200 274.262 C 226.681 273.110,226.800 270.760,226.800 262.382 L 226.800 251.938 225.631 250.769 L 224.462 249.600 200.235 249.600 C 176.979 249.600,175.924 249.568,173.904 248.800 C 171.991 248.073,170.831 248.000,161.129 248.000 L 150.458 248.000 149.640 249.041 M223.751 251.296 C 224.838 251.856,224.369 297.369,223.265 298.452 C 222.488 299.214,151.981 299.947,150.800 299.206 C 150.280 298.880,150.185 295.708,150.091 275.367 C 149.976 250.830,149.964 251.020,151.729 250.681 C 153.580 250.326,223.018 250.919,223.751 251.296" stroke="none" fill="rgb(var(--tc-color-10))" fill-rule="evenodd"></path><path d="M101.544 75.964 C 100.604 76.724,100.599 76.778,100.400 87.398 L 100.200 98.067 98.894 99.234 L 97.587 100.400 87.048 100.400 C 76.991 100.400,76.460 100.438,75.454 101.229 L 74.400 102.058 74.400 125.180 C 74.400 146.220,74.460 148.351,75.063 148.851 C 75.886 149.533,147.840 149.385,148.700 148.700 C 149.078 148.399,149.200 145.638,149.200 137.380 C 149.200 124.951,149.076 125.414,152.500 125.009 C 158.708 124.273,223.901 124.987,224.807 125.800 L 225.697 126.600 225.435 149.200 C 225.290 161.630,225.072 172.479,224.949 173.309 C 224.531 176.142,226.512 175.997,187.720 176.023 C 161.920 176.039,152.640 176.168,151.600 176.523 L 150.200 177.000 150.089 199.600 C 149.969 224.302,149.934 223.659,151.406 224.330 C 153.126 225.114,222.372 224.492,223.300 223.685 C 223.935 223.133,224.000 222.059,224.000 212.200 C 224.000 201.652,224.025 201.301,224.842 200.562 C 225.647 199.833,226.725 199.795,249.512 199.691 C 266.093 199.615,273.502 199.448,273.870 199.142 C 274.286 198.796,274.400 196.360,274.400 187.795 C 274.400 177.655,274.454 176.822,275.164 175.944 L 275.928 175.000 286.906 174.867 L 297.883 174.734 298.542 173.354 C 299.471 171.404,299.559 103.044,298.633 101.776 C 298.102 101.049,297.366 100.987,287.018 100.800 C 277.787 100.633,275.907 100.501,275.586 100.000 C 274.632 98.507,274.404 95.943,274.402 86.674 C 274.401 80.601,274.239 76.447,273.986 75.974 C 273.339 74.765,103.039 74.755,101.544 75.964 M273.600 88.103 C 273.600 98.341,273.854 101.007,274.893 101.666 C 275.172 101.843,280.283 101.991,286.251 101.994 C 294.792 101.999,297.196 102.113,297.544 102.533 C 297.864 102.918,297.914 112.722,297.727 137.933 L 297.468 172.800 286.908 172.800 C 272.414 172.800,273.600 171.502,273.600 187.368 L 273.600 198.776 249.061 198.888 C 229.085 198.979,224.401 199.101,223.867 199.544 C 223.293 200.021,223.199 201.504,223.106 211.544 L 223.000 223.000 188.400 223.110 C 169.370 223.171,153.395 223.122,152.900 223.002 L 152.000 222.785 152.000 200.057 L 152.000 177.330 168.500 177.066 C 177.575 176.920,193.874 176.801,204.720 176.801 C 225.651 176.800,226.430 176.734,226.940 174.904 C 227.048 174.517,227.258 163.455,227.408 150.322 L 227.680 126.444 226.658 125.422 L 225.636 124.400 187.467 124.400 C 156.147 124.400,149.219 124.496,148.855 124.933 C 148.561 125.289,148.377 129.263,148.306 136.833 L 148.200 148.200 113.400 148.314 C 94.260 148.376,78.015 148.323,77.300 148.196 L 76.000 147.964 76.000 125.405 C 76.000 107.798,76.110 102.776,76.500 102.524 C 76.775 102.346,82.040 102.110,88.200 102.000 C 103.194 101.732,102.000 102.894,102.000 88.573 C 102.000 83.234,102.109 78.581,102.243 78.233 C 102.463 77.658,110.395 77.600,188.043 77.600 L 273.600 77.600 273.600 88.103 M151.729 250.681 C 149.964 251.020,149.976 250.830,150.091 275.367 C 150.185 295.708,150.280 298.880,150.800 299.206 C 151.981 299.947,222.488 299.214,223.265 298.452 C 224.369 297.369,224.838 251.856,223.751 251.296 C 223.018 250.919,153.580 250.326,151.729 250.681 M223.000 274.600 L 223.000 297.400 188.043 297.701 C 162.323 297.923,152.942 297.884,152.543 297.552 C 151.774 296.915,151.732 252.175,152.500 251.864 C 152.775 251.752,168.750 251.692,188.000 251.730 L 223.000 251.800 223.000 274.600" stroke="none" fill="#fff" fill-rule="evenodd"></path><path d="M102.243 78.233 C 102.109 78.581,102.000 83.234,102.000 88.573 C 102.000 102.894,103.194 101.732,88.200 102.000 C 82.040 102.110,76.775 102.346,76.500 102.524 C 76.110 102.776,76.000 107.798,76.000 125.405 L 76.000 147.964 77.300 148.196 C 78.015 148.323,94.260 148.376,113.400 148.314 L 148.200 148.200 148.306 136.833 C 148.377 129.263,148.561 125.289,148.855 124.933 C 149.219 124.496,156.147 124.400,187.467 124.400 L 225.636 124.400 226.658 125.422 L 227.680 126.444 227.408 150.322 C 227.258 163.455,227.048 174.517,226.940 174.904 C 226.430 176.734,225.651 176.800,204.720 176.801 C 193.874 176.801,177.575 176.920,168.500 177.066 L 152.000 177.330 152.000 200.057 L 152.000 222.785 152.900 223.002 C 153.395 223.122,169.370 223.171,188.400 223.110 L 223.000 223.000 223.106 211.544 C 223.199 201.504,223.293 200.021,223.867 199.544 C 224.401 199.101,229.085 198.979,249.061 198.888 L 273.600 198.776 273.600 187.368 C 273.600 171.502,272.414 172.800,286.908 172.800 L 297.468 172.800 297.727 137.933 C 297.914 112.722,297.864 102.918,297.544 102.533 C 297.196 102.113,294.792 101.999,286.251 101.994 C 280.283 101.991,275.172 101.843,274.893 101.666 C 273.854 101.007,273.600 98.341,273.600 88.103 L 273.600 77.600 188.043 77.600 C 110.395 77.600,102.463 77.658,102.243 78.233 M152.500 251.864 C 151.732 252.175,151.774 296.915,152.543 297.552 C 152.942 297.884,162.323 297.923,188.043 297.701 L 223.000 297.400 223.000 274.600 L 223.000 251.800 188.000 251.730 C 168.750 251.692,152.775 251.752,152.500 251.864" stroke="none" fill="#fff" fill-rule="evenodd"></path></svg>`,
                    discordQuestionIcon = document.querySelector('.gameIcon-gg34Dz[style*="/assets/a5eba102f5b5e413df2b65c73f288afa.svg"]:empty');
                if (node && node.tagName && discordQuestionIcon) {
                    discordQuestionIcon.innerHTML = questionBlock;
                }

                // Joined voice chat
                if (node && node.tagName && node.classList.contains("container-1UB9sr")) {
                  this.insertVoiceConnected();
                }

                // Add identifier classes to the sub nav buttons
                if (document.getElementsByClassName('iconMargin-2YXk4F')) {
                  let iconParent = document.getElementsByClassName('iconMargin-2YXk4F');
                  for (var i = 0; i < iconParent.length; i++) {
                    if (iconParent[i].querySelector('.icon-1R19_H[name="VideoCamera"]')) {
                      iconParent[i].classList.add('tc-discordVideoCallButton');
                    }
                    if (iconParent[i].querySelector('.icon-1R19_H[name="NotificationBell"], .icon-1R19_H[name="NotificationBellOff"]')) {
                      iconParent[i].classList.add('tc-discordNotificationsButton');
                    }
                    if (iconParent[i].querySelector('.icon-1R19_H[name="Pin"]')) {
                      iconParent[i].classList.add('tc-discordPinButton');
                    }
                    if (iconParent[i].querySelector('.icon-1R19_H[name="People"]')) {
                      iconParent[i].classList.add('tc-discordMembersListButton');
                    }
                    if (iconParent[i].querySelector('.icon-1R19_H[name="Phone"]')) {
                      iconParent[i].classList.add('tc-discordCallButton');
                    }
                    if (iconParent[i].querySelector('.icon-1R19_H[name="PersonPlus"]')) {
                      iconParent[i].classList.add('tc-discordGroupDMButton');
                    }
                    if (iconParent[i].querySelector('.icon-1R19_H[name="QuestionMark"]')) {
                      iconParent[i].classList.add('tc-discordHelpButton');
                    }
                    if (iconParent[i].querySelector('.icon-1R19_H[name="Update"]')) {
                      iconParent[i].classList.add('tc-discordUpdateButton');
                      let tcUpdateBtn = document.getElementsByClassName('tc-titleWrapper-account-update-outer')[0];
                      if (!tcUpdateBtn.classList.contains('listener-added')) {
                        tcUpdateBtn.classList.add('listener-added');
                        new tcTooltip(tcUpdateBtn, {side: 'bottom'});
                        tcUpdateBtn.addEventListener('click', () => {
                          let discordUpdateBtn = document.querySelector('.icon-1R19_H[name="Update"]').parentNode;
                          tcUpdateBtn.getElementsByClassName('tc-titleWrapper-account-update').classList.add('updating');
                          discordUpdateBtn.click();
                        }, false);
                      }
                    }
                    if (iconParent[i].querySelector('.icon-1R19_H[name="Mention"]')) {
                      iconParent[i].classList.add('tc-discordMentionButton');
                      let tcNotificationsBtn = document.getElementsByClassName('tc-titleWrapper-account-mentions-outer')[0];
                      if (!tcNotificationsBtn.classList.contains('listener-added')) {
                        tcNotificationsBtn.classList.add('listener-added');
                        new tcTooltip(tcNotificationsBtn, {side: 'bottom'});
                        tcNotificationsBtn.addEventListener('click', () => {
                          let discordMentionBtn = document.querySelector('.icon-1R19_H[name="Mention"]').parentNode;
                          discordMentionBtn.click();
                        }, false);
                      }
                    }
                  }
                }

                // Adding tc-systemMessage class to system message message groups
                if (document.getElementsByClassName('container-3-pyIM')) {
                  let systemMessage = document.getElementsByClassName('container-3-pyIM');
                  for (var i = 0; i < systemMessage.length; i++) {
                    systemMessage[i].closest('.container-1YxwTf').classList.add('tc-systemMessage');
                  }
                }

                    // New message-group addeded
                if (node && node.tagName && node.classList.contains("container-1YxwTf"))/* ||
                    // New user appears on members list
                    (node && node.tagName && node.classList.contains("member-3W1lQa")))*/ {
                  // this.setUserIdAndBadges(node);
                }

                // Switch Channels
                if (node && node.tagName && node.classList.contains("messagesWrapper-3lZDfY")) {
                  // this.setUserIdAndBadges();
                }

                // If bot badge added
                if (node && node.tagName && node.classList.contains('botTag-2WPJ74')) {
                    node.dataset.tcTooltip = "Bot User";
                    new tcTooltip(badge);
                }

                // Switch to Servers
                if (node && node.tagName && document.querySelector('.container-2Rl01u')) {
                    this.switchToServers();
                    this.insertTopNav('serverView');
                    // this.giphy();
                }

                // Switch to Activity
                if (node && node.tagName && document.querySelector(".activityFeed-1C0EmJ")) {
                    this.switchToActivity();
                    this.insertTopNav('activityView');
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

                // Switch to Store
                if (node && node.tagName && document.querySelector('.applicationStore-1pNvnv')) {
                  this.switchToStore();
                  this.insertTopNav('storeView');
                }

                // Switch to DMs
                if (node && node.tagName && document.querySelector('.privateChannels-1nO12o') && document.querySelector(".chat-3bRxxu")) {
                    this.switchToDMs();
                    this.insertTopNav('messagesView');
                    // this.giphy();
                }

                // Switch to Friends
                if (node && node.tagName && document.querySelector(".container-3gCOGc")) {
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
    let channelStore = this.WebpackModules.findByUniqueProperties(["getChannel", "getChannels"]),
        selectedChannelStore = this.WebpackModules.findByUniqueProperties(["getChannelId", "getVoiceChannelId"]),
        selectedVoiceChannel = channelStore.getChannel(selectedChannelStore.getVoiceChannelId()),
        userStore = this.WebpackModules.findByUniqueProperties(['getUser']),
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

      new tcTooltip(voiceDisconnect);
      new tcTooltip(voiceDeafen);
      new tcTooltip(voiceMute);

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
  //
  // setUserIdAndBadges (node) {
  //   if (!node) {
  //     let messageGroups = document.getElementsByClassName("container-1YxwTf"),
  //         usernameWrapper = document.querySelector('.username-_4ZSMR');
  //     if (messageGroups && usernameWrapper) {
  //       for(var x=0; x < messageGroups.length; x++) {
  //         this.setUserIdAndBadges(messageGroups[x]);
  //       }
  //     }
  //   } else {
  //     node.dataset.userId = tc.react.getProp(node, "messages.0.author.id");
  //     let insertionPoint = node.getElementsByClassName('username-_4ZSMR')[0];
  //     if (!insertionPoint) return;
  //     for(let group in this.userBadgeGroups) {
  //       for(let [key, value] of Object.entries(this.userBadgeGroups[group])) {
  //         if (tc.react.getProp(node, "messages.0.author.id") == (key, value)) {
  //           let tcUserBadgeContainer = node.querySelector('.tc-userBadge-container'),
  //               tcUserBadges = node.querySelectorAll('.tc-userBadge-badge');
  //           if (!tcUserBadgeContainer && tcUserBadges.length < 2) {
  //             let groupFirstWord = group.replace(/ .*/,'');
  //             let tcUserBadgeContainerDivs = `
  //               <div class="tc-userBadge-container">
  //                 <div class="tc-userBadge-badge ${groupFirstWord.toLowerCase()}" data-tc-tooltip="${group}"></div>
  //               </div>
  //             `;
  //             insertionPoint.insertAdjacentHTML('beforebegin', tcUserBadgeContainerDivs);
  //             let tcBadge = node.querySelector('.tc-userBadge-badge');
  //             new tcTooltip(tcBadge);
  //           } else if (tcUserBadgeContainer && tcUserBadges.length < 2) {
  //             let groupFirstWord = group.replace(/ .*/,'');
  //             if (tcUserBadges[0].classList.contains(groupFirstWord.toLowerCase())) { return; }
  //             else {
  //               tcUserBadgeContainer.insertAdjacentHTML('beforeend', `<div class="tc-userBadge-badge ${groupFirstWord.toLowerCase()}" data-tc-tooltip="${group}"></div>`);
  //               let tcBadge = node.querySelector('.tc-userBadge-badge:nth-of-type(2)');
  //               new tcTooltip(tcBadge);
  //             }
  //           }
  //         }
  //       }
  //     }
  //     let badgeContainer = node.getElementsByClassName('tc-userBadge-container')[0],
  //         badge = node.getElementsByClassName('tc-userBadge-badge');
  //     if (badgeContainer && badge.length < 2) {
  //       if (badge.length == 0 || (badge.length == 1 && !badge[0].classList.contains('nitro'))) {
  //         let avatar = node.getElementsByClassName('image-33JSyf')[0];
  //         if (avatar && avatar.style.backgroundImage.includes("/a_")) {
  //           badgeContainer.insertAdjacentHTML('beforeend', '<div class="tc-userBadge-badge nitro" data-tc-tooltip="Nitro User"></div>');
  //           let tcBadge = node.querySelector('.tc-userBadge-badge:nth-of-type(2)');
  //           new tcTooltip(tcBadge);
  //         }
  //       }
  //     } else {
  //       if (!badgeContainer) {
  //         let avatar = node.getElementsByClassName('image-33JSyf')[0];
  //         if (avatar && avatar.style.backgroundImage.includes("/a_")) {
  //           insertionPoint.insertAdjacentHTML('beforebegin', '<div class="tc-userBadge-container">' +
  //                                                             '<div class="tc-userBadge-badge nitro" data-tc-tooltip="Nitro User"></div>' +
  //                                                           '</div>');
  //           let tcBadge = node.querySelector('.tc-userBadge-badge');
  //           new tcTooltip(tcBadge);
  //         }
  //       }
  //     }
  //   }
  // }

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

async switchToActivity () {

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

  new tcTooltip(refreshFriends);
  new tcTooltip(tileButton);
  new tcTooltip(gridButton);
  new tcTooltip(filterOptions);

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

async switchToStore () {
  let sortGames = document.getElementsByClassName('distributionApplicationsSort-2_uq5y'),
      storeMediaViewButtonContainer = document.getElementsByClassName('tc-storemediaview')[0],
      storeMediaViewButtonDivs = `<div class="tc-storemediaview">
                                     <i class="tc-storemediaview-icon" data-tc-tooltip="Media View"></i>
                                  </div>`;

  if (sortGames[0]) {
    if (!storeMediaViewButtonContainer) {
      sortGames[0].parentElement.insertAdjacentHTML('beforeend', storeMediaViewButtonDivs);

      let storeMediaViewButton = document.getElementsByClassName('tc-storemediaview-icon')[0];

      new tcTooltip(storeMediaViewButton, {side: 'right'});

      storeMediaViewButton.addEventListener('click', function() {
        if (document.documentElement.classList.contains('storeMediaView')) {
          document.documentElement.classList.remove('storeMediaView');
          document.documentElement.classList.add('storeNormalView');
        } else {
          document.documentElement.classList.remove('storeNormalView');
          document.documentElement.classList.add('storeMediaView');
        }
      }, false);
    }
  } else {
    return;
  }
}

async switchToLFG () {

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
  if (document.querySelector('.container-3gCOGc') || document.querySelector('.activityFeed-1C0EmJ')) return;
  let ChannelInfo = document.getElementsByClassName('titleText-3X-zRE')[0].getElementsByClassName('tc-channelInfo')[0];
  const activityTypes = ["Playing", "Streaming", "Listening to", "Watching"];
  switch (destination) {
    case 'server':
      var SelectedStore = this.WebpackModules.findByUniqueProperties(['getLastSelectedGuildId']),
          Store = this.WebpackModules.findByUniqueProperties(['getGuild']),
          Current = Store.getGuild(SelectedStore.getGuildId()),
          SelectedChannelStore = this.WebpackModules.findByUniqueProperties(['getLastSelectedChannelId']),
          ChannelStore = this.WebpackModules.findByUniqueProperties(['getChannel']),
          CurrentChannel = ChannelStore.getChannel(SelectedChannelStore.getChannelId());
      break;
    case 'dm':
      var SelectedStore = this.WebpackModules.findByUniqueProperties(['getLastSelectedChannelId']),
          Store = this.WebpackModules.findByUniqueProperties(['getChannel']),
          Current = Store.getChannel(SelectedStore.getChannelId()),
          SelectedChannelStore = this.WebpackModules.findByUniqueProperties(['getLastSelectedChannelId']),
          ChannelStore = this.WebpackModules.findByUniqueProperties(['getChannel']),
          CurrentChannel = ChannelStore.getChannel(SelectedChannelStore.getChannelId()),
          userStore = this.WebpackModules.findByUniqueProperties(['getUser']),
          obj = userStore.getUser(Current.recipients[0]),
          userPresence = this.WebpackModules.findByUniqueProperties(['getApplicationActivity']),
          activity = userPresence.getPrimaryActivity(Current.recipients[0]);
      break;
  }

  let avatarUrl = Current.getIconURL();

  if (!ChannelInfo) {
    let discordHeader = document.getElementsByClassName('titleText-3X-zRE')[0],
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
    let tabBar = document.getElementsByClassName('tabBar-1E2ExX')[0],
        addFriendContainer = document.getElementsByClassName('tc-addFriend')[0],
        friendsListOptionsContainer = document.getElementsByClassName('tc-friendsListOptions')[0],
        newGroupDMButton = document.querySelector('.container-3gCOGc .headerBar-UHpsPw svg[name="Compose"]'),
        addFriendButton = document.querySelector('.container-3gCOGc .headerBar-UHpsPw #addFriends'),
        friendPlaceholder = document.getElementsByClassName('tc-friendPlaceholder')[0],
        friendsRowContainer = document.querySelector('.container-3gCOGc .friendsTableBody-1ZhKif>div'),
        DiscordAddFriendsButton = document.querySelector('.container-3gCOGc .tabBar-1E2ExX .item-PXvHYJ.primary-3j8BhM');

    let addFriendOptions = `<div class="tc-addFriend">
                              <div class="tc-addFriend-howmany">00</div>
                              <div class="tc-addFriend-text-contain">
                                <div class="tc-addFriend-peopleare">people are</div>
                                <div class="tc-addFriend-active">error</div>
                              </div>
                            </div>`;

    let friendsListOptions = `<div class="tc-friendsListOptions">
                                <ul class="tc-friendsListOptions-ul">
                                  <li class="tc-friendsListOptions-li">
                                      <div class="tc-friendsListOptions-item">
                                        <i class="tc-icon refresh tc-friendsListOptions-refresh" data-tc-tooltip="Refresh"></i>
                                      </div>
                                  </li>
                                  <li class="tc-friendsListOptions-li">
                                      <div class="tc-friendsListOptions-item">
                                        <i class="tc-icon userbgs tc-friendsListOptions-background-tile" data-tc-tooltip="Default View"></i>
                                      </div>
                                  </li>
                                  <li class="tc-friendsListOptions-li">
                                      <div class="tc-friendsListOptions-item">
                                        <i class="tc-icon tile tc-friendsListOptions-tile" data-tc-tooltip="Tile View"></i>
                                      </div>
                                  </li>
                                  <li class="tc-friendsListOptions-li">
                                      <div class="tc-friendsListOptions-item">
                                        <i class="tc-icon grid tc-friendsListOptions-grid" data-tc-tooltip="Grid View"></i>
                                      </div>
                                  </li>
                                  <li class="tc-friendsListOptions-li">
                                    <div class="tc-friendsListOptions-item">
                                      <i class="tc-icon filter-options tc-friendsListOptions-options" data-tc-tooltip="Filter Options"></i>
                                    </div>
                                  </li>
                                </ul>
                                <div class="tc-friendsListOptions-filter-container">
                                  <div class="tc-friendsListOptions-filter">
                                      <input type="text" class="tc-input filter tc-friendsListOptions-filter-input" value="" placeholder="Filter by name">
                                      <label class="tc-label search">
                                      <i class="tc-icon search"></i>
                                      </label>
                                      <div class="tc-input-reset">
                                      <i class="tc-icon close"></i>
                                    </div>
                                  </div>
                                </div>
                            </div>`;

    let friendPlaceholderDivs = `<div class="friendsRow-2yicud tc-friendPlaceholder"></div>
                                 <div class="friendsRow-2yicud tc-friendPlaceholder"></div>
                                 <div class="friendsRow-2yicud tc-friendPlaceholder"></div>
                                 <div class="friendsRow-2yicud tc-friendPlaceholder"></div>
                                 <div class="friendsRow-2yicud tc-friendPlaceholder"></div>
                                 <div class="friendsRow-2yicud tc-friendPlaceholder"></div>
                                 <div class="friendsRow-2yicud tc-friendPlaceholder"></div>
                                 <div class="friendsRow-2yicud tc-friendPlaceholder"></div>`;

    function addFriendsButton () {
      if (DiscordAddFriendsButton) DiscordAddFriendsButton.click();
    }

    if (newGroupDMButton && !addFriendButton) {
      const addFriend = document.createElement('div');
      addFriend.id = "addFriends";

      addFriend.dataset.tcTooltip = "Add Friend";

      newGroupDMButton.parentNode.prepend(addFriend);
      new tcTooltip(addFriend, {side: 'bottom'});
      addFriend.addEventListener('click', addFriendsButton, false);
    }

    if (tabBar) {
      if (!addFriendContainer) tabBar.insertAdjacentHTML('afterbegin', addFriendOptions);
      if (!friendsListOptionsContainer) tabBar.insertAdjacentHTML('afterend', friendsListOptions);
      if (!friendPlaceholder && friendsRowContainer && friendsRowContainer.children.length > 0) friendsRowContainer.insertAdjacentHTML('beforeend', friendPlaceholderDivs);
      if (friendsRowContainer && friendsRowContainer.lastElementChild && !friendsRowContainer.lastElementChild.classList.contains("tc-friendPlaceholder")) {
        let friendPlaceholder = document.getElementsByClassName('tc-friendPlaceholder')[0];
        while (friendPlaceholder && friendPlaceholder.parentNode) {
          friendPlaceholder.parentNode.removeChild(friendPlaceholder);
        }
        friendsRowContainer.insertAdjacentHTML('beforeend', friendPlaceholderDivs);
      }
    }


    let friendsFilterInput = document.getElementsByClassName('tc-friendsListOptions-filter-input')[0];

    friendsFilterInput.addEventListener('input', friendsNameFilter, false);

    function friendsNameFilter() {
      var input = document.getElementsByClassName('tc-friendsListOptions-filter-input')[0],
          filter = input.value.toUpperCase(),
          friendsRowContainer = document.querySelector('.container-3gCOGc .scroller-2FKFPG > div'),
          item = friendsRowContainer.querySelectorAll('.friendsRow-2yicud:not(.tc-friendPlaceholder)'),
          friendsContainer = document.getElementByClassName('container-3gCOGc').getElementsByClassName('scroller-2FKFPG')[0];

      // Loop through all list items, and hide those who don't match the search query
      let counter = 0;
      for (let i = 0; i < item.length; i++) {
          var username = item[i].getElementsByClassName("username")[0];
          if (username.innerHTML.toUpperCase().indexOf(filter) > -1) {
              item[i].style.display = "flex";
              counter++;
          } else {
              item[i].style.display = "none";
          }
      }
      if (counter == 0) {
        friendsContainer.dataset.noResults = 'No results match your search criteria.';
      } else {
        friendsContainer.dataset.noResults = '';
      }
    }

    if (friendsRowContainer) {
        var countKeeper = 0;
        for (var i = 0; i < friendsRowContainer.children.length; i++) {
          if (friendsRowContainer.children[i].classList.contains("friendsRow-2yicud") && !friendsRowContainer.children[i].classList.contains("tc-friendPlaceholder")) {
            countKeeper++;
          }
        }
      document.getElementsByClassName('tc-addFriend')[0].getElementsByClassName('tc-addFriend-howmany')[0].textContent = countKeeper;
    }

    let currentlyActive = document.querySelector('.container-3gCOGc .item-PXvHYJ.itemSelected-1qLhcL').childNodes[0].nodeValue;
    document.getElementsByClassName('tc-addFriend-active')[0].textContent = ((currentlyActive == 'All') ? (currentlyActive = 'Friends') : currentlyActive);

    let refreshFriends = document.getElementsByClassName('tc-friendsListOptions-refresh')[0],
        backgroundTileButton = document.getElementsByClassName('tc-friendsListOptions-background-tile')[0],
        tileButton = document.getElementsByClassName('tc-friendsListOptions-tile')[0],
        gridButton = document.getElementsByClassName('tc-friendsListOptions-grid')[0],
        filterOptions = document.getElementsByClassName('tc-friendsListOptions-options')[0];

    new tcTooltip(refreshFriends);
    new tcTooltip(backgroundTileButton);
    new tcTooltip(tileButton);
    new tcTooltip(gridButton);
    new tcTooltip(filterOptions);

    refreshFriends.addEventListener('click', function() {
      refreshFriends.classList.add('tc-refreshing');
      setTimeout(() => { refreshFriends.classList.remove('tc-refreshing'); }, 1000);
    }, false);

    backgroundTileButton.addEventListener('click', function() {
      document.documentElement.classList.add('friendsBackgroundTile');
      document.documentElement.classList.remove('friendsTile');
      document.documentElement.classList.remove('friendsGrid');
    }, false);

    tileButton.addEventListener('click', function() {
      document.documentElement.classList.add('friendsTile');
      document.documentElement.classList.remove('friendsBackgroundTile');
      document.documentElement.classList.remove('friendsGrid');
    }, false);

    gridButton.addEventListener('click', function() {
      document.documentElement.classList.add('friendsGrid');
      document.documentElement.classList.remove('friendsTile');
      document.documentElement.classList.remove('friendsBackgroundTile');
    }, false);

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
    const header = document.querySelector('.userPopout-3XzG_A .avatarWrapper-3H_478'),
          userPopout = document.querySelector('.userPopout-3XzG_A');
    if (!header) {
      return;
    }

    userPopout.parentElement.classList.add('tc-fixLeftUserPopout');

    // const id = header.children[0].children[0].style.backgroundImage.split('/')[4];
    // if (this.userProfileImages[id]) {
    //   header.style.backgroundImage = `url("${this.userProfileImages[id]}")`;
    // }
  }

  imageModalCheck () {

  }

  keyBindFunctions (e) {
    const globalSearchInput = document.getElementsByClassName('tc-titleWrapper-nav-global-search-input')[0];

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
    const globalSearchInput = document.getElementsByClassName('tc-titleWrapper-nav-global-search-input')[0],
          globalSearchOuter = document.getElementsByClassName('tc-titleWrapper-nav-global-search-outer')[0];

    if (!globalSearchOuter) return;

    var openQuickswitcher = this.WebpackModules.findByUniqueProperties(['QUICKSWITCHER_SHOW']).QUICKSWITCHER_SHOW,
        closeAllModals = this.WebpackModules.findByUniqueProperties(['push', 'update', 'pop', 'popWithKey']);

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
          var quickSwitcher = '.tc-titleWrapper-nav-global-search-input, .container-3qKHyN, .container-3qKHyN *',
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
      while(!roleName) await new Promise(p => setTimeout(p, 10));
      roleName.style.color = roleColor;
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
    if (
      !header ||
      !header.children[0] ||
      !header.children[0].children[0]
    ) {
      return;
    }

    // const id = header.children[0].children[0].style.backgroundImage.split('/')[4];
    // if (this.userProfileImages[id]) {
    //   header.style.backgroundImage = `url("${this.userProfileImages[id]}")`;
    // }
  }

  async injectUserStatus () {
    const tcTitlewrapperheader = document.getElementsByClassName('tc-titleWrapper')[0];
    if (!tcTitlewrapperheader) {
      return;
    }

      let userPresence = this.WebpackModules.findByUniqueProperties(['getPresence']),
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
	return this.WebpackModules.find(function (m) {
    return m.nl === ti[lang];
	});
};

setContextMenuItemClasses (contextMenu) {
  var UserStore = this.WebpackModules.findByUniqueProperties(["getUser","getUsers"]);
  var strings = this.getLanguageTable();
  var enstrings = this.getLanguageTable("en-US");
  let contentMenuItems = document.getElementsByClassName("item-1Yvehc");
  var items = contentMenuItems;
  var instance = tc.react.get(contextMenu);
  var user = tc.utils.waitForTruthy(() =>  instance.memoizedProps.children.props.children[0].props.children[1].props.user, 1000);
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

  onMaximize() {
		document.documentElement.classList.add("isMaximized");
	}

	onUnMaximize() {
		document.documentElement.classList.remove("isMaximized");
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

  start () {
    this.WebpackModules = (() => {
      const req = typeof(webpackJsonp) == "function" ? webpackJsonp([], {'__extra_id__': (module, exports, req) => exports.default = req}, ['__extra_id__']).default : webpackJsonp.push([[], {'__extra_id__': (module, exports, req) => module.exports = req}, [['__extra_id__']]]);
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

      const findByUniqueProperties = (propNames, options) => find(module => propNames.every(prop => module[prop] !== undefined), options);
      const findByProps = (...props) => findByUniqueProperties(props);
      const findByDisplayName = (displayName, options) => find(module => module.displayName === displayName, options);
      // Only use for development purposes... webpack id's can change in subsequent versions
      const findById = (id) => webpackRequire(id);

      return {find, findByProps, findByUniqueProperties, findByDisplayName, findById};
    })();

    const FriendsComponent = this.WebpackModules.find(m => m.displayName == "Friends");
    const cancel = DiscordInternals.monkeyPatch(FriendsComponent.prototype, "render", {before: ({thisObject}) => {thisObject.state.relationshipCount = 60;}});

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

    this.cancelVoiceChannelPatch = DiscordInternals.monkeyPatch(this.WebpackModules.findByUniqueProperties(["handleVoiceChannelSelect"]), "handleVoiceChannelSelect", { after : data => {
      if(data.methodArguments[0].channelId) this.insertVoiceConnected();
    } });

    const currentWindow = require("electron").remote.getCurrentWindow();
		if (currentWindow.isMaximized()) this.onMaximize();

		currentWindow.on("maximize", this.onMaximize);
    currentWindow.on("unmaximize", this.onUnMaximize);

    // const browserHistory = () =>  {
    //   let wc = currentWindow.webContents;
    //   currentWindow.on('app-command', async (ev, cmd) => {
    //     var backdrop, settings;
    //
    //     if (cmd !== 'browser-backward' && cmd !== 'browser-forward')
    //       return;
    //     if (cmd === 'browser-backward' && (backdrop = document.getElementsByClassName("backdrop-1wrmKB")[0])) {
    //       tc.webpack.utilities.closeModal();
    //     } else if (cmd === 'browser-backward' && (settings = document.getElementsByClassName("standardSidebarView-3F1I7i")[0])) {
    //       tc.webpack.userSettings.close();
    //     } else if (cmd === 'browser-backward' && wc.canGoBack()) {
    //       wc.goBack();
    //     } else if (cmd === 'browser-forward' && wc.canGoForward()) {
    //       wc.goForward();
    //     }
    //
    //     backdrop = void 0;
    //     settings = void 0;
    //   });
    // };


    // this.guildsTimeout = null;
    // document.body.addEventListener('mousemove', this.mouseMoveHandler, false);

    document.addEventListener('keydown', this.keyBindFunctions, false);

    var location;

    if (document.querySelector(".container-2Rl01u")) {
      location = 'serverView';
    } else if (document.querySelector(".privateChannels-1nO12o") && document.querySelector(".chat-3bRxxu")) {
      location = 'messagesView';
    } else if (document.querySelector(".container-3gCOGc")) {
      location = 'friendsView';
    } else if (document.querySelector(".activityFeed-1C0EmJ")) {
        location = 'activityView';
    } else if (document.querySelector(".gameLibrary-TTDw4Y")) {
      location = 'libraryView';
    } else if (document.querySelector(".applicationStore-1pNvnv")) {
      location = 'storeView';
    }

    pixelRatio();
    // this.loadSnippets();
    // this.injectUserBackgrounds();
    //this.checkForUpdate();
    this.onSwitchViews();
    this.insertTopNav(location);
    // this.giphy();
    // this.zenMode();
    this.injectUserStatus();
    this.imageBtns();

    clearTimeout(this.startupTimeout);
    this.startupTimeout = setTimeout(()=> {
      // this.setUserIdAndBadges.bind(this);
      this.insertVoiceConnected.bind(this);
    }, 3000);

    document.documentElement.classList.add('friendsBackgroundTile', 'libraryTile');
    this.routeWatcher();
  }

  routeWatcher () {
    // tc.utils.nav
    //   .on('all', this.allViews)

    //   .on('activity', this.activityView)
    //   .on('friends', this.friendsView)
    //   .on('guilds', this.guildsView)
    //   .on('library', this.libraryView)
    //   .on('messages', this.messagesView)
    //   .on('store', this.storeView)
    //   .on('storeBrowse', this.storeBrowseView)
  };

  insertTopNav () {
    let topNavWrapper = document.querySelector('.tc-titleWrapper-nav');

    let userStore = this.WebpackModules.findByUniqueProperties(['getUser']),
        userName = userStore.getCurrentUser(),
        userAvatarURL = userStore.getUser(userName.id).getAvatarURL(),
        userStatusStore = this.WebpackModules.findByUniqueProperties(['getStatus']),
        userStatus = userStatusStore.getStatus(userName.id),
        userPresence = this.WebpackModules.findByUniqueProperties(['getPresence']),
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
          <div class="tc-titleWrapper-nav-activity-btn tc-titleWrapper-nav-btns" data-tc-tooltip="Activity"><icon class="tc-icon tc-titleWrapper-nav-icon-activity"></icon><p class="tc-titleWrapper-nav-view-name">Activity</p></div>
          <div class="tc-titleWrapper-nav-library-btn tc-titleWrapper-nav-btns" data-tc-tooltip="Library"><icon class="tc-icon tc-titleWrapper-nav-icon-library"></icon><p class="tc-titleWrapper-nav-view-name">Library</p></div>
          <div class="tc-titleWrapper-nav-store-btn tc-titleWrapper-nav-btns" data-tc-tooltip="Store"><icon class="tc-icon tc-titleWrapper-nav-icon-store"></icon><p class="tc-titleWrapper-nav-view-name">Store</p></div>
          <div class="tc-titleWrapper-nav-lfg-btn tc-titleWrapper-nav-btns disabled" data-tc-tooltip="LFG"><icon class="tc-icon tc-titleWrapper-nav-icon-lfg"></icon><p class="tc-titleWrapper-nav-view-name">LFG</p></div>
          <div class="tc-titleWrapper-nav-global-search-outer">
            <div class="tc-titleWrapper-nav-global-search-inner">
                <input class="tc-titleWrapper-nav-global-search-input" type="text" placeholder="Search">
                <div class="tc-titleWrapper-nav-search-bar-icon">
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
      document.getElementsByClassName(`${tc.classes.twitchcord.titleWrapper}-nav-activity-btn`)[0].addEventListener('click', () => tc.utils.nav.activity());
      document.getElementsByClassName(`${tc.classes.twitchcord.titleWrapper}-nav-library-btn`)[0].addEventListener('click', () => tc.utils.nav.library());
      document.getElementsByClassName(`${tc.classes.twitchcord.titleWrapper}-nav-store-btn`)[0].addEventListener('click', () => tc.utils.nav.store());
      document.getElementsByClassName(`${tc.classes.twitchcord.titleWrapper}-nav-lfg-btn`)[0].addEventListener('click', () => tc.utils.nav.lfg());

      document.getElementsByClassName(`${tc.classes.twitchcord.titleWrapper}-account-messages-outer`)[0].addEventListener('click', () => tc.utils.nav.private());

      let tcAccountPanel = document.getElementsByClassName(`${tc.classes.twitchcord.titleWrapper}-account-panel-outer`)[0];
      if (tcAccountPanel) {
        tcAccountPanel.addEventListener('click', () => {
          let tcAccountPanelFresh = document.querySelector('.tc-titleWrapper-account-panel-outer');
          if (tcAccountPanelFresh && tcAccountPanelFresh.classList.contains('opened')) {
            document.body.click();
          } else {
            document.querySelector('.container-2Thooq .wrapper-2F3Zv8 > .inner-1W0Bkn').click();
          }
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

    this.WebpackModules.findbyUniqueProperties(["handleVoiceChannelSelect"]).handleVoiceChannelSelect.unpatch();
  }
}
=======
//META{"name":"Twitchcord"}*//
/* global bdPluginStorage, $, PluginUtilities, PluginContextMenu */

class Twitchcord {
  getName () { return 'Twitchcord'; }
  getVersion () { return '0.5.2'; }
  getAuthor () { return 'Twitchcord Developers'; }
  getDescription () { return 'Splargin! The official plugin for Twitchcord. Includes fixes and features and a full array of user theme settings options!'; }

  constructor () {
    this.initialized = false;

    // this.BASE_URL = 'https://rawgit.com/twitchcord/twitchcord/master';
    // this.userProfileImages = {};
    // this.userBadgeGroups = {};
    // this.SNIPPET_URL = `${this.BASE_URL}/pluginSnippets/snippets.json`;
    // this.USER_PROFILE_IMAGE_URL = 'https://api.github.com/gists/aaa364d4cae7e5c0cf7799c6fd5310d3';
    // this.USER_BADGE_GROUPS_URL = 'https://api.github.com/gists/52a83b5e7ff443d6edbdbde77f4cd51d';
    // this.PLUGIN_URL = `${this.BASE_URL}/plugin/Twitchcord.plugin.js`;
    //
    // window.fetch(this.USER_BADGE_GROUPS_URL).then(async r =>  {
    //   let res = await r.json();
    //   if (!res.files) {
    //     return;
    //   } else { this.userBadgeGroups = JSON.parse(res.files['userBadges.json'].content); }
    // });
    //
    // window.fetch(this.USER_PROFILE_IMAGE_URL).then(async r =>  {
    //   let res = await r.json();
    //   if (!res.files) {
    //     return;
    //   } else { this.userProfileImages = JSON.parse(res.files['userProfileImages.json'].content); }
    // });

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

  async imageBtns () {
    const clipboard = require('electron').clipboard;
    const nativeImage = require('electron').nativeImage;
    const request = require('request');
    $(document).on('click', '.imageWrapper-2p5ogY.imageZoom-1n-ADA img, .imageWrapper-2p5ogY.imageZoom-1n-ADA video, .imageWrapper-2p5ogY.imageZoom-1n-ADA .imageError-2OefUi', async (e) => {
      while(!document.querySelector(".modal-1UGdnR > .inner-1JeGVc > div > .imageWrapper-2p5ogY img") && !document.querySelector(".modal-1UGdnR > .inner-1JeGVc > div > .imageWrapper-2p5ogY video")) await new Promise(p => setTimeout(p, 10));
      let parent = e.target.closest('.container-1YxwTf'),
          openOriginal = document.querySelector('.modal-1UGdnR > .inner-1JeGVc > div > .imageWrapper-2p5ogY ~ .downloadLink-1ywL9o'),
          userImage = parent.getElementsByClassName('large-3ChYtB')[0],
          name = parent.getElementsByClassName('username-_4ZSMR')[0],
          timestamp = parent.querySelector('h2 time'),
          noClassDiv = document.querySelector(".modal-1UGdnR > .inner-1JeGVc > div > .imageWrapper-2p5ogY").parentElement,
          imageCheck = document.querySelector(".modal-1UGdnR > .inner-1JeGVc > div > .imageWrapper-2p5ogY img"),
          videoCheck = document.querySelector(".modal-1UGdnR > .inner-1JeGVc > div > .imageWrapper-2p5ogY video"),
          inner = document.querySelector(".inner-1JeGVc");

      var imageUrl, imageName, videoUrl, videoName;

          if (imageCheck) {
            imageUrl = imageCheck.src;
            imageName = imageUrl.split('/').pop();
            imageName = imageName.split(/[?#]/)[0];
          } else if (videoCheck) {
            videoUrl = videoCheck.src;
            videoName = videoUrl.split('/').pop();
            videoName = videoName.split(/[?#]/)[0];
          } else {
            return;
          }

          document.querySelector('.inner-1JeGVc > div > .imageWrapper-2p5ogY').insertAdjacentHTML('afterend', `
          <div class="tc-imageTopbar-container">
            <div class="tc-imageTopbar-avatar">
              ${userImage.outerHTML}
            </div>
            <div class="tc-imageTopbar-text">
              <div class="tc-imageTopbar-userdetails">
                ${name.outerHTML}
                ${timestamp.outerHTML}
              </div>
              <div class="tc-imageTopbar-imgname">
                ${imageName ? imageName : videoName}
              </div>
            </div>
            <div class="tc-imageTopbar-buttons">
              <a href="${imageUrl ? imageUrl : videoUrl}" download id="downloadA" data-tc-tooltip="Download"></a>
              <a id="copyImageAddress" data-tc-tooltip="Copy Link"></a>
              <a id="copyImage" data-tc-tooltip="Copy Image"></a>
              <div class="tc-imageTopbar-separator"></div>
              <a class="tc-imageTopbar-close"></a>
            </div>
          </div>
          `);

          // Fix for https://i.imgur.com/MftsSwV.png
          noClassDiv.classList.add('tc-imageTopbar');

          let newOpenOriginal = openOriginal.cloneNode(true);
          newOpenOriginal.setAttribute('id', 'openOriginal');
          newOpenOriginal.setAttribute('data-tc-tooltip', 'Open Original');

          inner.style.position = "relative";
          inner.style.top = "calc(var(--titlebar-height) / 2)";

          document.querySelector('.tc-imageTopbar .tc-imageTopbar-buttons').insertBefore(newOpenOriginal, document.querySelector('.tc-imageTopbar-separator'));

          new tcTooltip(newOpenOriginal);

          new tcTooltip(document.getElementById('downloadA'));

          new tcTooltip(document.getElementById('copyImageAddress'));

          document.getElementById('copyImageAddress').onclick = () => {
            clipboard.writeText(`${imageUrl ? imageUrl : videoUrl}`);
          }

          document.querySelector('.tc-imageTopbar-close').onclick = () => {
            document.querySelector('.backdrop-1wrmKB').click();
          }

          new tcTooltip(document.getElementById('copyImage'));

          document.getElementById('copyImage').onclick = () => {
            request({url: `${imageUrl ? imageUrl : videoUrl}`, encoding: null}, (error, response, buffer) => {
              if (error) {
                  return;
              }
              clipboard.write({image: nativeImage.createFromBuffer(buffer)});
          });
          }
    });
  }

  // injectUserBackgrounds () {
  //   const MO = new MutationObserver(async changes => {
  //     if (changes.some(change =>
  //       change.addedNodes && change.addedNodes[0] &&
  //       change.addedNodes[0].className === 'backdrop-1wrmKB'
  //     )) {
  //         this.injectUserModal();
  //     } else if (changes.some(change =>
  //       change.target && change.target.className.includes('popouts-3dRSmE')
  //     )) {
  //       let popouts = document.getElementsByClassName('popouts-3dRSmE')[0];

  //       let gamePreviewPopout = document.getElementsByClassName('popouts-3dRSmE')[0].getElementsByClassName('gamePreview-9weYR2')[0];
  //       if (gamePreviewPopout) {
  //         gamePreviewPopout.parentElement.parentElement.classList.add('tc-gamePopout');
  //       } else {
  //         if (popouts) popouts.classList.remove('tc-gamePopout');
  //       }

  //       this.injectUserPopout();
  //     }
  //   });

  //   MO.observe(document.querySelector('#app-mount'), { childList: true, subtree: true });
  //   this.observers.push(MO);
  // }

  async onSwitchViews () {
    var observertarget = null;
    this.viewsObserver = new MutationObserver((changes, _) => {
      changes.forEach(
        (change, i) => {
          if (change.target && change.target.classList.contains('popouts-3dRSmE')) {
            let popouts = document.getElementsByClassName('popouts-3dRSmE')[0];

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

            let gamePreviewPopout = document.getElementsByClassName('popouts-3dRSmE')[0].getElementsByClassName('gamePreview-9weYR2')[0];
            if (gamePreviewPopout) {
              gamePreviewPopout.parentElement.parentElement.classList.add('tc-gamePopout');
            } else {
              if (popouts) popouts.classList.remove('tc-gamePopout');
            }

            this.injectUserPopout();
            this.changeRoleStyle();
          }
          if (change.removedNodes) {
            change.removedNodes.forEach((node) => {
              if (node && node.tagName && node.classList.contains('backdrop-1wrmKB')) {
                let quickSwitcherInput = document.querySelector('.tc-titleWrapper-nav-global-search-outer .input-2VB9rf');
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
                    channelsList = document.querySelector('.channels-Ie2l6A');
                if (node && node.tagName && (
                    isDescendant(customCSSEditor, node) ||
                    isDescendant(emojiPicker, node) ||
                    isDescendant(inviteFriendsModal, node) ||
                    isDescendant(settingsContent, node) ||
                    isDescendant(channelMembersList, node) ||
                    isDescendant(quickswitcherInput, node) ||
                    isDescendant(channelsList, node)
                  )) {
                  return;
                }

                if (node && node.tagName && node.classList.contains('autocomplete-1vrmpx')) {
                  console.log('pie');
                  while(!node.querySelector('.horizontalAutocompletes-x8hlrn.scrollbar-3dvm_9')) await new Promise(p => setTimeout(p, 10));
                  console.log('hmmm');
                    node.querySelector('.horizontalAutocompletes-x8hlrn.scrollbar-3dvm_9').addEventListener('wheel', function(e)
                    {
                      if(e.type != 'wheel')
                      {
                        return;
                      }
                      console.log('cheese');
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
                  this.setContextMenuItemClasses();
                }

                // Settings menu opened
                let settingsMenu = document.querySelector('.layer-3QrUeG + .layer-3QrUeG');
                if (node && node.tagName && settingsMenu) {
                  this.setSettingsMenuItemClasses();
                }

                // if (node && node.tagName && node.classList.contains("layer-3QrUeG")) {
                //   this.discordSettingsOpened();
                // }

                // Add tooltip to the guilds-add button
                let createOrJoinBtn = document.querySelector('.wrapper-1Rf91z .circleIconButton-jET_ig');
                if (node && node.tagName && createOrJoinBtn && !createOrJoinBtn.dataset.tcTooltip) {
                  createOrJoinBtn.dataset.tcTooltip = 'Join or create a server';

                  new tcTooltip(createOrJoinBtn, {side: 'right'});
                }

                // Check if user has unread server mentions
                if (document.querySelector('.scroller-2TZvBN > .container-2td-dC:not(:first-of-type) .badge-3dItlm')) {
                  document.documentElement.classList.add('newMentions');
                } else {
                  document.documentElement.classList.remove('newMentions');
                }

                // Prevent native fullscreen youtube videos
                let videoIframe = document.getElementById('tc-fixedVideo-player');
                if (node && node.tagName && videoIframe)
                  videoIframe.allowFullscreen = false;

                // Injecting inline SVG into Discord's question block icons for user activities so we can use rgb(var(--tc-color-7)) and rgb(var(--tc-color-10))
                var questionBlock = `<svg viewBox="0 0 400 400"><path d="M22.800 11.600 L 22.800 23.200 11.400 23.200 L 0.000 23.200 0.000 200.200 L 0.000 377.200 11.400 377.200 L 22.800 377.200 22.800 388.600 L 22.800 400.000 200.000 400.000 L 377.200 400.000 377.200 388.600 L 377.200 377.200 388.600 377.200 L 400.000 377.200 400.000 201.200 L 400.000 25.200 388.600 25.200 L 377.200 25.200 377.200 12.600 L 377.200 0.000 200.000 0.000 L 22.800 0.000 22.800 11.600 M325.200 24.303 C 338.510 24.477,349.440 24.659,349.490 24.709 C 350.618 25.850,350.800 27.557,350.800 37.011 L 350.800 46.862 351.969 48.031 L 353.138 49.200 363.069 49.205 C 374.232 49.212,374.604 49.261,375.416 50.831 C 376.300 52.541,376.300 347.459,375.416 349.169 C 374.604 350.739,374.232 350.788,363.069 350.795 L 353.138 350.800 351.969 351.969 L 350.800 353.138 350.800 363.740 L 350.800 374.342 349.746 375.171 L 348.692 376.000 200.000 376.000 L 51.308 376.000 50.254 375.171 L 49.200 374.342 49.200 363.830 C 49.200 353.540,49.181 353.290,48.285 351.959 L 47.370 350.600 36.726 350.400 C 26.982 350.217,26.011 350.136,25.241 349.438 L 24.400 348.676 24.400 200.000 L 24.400 51.324 25.241 50.562 C 26.016 49.860,26.914 49.791,36.629 49.681 L 47.176 49.563 48.369 48.370 L 49.562 47.176 49.681 36.753 L 49.800 26.330 50.922 25.365 L 52.045 24.400 62.922 24.372 C 68.905 24.356,74.160 24.188,74.600 23.998 C 75.553 23.587,290.236 23.848,325.200 24.303 M302.430 125.944 C 302.137 126.491,302.000 134.394,302.000 150.729 C 302.000 173.738,301.969 174.750,301.236 175.656 C 300.473 176.599,300.459 176.600,288.736 176.833 C 282.281 176.961,276.955 177.096,276.900 177.133 C 276.845 177.170,276.799 182.015,276.798 187.900 C 276.796 198.593,276.795 198.601,275.836 199.800 L 274.876 201.000 251.055 201.112 L 227.234 201.224 227.117 212.981 L 227.000 224.737 226.030 225.769 C 224.379 227.526,223.366 227.595,199.533 227.598 C 187.066 227.599,176.581 227.709,176.233 227.843 C 175.391 228.166,175.264 246.536,176.100 247.076 C 176.375 247.254,187.822 247.490,201.538 247.600 L 226.476 247.800 227.374 248.926 L 228.271 250.052 238.322 249.926 C 251.161 249.765,249.746 251.248,250.000 237.686 C 250.143 230.035,250.346 226.744,250.714 226.100 L 251.228 225.200 274.379 225.200 L 297.529 225.200 298.564 223.969 L 299.600 222.739 299.600 211.813 L 299.600 200.887 301.208 200.243 C 302.539 199.711,304.578 199.600,313.034 199.600 C 319.313 199.600,323.551 199.440,324.026 199.186 C 325.143 198.588,325.254 126.875,324.139 125.949 C 322.903 124.922,302.979 124.917,302.430 125.944 M152.267 126.667 C 152.120 126.813,152.000 131.907,152.000 137.985 L 152.000 149.038 150.483 150.519 L 148.966 152.000 126.044 152.000 C 105.777 152.000,102.963 152.075,101.760 152.646 L 100.400 153.291 100.400 162.458 C 100.400 171.782,100.704 173.983,102.116 174.880 C 102.382 175.049,112.717 175.191,125.082 175.194 L 147.564 175.200 149.038 174.200 L 150.512 173.200 161.156 173.170 C 168.647 173.148,172.215 172.990,173.200 172.635 L 174.600 172.130 174.800 161.678 C 174.979 152.342,175.076 151.151,175.714 150.514 C 176.380 149.848,177.981 149.793,199.570 149.691 L 222.712 149.581 222.950 148.691 C 223.082 148.201,223.192 142.985,223.195 137.100 L 223.200 126.400 187.867 126.400 C 168.433 126.400,152.413 126.520,152.267 126.667 M227.724 275.700 C 227.546 275.975,227.310 281.750,227.200 288.533 C 227.012 300.154,226.955 300.899,226.224 301.433 C 225.574 301.908,221.509 302.000,201.297 302.000 C 185.415 302.000,176.883 302.142,176.374 302.414 C 174.863 303.222,175.340 323.480,176.893 324.466 C 177.770 325.022,248.960 324.880,249.520 324.320 C 250.213 323.627,250.213 276.373,249.520 275.680 C 248.817 274.977,228.179 274.996,227.724 275.700" stroke="none" fill="#000000" fill-rule="evenodd"></path><path d="M74.600 23.998 C 74.160 24.188,68.905 24.356,62.922 24.372 L 52.045 24.400 50.922 25.365 L 49.800 26.330 49.681 36.753 L 49.562 47.176 48.369 48.370 L 47.176 49.563 36.629 49.681 C 26.914 49.791,26.016 49.860,25.241 50.562 L 24.400 51.324 24.400 200.000 L 24.400 348.676 25.241 349.438 C 26.011 350.136,26.982 350.217,36.726 350.400 L 47.370 350.600 48.285 351.959 C 49.181 353.290,49.200 353.540,49.200 363.830 L 49.200 374.342 50.254 375.171 L 51.308 376.000 200.000 376.000 L 348.692 376.000 349.746 375.171 L 350.800 374.342 350.800 363.740 L 350.800 353.138 351.969 351.969 L 353.138 350.800 363.069 350.795 C 374.232 350.788,374.604 350.739,375.416 349.169 C 376.300 347.459,376.300 52.541,375.416 50.831 C 374.604 49.261,374.232 49.212,363.069 49.205 L 353.138 49.200 351.969 48.031 L 350.800 46.862 350.800 37.011 C 350.800 27.557,350.618 25.850,349.490 24.709 C 348.841 24.054,76.104 23.348,74.600 23.998 M299.307 27.014 L 300.800 28.029 300.800 37.037 C 300.800 42.274,300.615 46.779,300.359 47.797 C 299.530 51.091,309.275 50.800,199.813 50.800 C 133.393 50.800,102.101 50.932,101.574 51.214 C 100.838 51.608,100.800 52.161,100.800 62.562 L 100.800 73.495 102.300 73.743 C 103.125 73.880,142.269 73.993,189.286 73.996 C 273.392 74.000,274.779 74.012,275.186 74.774 C 275.441 75.251,275.602 79.657,275.606 86.274 C 275.610 92.320,275.777 97.262,275.991 97.600 C 276.307 98.101,278.177 98.233,287.357 98.400 C 302.628 98.678,301.737 97.691,301.415 113.970 C 301.299 119.816,301.069 135.710,300.902 149.289 L 300.600 173.978 299.690 174.889 C 298.797 175.783,298.569 175.804,287.650 176.000 C 279.036 176.155,276.371 176.324,275.860 176.749 C 275.276 177.235,275.200 178.556,275.200 188.226 C 275.200 199.066,275.193 199.160,274.311 199.777 C 273.532 200.323,270.602 200.400,250.537 200.400 C 236.636 200.400,227.249 200.553,226.626 200.790 L 225.600 201.180 225.600 211.816 C 225.600 222.782,225.535 223.283,223.880 225.100 L 223.061 226.000 200.030 226.005 C 180.995 226.009,176.618 226.112,174.800 226.600 C 173.114 227.053,170.023 227.192,161.570 227.195 L 150.539 227.200 149.570 226.165 L 148.600 225.130 148.722 201.065 L 148.845 177.000 149.831 176.000 L 150.817 175.000 163.909 174.676 C 171.109 174.497,187.254 174.269,199.787 174.169 C 214.666 174.050,222.717 173.844,222.987 173.574 C 223.389 173.173,223.720 163.730,224.226 138.203 C 224.446 127.067,224.443 127.002,223.579 126.303 C 222.691 125.584,155.071 125.252,151.800 125.951 L 150.600 126.208 150.494 137.255 L 150.388 148.303 149.339 149.352 L 148.291 150.400 124.045 150.401 C 100.521 150.403,99.761 150.427,98.490 151.201 C 97.269 151.946,96.470 152.000,86.604 152.000 C 76.557 152.000,76.007 152.039,75.614 152.774 C 75.334 153.297,75.200 173.000,75.200 213.698 C 75.200 273.679,75.198 273.852,74.384 274.725 C 73.570 275.599,53.490 276.147,51.418 275.352 C 49.505 274.618,49.600 280.502,49.600 162.539 L 49.600 52.238 50.878 50.919 L 52.157 49.600 62.888 49.600 L 73.620 49.600 74.010 48.574 C 74.225 48.009,74.400 43.175,74.400 37.828 C 74.400 28.600,74.442 28.055,75.229 27.054 L 76.058 26.000 186.936 26.000 L 297.814 26.000 299.307 27.014 M76.000 75.991 C 75.497 76.309,75.379 78.081,75.271 86.970 L 75.141 97.570 76.071 97.797 C 76.582 97.923,81.680 97.974,87.400 97.912 L 97.800 97.800 97.913 87.600 C 97.974 81.990,97.926 76.995,97.805 76.500 L 97.585 75.600 87.092 75.606 C 81.189 75.610,76.338 75.778,76.000 75.991 M324.139 125.949 C 325.254 126.875,325.143 198.588,324.026 199.186 C 323.551 199.440,319.313 199.600,313.034 199.600 C 304.578 199.600,302.539 199.711,301.208 200.243 L 299.600 200.887 299.600 211.813 L 299.600 222.739 298.564 223.969 L 297.529 225.200 274.379 225.200 L 251.228 225.200 250.714 226.100 C 250.346 226.744,250.143 230.035,250.000 237.686 C 249.746 251.248,251.161 249.765,238.322 249.926 L 228.271 250.052 227.374 248.926 L 226.476 247.800 201.538 247.600 C 187.822 247.490,176.375 247.254,176.100 247.076 C 175.264 246.536,175.391 228.166,176.233 227.843 C 176.581 227.709,187.066 227.599,199.533 227.598 C 223.366 227.595,224.379 227.526,226.030 225.769 L 227.000 224.737 227.117 212.981 L 227.234 201.224 251.055 201.112 L 274.876 201.000 275.836 199.800 C 276.795 198.601,276.796 198.593,276.798 187.900 C 276.799 182.015,276.845 177.170,276.900 177.133 C 276.955 177.096,282.281 176.961,288.736 176.833 C 300.459 176.600,300.473 176.599,301.236 175.656 C 301.969 174.750,302.000 173.738,302.000 150.729 C 302.000 134.394,302.137 126.491,302.430 125.944 C 302.979 124.917,322.903 124.922,324.139 125.949 M223.195 137.100 C 223.192 142.985,223.082 148.201,222.950 148.691 L 222.712 149.581 199.570 149.691 C 177.981 149.793,176.380 149.848,175.714 150.514 C 175.076 151.151,174.979 152.342,174.800 161.678 L 174.600 172.130 173.200 172.635 C 172.215 172.990,168.647 173.148,161.156 173.170 L 150.512 173.200 149.038 174.200 L 147.564 175.200 125.082 175.194 C 112.717 175.191,102.382 175.049,102.116 174.880 C 100.704 173.983,100.400 171.782,100.400 162.458 L 100.400 153.291 101.760 152.646 C 102.963 152.075,105.777 152.000,126.044 152.000 L 148.966 152.000 150.483 150.519 L 152.000 149.038 152.000 137.985 C 152.000 131.907,152.120 126.813,152.267 126.667 C 152.413 126.520,168.433 126.400,187.867 126.400 L 223.200 126.400 223.195 137.100 M173.904 248.800 C 175.924 249.568,176.979 249.600,200.235 249.600 L 224.462 249.600 225.631 250.769 L 226.800 251.938 226.800 262.382 C 226.800 270.760,226.681 273.110,226.200 274.262 C 225.711 275.431,225.600 277.951,225.600 287.830 L 225.600 299.962 224.100 300.379 C 223.141 300.645,214.234 300.798,199.400 300.802 C 180.012 300.808,175.877 300.907,174.236 301.404 C 170.940 302.404,150.818 302.267,149.544 301.236 L 148.600 300.471 148.481 276.536 C 148.355 251.096,148.374 250.650,149.640 249.041 L 150.458 248.000 161.129 248.000 C 170.831 248.000,171.991 248.073,173.904 248.800 M249.520 275.680 C 250.213 276.373,250.213 323.627,249.520 324.320 C 248.960 324.880,177.770 325.022,176.893 324.466 C 175.340 323.480,174.863 303.222,176.374 302.414 C 176.883 302.142,185.415 302.000,201.297 302.000 C 221.509 302.000,225.574 301.908,226.224 301.433 C 226.955 300.899,227.012 300.154,227.200 288.533 C 227.310 281.750,227.546 275.975,227.724 275.700 C 228.179 274.996,248.817 274.977,249.520 275.680" stroke="none" fill="rgb(var(--tc-color-7))" fill-rule="evenodd"></path><path d="M75.229 27.054 C 74.442 28.055,74.400 28.600,74.400 37.828 C 74.400 43.175,74.225 48.009,74.010 48.574 L 73.620 49.600 62.888 49.600 L 52.157 49.600 50.878 50.919 L 49.600 52.238 49.600 162.539 C 49.600 280.502,49.505 274.618,51.418 275.352 C 53.490 276.147,73.570 275.599,74.384 274.725 C 75.198 273.852,75.200 273.679,75.200 213.698 C 75.200 173.000,75.334 153.297,75.614 152.774 C 76.007 152.039,76.557 152.000,86.604 152.000 C 96.470 152.000,97.269 151.946,98.490 151.201 C 99.761 150.427,100.521 150.403,124.045 150.401 L 148.291 150.400 149.339 149.352 L 150.388 148.303 150.494 137.255 L 150.600 126.208 151.800 125.951 C 155.071 125.252,222.691 125.584,223.579 126.303 C 224.443 127.002,224.446 127.067,224.226 138.203 C 223.720 163.730,223.389 173.173,222.987 173.574 C 222.717 173.844,214.666 174.050,199.787 174.169 C 187.254 174.269,171.109 174.497,163.909 174.676 L 150.817 175.000 149.831 176.000 L 148.845 177.000 148.722 201.065 L 148.600 225.130 149.570 226.165 L 150.539 227.200 161.570 227.195 C 170.023 227.192,173.114 227.053,174.800 226.600 C 176.618 226.112,180.995 226.009,200.030 226.005 L 223.061 226.000 223.880 225.100 C 225.535 223.283,225.600 222.782,225.600 211.816 L 225.600 201.180 226.626 200.790 C 227.249 200.553,236.636 200.400,250.537 200.400 C 270.602 200.400,273.532 200.323,274.311 199.777 C 275.193 199.160,275.200 199.066,275.200 188.226 C 275.200 178.556,275.276 177.235,275.860 176.749 C 276.371 176.324,279.036 176.155,287.650 176.000 C 298.569 175.804,298.797 175.783,299.690 174.889 L 300.600 173.978 300.902 149.289 C 301.069 135.710,301.299 119.816,301.415 113.970 C 301.737 97.691,302.628 98.678,287.357 98.400 C 278.177 98.233,276.307 98.101,275.991 97.600 C 275.777 97.262,275.610 92.320,275.606 86.274 C 275.602 79.657,275.441 75.251,275.186 74.774 C 274.779 74.012,273.392 74.000,189.286 73.996 C 142.269 73.993,103.125 73.880,102.300 73.743 L 100.800 73.495 100.800 62.562 C 100.800 52.161,100.838 51.608,101.574 51.214 C 102.101 50.932,133.393 50.800,199.813 50.800 C 309.275 50.800,299.530 51.091,300.359 47.797 C 300.615 46.779,300.800 42.274,300.800 37.037 L 300.800 28.029 299.307 27.014 L 297.814 26.000 186.936 26.000 L 76.058 26.000 75.229 27.054 M273.986 75.974 C 274.239 76.447,274.401 80.601,274.402 86.674 C 274.404 95.943,274.632 98.507,275.586 100.000 C 275.907 100.501,277.787 100.633,287.018 100.800 C 297.366 100.987,298.102 101.049,298.633 101.776 C 299.559 103.044,299.471 171.404,298.542 173.354 L 297.883 174.734 286.906 174.867 L 275.928 175.000 275.164 175.944 C 274.454 176.822,274.400 177.655,274.400 187.795 C 274.400 196.360,274.286 198.796,273.870 199.142 C 273.502 199.448,266.093 199.615,249.512 199.691 C 226.725 199.795,225.647 199.833,224.842 200.562 C 224.025 201.301,224.000 201.652,224.000 212.200 C 224.000 222.059,223.935 223.133,223.300 223.685 C 222.372 224.492,153.126 225.114,151.406 224.330 C 149.934 223.659,149.969 224.302,150.089 199.600 L 150.200 177.000 151.600 176.523 C 152.640 176.168,161.920 176.039,187.720 176.023 C 226.512 175.997,224.531 176.142,224.949 173.309 C 225.072 172.479,225.290 161.630,225.435 149.200 L 225.697 126.600 224.807 125.800 C 223.901 124.987,158.708 124.273,152.500 125.009 C 149.076 125.414,149.200 124.951,149.200 137.380 C 149.200 145.638,149.078 148.399,148.700 148.700 C 147.840 149.385,75.886 149.533,75.063 148.851 C 74.460 148.351,74.400 146.220,74.400 125.180 L 74.400 102.058 75.454 101.229 C 76.460 100.438,76.991 100.400,87.048 100.400 L 97.587 100.400 98.894 99.234 L 100.200 98.067 100.400 87.398 C 100.599 76.778,100.604 76.724,101.544 75.964 C 103.039 74.755,273.339 74.765,273.986 75.974 M97.805 76.500 C 97.926 76.995,97.974 81.990,97.913 87.600 L 97.800 97.800 87.400 97.912 C 81.680 97.974,76.582 97.923,76.071 97.797 L 75.141 97.570 75.271 86.970 C 75.379 78.081,75.497 76.309,76.000 75.991 C 76.338 75.778,81.189 75.610,87.092 75.606 L 97.585 75.600 97.805 76.500 M149.640 249.041 C 148.374 250.650,148.355 251.096,148.481 276.536 L 148.600 300.471 149.544 301.236 C 150.818 302.267,170.940 302.404,174.236 301.404 C 175.877 300.907,180.012 300.808,199.400 300.802 C 214.234 300.798,223.141 300.645,224.100 300.379 L 225.600 299.962 225.600 287.830 C 225.600 277.951,225.711 275.431,226.200 274.262 C 226.681 273.110,226.800 270.760,226.800 262.382 L 226.800 251.938 225.631 250.769 L 224.462 249.600 200.235 249.600 C 176.979 249.600,175.924 249.568,173.904 248.800 C 171.991 248.073,170.831 248.000,161.129 248.000 L 150.458 248.000 149.640 249.041 M223.751 251.296 C 224.838 251.856,224.369 297.369,223.265 298.452 C 222.488 299.214,151.981 299.947,150.800 299.206 C 150.280 298.880,150.185 295.708,150.091 275.367 C 149.976 250.830,149.964 251.020,151.729 250.681 C 153.580 250.326,223.018 250.919,223.751 251.296" stroke="none" fill="rgb(var(--tc-color-10))" fill-rule="evenodd"></path><path d="M101.544 75.964 C 100.604 76.724,100.599 76.778,100.400 87.398 L 100.200 98.067 98.894 99.234 L 97.587 100.400 87.048 100.400 C 76.991 100.400,76.460 100.438,75.454 101.229 L 74.400 102.058 74.400 125.180 C 74.400 146.220,74.460 148.351,75.063 148.851 C 75.886 149.533,147.840 149.385,148.700 148.700 C 149.078 148.399,149.200 145.638,149.200 137.380 C 149.200 124.951,149.076 125.414,152.500 125.009 C 158.708 124.273,223.901 124.987,224.807 125.800 L 225.697 126.600 225.435 149.200 C 225.290 161.630,225.072 172.479,224.949 173.309 C 224.531 176.142,226.512 175.997,187.720 176.023 C 161.920 176.039,152.640 176.168,151.600 176.523 L 150.200 177.000 150.089 199.600 C 149.969 224.302,149.934 223.659,151.406 224.330 C 153.126 225.114,222.372 224.492,223.300 223.685 C 223.935 223.133,224.000 222.059,224.000 212.200 C 224.000 201.652,224.025 201.301,224.842 200.562 C 225.647 199.833,226.725 199.795,249.512 199.691 C 266.093 199.615,273.502 199.448,273.870 199.142 C 274.286 198.796,274.400 196.360,274.400 187.795 C 274.400 177.655,274.454 176.822,275.164 175.944 L 275.928 175.000 286.906 174.867 L 297.883 174.734 298.542 173.354 C 299.471 171.404,299.559 103.044,298.633 101.776 C 298.102 101.049,297.366 100.987,287.018 100.800 C 277.787 100.633,275.907 100.501,275.586 100.000 C 274.632 98.507,274.404 95.943,274.402 86.674 C 274.401 80.601,274.239 76.447,273.986 75.974 C 273.339 74.765,103.039 74.755,101.544 75.964 M273.600 88.103 C 273.600 98.341,273.854 101.007,274.893 101.666 C 275.172 101.843,280.283 101.991,286.251 101.994 C 294.792 101.999,297.196 102.113,297.544 102.533 C 297.864 102.918,297.914 112.722,297.727 137.933 L 297.468 172.800 286.908 172.800 C 272.414 172.800,273.600 171.502,273.600 187.368 L 273.600 198.776 249.061 198.888 C 229.085 198.979,224.401 199.101,223.867 199.544 C 223.293 200.021,223.199 201.504,223.106 211.544 L 223.000 223.000 188.400 223.110 C 169.370 223.171,153.395 223.122,152.900 223.002 L 152.000 222.785 152.000 200.057 L 152.000 177.330 168.500 177.066 C 177.575 176.920,193.874 176.801,204.720 176.801 C 225.651 176.800,226.430 176.734,226.940 174.904 C 227.048 174.517,227.258 163.455,227.408 150.322 L 227.680 126.444 226.658 125.422 L 225.636 124.400 187.467 124.400 C 156.147 124.400,149.219 124.496,148.855 124.933 C 148.561 125.289,148.377 129.263,148.306 136.833 L 148.200 148.200 113.400 148.314 C 94.260 148.376,78.015 148.323,77.300 148.196 L 76.000 147.964 76.000 125.405 C 76.000 107.798,76.110 102.776,76.500 102.524 C 76.775 102.346,82.040 102.110,88.200 102.000 C 103.194 101.732,102.000 102.894,102.000 88.573 C 102.000 83.234,102.109 78.581,102.243 78.233 C 102.463 77.658,110.395 77.600,188.043 77.600 L 273.600 77.600 273.600 88.103 M151.729 250.681 C 149.964 251.020,149.976 250.830,150.091 275.367 C 150.185 295.708,150.280 298.880,150.800 299.206 C 151.981 299.947,222.488 299.214,223.265 298.452 C 224.369 297.369,224.838 251.856,223.751 251.296 C 223.018 250.919,153.580 250.326,151.729 250.681 M223.000 274.600 L 223.000 297.400 188.043 297.701 C 162.323 297.923,152.942 297.884,152.543 297.552 C 151.774 296.915,151.732 252.175,152.500 251.864 C 152.775 251.752,168.750 251.692,188.000 251.730 L 223.000 251.800 223.000 274.600" stroke="none" fill="#fff" fill-rule="evenodd"></path><path d="M102.243 78.233 C 102.109 78.581,102.000 83.234,102.000 88.573 C 102.000 102.894,103.194 101.732,88.200 102.000 C 82.040 102.110,76.775 102.346,76.500 102.524 C 76.110 102.776,76.000 107.798,76.000 125.405 L 76.000 147.964 77.300 148.196 C 78.015 148.323,94.260 148.376,113.400 148.314 L 148.200 148.200 148.306 136.833 C 148.377 129.263,148.561 125.289,148.855 124.933 C 149.219 124.496,156.147 124.400,187.467 124.400 L 225.636 124.400 226.658 125.422 L 227.680 126.444 227.408 150.322 C 227.258 163.455,227.048 174.517,226.940 174.904 C 226.430 176.734,225.651 176.800,204.720 176.801 C 193.874 176.801,177.575 176.920,168.500 177.066 L 152.000 177.330 152.000 200.057 L 152.000 222.785 152.900 223.002 C 153.395 223.122,169.370 223.171,188.400 223.110 L 223.000 223.000 223.106 211.544 C 223.199 201.504,223.293 200.021,223.867 199.544 C 224.401 199.101,229.085 198.979,249.061 198.888 L 273.600 198.776 273.600 187.368 C 273.600 171.502,272.414 172.800,286.908 172.800 L 297.468 172.800 297.727 137.933 C 297.914 112.722,297.864 102.918,297.544 102.533 C 297.196 102.113,294.792 101.999,286.251 101.994 C 280.283 101.991,275.172 101.843,274.893 101.666 C 273.854 101.007,273.600 98.341,273.600 88.103 L 273.600 77.600 188.043 77.600 C 110.395 77.600,102.463 77.658,102.243 78.233 M152.500 251.864 C 151.732 252.175,151.774 296.915,152.543 297.552 C 152.942 297.884,162.323 297.923,188.043 297.701 L 223.000 297.400 223.000 274.600 L 223.000 251.800 188.000 251.730 C 168.750 251.692,152.775 251.752,152.500 251.864" stroke="none" fill="#fff" fill-rule="evenodd"></path></svg>`,
                    discordQuestionIcon = document.querySelector('.gameIcon-gg34Dz[style*="/assets/a5eba102f5b5e413df2b65c73f288afa.svg"]:empty');
                if (node && node.tagName && discordQuestionIcon) {
                    discordQuestionIcon.innerHTML = questionBlock;
                }

                // Joined voice chat
                if (node && node.tagName && node.classList.contains("container-1UB9sr")) {
                  this.insertVoiceConnected();
                }

                // Add identifier classes to the sub nav buttons
                if (document.getElementsByClassName('iconMargin-2YXk4F')) {
                  let iconParent = document.getElementsByClassName('iconMargin-2YXk4F');
                  for (var i = 0; i < iconParent.length; i++) {
                    if (iconParent[i].querySelector('.icon-1R19_H[name="VideoCamera"]')) {
                      iconParent[i].classList.add('tc-discordVideoCallButton');
                    }
                    if (iconParent[i].querySelector('.icon-1R19_H[name="NotificationBell"], .icon-1R19_H[name="NotificationBellOff"]')) {
                      iconParent[i].classList.add('tc-discordNotificationsButton');
                    }
                    if (iconParent[i].querySelector('.icon-1R19_H[name="Pin"]')) {
                      iconParent[i].classList.add('tc-discordPinButton');
                    }
                    if (iconParent[i].querySelector('.icon-1R19_H[name="People"]')) {
                      iconParent[i].classList.add('tc-discordMembersListButton');
                    }
                    if (iconParent[i].querySelector('.icon-1R19_H[name="Phone"]')) {
                      iconParent[i].classList.add('tc-discordCallButton');
                    }
                    if (iconParent[i].querySelector('.icon-1R19_H[name="PersonPlus"]')) {
                      iconParent[i].classList.add('tc-discordGroupDMButton');
                    }
                    if (iconParent[i].querySelector('.icon-1R19_H[name="QuestionMark"]')) {
                      iconParent[i].classList.add('tc-discordHelpButton');
                    }
                    if (iconParent[i].querySelector('.icon-1R19_H[name="Update"]')) {
                      iconParent[i].classList.add('tc-discordUpdateButton');
                      let tcUpdateBtn = document.getElementsByClassName('tc-titleWrapper-account-update-outer')[0];
                      if (!tcUpdateBtn.classList.contains('listener-added')) {
                        tcUpdateBtn.classList.add('listener-added');
                        new tcTooltip(tcUpdateBtn, {side: 'bottom'});
                        tcUpdateBtn.addEventListener('click', () => {
                          let discordUpdateBtn = document.querySelector('.icon-1R19_H[name="Update"]').parentNode;
                          tcUpdateBtn.getElementsByClassName('tc-titleWrapper-account-update').classList.add('updating');
                          discordUpdateBtn.click();
                        }, false);
                      }
                    }
                    if (iconParent[i].querySelector('.icon-1R19_H[name="Mention"]')) {
                      iconParent[i].classList.add('tc-discordMentionButton');
                      let tcNotificationsBtn = document.getElementsByClassName('tc-titleWrapper-account-mentions-outer')[0];
                      if (!tcNotificationsBtn.classList.contains('listener-added')) {
                        tcNotificationsBtn.classList.add('listener-added');
                        new tcTooltip(tcNotificationsBtn, {side: 'bottom'});
                        tcNotificationsBtn.addEventListener('click', () => {
                          let discordMentionBtn = document.querySelector('.icon-1R19_H[name="Mention"]').parentNode;
                          discordMentionBtn.click();
                        }, false);
                      }
                    }
                  }
                }

                // Adding tc-systemMessage class to system message message groups
                if (document.getElementsByClassName('container-3-pyIM')) {
                  let systemMessage = document.getElementsByClassName('container-3-pyIM');
                  for (var i = 0; i < systemMessage.length; i++) {
                    systemMessage[i].closest('.container-1YxwTf').classList.add('tc-systemMessage');
                  }
                }

                    // New message-group addeded
                if (node && node.tagName && node.classList.contains("container-1YxwTf"))/* ||
                    // New user appears on members list
                    (node && node.tagName && node.classList.contains("member-3W1lQa")))*/ {
                  // this.setUserIdAndBadges(node);
                }

                // Switch Channels
                if (node && node.tagName && node.classList.contains("messagesWrapper-3lZDfY")) {
                  // this.setUserIdAndBadges();
                }

                // If bot badge added
                if (node && node.tagName && node.classList.contains('botTag-2WPJ74')) {
                    node.dataset.tcTooltip = "Bot User";
                    new tcTooltip(badge);
                }

                // Switch to Servers
                if (node && node.tagName && document.querySelector('.container-2Rl01u')) {
                    this.switchToServers();
                    this.insertTopNav('serverView');
                    // this.giphy();
                }

                // Switch to Activity
                if (node && node.tagName && document.querySelector(".activityFeed-28jde9")) {
                    this.switchToActivity();
                    this.insertTopNav('activityView');
                }

                // Switch to Library
                if (node && node.tagName && document.querySelector('.gameLibrary-TTDw4Y')) {
                  this.switchToLibrary();
                  this.insertTopNav('libraryView');
                }

                // Switch to Store
                if (node && node.tagName && document.querySelector('.applicationStore-1pNvnv')) {
                  this.switchToStore();
                  this.insertTopNav('storeView');
                }

                // Switch to DMs
                if (node && node.tagName && document.querySelector('.privateChannels-1nO12o') && document.querySelector(".chat-3bRxxu")) {
                    this.switchToDMs();
                    this.insertTopNav('messagesView');
                    // this.giphy();
                }

                // Switch to Friends
                if (node && node.tagName && document.querySelector("#friends")) {
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
    let channelStore = this.WebpackModules.findByUniqueProperties(["getChannel", "getChannels"]),
        selectedChannelStore = this.WebpackModules.findByUniqueProperties(["getChannelId", "getVoiceChannelId"]),
        selectedVoiceChannel = channelStore.getChannel(selectedChannelStore.getVoiceChannelId()),
        userStore = this.WebpackModules.findByUniqueProperties(['getUser']),
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

      new tcTooltip(voiceDisconnect);
      new tcTooltip(voiceDeafen);
      new tcTooltip(voiceMute);

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
  //
  // setUserIdAndBadges (node) {
  //   if (!node) {
  //     let messageGroups = document.getElementsByClassName("container-1YxwTf"),
  //         usernameWrapper = document.querySelector('.username-_4ZSMR');
  //     if (messageGroups && usernameWrapper) {
  //       for(var x=0; x < messageGroups.length; x++) {
  //         this.setUserIdAndBadges(messageGroups[x]);
  //       }
  //     }
  //   } else {
  //     node.dataset.userId = tc.react.getProp(node, "messages.0.author.id");
  //     let insertionPoint = node.getElementsByClassName('username-_4ZSMR')[0];
  //     if (!insertionPoint) return;
  //     for(let group in this.userBadgeGroups) {
  //       for(let [key, value] of Object.entries(this.userBadgeGroups[group])) {
  //         if (tc.react.getProp(node, "messages.0.author.id") == (key, value)) {
  //           let tcUserBadgeContainer = node.querySelector('.tc-userBadge-container'),
  //               tcUserBadges = node.querySelectorAll('.tc-userBadge-badge');
  //           if (!tcUserBadgeContainer && tcUserBadges.length < 2) {
  //             let groupFirstWord = group.replace(/ .*/,'');
  //             let tcUserBadgeContainerDivs = `
  //               <div class="tc-userBadge-container">
  //                 <div class="tc-userBadge-badge ${groupFirstWord.toLowerCase()}" data-tc-tooltip="${group}"></div>
  //               </div>
  //             `;
  //             insertionPoint.insertAdjacentHTML('beforebegin', tcUserBadgeContainerDivs);
  //             let tcBadge = node.querySelector('.tc-userBadge-badge');
  //             new tcTooltip(tcBadge);
  //           } else if (tcUserBadgeContainer && tcUserBadges.length < 2) {
  //             let groupFirstWord = group.replace(/ .*/,'');
  //             if (tcUserBadges[0].classList.contains(groupFirstWord.toLowerCase())) { return; }
  //             else {
  //               tcUserBadgeContainer.insertAdjacentHTML('beforeend', `<div class="tc-userBadge-badge ${groupFirstWord.toLowerCase()}" data-tc-tooltip="${group}"></div>`);
  //               let tcBadge = node.querySelector('.tc-userBadge-badge:nth-of-type(2)');
  //               new tcTooltip(tcBadge);
  //             }
  //           }
  //         }
  //       }
  //     }
  //     let badgeContainer = node.getElementsByClassName('tc-userBadge-container')[0],
  //         badge = node.getElementsByClassName('tc-userBadge-badge');
  //     if (badgeContainer && badge.length < 2) {
  //       if (badge.length == 0 || (badge.length == 1 && !badge[0].classList.contains('nitro'))) {
  //         let avatar = node.getElementsByClassName('image-33JSyf')[0];
  //         if (avatar && avatar.style.backgroundImage.includes("/a_")) {
  //           badgeContainer.insertAdjacentHTML('beforeend', '<div class="tc-userBadge-badge nitro" data-tc-tooltip="Nitro User"></div>');
  //           let tcBadge = node.querySelector('.tc-userBadge-badge:nth-of-type(2)');
  //           new tcTooltip(tcBadge);
  //         }
  //       }
  //     } else {
  //       if (!badgeContainer) {
  //         let avatar = node.getElementsByClassName('image-33JSyf')[0];
  //         if (avatar && avatar.style.backgroundImage.includes("/a_")) {
  //           insertionPoint.insertAdjacentHTML('beforebegin', '<div class="tc-userBadge-container">' +
  //                                                             '<div class="tc-userBadge-badge nitro" data-tc-tooltip="Nitro User"></div>' +
  //                                                           '</div>');
  //           let tcBadge = node.querySelector('.tc-userBadge-badge');
  //           new tcTooltip(tcBadge);
  //         }
  //       }
  //     }
  //   }
  // }

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

async switchToActivity () {

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

  new tcTooltip(refreshFriends);
  new tcTooltip(tileButton);
  new tcTooltip(gridButton);
  new tcTooltip(filterOptions);

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

async switchToStore () {
  let sortGames = document.getElementsByClassName('distributionApplicationsSort-2_uq5y'),
      storeMediaViewButtonContainer = document.getElementsByClassName('tc-storemediaview')[0],
      storeMediaViewButtonDivs = `<div class="tc-storemediaview">
                                     <i class="tc-storemediaview-icon" data-tc-tooltip="Media View"></i>
                                  </div>`;

  if (sortGames[0]) {
    if (!storeMediaViewButtonContainer) {
      sortGames[0].parentElement.insertAdjacentHTML('beforeend', storeMediaViewButtonDivs);

      let storeMediaViewButton = document.getElementsByClassName('tc-storemediaview-icon')[0];

      new tcTooltip(storeMediaViewButton, {side: 'right'});

      storeMediaViewButton.addEventListener('click', function() {
        if (document.documentElement.classList.contains('storeMediaView')) {
          document.documentElement.classList.remove('storeMediaView');
          document.documentElement.classList.add('storeNormalView');
        } else {
          document.documentElement.classList.remove('storeNormalView');
          document.documentElement.classList.add('storeMediaView');
        }
      }, false);
    }
  } else {
    return;
  }
}

async switchToLFG () {

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
  if (document.querySelector('#friends') || document.querySelector('.activityFeed-28jde9')) return;
  let ChannelInfo = document.getElementsByClassName('titleText-3X-zRE')[0].getElementsByClassName('tc-channelInfo')[0];
  const activityTypes = ["Playing", "Streaming", "Listening to", "Watching"];
  switch (destination) {
    case 'server':
      var SelectedStore = this.WebpackModules.findByUniqueProperties(['getLastSelectedGuildId']),
          Store = this.WebpackModules.findByUniqueProperties(['getGuild']),
          Current = Store.getGuild(SelectedStore.getGuildId()),
          SelectedChannelStore = this.WebpackModules.findByUniqueProperties(['getLastSelectedChannelId']),
          ChannelStore = this.WebpackModules.findByUniqueProperties(['getChannel']),
          CurrentChannel = ChannelStore.getChannel(SelectedChannelStore.getChannelId());
      break;
    case 'dm':
      var SelectedStore = this.WebpackModules.findByUniqueProperties(['getLastSelectedChannelId']),
          Store = this.WebpackModules.findByUniqueProperties(['getChannel']),
          Current = Store.getChannel(SelectedStore.getChannelId()),
          SelectedChannelStore = this.WebpackModules.findByUniqueProperties(['getLastSelectedChannelId']),
          ChannelStore = this.WebpackModules.findByUniqueProperties(['getChannel']),
          CurrentChannel = ChannelStore.getChannel(SelectedChannelStore.getChannelId()),
          userStore = this.WebpackModules.findByUniqueProperties(['getUser']),
          obj = userStore.getUser(Current.recipients[0]),
          userPresence = this.WebpackModules.findByUniqueProperties(['getApplicationActivity']),
          activity = userPresence.getPrimaryActivity(Current.recipients[0]);
      break;
  }

  let avatarUrl = Current.getIconURL();

  if (!ChannelInfo) {
    let discordHeader = document.getElementsByClassName('titleText-3X-zRE')[0],
    ChannelInfoComplete = `
      <div class="tc-channelInfo">
        <div class="tc-channelInfo-ava-container">
          <div class="tc-channelInfo-ava avatar-small" style="${avatarUrl ? `background-image: url('${avatarUrl}');` : ""}"></div>
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
    const header = document.querySelector('.friends-row .friends-column-name');
    if (!header) {
      return;
    }
    let tabBar = document.getElementsByClassName('tab-bar')[0],
        addFriendContainer = document.getElementsByClassName('tc-addFriend')[0],
        friendsListOptionsContainer = document.getElementsByClassName('tc-friendsListOptions')[0],
        newGroupDMButton = document.querySelector('#friends .headerBar-UHpsPw svg[name="Compose"]'),
        addFriendButton = document.querySelector('#friends .headerBar-UHpsPw #addFriends'),
        friendPlaceholder = document.getElementsByClassName('tc-friendPlaceholder')[0],
        friendsRowContainer = document.querySelector('#friends .friends-table-body>div'),
        DiscordAddFriendsButton = document.querySelector('#friends .tab-bar .tab-bar-item.tab-bar-item-primary');

    let addFriendOptions = `<div class="tc-addFriend">
                              <div class="tc-addFriend-howmany">00</div>
                              <div class="tc-addFriend-text-contain">
                                <div class="tc-addFriend-peopleare">people are</div>
                                <div class="tc-addFriend-active">error</div>
                              </div>
                            </div>`;

    let friendsListOptions = `<div class="tc-friendsListOptions">
                                <ul class="tc-friendsListOptions-ul">
                                  <li class="tc-friendsListOptions-li">
                                      <div class="tc-friendsListOptions-item">
                                        <i class="tc-icon refresh tc-friendsListOptions-refresh" data-tc-tooltip="Refresh"></i>
                                      </div>
                                  </li>
                                  <li class="tc-friendsListOptions-li">
                                      <div class="tc-friendsListOptions-item">
                                        <i class="tc-icon userbgs tc-friendsListOptions-background-tile" data-tc-tooltip="Default View"></i>
                                      </div>
                                  </li>
                                  <li class="tc-friendsListOptions-li">
                                      <div class="tc-friendsListOptions-item">
                                        <i class="tc-icon tile tc-friendsListOptions-tile" data-tc-tooltip="Tile View"></i>
                                      </div>
                                  </li>
                                  <li class="tc-friendsListOptions-li">
                                      <div class="tc-friendsListOptions-item">
                                        <i class="tc-icon grid tc-friendsListOptions-grid" data-tc-tooltip="Grid View"></i>
                                      </div>
                                  </li>
                                  <li class="tc-friendsListOptions-li">
                                    <div class="tc-friendsListOptions-item">
                                      <i class="tc-icon filter-options tc-friendsListOptions-options" data-tc-tooltip="Filter Options"></i>
                                    </div>
                                  </li>
                                </ul>
                                <div class="tc-friendsListOptions-filter-container">
                                  <div class="tc-friendsListOptions-filter">
                                      <input type="text" class="tc-input filter tc-friendsListOptions-filter-input" value="" placeholder="Filter by name">
                                      <label class="tc-label search">
                                      <i class="tc-icon search"></i>
                                      </label>
                                      <div class="tc-input-reset">
                                      <i class="tc-icon close"></i>
                                    </div>
                                  </div>
                                </div>
                            </div>`;

    let friendPlaceholderDivs = `<div class="friends-row tc-friendPlaceholder"></div>
                                 <div class="friends-row tc-friendPlaceholder"></div>
                                 <div class="friends-row tc-friendPlaceholder"></div>
                                 <div class="friends-row tc-friendPlaceholder"></div>
                                 <div class="friends-row tc-friendPlaceholder"></div>
                                 <div class="friends-row tc-friendPlaceholder"></div>
                                 <div class="friends-row tc-friendPlaceholder"></div>
                                 <div class="friends-row tc-friendPlaceholder"></div>`;

    function addFriendsButton () {
      if (DiscordAddFriendsButton) DiscordAddFriendsButton.click();
    }

    if (newGroupDMButton && !addFriendButton) {
      const addFriend = document.createElement('div');
      addFriend.id = "addFriends";

      addFriend.dataset.tcTooltip = "Add Friend";

      newGroupDMButton.parentNode.prepend(addFriend);
      new tcTooltip(addFriend, {side: 'bottom'});
      addFriend.addEventListener('click', addFriendsButton, false);
    }

    if (tabBar) {
      if (!addFriendContainer) tabBar.insertAdjacentHTML('afterbegin', addFriendOptions);
      if (!friendsListOptionsContainer) tabBar.insertAdjacentHTML('afterend', friendsListOptions);
      if (!friendPlaceholder && friendsRowContainer && friendsRowContainer.children.length > 0) friendsRowContainer.insertAdjacentHTML('beforeend', friendPlaceholderDivs);
      if (friendsRowContainer && friendsRowContainer.lastElementChild && !friendsRowContainer.lastElementChild.classList.contains("tc-friendPlaceholder")) {
        let friendPlaceholder = document.getElementsByClassName('tc-friendPlaceholder')[0];
        while (friendPlaceholder && friendPlaceholder.parentNode) {
          friendPlaceholder.parentNode.removeChild(friendPlaceholder);
        }
        friendsRowContainer.insertAdjacentHTML('beforeend', friendPlaceholderDivs);
      }
    }


    let friendsFilterInput = document.getElementsByClassName('tc-friendsListOptions-filter-input')[0];

    friendsFilterInput.addEventListener('input', friendsNameFilter, false);

    function friendsNameFilter() {
      var input = document.getElementsByClassName('tc-friendsListOptions-filter-input')[0],
          filter = input.value.toUpperCase(),
          friendsRowContainer = document.querySelector('#friends .scroller>div'),
          item = friendsRowContainer.querySelectorAll('.friends-row:not(.tc-friendPlaceholder)'),
          friendsContainer = document.getElementById('friends').getElementsByClassName('scroller')[0];

      // Loop through all list items, and hide those who don't match the search query
      let counter = 0;
      for (let i = 0; i < item.length; i++) {
          var username = item[i].getElementsByClassName("username")[0];
          if (username.innerHTML.toUpperCase().indexOf(filter) > -1) {
              item[i].style.display = "flex";
              counter++;
          } else {
              item[i].style.display = "none";
          }
      }
      if (counter == 0) {
        friendsContainer.dataset.noResults = 'No results match your search criteria.';
      } else {
        friendsContainer.dataset.noResults = '';
      }
    }

    if (friendsRowContainer) {
        var countKeeper = 0;
        for (var i = 0; i < friendsRowContainer.children.length; i++) {
          if (friendsRowContainer.children[i].classList.contains("friends-row") && !friendsRowContainer.children[i].classList.contains("tc-friendPlaceholder")) {
            countKeeper++;
          }
        }
      document.getElementsByClassName('tc-addFriend')[0].getElementsByClassName('tc-addFriend-howmany')[0].textContent = countKeeper;
    }

    let currentlyActive = document.querySelector('#friends .tab-bar-item.selected').childNodes[0].nodeValue;
    document.getElementsByClassName('tc-addFriend-active')[0].textContent = ((currentlyActive == 'All') ? (currentlyActive = 'Friends') : currentlyActive);

    let refreshFriends = document.getElementsByClassName('tc-friendsListOptions-refresh')[0],
        backgroundTileButton = document.getElementsByClassName('tc-friendsListOptions-background-tile')[0],
        tileButton = document.getElementsByClassName('tc-friendsListOptions-tile')[0],
        gridButton = document.getElementsByClassName('tc-friendsListOptions-grid')[0],
        filterOptions = document.getElementsByClassName('tc-friendsListOptions-options')[0];

    new tcTooltip(refreshFriends);
    new tcTooltip(backgroundTileButton);
    new tcTooltip(tileButton);
    new tcTooltip(gridButton);
    new tcTooltip(filterOptions);

    refreshFriends.addEventListener('click', function() {
      refreshFriends.classList.add('tc-refreshing');
      setTimeout(() => { refreshFriends.classList.remove('tc-refreshing'); }, 1000);
    }, false);

    backgroundTileButton.addEventListener('click', function() {
      document.documentElement.classList.add('friendsBackgroundTile');
      document.documentElement.classList.remove('friendsTile');
      document.documentElement.classList.remove('friendsGrid');
    }, false);

    tileButton.addEventListener('click', function() {
      document.documentElement.classList.add('friendsTile');
      document.documentElement.classList.remove('friendsBackgroundTile');
      document.documentElement.classList.remove('friendsGrid');
    }, false);

    gridButton.addEventListener('click', function() {
      document.documentElement.classList.add('friendsGrid');
      document.documentElement.classList.remove('friendsTile');
      document.documentElement.classList.remove('friendsBackgroundTile');
    }, false);

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
    const header = document.querySelector('.userPopout-3XzG_A .avatarWrapper-3H_478'),
          userPopout = document.querySelector('.userPopout-3XzG_A');
    if (!header) {
      return;
    }

    userPopout.parentElement.classList.add('tc-fixLeftUserPopout');

    // const id = header.children[0].children[0].style.backgroundImage.split('/')[4];
    // if (this.userProfileImages[id]) {
    //   header.style.backgroundImage = `url("${this.userProfileImages[id]}")`;
    // }
  }

  imageModalCheck () {

  }

  keyBindFunctions (e) {
    const globalSearchInput = document.getElementsByClassName('tc-titleWrapper-nav-global-search-input')[0];

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
    const globalSearchInput = document.getElementsByClassName('tc-titleWrapper-nav-global-search-input')[0],
          globalSearchOuter = document.getElementsByClassName('tc-titleWrapper-nav-global-search-outer')[0];

    if (!globalSearchOuter) return;

    var openQuickswitcher = this.WebpackModules.findByUniqueProperties(['QUICKSWITCHER_SHOW']).QUICKSWITCHER_SHOW,
        closeAllModals = this.WebpackModules.findByUniqueProperties(['push', 'update', 'pop', 'popWithKey']);

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
          var quickSwitcher = '.tc-titleWrapper-nav-global-search-input, .container-3qKHyN, .container-3qKHyN *',
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
      while(!roleName) await new Promise(p => setTimeout(p, 10));
      roleName.style.color = roleColor;
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
    if (
      !header ||
      !header.children[0] ||
      !header.children[0].children[0]
    ) {
      return;
    }

    // const id = header.children[0].children[0].style.backgroundImage.split('/')[4];
    // if (this.userProfileImages[id]) {
    //   header.style.backgroundImage = `url("${this.userProfileImages[id]}")`;
    // }
  }

  async injectUserStatus () {
    const tcTitlewrapperheader = document.getElementsByClassName('tc-titleWrapper')[0];
    if (!tcTitlewrapperheader) {
      return;
    }

      let userPresence = this.WebpackModules.findByUniqueProperties(['getPresence']),
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
	return this.WebpackModules.find(function (m) {
    return m.nl === ti[lang];
	});
};

setContextMenuItemClasses () {
  var UserStore = this.WebpackModules.findByUniqueProperties(["getUser","getUsers"]);
  var strings = this.getLanguageTable();
  var enstrings = this.getLanguageTable("en-US");
  let contextMenu = document.getElementsByClassName("contextMenu-HLZMGh")[0],
      contentMenuItems = document.getElementsByClassName("item-1Yvehc");
  var items = contentMenuItems;
  var instance = tc.react.get(contextMenu);
  var user = instance && instance.return.stateNode.props ? instance.return.stateNode.props.user : null;
  var channel = instance && instance.return.stateNode.props ? instance.return.stateNode.props.channel : null;
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
      if (string == label.textContent || (user && (string + " " + username) == label.textContent)) {
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

  onMaximize() {
		document.documentElement.classList.add("isMaximized");
	}

	onUnMaximize() {
		document.documentElement.classList.remove("isMaximized");
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

  start () {
    this.WebpackModules = (() => {
      const req = typeof(webpackJsonp) == "function" ? webpackJsonp([], {'__extra_id__': (module, exports, req) => exports.default = req}, ['__extra_id__']).default : webpackJsonp.push([[], {'__extra_id__': (module, exports, req) => module.exports = req}, [['__extra_id__']]]);
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

      const findByUniqueProperties = (propNames, options) => find(module => propNames.every(prop => module[prop] !== undefined), options);
      const findByProps = (...props) => findByUniqueProperties(props);
      const findByDisplayName = (displayName, options) => find(module => module.displayName === displayName, options);
      // Only use for development purposes... webpack id's can change in subsequent versions
      const findById = (id) => webpackRequire(id);

      return {find, findByProps, findByUniqueProperties, findByDisplayName, findById};
    })();

    const FriendsComponent = this.WebpackModules.find(m => m.displayName == "Friends");
    const cancel = DiscordInternals.monkeyPatch(FriendsComponent.prototype, "render", {before: ({thisObject}) => {thisObject.state.relationshipCount = 60;}});

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

    this.cancelVoiceChannelPatch = DiscordInternals.monkeyPatch(this.WebpackModules.findByUniqueProperties(["handleVoiceChannelSelect"]), "handleVoiceChannelSelect", { after : data => {
      if(data.methodArguments[0].channelId) this.insertVoiceConnected();
    } });

    const currentWindow = require("electron").remote.getCurrentWindow();
		if (currentWindow.isMaximized()) this.onMaximize();

		currentWindow.on("maximize", this.onMaximize);
    currentWindow.on("unmaximize", this.onUnMaximize);

    // const browserHistory = () =>  {
    //   let wc = currentWindow.webContents;
    //   currentWindow.on('app-command', async (ev, cmd) => {
    //     var backdrop, settings;
    //
    //     if (cmd !== 'browser-backward' && cmd !== 'browser-forward')
    //       return;
    //     if (cmd === 'browser-backward' && (backdrop = document.getElementsByClassName("backdrop-1wrmKB")[0])) {
    //       tc.webpack.utilities.closeModal();
    //     } else if (cmd === 'browser-backward' && (settings = document.getElementsByClassName("standardSidebarView-3F1I7i")[0])) {
    //       tc.webpack.userSettings.close();
    //     } else if (cmd === 'browser-backward' && wc.canGoBack()) {
    //       wc.goBack();
    //     } else if (cmd === 'browser-forward' && wc.canGoForward()) {
    //       wc.goForward();
    //     }
    //
    //     backdrop = void 0;
    //     settings = void 0;
    //   });
    // };


    // this.guildsTimeout = null;
    // document.body.addEventListener('mousemove', this.mouseMoveHandler, false);

    document.addEventListener('keydown', this.keyBindFunctions, false);

    var location;

    if (document.querySelector(".container-2Rl01u")) {
      location = 'serverView';
    } else if (document.querySelector(".privateChannels-1nO12o") && document.querySelector(".chat-3bRxxu")) {
      location = 'messagesView';
    } else if (document.querySelector("#friends")) {
      location = 'friendsView';
    } else if (document.querySelector(".activityFeed-28jde9")) {
        location = 'activityView';
    } else if (document.querySelector(".gameLibrary-TTDw4Y")) {
      location = 'libraryView';
    } else if (document.querySelector(".applicationStore-1pNvnv")) {
      location = 'storeView';
    }

    pixelRatio();
    // this.loadSnippets();
    // this.injectUserBackgrounds();
    //this.checkForUpdate();
    this.onSwitchViews();
    this.insertTopNav(location);
    // this.giphy();
    // this.zenMode();
    this.injectUserStatus();
    this.imageBtns();

    clearTimeout(this.startupTimeout);
    this.startupTimeout = setTimeout(()=> {
      // this.setUserIdAndBadges.bind(this);
      this.insertVoiceConnected.bind(this);
    }, 3000);

    document.documentElement.classList.add('friendsBackgroundTile', 'libraryTile');
    this.routeWatcher();
  }

  routeWatcher () {
    // tc.utils.nav
    //   .on('all', this.allViews)

    //   .on('activity', this.activityView)
    //   .on('friends', this.friendsView)
    //   .on('guilds', this.guildsView)
    //   .on('library', this.libraryView)
    //   .on('messages', this.messagesView)
    //   .on('store', this.storeView)
    //   .on('storeBrowse', this.storeBrowseView)
  };

  insertTopNav () {
    let topNavWrapper = document.querySelector('.tc-titleWrapper-nav');

    let userStore = this.WebpackModules.findByUniqueProperties(['getUser']),
        userName = userStore.getCurrentUser(),
        userAvatarURL = userStore.getUser(userName.id).getAvatarURL(),
        userStatusStore = this.WebpackModules.findByUniqueProperties(['getStatus']),
        userStatus = userStatusStore.getStatus(userName.id),
        userPresence = this.WebpackModules.findByUniqueProperties(['getPresence']),
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
          <div class="tc-titleWrapper-nav-messages-btn tc-titleWrapper-nav-btns" data-tc-tooltip="Messages"><icon class="tc-icon tc-titleWrapper-nav-icon-messages"></icon><p class="tc-titleWrapper-nav-view-name">Messages</p></div>
          <div class="tc-titleWrapper-nav-friends-btn tc-titleWrapper-nav-btns" data-tc-tooltip="Friends"><icon class="tc-icon tc-titleWrapper-nav-icon-friends"></icon><p class="tc-titleWrapper-nav-view-name">Friends</p></div>
          <div class="tc-titleWrapper-nav-activity-btn tc-titleWrapper-nav-btns" data-tc-tooltip="Activity"><icon class="tc-icon tc-titleWrapper-nav-icon-activity"></icon><p class="tc-titleWrapper-nav-view-name">Activity</p></div>
          <div class="tc-titleWrapper-nav-library-btn tc-titleWrapper-nav-btns" data-tc-tooltip="Library"><icon class="tc-icon tc-titleWrapper-nav-icon-library"></icon><p class="tc-titleWrapper-nav-view-name">Library</p></div>
          <div class="tc-titleWrapper-nav-store-btn tc-titleWrapper-nav-btns" data-tc-tooltip="Store"><icon class="tc-icon tc-titleWrapper-nav-icon-store"></icon><p class="tc-titleWrapper-nav-view-name">Store</p></div>
          <div class="tc-titleWrapper-nav-lfg-btn tc-titleWrapper-nav-btns disabled" data-tc-tooltip="LFG"><icon class="tc-icon tc-titleWrapper-nav-icon-lfg"></icon><p class="tc-titleWrapper-nav-view-name">LFG</p></div>
          <div class="tc-titleWrapper-nav-global-search-outer">
            <div class="tc-titleWrapper-nav-global-search-inner">
                <input class="tc-titleWrapper-nav-global-search-input" type="text" placeholder="Search">
                <div class="tc-titleWrapper-nav-search-bar-icon">
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
          <div class="tc-titleWrapper-account-mentions-outer" data-tc-tooltip="Mentions">
            <div class="tc-titleWrapper-account-mentions-inner">
              <icon class="tc-icon tc-titleWrapper-account-mentions"></icon>
              <div class="tc-titleWrapper-account-mentions-new-indicator"></div>
            </div>
          </div>
          <div class="tc-titleWrapper-account-panel-outer">
            <div class="tc-titleWrapper-account-panel-inner">
              <div class="tc-titleWrapper-account-avatar-container">
                  <div class="tc-titleWrapper-account-avatar avatar-small" style="background-image: url(${userAvatarURL});"></div>
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

      document.getElementsByClassName(`${tc.classes.twitchcord.titleWrapper}-nav-messages-btn`)[0].addEventListener('click', () => tc.utils.nav.private());
      document.getElementsByClassName(`${tc.classes.twitchcord.titleWrapper}-nav-friends-btn`)[0].addEventListener('click', () => tc.utils.nav.friends());
      document.getElementsByClassName(`${tc.classes.twitchcord.titleWrapper}-nav-activity-btn`)[0].addEventListener('click', () => tc.utils.nav.activity());
      document.getElementsByClassName(`${tc.classes.twitchcord.titleWrapper}-nav-library-btn`)[0].addEventListener('click', () => tc.utils.nav.library());
      document.getElementsByClassName(`${tc.classes.twitchcord.titleWrapper}-nav-store-btn`)[0].addEventListener('click', () => tc.utils.nav.store());
      document.getElementsByClassName(`${tc.classes.twitchcord.titleWrapper}-nav-lfg-btn`)[0].addEventListener('click', () => tc.utils.nav.lfg());

      let tcAccountPanel = document.getElementsByClassName(`${tc.classes.twitchcord.titleWrapper}-account-panel-outer`)[0];
      if (tcAccountPanel) {
        tcAccountPanel.addEventListener('click', () => {
          let tcAccountPanelFresh = document.querySelector('.tc-titleWrapper-account-panel-outer');
          if (tcAccountPanelFresh && tcAccountPanelFresh.classList.contains('opened')) {
            document.body.click();
          } else {
            document.querySelector('.container-2Thooq .wrapper-2F3Zv8 > .avatar-small').click();
          }
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

    this.WebpackModules.findbyUniqueProperties(["handleVoiceChannelSelect"]).handleVoiceChannelSelect.unpatch();
  }
}
>>>>>>> 9f486902c4d3a5b198c1402007d82bc6a1916d73
