window.emotesTwitch = {};
window.twitchEmotesUrl = "https://twitchemotes.com/api_cache/v3/global.json";
window.twitchEmoteUrlStart = "https://static-cdn.jtvnw.net/emoticons/v1/";
window.twitchEmoteUrlEnd = "/2.0"
window.twitchEmotePickerEnd = "/1.0"

window.emotesTwitchSub = {};
var emotesTwitchSubPreKeys;

window.emotesFFZ = {};
var emotesFFZPreKeys;
window.emotesFFZUrlStart = "https://cdn.frankerfacez.com/emoticon/"
window.emotesFFZUrlEnd = "/1"

window.bttvEmotesChannel = {};
var bttvEmotesChannelPreKeys;

window.bttvEmotes = {};
window.bttvUrl = "https://api.betterttv.net/2/emotes";
window.bttvEmoteUrlStart = "https://cdn.betterttv.net/emote/";
window.bttvEmoteUrlEnd = "/2x";
window.bttvEmotePickerEnd = "/1x";


/**
* Manages the injection of emotes.
*/
class emoteModule {

    /**
    * Initializes functions and loads emote lists.
    */
    async startup() {
        //this passes element to a global variable for usage in the add to faves function which gets available after injection through the global nodeFilter.
        $(document).on('contextmenu', '.teE > img.emoji', function() {
            window.leftClickElem = this;
        });

        //in case the mouseleave function doesn't get triggered this removes the tooltip from an emote.
        $(document).click(function() {
            if(document.querySelector('#pcEmoteTooltip')) document.querySelector('#pcEmoteTooltip').remove();
        });

        emotesTwitch = api.load('twitchEmotes');
        emotesTwitchSub = api.load('twitchSubEmotes');
        emotesFFZ = api.load('ffzEmotes');
        bttvEmotesChannel = api.load('bttvSub');
        bttvEmotes = api.load('bttvEmotes');

        emotesFFZPreKeys = Object.keys(emotesFFZ);
        emotesTwitchSubPreKeys = Object.keys(emotesTwitchSub);
        bttvEmotesChannelPreKeys = Object.keys(bttvEmotesChannel)

        //create a tooltip when hovering over an emote.
        $(document.documentElement).on('mouseenter', '.teE img', function() {
            let rect = this.getBoundingClientRect();
            let elem = document.createElement('div');
            elem.className = 'tooltip tooltip-top tooltip-black';
            elem.innerHTML = this.alt;
            elem.style.top = rect.top-30+'px';
            elem.id = 'pcEmoteTooltip';
            document.querySelector('#app-mount .tooltips').appendChild(elem);
            elem.style.left = rect.left+(this.clientWidth/2)-(elem.clientWidth/2)+'px';
        });

        //remove a tooltip from an emote if leaving the element
        $(document.documentElement).on('mouseleave', '.teE img', function() {
            if(document.querySelector('#pcEmoteTooltip')) document.querySelector('#pcEmoteTooltip').remove();
        });
    }

    /**
    * Inserts the add / remove from favs button to the context menu.
    * @param {element} i the context menu.
    */    
    async insertFavBtn(i) {
        if(typeof leftClickElem !== 'undefined' && leftClickElem){
            let elem = leftClickElem,
                btnTxt = 'Add to Favorites';

            leftClickElem = null;

            i.style.display = '';
            if(pcConfig.favEmotes.includes(elem.alt)) {
                btnTxt = 'Remove from Favorites';
            }
            if(elem.parentElement.classList.contains('teE')) {
                let btnHtml = `<div class="${api.fixedClasses.contextMenu.itemGroup} pcFavBtn">
                <div class="item-1Yvehc tc-contextitem context-twitch-emote-add-to-favorites">
                <span>${btnTxt}</span>
                </div>`;
                i.insertAdjacentHTML('afterBegin', btnHtml);
                if(i.offsetTop < mousePos.y) {
                    i.style.top = i.offsetTop-document.querySelector('.pcFavBtn').clientHeight-5+"px";
                }
                document.querySelector('.pcFavBtn').onclick = (function(nam){
                    return function() {
                        if(pcConfig.favEmotes.includes(nam)) {
                            pcConfig.favEmotes.splice(pcConfig.favEmotes.indexOf(nam), 1);
                            api.save('twitchcord', pcConfig);
                            api.save('twitchcordBackup', pcConfig);
                        } else {
                            pcConfig.favEmotes.push(nam);
                            api.save('twitchcord', pcConfig);
                            api.save('twitchcordBackup', pcConfig);
                        }
                        i.style.display = 'none';
                    }
                })(elem.alt);
            }
        }
    }

    /**
    * Inserts the emote menu.
    */  
    async insertEmoteBtns() {
        document.querySelector("[class*=emojiPicker]").style.height = "358px";
        document.querySelector("[class*=emojiPicker]").style.width = "344px";
        document.querySelector("[class*=emojiPicker] [class*=header]").insertAdjacentHTML('beforeBegin', `
        <div class="emoteTypeBtns">
            <div id="emoteMore">More</div><div id="emoteDefault" class="selected">Default</div>
        </div>
        `);
        
        $('.emoteTypeBtns > div').mousedown(e => {
            if(!e.currentTarget.classList.contains('selected')){
                $('.emoteTypeBtns > div').toggleClass('selected');
                if(e.currentTarget.id == 'emoteMore'){
                    for(let element of document.querySelectorAll("[class*=emojiPicker]" +' > *:not(.emoteTypeBtns)')) {
                        element.style.display = 'none';
                    }
                    document.querySelector('.emoteTypeBtns').insertAdjacentHTML('afterEnd', `
                    <div class="emoteContainer">
                        <div class="${api.fixedClasses.diversitySelector.header}">
                            <div class="search-bar search-bar-light"><div class="search-bar-inner"><input id="search" type="text" placeholder="Find the perfect emote" value=""><div class="search-bar-icon"><i class="icon icon-search-bar-eye-glass visible"></i><i class="icon icon-search-bar-clear"></i></div></div></div>
                        </div>
                        <div class="pcScroller">
                            <div class="emoteItemContainer">
                                <div id="favContainer">
                                </div>
                                <div id="twitchEmotesContainer">
                                    <div>
                                        <div class="${api.fixedClasses.diversitySelector.category}">Twitch Emotes</div>
                                    </div>
                                </div>
                                <div id="bttvEmotesContainer">
                                    <div>
                                        <div class="${api.fixedClasses.diversitySelector.category}">BTTV Emotes</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="${api.fixedClasses.diversitySelector.categories}"></div>
                    </div>
                    `);

                    $('.emoteContainer').on('mouseenter', '.pcEmoteItem', function() {
                        $('.pcEmoteSelected').removeClass('pcEmoteSelected');
                        $(this).addClass('pcEmoteSelected');
                        document.querySelector('.emoteContainer input').placeholder = this.querySelector('img').alt;
                    });

                    $('.emoteContainer').on('click', '.pcEmoteItem', function() {
                        let name = this.querySelector('img').alt,
                            textarea = document.querySelector('textarea'),
                            space = '';
                        
                        if(textarea.value.length != 0) space = ' ';

                        let text = textarea.value.substr(0, textarea.selectionStart) + space +
                        name +
                        textarea.value.substr(textarea.selectionEnd, textarea.value.length);

                        textarea.focus();
                        textarea.selectionStart = 0;
                        textarea.selectionEnd = textarea.value.length;
                        document.execCommand("insertText", false, text)
                    });

                    $('.emoteContainer').on('contextmenu', '.pcEmoteItem:not(.pcFavEmote)', function() {
                        let name = this.querySelector('img').alt;
                        
                        if(!pcConfig.favEmotes.includes(name)){
                            pcConfig.favEmotes.push(name);
                            api.save('twitchcord', pcConfig);
                            api.save('twitchcordBackup', pcConfig);


                            if(document.querySelector('#favContainer')) {
                                let emote = this.cloneNode(true);
                                if(emote.classList.contains('pcEmoteSelected')) emote.classList.remove('pcEmoteSelected');
                                emote.classList.add('pcFavEmote');
                                document.querySelector('#favContainer').insertAdjacentElement('beforeEnd', emote);
                            }
                        }
                    });

                    $('.emoteContainer').on('contextmenu', '.pcFavEmote.pcEmoteItem', function() {
                        let name = this.querySelector('img').alt;
                        
                        api.confirmationBox(`REMOVE ${name.toUpperCase()} FROM FAVORITES`, `Are you sure you want to remove <strong>${name}</strong> from your favorites list? This action cannot be undone.`, bool => {
                            if(bool) {
                                if(pcConfig.favEmotes.includes(name)) {
                                    pcConfig.favEmotes.splice(pcConfig.favEmotes.indexOf(name), 1);
                                    api.save('twitchcord', pcConfig);
                                    api.save('twitchcordBackup', pcConfig);

                                    if(document.querySelector(`.pcFavEmote img[alt="${name}"]`)) {
                                        document.querySelector(`.pcFavEmote img[alt="${name}"]`).parentElement.remove();
                                    }
                                }
                            }
                        });
                    });

                    document.querySelector('#search').oninput = async elem => {
                        let value = elem.currentTarget.value;
                        if(document.querySelector('#searchresult')) document.querySelector('#searchresult').remove();
                        if(value.length != 0) {
                            document.querySelector('.emoteItemContainer').style.display = 'none';
                            document.querySelector('.emoteItemContainer').insertAdjacentHTML('afterEnd', `
                            <div id="searchresult"></div>
                            `);

                            let emotesTwitchKeys = Object.keys(emotesTwitch);
                            for(let word of emotesTwitchKeys) {
                                if(word.includes(value) && !pcConfig.favEmotes.hasOwnProperty(word)) {
                                    document.querySelector('#searchresult').insertAdjacentHTML('beforeEnd', '<div class="pcEmoteItem"><img alt="'+word+'" class="emoji" src="' + twitchEmoteUrlStart + emotesTwitch[word] + twitchEmotePickerEnd + '" /></div>');
                                }
                            }

                            for(let word of bttvEmotes.emotes) {
                                if(word.code.includes(value) && !pcConfig.favEmotes.hasOwnProperty(word)){
                                    document.querySelector('#searchresult').insertAdjacentHTML('beforeEnd', '<div class="pcEmoteItem"><img alt="'+word.code+'" class="emoji" src="' + bttvEmoteUrlStart + word.id + bttvEmotePickerEnd + '" /></div>');
                                }
                            }

                            let emotesTwitchSubKeys = emotesTwitchSubPreKeys.filter(word => word.includes(value));
                            for(let word of emotesTwitchSubKeys) {
                                if(pcConfig.favEmotes.hasOwnProperty(word)) continue;
                                if (document.querySelectorAll('#searchresult .pcEmoteItem').length < 140) {
                                    document.querySelector('#searchresult').insertAdjacentHTML('beforeEnd', '<div class="pcEmoteItem"><img alt="'+word+'" class="emoji" src="' + twitchEmoteUrlStart + emotesTwitchSub[word] + twitchEmotePickerEnd + '" /></div>');
                                } else {
                                    break;
                                }
                            }

                            let bttvEmotesChannelKeys = bttvEmotesChannelPreKeys.filter(word => word.includes(value));
                            for(let word of bttvEmotesChannelKeys) {
                                if(pcConfig.favEmotes.hasOwnProperty(word)) continue;
                                if (document.querySelectorAll('#searchresult .pcEmoteItem').length < 140) {
                                    document.querySelector('#searchresult').insertAdjacentHTML('beforeEnd', '<div class="pcEmoteItem"><img alt="'+word+'" class="emoji" src="' + bttvEmoteUrlStart + bttvEmotesChannel[word] + bttvEmotePickerEnd + '" /></div>');
                                } else {
                                    break;
                                }
                            }

                            let emotesFFZKeys = emotesFFZPreKeys.filter(word => word.includes(value));
                            for(let word of emotesFFZKeys) {
                                if(pcConfig.favEmotes.hasOwnProperty(word)) continue;
                                if (document.querySelectorAll('#searchresult .pcEmoteItem').length < 140) {
                                    document.querySelector('#searchresult').insertAdjacentHTML('beforeEnd', '<div class="pcEmoteItem"><img alt="'+word+'" class="emoji" src="' + emotesFFZUrlStart + emotesFFZ[word] + emotesFFZUrlEnd  + '" /></div>');
                                } else {
                                    break;
                                }
                            }

                        } else {
                            document.querySelector('.emoteItemContainer').style.display = '';
                        }
                    }


                    for(let word of Object.keys(emotesTwitch)) {
                        document.querySelector('#twitchEmotesContainer').insertAdjacentHTML('beforeEnd', '<div class="pcEmoteItem"><img alt="'+word+'" class="emoji" src="' + twitchEmoteUrlStart + emotesTwitch[word] + twitchEmotePickerEnd + '" /></div>');
                    }

                    for(let word of bttvEmotes.emotes) {
                        document.querySelector('#bttvEmotesContainer').insertAdjacentHTML('beforeEnd', '<div class="pcEmoteItem"><img alt="'+word.code+'" class="emoji" src="' + bttvEmoteUrlStart + word.id + bttvEmotePickerEnd + '" /></div>');
                    }

                    if(pcConfig.favEmotes.length != 0) {
                        document.querySelector('#favContainer').insertAdjacentHTML('afterBegin', `
                        <div>
                            <div class="${api.fixedClasses.diversitySelector.category}">Favorite Emotes</div>
                        </div>
                        `);
                        pcConfig.favEmotes.some(word => {
                            if (emotesTwitch.hasOwnProperty(word)) {
                                document.querySelector('#favContainer').insertAdjacentHTML('beforeEnd', '<div class="pcFavEmote pcEmoteItem"><img alt="'+word+'" class="emoji" src="' + twitchEmoteUrlStart + emotesTwitch[word] + twitchEmotePickerEnd + '" /></div>');
                                return;
                            }
                            if (emotesTwitchSub.hasOwnProperty(word)) {
                                document.querySelector('#favContainer').insertAdjacentHTML('beforeEnd', '<div class="pcFavEmote pcEmoteItem"><img alt="'+word+'" class="emoji" src="' + twitchEmoteUrlStart + emotesTwitchSub[word] + twitchEmotePickerEnd + '" /></div>');
                                return;
                            }
                            for(let i of bttvEmotes.emotes) {
                                if (i.code == word) {
                                    document.querySelector('#favContainer').insertAdjacentHTML('beforeEnd', '<div class="pcFavEmote pcEmoteItem"><img alt="'+word+'" class="emoji" src="' + bttvEmoteUrlStart + i.id + bttvEmotePickerEnd + '" /></div>');
                                    return;
                                }
                            }
                            if (bttvEmotesChannel.hasOwnProperty(word)) {
                                document.querySelector('#favContainer').insertAdjacentHTML('beforeEnd', '<div class="pcFavEmote pcEmoteItem"><img alt="'+word+'" class="emoji" src="' + bttvEmoteUrlStart + bttvEmotesChannel[word] + bttvEmotePickerEnd + '" /></div>');
                                return;
                            }
                            if (word in emotesFFZ) {
                                document.querySelector('#favContainer').insertAdjacentHTML('beforeEnd', '<div class="pcFavEmote pcEmoteItem"><img alt="'+word+'" class="emoji" src="' + emotesFFZUrlStart + emotesFFZ[word] + emotesFFZUrlEnd  + '" /></div>');
                                return;
                            }
                            
                        });
                    }
                }

                if(e.currentTarget.id == 'emoteDefault') {
                    for(let element of document.querySelectorAll("[class*=emojiPicker]" +' > *:not(.emoteTypeBtns)')) {
                        element.style.display = '';
                    }
                    document.querySelector('.emoteContainer').remove();
                }
            }
        });
    }

    /**
    * Replace a word with an emote.
    * @param {element} node any text node where you wanna use emotes
    */  
    async replaceEmote(node) {
        let words = node.innerText.replace(/\n/ig, " ").split(/[ (),.:;!?]/g);
        let emojiClass;

        if(words.length == 1) {
            emojiClass = "emoji jumboable";
        } else {
            emojiClass = "emoji";
        }

        words.some(function(word) {
            if(pcConfig.enabledSettings.emoteBlackList ? !pcConfig.emoteBlacklist.includes(word) : true){
                if (emotesTwitch && pcConfig.enabledSettings.twitchEmotes) {
                    if (emotesTwitch.hasOwnProperty(word)) {
                        node.innerHTML = node.innerHTML.replace(new RegExp(`(^|\\s)(${word})(?=\\s|$)|(\\s${word})(?=<)`), '<span class="teE" tc-tooltip tc-title="'+word+'"><img alt="'+word+'" class="'+emojiClass+'" src="' + twitchEmoteUrlStart + emotesTwitch[word] + twitchEmoteUrlEnd + '" /></span>');
                        return;
                    }
                }
                if (emotesTwitchSub && pcConfig.enabledSettings.emotesTwitchSub) {
                    if (emotesTwitchSub.hasOwnProperty(word)) {
                        node.innerHTML = node.innerHTML.replace(new RegExp(`(^|\\s)(${word})(?=\\s|$)|(\\s${word})(?=<)`), '<span class="teE" tc-tooltip tc-title="'+word+'"><img alt="'+word+'" class="'+emojiClass+'" src="' + twitchEmoteUrlStart + emotesTwitchSub[word] + twitchEmoteUrlEnd + '" /></span>');
                        return;
                    }
                }
                if (bttvEmotes && bttvEmotes.emotes && pcConfig.enabledSettings.bttvEmotes) {
                    for(let i of bttvEmotes.emotes) {
                        if (i.code == word) {
                            node.innerHTML = node.innerHTML.replace(new RegExp(`(^|\\s)(${word})(?=\\s|$)|(\\s${word})(?=<)`), '<span class="teE" tc-tooltip tc-title="'+word+'"><img alt="'+word+'" class="'+emojiClass+'" src="' + bttvEmoteUrlStart + i.id + bttvEmoteUrlEnd + '" /></span>');
                            return;
                        }
                    }
                }
                if (bttvEmotesChannel && pcConfig.enabledSettings.bttvEmotesChannel) {
                    if (bttvEmotesChannel.hasOwnProperty(word)) {
                        node.innerHTML = node.innerHTML.replace(new RegExp(`(^|\\s)(${word})(?=\\s|$)|(\\s${word})(?=<)`), '<span class="teE" tc-tooltip tc-title="'+word+'"><img alt="'+word+'" class="'+emojiClass+'" src="' + bttvEmoteUrlStart + bttvEmotesChannel[word] + bttvEmoteUrlEnd + '" /></span>');
                        return;
                    }
                }
                if (emotesFFZ && pcConfig.enabledSettings.emotesFFZ) {
                    if (word in emotesFFZ) {
                        node.innerHTML = node.innerHTML.replace(new RegExp(`(^|\\s)(${word})(?=\\s|$)|(\\s${word})(?=<)`), '<span class="teE" tc-tooltip tc-title="'+word+'"><img alt="'+word+'" class="'+emojiClass+'" src="' + emotesFFZUrlStart + emotesFFZ[word] + emotesFFZUrlEnd  + '" /></span>');
                        return;
                    }
                }
            }
        });
    }
}


module.exports = new emoteModule;