const { get, getAll, modules } = require('./webpack');

module.exports = {
  
    findContaining (targetValue) {
       if (typeof targetValue !== 'string') {
           throw new TypeError(`Expected a string for targetValue, received ${typeof targetValue}`);
       }

       return [ ...this.traverse(targetValue, true) ];
   },

   find (targetValue) {
         if (typeof targetValue !== 'string') {
           throw new TypeError(`Expected a string for targetValue, received ${typeof targetValue}`);
         }

         return [ ...this.traverse(targetValue, false) ];
     },

   * traverse (
       targetValue,
       containing,
       currentPath = `tc.${Object.keys(tc).find(k => tc[k] === this)}`,
       object = this
     ) {
       if (typeof object !== 'object') {
         return false;
       }

       const matchedKeys =
         !containing
         ? Object.keys(object).filter(key => object[key] === targetValue)
         : Object.keys(object).filter(key => typeof object[key] === 'string' && object[key].includes(targetValue));

       if (matchedKeys[0]) {
         yield *matchedKeys.map(key => `${currentPath}.${key}`);
       } else {
         for (const key in object) {
           const found = this.traverse(targetValue, containing, `${currentPath}.${key}`, object[key]);
           if (found) {
             yield *found;
           }
         }
       }
   },

    base: {
        avatar: {
            avatar: 'avatar-17mtNa',
            image: 'image-33JSyf',
            icon: 'icon-3o6xvg',
            wrapper: 'wrapper-2F3Zv8',

            iconActiveLarge: 'iconActiveLarge-2nzn9z',
            iconActiveMedium: 'iconActiveMedium-1UaEIR',
            iconActiveMini: 'iconActiveMini-3PzjMn',
            iconActiveSmall: 'iconActiveSmall-3IUUtn',
            iconActiveXLarge: 'iconActiveXLarge-_qKvKn',
            iconInactive: 'iconInactive-98JN5i',

            iconSizeLarge: 'iconSizeLarge-161qtT',
            iconSizeMedium: 'iconSizeMedium-2OqPjI',
            iconSizeMini: 'iconSizeMini-3dKErj',
            iconSizeSmall: 'iconSizeSmall-3aWgx9',
            iconSizeXLarge: 'iconSizeXLarge-1AvWOw',

            large: 'large-3ChYtB',
            largeOld: 'avatar-large',
            small: 'small-5Os1Bb',
            smallOld: 'avatar-small',
            xlarge: 'xlarge-2z2DtB',
            xlargeOld: 'avatar-xlarge',
            xxlarge: 'xxlarge-1R_NA5',
            xxlargeOld: 'avatar-xxlarge',
            xsmall: 'xsmall-3afG_L',
            xsmallOld: 'avatar-xsmall'
        }
    },
    components: {
        attachments: {
            ...getAll('attachment'),
            progressBar: 'progressBar-3u8FBM'
        },
        buttons: {
            button: "button-38aScr",
            buttonShine: "buttonShine-1CSUM8",

            colorBlack: "colorBlack-1jwPVL",
            colorBrand: "colorBrand-3pXr91",
            colorGreen: "colorGreen-29iAKY",
            colorGrey: "colorGrey-2DXtkV",
            colorLink: "colorLink-35jkBc",
            colorPrimary: "colorPrimary-3b3xI6",
            colorRed: "colorRed-1TFJan",
            colorTransparent: "colorTransparent-1ewNp9",
            colorWhite: "colorWhite-rEQuAQ",
            colorYellow: "colorYellow-2JqYwt",

            contents: "contents-18-Yxp",
            fullWidth: "fullWidth-1orjjo",
            grow: "grow-q77ONN",
            hasHover: "hasHover-3X1-zV",

            hoverBlack: "hoverBlack-3jULb8",
            hoverBrand: "hoverBrand-1_Fxlk",
            hoverGreen: "hoverGreen-1gjdJc",
            hoverGrey: "hoverGrey-2CBXu0",
            hoverLink: "hoverLink-i1fEKS",
            hoverPrimary: "hoverPrimary-2D1j2r",
            hoverRed: "hoverRed-2NoOXI",
            hoverTransparent: "hoverTransparent-2Lz5CN",
            hoverWhite: "hoverWhite-2uUmXw",
            hoverYellow: "hoverYellow-171chs",

            lookBlank: "lookBlank-3eh9lL",
            lookFilled: "lookFilled-1Gx00P",
            lookGhost: "lookGhost-2Fn_0-",
            lookInverted: "lookInverted-2D7oAl",
            lookLink: "lookLink-9FtZy-",
            lookOutlined: "lookOutlined-3sRXeN",

            sizeIcon: "sizeIcon-1-kvKI",
            sizeLarge: "sizeLarge-1vSeWK",
            sizeMax: "sizeMax-1Mj0eU",
            sizeMedium: "sizeMedium-1AC_Sl",
            sizeMin: "sizeMin-1mJd1x",
            sizeSmall: "sizeSmall-2cSMqn",
            sizeXlarge: "sizeXlarge-2yFAlZ",

            shine: 'shine-2f1uEU',
            shineContainer: "shineContainer-1HHuZ1",
            shineContainerDefault: "shineContainerDefault-2bbFgu",
            shineContainerSmall: "shineContainerSmall-1MIVgq",
            shineInner: "shineInner-fWUhvE",
            shinyButton: "shinyButton-3uFlM-",

            spinner: "spinner-3a9zLT",
            spinnerItem: "spinnerItem-3GlVyU",
            submitting: "submitting-3qlO9O",
            iconSmall: "iconActiveSmall-3IUUtn"
        },
        modals: {
          settings: {
            
          },
          userSettings: {
            ...getAll('userSettingsAccount', 'userInfoEditing')
          },
          guildSettings: {
            
          },
          channelSettings: {
            
          }
        }
    },
    layout: {
      guilds: {
        ...getAll('friendsOnline', 'guildSeparator')
      }
    },
    twitchcord: {
      titleWrapper: `tc-titleWrapper`
    }
};
