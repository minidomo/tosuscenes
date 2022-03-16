/**
 *
 * @param {number} delay
 * @returns {Promise<any>}
 */
function wait(delay) {
    return new Promise(resolve => {
        setTimeout(resolve, delay);
    });
}

function initTsParticles() {
    loadSnowPreset(tsParticles);

    tsParticles.load('tsparticles', {
        particles: {
            shape: {
                type: 'triangle',
            },
            move: {
                direction: 'top',
            },
            number: {
                value: 20,
            },
            color: {
                value: '#2E72D0',
            },

        },
        fullScreen: {
            enable: false,
        },
        background: {
            opacity: 0,
        },
        preset: 'snow',
    });
}

function initSocket() {
    const socket = io();

    socket.on('load config', config => {
        /** @type {HTMLDivElement} */
        let playersContainer;

        /** default data */
        document.getElementById('defaultScreenTitle').innerHTML = config.tournament.title;
        document.getElementById('defaultScreenSubtitle').innerHTML = config.tournament.subtitle;

        /** line up data */
        document.getElementById('lineUpScreenTitle').innerHTML = config.tournament.title;
        document.getElementById('lineUpScreenSubtitle').innerHTML = config.tournament.subtitle;
        document.getElementById('lineUpScreenBracket').innerHTML = `${config.tournament.bracket} Bracket`;
        document.getElementById('lineUpScreenRound').innerHTML = config.tournament.round;

        document.getElementById('lineUpScreenRedImage').setAttribute('src', config.tournament.teams.red.image);
        document.getElementById('lineUpScreenRedTeamName').innerHTML = config.tournament.teams.red.name;
        document.getElementById('lineUpScreenBlueImage').setAttribute('src', config.tournament.teams.blue.image);
        document.getElementById('lineUpScreenBlueTeamName').innerHTML = config.tournament.teams.blue.name;

        playersContainer = document.getElementById('lineUpScreenRedPlayersContainer');
        $(playersContainer).empty();
        config.tournament.teams.red.players.forEach(playerName => {
            const playerDiv = document.createElement('span');
            playerDiv.setAttribute('class', 'lineUpScreenPlayer');
            playerDiv.innerHTML = playerName;
            playersContainer.appendChild(playerDiv);
        });

        playersContainer = document.getElementById('lineUpScreenBluePlayersContainer');
        $(playersContainer).empty();
        config.tournament.teams.blue.players.forEach(playerName => {
            const playerDiv = document.createElement('span');
            playerDiv.setAttribute('class', 'lineUpScreenPlayer');
            playerDiv.innerHTML = playerName;
            playersContainer.appendChild(playerDiv);
        });

        /** winner data */
        document.getElementById('winnerScreenImage').setAttribute('src', config.tournament.winner.image);

        document.getElementById('winnerScreenTitle').innerHTML = config.tournament.title;
        document.getElementById('winnerScreenSubtitle').innerHTML = config.tournament.subtitle;
        document.getElementById('winnerScreenBracket').innerHTML = `${config.tournament.bracket} Bracket`;
        document.getElementById('winnerScreenRound').innerHTML = config.tournament.round;

        /** @type {string} */
        let winnerTeamTextColorHex;
        /** @type {HTMLDivElement} */
        const winnerTeamTextElement = document.getElementById('winnerScreenTeamText');
        winnerTeamTextElement.innerHTML = `TEAM ${config.tournament.winner.color}`;
        switch (config.tournament.winner.color) {
            case 'RED': {
                winnerTeamTextColorHex = '#A91418';
                break;
            }
            case 'BLUE': {
                winnerTeamTextColorHex = '#1461A5';
                break;
            }
            default: {
                console.error(`invalid winner color: ${config.tournament.winner.color}`);
                break;
            }
        }
        winnerTeamTextElement.setAttribute('style', `background-color: ${winnerTeamTextColorHex}`);

        document.getElementById('winnerScreenTeamName').innerHTML = config.tournament.winner.name;

        playersContainer = document.getElementById('winnerScreenPlayersContainer');
        $(playersContainer).empty();
        config.tournament.teams.red.players.forEach(playerName => {
            const playerDiv = document.createElement('span');
            playerDiv.setAttribute('class', 'winnerScreenPlayer');
            playerDiv.innerHTML = playerName;
            playersContainer.appendChild(playerDiv);
        });
    });

    socket.on('scene change', sceneState => {
        if (sceneState.prevScene) {
            $(`#${sceneState.prevScene}`).fadeOut('fast', () => loadScreenData(sceneState.curScene));
        } else {
            loadScreenData(sceneState.curScene);
        }
    });

    return socket;
}

function initGosuSocket() {
    const gosuSocket = new ReconnectingWebSocket('ws://127.0.0.1:24050/ws');

    const songMetadata = document.getElementById('defaultScreenSongMetadata');

    gosuSocket.addEventListener('open', () => {
        console.log('socket open');
    });

    gosuSocket.addEventListener('close', event => {
        console.log('socket closed', event);
        gosuSocket.send('client closed');
    });

    gosuSocket.addEventListener('error', event => {
        console.log('socket error', event);
    });

    gosuSocket.addEventListener('message', event => {
        const data = JSON.parse(event.data);
        // Console.log('socket message', data);
        if (data.menu.bm) {
            const bm = data.menu.bm;

            const newSongMetadata = `${bm.metadata.artist} - '${bm.metadata.title}'`;
            if (songMetadata.innerHTML !== newSongMetadata) {
                songMetadata.innerHTML = newSongMetadata;
            }
        }
    });

    return gosuSocket;
}

async function hideScreens() {
    let screens = document.getElementsByClassName('screen');
    for (const screen of screens) {
        $(screen).fadeOut('fast');
    }
    await wait(1000);
}

/**
 * 
 * @param {string} jQueryString
 * @returns {boolean} 
 */
function isFadeOut(jQueryString) {
    const e = $(jQueryString);
    const style = e.attr('style');
    return typeof style === 'string' && style.includes('display: none;');
}

/**
 * 
 * @param {string} jQueryString 
 */
function tryFadeIn(jQueryString) {
    if (isFadeOut(jQueryString)) {
        $(jQueryString).fadeIn('fast');
    }
}

/**
 * 
 * @param {string} jQueryString 
 */
function tryFadeOut(jQueryString) {
    if (!isFadeOut(jQueryString)) {
        $(jQueryString).fadeOut('fast');
    }
}

/**
 *
 * @param {'defaultScreen'|'lineUpScreen'|'mapScreen'|'matchScreen'|'winnerScreen'} screenName
 */
function loadScreenData(screenName) {
    switch (screenName) {
        case 'defaultScreen': {
            tryFadeIn('#tsparticles');
            tryFadeIn('#screenBg');
            $('#defaultScreen').fadeIn('fast');
            break;
        }
        case 'lineUpScreen': {
            tryFadeIn('#tsparticles');
            tryFadeIn('#screenBg');
            $('#lineUpScreen').fadeIn('fast');
            break;
        }
        case 'mapScreen': {
            tryFadeIn('#tsparticles');
            tryFadeIn('#screenBg');
            $('#mapScreen').fadeIn('fast');
            break;
        }
        case 'matchScreen': {
            tryFadeOut('#tsparticles');
            tryFadeOut('#screenBg');
            $('#matchScreen').fadeIn('fast');
            break;
        }
        case 'winnerScreen': {
            tryFadeIn('#tsparticles');
            tryFadeIn('#screenBg');
            $('#winnerScreen').fadeIn('fast');
            break;
        }
        default: {
            console.error(`bad screen name: ${screenName}`);
            break;
        }
    }
}

(async () => {
    await hideScreens();

    initTsParticles();
    const socket = initSocket();
    const gosuSocket = initGosuSocket();
    socket.emit('load config');
})();


// Let socket = new ReconnectingWebSocket('ws://' + location.host + '/ws');
// let mapid = document.getElementById('mapid');

// // NOW PLAYING
// let mapContainer = document.getElementById('mapContainer');
// let mapTitle = document.getElementById('mapTitle');
// let mapDifficulty = document.getElementById('mapDifficulty');

// // TEAM OVERALL SCORE
// let teamBlueName = document.getElementById('teamBlueName');
// let teamRedName = document.getElementById('teamRedName');
// let scoreNowBlue = document.getElementById('scoreNowBlue');
// let scoreNowRed = document.getElementById('scoreNowRed');
// let scoreMaxBlue = document.getElementById('scoreMaxBlue');
// let scoreMaxRed = document.getElementById('scoreMaxRed');

// // For Star Visibility
// let scoreBlue = document.getElementById('scoreBlue');
// let scoreRed = document.getElementById('scoreRed');
// let teamBlue = document.getElementById('teamBlue');
// let teamRed = document.getElementById('teamRed');

// // TEAM PLAYING SCORE
// let playScoreBlue = document.getElementById('playScoreBlue');
// let playScoreRed = document.getElementById('playScoreRed');

// // Graphic components
// let bottom = document.getElementById('bottom');

// // Chats
// let chats = document.getElementById('chats');

// socket.onopen = () => {
//     console.log('Successfully Connected');
// };

// let animation = {
//     playScoreBlue: new CountUp('playScoreBlue', 0, 0, 0, .2, { useEasing: true, useGrouping: true, separator: ' ', decimal: '.' }),
//     playScoreRed: new CountUp('playScoreRed', 0, 0, 0, .2, { useEasing: true, useGrouping: true, separator: ' ', decimal: '.' }),
// }

// socket.onclose = event => {
//     console.log('Socket Closed Connection: ', event);
//     socket.send('Client Closed!');
// };

// socket.onerror = error => {
//     console.log('Socket Error: ', error);
// };

// let bestOfTemp;
// let scoreVisibleTemp;
// let starsVisibleTemp;

// let tempImg;
// let tempMapName;
// let tempMapDiff;

// let scoreBlueTemp;
// let scoreRedTemp;
// let teamNameBlueTemp;
// let teamNameRedTemp;
// let gameState;

// let chatLen = 0;
// let tempClass = 'unknown';

// socket.onmessage = event => {
//     let data = JSON.parse(event.data);
//     if (scoreVisibleTemp !== data.tourney.manager.bools.scoreVisible) {
//         scoreVisibleTemp = data.tourney.manager.bools.scoreVisible;
//         if (scoreVisibleTemp) {
//             // Score visible -> Set bg bottom to full
//             chats.style.opacity = 0;
//             playScoreBlue.style.opacity = 1;
//             playScoreRed.style.opacity = 1;
//         } else {
//             // Score invisible -> Set bg to show chats
//             chats.style.opacity = 1;
//             playScoreBlue.style.opacity = 0;
//             playScoreRed.style.opacity = 0;
//         }
//     }
//     if (starsVisibleTemp !== data.tourney.manager.bools.starsVisible) {
//         starsVisibleTemp = data.tourney.manager.bools.starsVisible;
//         if (starsVisibleTemp) {
//             scoreBlue.style.display = 'flex';
//             scoreRed.style.display = 'flex';
//             teamBlue.style.transform = 'translateX(0)';
//             teamRed.style.transform = 'translateX(0)';
//         } else {
//             scoreBlue.style.display = 'none';
//             scoreRed.style.display = 'none';
//             teamBlue.style.transform = 'translateX(-150px)';
//             teamRed.style.transform = 'translateX(150px)';
//         }
//     }
//     if (tempImg !== data.menu.bm.path.full) {
//         tempImg = data.menu.bm.path.full;
//         data.menu.bm.path.full = data.menu.bm.path.full.replace(/#/g, '%23').replace(/%/g, '%25').replace(/\\/g, '/');
//         mapContainer.style.backgroundImage = `url('http://` + location.host + `/Songs/${data.menu.bm.path.full}?a=${Math.random(10000)}')`;
//     }
//     if (tempMapName !== data.menu.bm.metadata.title) {
//         tempMapName = data.menu.bm.metadata.title;
//         mapTitle.innerHTML = tempMapName;
//     }
//     if (tempMapDiff !== '[' + data.menu.bm.metadata.difficulty + ']') {
//         tempMapDiff = '[' + data.menu.bm.metadata.difficulty + ']';
//         mapDifficulty.innerHTML = tempMapDiff;
//     }
//     if (bestOfTemp !== data.tourney.manager.bestOF) {
//         bestOfTemp = data.tourney.manager.bestOF;
//         scoreMaxBlue.innerHTML = '\xa0/\xa0' + Math.ceil(bestOfTemp / 2);
//         scoreMaxRed.innerHTML = '\xa0/\xa0' + Math.ceil(bestOfTemp / 2);
//     }
//     if (scoreBlueTemp !== data.tourney.manager.stars.left) {
//         scoreBlueTemp = data.tourney.manager.stars.left;
//         scoreNowBlue.innerHTML = scoreBlueTemp;
//     }
//     if (scoreRedTemp !== data.tourney.manager.stars.right) {
//         scoreRedTemp = data.tourney.manager.stars.right;
//         scoreNowRed.innerHTML = scoreRedTemp;
//     }
//     if (teamNameBlueTemp !== data.tourney.manager.teamName.left) {
//         teamNameBlueTemp = data.tourney.manager.teamName.left;
//         teamBlueName.innerHTML = teamNameBlueTemp;
//     }
//     if (teamNameRedTemp !== data.tourney.manager.teamName.right) {
//         teamNameRedTemp = data.tourney.manager.teamName.right;
//         teamRedName.innerHTML = teamNameRedTemp;
//     }
//     if (scoreVisibleTemp) {
//         scoreBlueTemp = data.tourney.manager.gameplay.score.left;
//         scoreRedTemp = data.tourney.manager.gameplay.score.right;

//         animation.playScoreBlue.update(scoreBlueTemp);
//         animation.playScoreRed.update(scoreRedTemp);

//         if (scoreBlueTemp > scoreRedTemp) {
//             // Blue is Leading
//             playScoreBlue.style.backgroundColor = '#007E93';
//             playScoreBlue.style.color = 'white';

//             playScoreRed.style.backgroundColor = 'transparent';
//             playScoreRed.style.color = '#8E0029';
//         } else if (scoreBlueTemp == scoreRedTemp) {
//             // Tie
//             playScoreBlue.style.backgroundColor = '#007E93';
//             playScoreBlue.style.color = 'white';

//             playScoreRed.style.backgroundColor = '#8E0029';
//             playScoreRed.style.color = 'white';
//         } else {
//             // Red is Leading
//             playScoreBlue.style.backgroundColor = 'transparent';
//             playScoreBlue.style.color = '#007E93';

//             playScoreRed.style.backgroundColor = '#8E0029';
//             playScoreRed.style.color = 'white';

//         }
//     }
//     if (!scoreVisibleTemp) {
//         if (chatLen != data.tourney.manager.chat.length) {
//             // There's new chats that haven't been updated

//             if (chatLen == 0 || (chatLen > 0 && chatLen > data.tourney.manager.chat.length)) {
//                 // Starts from bottom
//                 chats.innerHTML = '';
//                 chatLen = 0;
//             }

//             // Add the chats
//             for (var i = chatLen; i < data.tourney.manager.chat.length; i++) {
//                 tempClass = data.tourney.manager.chat[i].team;

//                 // Chat variables
//                 let chatParent = document.createElement('div');
//                 chatParent.setAttribute('class', 'chat');

//                 let chatTime = document.createElement('div');
//                 chatTime.setAttribute('class', 'chatTime');

//                 let chatName = document.createElement('div');
//                 chatName.setAttribute('class', 'chatName');

//                 let chatText = document.createElement('div');
//                 chatText.setAttribute('class', 'chatText');

//                 chatTime.innerText = data.tourney.manager.chat[i].time;
//                 chatName.innerText = data.tourney.manager.chat[i].name + ':\xa0';
//                 chatText.innerText = data.tourney.manager.chat[i].messageBody;

//                 chatName.classList.add(tempClass);

//                 chatParent.append(chatTime);
//                 chatParent.append(chatName);
//                 chatParent.append(chatText);
//                 chats.append(chatParent);
//             }

//             // Update the Length of chat
//             chatLen = data.tourney.manager.chat.length;

//             // Update the scroll so it's sticks at the bottom by default
//             chats.scrollTop = chats.scrollHeight;
//         }
//     }
// }
