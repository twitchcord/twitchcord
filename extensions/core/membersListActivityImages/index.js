class membersListActivityImages {
  getName () { return 'User Activity Images'; }
  getVersion () { return '0.0.1'; }
  getAuthor () { return 'Baked'; }
  getDescription () { return 'Adds game icons to user activities in the channel members list. Made especially for Twitchcord.'; }

  constructor () {
    this.activityList = ['Twitchcord','7 Days to Die','9Dragons','APB Reloaded','ARK: Survival Evolved','Adventure Capitalist','Albion Online','Archeage','ARMA 2: Operation Arrowhead','Arma 3','Assassin\'s Creed: Origins','Awesomenauts','Battle Battalions','BattleBlock Theater','Battlefield 1','Battlefield 3','Battlefield 4','Battlefield Hardline','Battlerite','Besiege','Bioshock Infinite','Blade & Soul','Borderlands 2','Borderlands: The Pre Sequel','Brawlhalla','Breakaway','Call of Duty 2','Call of Duty 3','Call of Duty: Advanced Warfare','Call of Duty: Black Ops II Zombies','Call of Duty: Black Ops II','Call of Duty: Black Ops','Call of Duty: Infinite Warfare','Castle Crashers','Chivalry: Medieval Warfare','Cities: Skylines','Civilization III: Conquests','Civilization IV','Civilization VI','Clicker Heroes','Company of Heroes 2','Counter-Strike: Condition Zero','Counter-Strike: Source','Counter-Strike','Crusader King II','Cubeworld','DAYZ','DC Universe Online','Dark Souls 2','Dark Souls III','Dark Souls','Dark and Light','Darkest Dungeon','Day of Defeat','Dead By Daylight','Defiance','Desert Rangers','Destiny 2','Diablo 3','Dirty Bomb','Discord','Dolphin','Don\'t Starve Together','Don\'t Starve','DOOM 3','DOTA','Dragon Age: Inquisition','Dragon Nest','Dungeons and Dragons Online','EVE Online','Everquest','Elite: Dangerous','Elite Dangerous','Empyrion Galactic Survival','Euro Truck Simulator','Europa Universalias IV','FIFA 15','FIFA 16','FIFA 17','FIFA 18','FTL: Faster Than Light','Facebook','Factorio','Fallout 4','Fallout','Far Cry 4','Final Fantasy XIV','Firefox','Football Manager 2015','Football Manager 2016','Football Manager 2017','Fortnite','GRID 2','Galactic Civilizations III','Garry\'s Mod','Gears of War','Github','Goat Simulator','Google Chrome','Grand Theft Auto IV','Grand Theft Auto V','Grand Theft Auto 4','Grand Theft Auto 5','Grey Goo','Guild Wars 2','H1Z1: King of the Hill','H1Z1','Hearthstone','Hearts of Iron IV','Heroes & Generals','Heroes of the Storm','Hurtworld','Infinite Crisis','Insanity Clicker','Insurgency','IntelliJ','Internet Explorer','Just Cause 2','Kerbal Space Program','Killing Floor 2','Killing Floor','Kingdom Come: Deliverance','League of Legends','Left4Dead 2','Lego Racers','Life is Feudal','Lineage II','Mad Max','Mafia 3','Magicka 2','Magicka','Magic the Gathering','Marvel Heroes 2015','Massive Chalice','Medieval Engineers','Medieval II: Total War','Metal Gear Solid V','Microsoft Edge','Minecraft','Mount and Blade Warband','NBA 2K16','NBA 2K17','Netflix','Neverwinter','No Man\'s Sky','Oort Online','osu','Overwatch','Payday: The Heist','Payday 2','Paragon','Path of Exile','Photoshop','Pillars of Eternity','Planet Coaster','PlanetSide 2','PLAYERUNKNOWN\'S BATTLEGROUNDS','Portal 2','Portal','Rebuild 3: Gangs of Deadsville','Reign of Kings','Rift','Roblox','Robocraft','Rocket League','Runescape','Runes of Magic','Rust','Saints Row 2','Saints Row 4','Shadow Warrior 2','ShellShock Live','Sid Meier\'s Civilization: Beyond Earth','Sid Meier\'s Civilization V','Skyforge','Skype','Smite','Spore','Spotify','Star Citizen','Starcraft 2','Starcraft II','Star Trek Online','Star Wars Battlefront','Star Wars Battlefront II','Star Wars: The Old Republic','Starbound','Stardew Valley','Steam','Stellaris','Streamline','Street Fighter V','Strife','Stronghold Kingdoms','Sublime','Sunless Sea','Survarium','Team Fortress 2','TERA','Terraria','Tekken 6','The Binding of Isaac','The Elder Scrolls Online','The Elder Scrolls V: Skyrim','The Lord of the Rings: War in the South','The Paladins','The Secret World: Legends','The Sims 3','The Forest','This War of Mine','Titanfall','Tom Clancy\'s Rainbow Six Siege','Tom Clancy\'s The Division','The Division','Total War: ARENA','Total War: ATTILA','Total War: ROME II','Total War: Shogun 2','Total War: WARHAMMER','Tree of Life','Tree of Savior','Tropico','Trove','Ultimate Chicken Horse','Twitch','Twitter','Undertale','Unturned','VSCode','Visual Studio','Wakfu','War Thunder','Warface','Warframe','Watch Dogs 2','Watch Dogs','Wildstar','Witcher 3','World of Tanks','World of Warcraft','World of Warships','XCOM: Enemy Unknown'];
    this.GAME_ICONS_24x24_BASE = 'https://twitchcord.com/app/assets/images/games/icons/20x20/';
    this.observers = [];
    this.tcActivityPlaying = 'tc-activityPlaying';
  }

  async injectUserActivities () {
    if (!document.querySelector('.membersWrap-2h-GB4')) {
      return;
    }

    document
      .querySelectorAll('.member-3-YXUe')
      .forEach(member => {
        const activityTextNode = member.querySelector('.activityText-yGKsKm');
        if (activityTextNode) {
          this.injectChannelMembersActivities(activityTextNode);
        }
      });

    let observertarget = null;
    this.userListObserver = new MutationObserver((changes, _) => {
      changes.forEach(
        (change, i) => {
          if (change.removedNodes && change.removedNodes.length !== 0 &&
            change.removedNodes[0].classList && change.removedNodes[0].classList.contains('activity-2Gy-9S') &&
            change.previousSibling && change.previousSibling.closest('.member-3-YXUe') &&
            change.previousSibling.closest('.member-3-YXUe').querySelector(`.${this.tcActivityPlaying}`) &&
            change.previousSibling.closest('.member-3-YXUe').querySelector(`.${this.tcActivityPlaying}`).parentElement) {
            change.previousSibling.closest('.member-3-YXUe').querySelector(`.${this.tcActivityPlaying}`).parentElement.removeChild(change.previousSibling.closest('.member-3-YXUe').querySelector(`.${this.tcActivityPlaying}`));
          }
          if (change.addedNodes) {
            change.addedNodes.forEach((node) => {
              if (node.querySelector) {
                let strong = node.querySelector('.activityText-yGKsKm strong');
                if (node && strong) {
                    this.injectChannelMembersActivities(strong);
                }
              }
            });
          }
          if (change.type && change.type == 'characterData' && change.target) {
            if (change.target.parentElement && change.target.parentElement.className == 'activityText-yGKsKm') {
              let strong = change.target.parentElement.querySelector('strong');
              this.injectChannelMembersActivities(strong);
            }
          }
        }
      );
    });

    if (observertarget = document.querySelector('.membersWrap-2h-GB4')) {
      this.userListObserver.observe(observertarget, {
        characterData: true,
        childList: true,
        subtree: true
      });
    }
    this.observers.push(this.userListObserver);
  }

  async injectChannelMembersActivities (node) {
    let returnString,
        nodeString = node.innerHTML.toLowerCase(),
        memberParent = node.closest('.member-3-YXUe');

    const activityPlayingNode = memberParent.querySelector(`.${this.tcActivityPlaying}`);
    if (activityPlayingNode) {
      activityPlayingNode.remove();
    }

    let tcStatusImage;
    for (const activity of this.activityList) {
      const activityLowerCase = activity.toLowerCase();
      if (nodeString.includes(activityLowerCase)) {
        const slugifyReturnString = tc.lib.slugify(activity);
        tcStatusImage = document.querySelector(`.${this.tcActivityPlaying}`);
        if (tcStatusImage && tcStatusImage.childNode) {
          tcStatusImage.childNode.src = `${this.GAME_ICONS_24x24_BASE}${slugifyReturnString}.png`;
        } else {
          const returnDiv = `
            <div class="${this.tcActivityPlaying}">
              <img
                class="${this.tcActivityPlaying}-img"
                src="${this.GAME_ICONS_24x24_BASE}${slugifyReturnString}.png"
                width="20" height="20"
              />
            </div>
          `;
          memberParent.insertAdjacentHTML('afterbegin', returnDiv);
        }
        break;
      } else {
        if (tcStatusImage) {
          tcStatusImage.remove();
        }
      }
    }
  }

  start () {
    setTimeout(() => {
    this.injectUserActivities();
    tc.utils.nav
      .on('dm', this.injectUserActivities, this)
      .on('guild', this.injectUserActivities, this);
    }, 3000);
  }

  stop () {
    for (const observer of this.observers) {
      observer.disconnect();
    }

    document
      .querySelectorAll('.tc-activityPlaying')
      .forEach(activity => {
        activity.remove();
      });

    tc.utils.nav
      .removeListener('dm', this.injectUserActivities, this)
      .removeListener('guild', this.injectUserActivities, this);
  }
}

module.exports = new membersListActivityImages