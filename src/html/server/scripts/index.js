import { CountUp } from './countUp.min.js';

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
        /** @type {HTMLDivElement} */
        let pointsContainer;

        /** Default data */
        document.getElementById('defaultScreenTitle').innerHTML = config.tournament.title;
        document.getElementById('defaultScreenSubtitle').innerHTML = config.tournament.subtitle;

        /** Line up data */
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
            const playerSpan = document.createElement('span');
            playerSpan.setAttribute('class', 'lineUpScreenPlayer');
            playerSpan.innerHTML = playerName;
            playersContainer.appendChild(playerSpan);
        });

        playersContainer = document.getElementById('lineUpScreenBluePlayersContainer');
        $(playersContainer).empty();
        config.tournament.teams.blue.players.forEach(playerName => {
            const playerSpan = document.createElement('span');
            playerSpan.setAttribute('class', 'lineUpScreenPlayer');
            playerSpan.innerHTML = playerName;
            playersContainer.appendChild(playerSpan);
        });

        /** Match data */
        document.getElementById('matchScreenTitle').innerHTML = config.tournament.title;
        document.getElementById('matchScreenSubtitle').innerHTML = config.tournament.subtitle;
        document.getElementById('matchScreenBracket').innerHTML = `${config.tournament.bracket} Bracket`;
        document.getElementById('matchScreenRound').innerHTML = config.tournament.round;

        document.getElementById('matchScreenRedImage').setAttribute('src', config.tournament.teams.red.image);
        document.getElementById('matchScreenRedTeamName').innerHTML = config.tournament.teams.red.name;

        document.getElementById('matchScreenBlueImage').setAttribute('src', config.tournament.teams.blue.image);
        document.getElementById('matchScreenBlueTeamName').innerHTML = config.tournament.teams.blue.name;

        document.getElementById('matchScreenAnnotationText').innerHTML = config.tournament.annotation;
        if (config.tournament.annotation.length === 0) {
            document.getElementById('matchScreenAnnotationContainer')
                .setAttribute('style', 'display: none');
        }

        pointsContainer = document.getElementById('matchScreenRedPointsContainer');
        $(pointsContainer).empty();
        for (let i = 0; i < config.tournament.individualMaxPoints; i++) {
            const pointSpan = document.createElement('span');
            pointSpan.setAttribute('class', 'matchScreenPoint');
            if (i < config.tournament.teams.red.points) {
                pointSpan.classList.toggle('matchScreenPointWon');
            }
            pointsContainer.appendChild(pointSpan);
        }

        pointsContainer = document.getElementById('matchScreenBluePointsContainer');
        $(pointsContainer).empty();
        for (let i = 0; i < config.tournament.individualMaxPoints; i++) {
            const pointSpan = document.createElement('span');
            pointSpan.setAttribute('class', 'matchScreenPoint');
            if (i < config.tournament.teams.blue.points) {
                pointSpan.classList.toggle('matchScreenPointWon');
            }
            pointsContainer.appendChild(pointSpan);
        }

        /** Winner data */
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
            const playerSpan = document.createElement('span');
            playerSpan.setAttribute('class', 'winnerScreenPlayer');
            playerSpan.innerHTML = playerName;
            playersContainer.appendChild(playerSpan);
        });
    });

    /** @type {string|undefined} */
    let curScene;
    socket.on('scene change', newScene => {
        if (typeof curScene === 'string' && newScene !== curScene) {
            $(`#${curScene}`).fadeOut('fast', () => loadScreenData(newScene));
        } else {
            loadScreenData(newScene);
        }
        curScene = newScene;
    });

    socket.on('point change', changeState => {
        /** @type {string} */
        let pointContainerQuery;
        switch (changeState.teamColor) {
            case 'red': {
                pointContainerQuery = '#matchScreenRedPointsContainer';
                break;
            }
            case 'blue': {
                pointContainerQuery = '#matchScreenBluePointsContainer';
                break;
            }
            default: {
                console.error(`unknown teamColor: ${changeState.teamColor}`);
                return;
            }
        }

        $(pointContainerQuery)
            .children()
            .each((index, element) => {
                const e = $(element);
                const isWonPoint = e.hasClass('matchScreenPointWon');
                if (index < changeState.value) {
                    if (!isWonPoint) {
                        e.addClass('matchScreenPointWon');
                    }
                } else if (isWonPoint) {
                        e.removeClass('matchScreenPointWon');
                    }
            });
    });

    socket.on('annotation change', annotation => {
        document.getElementById('matchScreenAnnotationText').innerHTML = annotation;
        if (annotation.length === 0) {
            tryFadeOut('matchScreenAnnotationContainer');
        } else {
            tryFadeIn('matchScreenAnnotationContainer');
        }
    });

    return socket;
}

function initGosuSocket() {
    const gosuSocket = new ReconnectingWebSocket('ws://127.0.0.1:24050/ws');

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


    const defaultSongMetadata = document.getElementById('defaultScreenSongMetadata');
    const matchMapTitle = document.getElementById('matchScreenMapTitle');
    const matchMapMapperName = document.getElementById('matchScreenMapMapperName');
    const matchMapDifficultyName = document.getElementById('matchScreenMapDifficultyName');
    const matchMapCsValue = document.getElementById('matchScreenMapCsValue');
    const matchMapArValue = document.getElementById('matchScreenMapArValue');
    const matchMapOdValue = document.getElementById('matchScreenMapOdValue');
    const matchMapSrValue = document.getElementById('matchScreenMapSrValue');
    const matchMapLengthValue = document.getElementById('matchScreenMapLengthValue');
    const matchMapBpmValue = document.getElementById('matchScreenMapBpmValue');
    const matchRedScoreValue = document.getElementById('matchScreenRedScoreValue');
    const matchBlueScoreValue = document.getElementById('matchScreenBlueScoreValue');
    const matchChatContainer = document.getElementById('matchScreenChatContainer');

    /** @type {string|undefined} */
    let prevBgPath;
    /** @type {string|undefined} */
    let prevScoreVisible;
    /** @type {'red'|'blue'|'tie'} */
    let prevScoreLead = 'tie';
    let prevChatMessageNum = 0;
    const score = {
        red: {
            value: 0,
            animation: new CountUp('matchScreenRedScoreValue', 0, {
                // Seconds
                duration: 0.108,
            }),
        },
        blue: {
            value: 0,
            animation: new CountUp('matchScreenBlueScoreValue', 0, {
                // Seconds
                duration: 0.108,
            }),
        },
    };

    /**
     *
     * @param {HTMLElement} element
     * @param {any} value
     */
    function trySetInnerHtml(element, value) {
        let strVal = value;
        if (typeof value !== 'string') strVal = `${value}`;
        if (element.innerHTML !== strVal) {
            element.innerHTML = strVal;
        }
    }

    /**
     *
     * @param {number} stat
     * @param {number} mantissa
     * @returns {string}
     */
    function getStatString(stat, mantissa) {
        const num = numbro(stat).format({
            optionalMantissa: true,
            trimMantissa: true,
            mantissa,
        });
        return num;
    }

    function removeUnseenMessages(chatContainer) {
        const sTop = chatContainer.prop('scrollTop');
        if (sTop > 0) {
            let sumHeight = 0;
            chatContainer
                .children()
                .each((index, element) => {
                    const curE = $(element);
                    sumHeight += curE.height();
                    if (sumHeight <= sTop) {
                        curE.remove();
                    }
                });
        }
    }

    /**
     *
     * @param {Object[]} clients
     * @returns {number}
     */
    function getUniformMods(clients) {
        let mods;
        clients.forEach(client => {
            const curMods = client.gameplay.mods.num;
            if (mods === undefined) {
                mods = curMods;
            } else {
                mods &= curMods;
            }
        });
        return mods;
    }

    gosuSocket.addEventListener('message', event => {
        const data = JSON.parse(event.data);

        // TODO menu always here?
        const menu = data.menu;
        const tourney = data.tourney;

        if (menu.bm) {
            const bm = menu.bm;

            // TODO doesnt display correct values after mods since mods not on menu
            trySetInnerHtml(defaultSongMetadata, `${bm.metadata.artist} - '${bm.metadata.title}'`);
            trySetInnerHtml(matchMapTitle, `${bm.metadata.artist} - ${bm.metadata.title}`);
            trySetInnerHtml(matchMapMapperName, bm.metadata.mapper);
            trySetInnerHtml(matchMapDifficultyName, bm.metadata.difficulty);

            /** @type {number} */
            let timeDuration;
            let bpmAverage = (bm.stats.BPM.min + bm.stats.BPM.max) / 2;
            let csChange = false;
            let arChange = false;
            let odChange = false;

            const clients = tourney.ipcClients
                ? tourney.ipcClients.filter(client => client.team === 'left' || client.team === 'right')
                : undefined;
            const isTourney = typeof tourney !== 'undefined';
            const clientsExists = typeof clients !== 'undefined' && clients.length > 0;

            if (isTourney && clientsExists) {
                // Get any team to check if dt/ht is on
                let modsNum = getUniformMods(clients);
                const isDt = (modsNum & 64) === 64;
                const isHT = (modsNum & 256) === 256;
                const isHr = (modsNum & 16) === 16;
                const isEz = (modsNum & 2) === 2;
                if (isDt) {
                    timeDuration = Math.round(bm.time.mp3 / 1.5);
                    bpmAverage /= 1.5;
                    arChange = odChange = true;
                } else if (isHT) {
                    timeDuration = Math.round(bm.time.mp3 * 1.5);
                    bpmAverage *= 1.5;
                    arChange = odChange = true;
                } else {
                    timeDuration = bm.time.mp3;
                }

                if (isHr || isEz) {
                    csChange = arChange = odChange = true;
                }
            } else {
                timeDuration = bm.time.mp3;
            }
            trySetInnerHtml(matchMapLengthValue, dayjs.duration(timeDuration).format('mm:ss'));
            trySetInnerHtml(matchMapBpmValue, getStatString(bpmAverage, 1));

            let csStr = getStatString(bm.stats.memoryCS, 1);
            let arStr = getStatString(bm.stats.memoryAR, 1);
            let odStr = getStatString(bm.stats.memoryOD, 1);
            if (csChange) {
                csStr += '*';
            }
            if (arChange) {
                arStr += '*';
            }
            if (odChange) {
                odStr += '*';
            }
            trySetInnerHtml(matchMapCsValue, csStr);
            trySetInnerHtml(matchMapArValue, arStr);
            trySetInnerHtml(matchMapOdValue, odStr);

            const sr = `${bm.stats.fullSR}*`;
            trySetInnerHtml(matchMapSrValue, sr);

            if (prevBgPath !== bm.path.full) {
                const img = bm.path.full.replace(/#/g, '%23').replace(/%/g, '%25');
                // TODO url method inconsistent?
                const url = `http://localhost:24050/Songs/${img}?a=${Math.random(10000)}`;
                document.getElementById('matchScreenMapBg')
                    .setAttribute('src', url);
            }

            prevBgPath = bm.path.full;
        }

        if (tourney) {
            // TODO manager always here?
            const manager = tourney.manager;

            if (prevScoreVisible !== manager.bools.scoreVisible) {
                prevScoreVisible = manager.bools.scoreVisible;
                if (manager.bools.scoreVisible) {
                    // Show scores, hide chat
                    tryFadeOut('#matchScreenChatContainer');
                    tryFadeIn('#matchScreenRedScoreContainer');
                    tryFadeIn('#matchScreenBlueScoreContainer');
                } else {
                    // Hide scores, show chat
                    tryFadeOut('#matchScreenRedScoreContainer');
                    tryFadeOut('#matchScreenBlueScoreContainer');
                    tryFadeIn('#matchScreenChatContainer');
                }
            }

            const chatExists = !!manager.chat;

            if (manager.bools.scoreVisible) {
                const clients = tourney.ipcClients.filter(client => client.team === 'left' || client.team === 'right');
                const redScore = clients
                    .filter(client => client.team === 'left')
                    .map(client => client.gameplay.score)
                    .reduce((prev, cur) => prev + cur);
                const blueScore = clients
                    .filter(client => client.team === 'right')
                    .map(client => client.gameplay.score)
                    .reduce((prev, cur) => prev + cur);

                if (score.red.value !== redScore) {
                    score.red.animation.update(redScore);
                    score.red.value = redScore;
                }

                if (score.blue.value !== blueScore) {
                    score.blue.animation.update(blueScore);
                    score.blue.value = blueScore;
                }

                if (redScore > blueScore && prevScoreLead !== 'red') {
                    matchBlueScoreValue.classList.remove('matchScreenScoreLeading');
                    matchRedScoreValue.classList.add('matchScreenScoreLeading');
                    prevScoreLead = 'red';
                } else if (redScore < blueScore && prevScoreLead !== 'blue') {
                    matchRedScoreValue.classList.remove('matchScreenScoreLeading');
                    matchBlueScoreValue.classList.add('matchScreenScoreLeading');
                    prevScoreLead = 'blue';
                } else if (prevScoreLead !== 'tie') {
                    matchRedScoreValue.classList.remove('matchScreenScoreLeading');
                    matchBlueScoreValue.classList.remove('matchScreenScoreLeading');
                    prevScoreLead = 'tie';
                }
            } else if (chatExists && prevChatMessageNum !== manager.chat.length) {
                for (let i = prevChatMessageNum; i < manager.chat.length; i++) {
                    const message = manager.chat[i];

                    const chatMessageDiv = document.createElement('div');
                    const chatMessageTimeDiv = document.createElement('div');
                    const chatMessageNameDiv = document.createElement('div');
                    const chatMessageBodyDiv = document.createElement('div');

                    const teamClass = `matchScreenChatTeam${message.team}`;
                    chatMessageDiv.setAttribute('class', 'matchScreenChatMessageContainer');
                    chatMessageTimeDiv.setAttribute('class', 'matchScreenChatMessageTime');
                    chatMessageNameDiv.classList.add('matchScreenChatMessageName', teamClass);
                    chatMessageBodyDiv.setAttribute('class', 'matchScreenChatMessageBody');

                    chatMessageTimeDiv.innerHTML = message.time;
                    chatMessageNameDiv.innerHTML = `${message.name}:`;
                    chatMessageBodyDiv.innerHTML = message.messageBody;

                    chatMessageDiv.append(chatMessageTimeDiv, chatMessageNameDiv, chatMessageBodyDiv);
                    matchChatContainer.appendChild(chatMessageDiv);
                }

                const chatContainer = $('#matchScreenChatContainer');
                chatContainer.animate({
                    scrollTop: chatContainer.prop('scrollHeight'),
                }, {
                    complete() {
                        removeUnseenMessages(chatContainer);
                    },
                });
                prevChatMessageNum = manager.chat.length;
            }
        }
    });

    return gosuSocket;
}

async function hideScreens() {
    const screens = document.getElementsByClassName('screen');
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
    initGosuSocket();

    socket.emit('load config');
})();
