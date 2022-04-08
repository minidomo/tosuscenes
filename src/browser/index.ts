import * as $ from 'jquery';
import { io, Socket } from 'socket.io-client';
import type { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { IOptions, RecursivePartial, SingleOrMultiple, tsParticles } from 'tsparticles';
import { CountUp } from 'countup.js';
import * as dayjs from 'dayjs';
import * as Duration from 'dayjs/plugin/duration';
import { WebsocketBuilder, ConstantBackoff } from 'websocket-ts';
import numbro = require('numbro');

import * as snowConfig from './snow.json';

dayjs.extend(Duration);

let CONFIG: Config | undefined;

function wait(delay: number) {
    return new Promise(resolve => {
        setTimeout(resolve, delay);
    });
}

function initTsParticles() {
    tsParticles.load('tsparticles', snowConfig as SingleOrMultiple<RecursivePartial<IOptions>>);
}

function initSocket() {
    const socket = io();

    socket.on('load config', (config: Config) => {
        CONFIG = config;

        let playersContainer: JQuery<HTMLElement>;

        /** Default data */
        $('#defaultScreenTitle').html(config.tournament.title);
        $('#defaultScreenSubtitle').html(config.tournament.subtitle);

        /** Line up data */
        $('#lineUpScreenTitle').html(config.tournament.title);
        $('#lineUpScreenSubtitle').html(config.tournament.subtitle);
        $('#lineUpScreenBracket').html(`${config.tournament.bracket} Bracket`);
        $('#lineUpScreenRound').html(config.tournament.round);

        $('#lineUpScreenRedImage').attr('src', config.tournament.teams.red.image);
        $('#lineUpScreenRedTeamName').html(config.tournament.teams.red.name);
        $('#lineUpScreenBlueImage').attr('src', config.tournament.teams.blue.image);
        $('#lineUpScreenBlueTeamName').html(config.tournament.teams.blue.name);

        playersContainer = $('#lineUpScreenRedPlayersContainer');
        playersContainer.empty();
        config.tournament.teams.red.players.forEach(playerName => {
            const playerSpan = $('<span>');
            playerSpan.attr('class', 'lineUpScreenPlayer');
            playerSpan.html(playerName);
            playersContainer.append(playerSpan);
        });

        playersContainer = $('#lineUpScreenBluePlayersContainer');
        playersContainer.empty();
        config.tournament.teams.blue.players.forEach(playerName => {
            const playerSpan = $('<span>');
            playerSpan.attr('class', 'lineUpScreenPlayer');
            playerSpan.html(playerName);
            playersContainer.append(playerSpan);
        });

        /** Match data */
        $('#matchScreenTitle').html(config.tournament.title);
        $('#matchScreenSubtitle').html(config.tournament.subtitle);
        $('#matchScreenBracket').html(`${config.tournament.bracket} Bracket`);
        $('#matchScreenRound').html(config.tournament.round);

        $('#matchScreenRedImage').attr('src', config.tournament.teams.red.image);
        $('#matchScreenRedTeamName').html(config.tournament.teams.red.name);

        $('#matchScreenBlueImage').attr('src', config.tournament.teams.blue.image);
        $('#matchScreenBlueTeamName').html(config.tournament.teams.blue.name);

        $('#matchScreenRedScoreMultiplierValue').html(`(x${config.tournament.teams.red.scoreMultiplier})`);
        $('#matchScreenBlueScoreMultiplierValue').html(`(x${config.tournament.teams.blue.scoreMultiplier})`);

        $('#matchScreenAnnotationText').html(config.tournament.annotation);
        if (config.tournament.annotation.length === 0) {
            $('#matchScreenAnnotationContainer').attr('style', 'display: none;');
        }

        updatePointsDisplay(config.tournament.individualMaxPoints);

        if (config.tournament.showScoreMultiplier) {
            tryFadeIn('#matchScreenRedScoreMultiplierContainer');
            tryFadeIn('#matchScreenBlueScoreMultiplierContainer');
        } else {
            tryFadeOut('#matchScreenRedScoreMultiplierContainer');
            tryFadeOut('#matchScreenBlueScoreMultiplierContainer');
        }

        /** Winner data */
        $('#winnerScreenTitle').html(config.tournament.title);
        $('#winnerScreenSubtitle').html(config.tournament.subtitle);
        $('#winnerScreenBracket').html(`${config.tournament.bracket} Bracket`);
        $('#winnerScreenRound').html(config.tournament.round);

        updateWinnerDisplay(config.tournament.winner);
    });

    function updateWinnerDisplay(winner: ConfigWinner) {
        if (CONFIG === undefined) return;

        let winnerTeamTextColorHex = '#000000';
        const winnerTeamTextElement = $('#winnerScreenTeamText');
        winnerTeamTextElement.html(`TEAM ${winner.color}`);
        switch (winner.color) {
            case 'RED': {
                winnerTeamTextColorHex = '#A91418';
                break;
            }
            case 'BLUE': {
                winnerTeamTextColorHex = '#1461A5';
                break;
            }
            default: {
                console.error(`invalid winner color: ${winner.color}`);
                break;
            }
        }
        winnerTeamTextElement.attr('style', `background-color: ${winnerTeamTextColorHex}`);

        $('#winnerScreenTeamName').html(winner.name);
        $('#winnerScreenImage').attr('src', winner.image);

        const playersContainer = $('#winnerScreenPlayersContainer');
        playersContainer.empty();
        winner.players.forEach(playerName => {
            const playerSpan = $('<span>');
            playerSpan.attr('class', 'winnerScreenPlayer');
            playerSpan.html(playerName);
            playersContainer.append(playerSpan);
        });

        CONFIG.tournament.winner = winner;
    }

    function updatePointsDisplay(individualMaxPoints: number) {
        if (CONFIG === undefined) return;
        CONFIG.tournament.individualMaxPoints = individualMaxPoints;

        let pointsContainer = $('#matchScreenRedPointsContainer');
        pointsContainer.empty();
        for (let i = 0; i < individualMaxPoints; i++) {
            const pointSpan = $('<span>');
            pointSpan.attr('class', 'matchScreenPoint');
            if (i < CONFIG.tournament.teams.red.points) {
                pointSpan.addClass('matchScreenPointWon');
            }
            pointsContainer.append(pointSpan);
        }

        pointsContainer = $('#matchScreenBluePointsContainer');
        pointsContainer.empty();
        for (let i = 0; i < individualMaxPoints; i++) {
            const pointSpan = $('<span>');
            pointSpan.attr('class', 'matchScreenPoint');
            if (i < CONFIG.tournament.teams.blue.points) {
                pointSpan.addClass('matchScreenPointWon');
            }
            pointsContainer.append(pointSpan);
        }
    }

    let curScene: string | undefined;
    socket.on('scene change', newScene => {
        if (typeof curScene === 'string' && newScene !== curScene) {
            $(`#${curScene}`).fadeOut('fast', () => loadScreenData(newScene));
        } else {
            loadScreenData(newScene);
        }
        curScene = newScene;
    });

    socket.on('point change', (changeState: { teamColor: 'red' | 'blue', value: number }) => {
        if (CONFIG === undefined) return;

        let pointContainerQuery: string;
        switch (changeState.teamColor) {
            case 'red': {
                pointContainerQuery = '#matchScreenRedPointsContainer';
                CONFIG.tournament.teams.red.points = changeState.value;
                break;
            }
            case 'blue': {
                pointContainerQuery = '#matchScreenBluePointsContainer';
                CONFIG.tournament.teams.blue.points = changeState.value;
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

    socket.on('annotation change', (annotation: string) => {
        $('#matchScreenAnnotationText').html(annotation);
        if (annotation.length === 0) {
            tryFadeOut('#matchScreenAnnotationContainer');
        } else {
            tryFadeIn('#matchScreenAnnotationContainer');
        }
    });

    socket.on('score multiplier change', (state: { team: 'red' | 'blue', value: number }) => {
        if (CONFIG === undefined) return;
        let scoreMultiplierContainerQuery: string;
        switch (state.team) {
            case 'red': {
                scoreMultiplierContainerQuery = '#matchScreenRedScoreMultiplierValue';
                CONFIG.tournament.teams.red.scoreMultiplier = state.value;
                break;
            }
            case 'blue': {
                scoreMultiplierContainerQuery = '#matchScreenBlueScoreMultiplierValue';
                CONFIG.tournament.teams.blue.scoreMultiplier = state.value;
                break;
            }
            default: {
                console.error(`unknown teamColor: ${state.team}`);
                return;
            }
        }

        $(scoreMultiplierContainerQuery).html(`(x${state.value})`);
    });

    socket.on('winner update', (winner: ConfigWinner) => {
        updateWinnerDisplay(winner);
    });

    socket.on('show score multiplier', (showScoreMultiplier: boolean) => {
        if (showScoreMultiplier) {
            tryFadeIn('#matchScreenRedScoreMultiplierContainer');
            tryFadeIn('#matchScreenBlueScoreMultiplierContainer');
        } else {
            tryFadeOut('#matchScreenRedScoreMultiplierContainer');
            tryFadeOut('#matchScreenBlueScoreMultiplierContainer');
        }
    });

    socket.on('bracket change', (bracket: string) => {
        if (CONFIG === undefined) return;
        CONFIG.tournament.bracket = bracket;

        $('#lineUpScreenBracket').html(`${bracket} Bracket`);
        $('#matchScreenBracket').html(`${bracket} Bracket`);
        $('#winnerScreenBracket').html(`${bracket} Bracket`);
    });

    socket.on('round change', (round: string) => {
        if (CONFIG === undefined) return;
        CONFIG.tournament.round = round;

        $('#lineUpScreenRound').html(round);
        $('#matchScreenRound').html(round);
        $('#winnerScreenRound').html(round);
    });

    socket.on('individual max points change', (individualMaxPoints: number) => {
        updatePointsDisplay(individualMaxPoints);
    });

    socket.on('team players change', (state: { team: 'red' | 'blue', value: string[] }) => {
        if (CONFIG === undefined) return;
        let playersContainerQuery: string;
        switch (state.team) {
            case 'red': {
                playersContainerQuery = '#lineUpScreenRedPlayersContainer';
                CONFIG.tournament.teams.red.players = state.value;
                break;
            }
            case 'blue': {
                playersContainerQuery = '#lineUpScreenBluePlayersContainer';
                CONFIG.tournament.teams.blue.players = state.value;
                break;
            }
            default: {
                console.error(`unknown teamColor: ${state.team}`);
                return;
            }
        }

        const playersContainer = $(playersContainerQuery);
        playersContainer.empty();
        state.value.forEach(playerName => {
            const playerSpan = $('<span>');
            playerSpan.attr('class', 'lineUpScreenPlayer');
            playerSpan.html(playerName);
            playersContainer.append(playerSpan);
        });
    });

    socket.on('title change', (title: string) => {
        if (CONFIG === undefined) return;
        CONFIG.tournament.title = title;

        $('#defaultScreenTitle').html(title);
        $('#lineUpScreenTitle').html(title);
        $('#matchScreenTitle').html(title);
        $('#winnerScreenTitle').html(title);
    });

    socket.on('subtitle change', (subtitle: string) => {
        if (CONFIG === undefined) return;
        CONFIG.tournament.subtitle = subtitle;

        $('#defaultScreenSubtitle').html(subtitle);
        $('#lineUpScreenSubtitle').html(subtitle);
        $('#matchScreenSubtitle').html(subtitle);
        $('#winnerScreenSubtitle').html(subtitle);
    });

    socket.on('team name change', (state: { team: 'red' | 'blue', value: string }) => {
        if (CONFIG === undefined) return;
        let team: string;
        switch (state.team) {
            case 'red': {
                team = 'Red';
                CONFIG.tournament.teams.red.name = state.value;
                break;
            }
            case 'blue': {
                team = 'Blue';
                CONFIG.tournament.teams.blue.name = state.value;
                break;
            }
            default: {
                console.error(`unknown teamColor: ${state.team}`);
                return;
            }
        }

        $(`#lineUpScreen${team}TeamName`).html(state.value);
        $(`#matchScreen${team}TeamName`).html(state.value);
    });

    socket.on('team image url change', (state: { team: 'red' | 'blue', value: string }) => {
        if (CONFIG === undefined) return;
        let team: string;
        switch (state.team) {
            case 'red': {
                team = 'Red';
                CONFIG.tournament.teams.red.image = state.value;
                break;
            }
            case 'blue': {
                team = 'Blue';
                CONFIG.tournament.teams.blue.image = state.value;
                break;
            }
            default: {
                console.error(`unknown teamColor: ${state.team}`);
                return;
            }
        }

        $(`#lineUpScreen${team}Image`).attr('src', state.value);
        $(`#matchScreen${team}Image`).attr('src', state.value);
    });

    return socket;
}

function initGosuSocket(serverSocket: Socket<DefaultEventsMap, DefaultEventsMap>) {
    const gosuSocket = new WebsocketBuilder('ws://127.0.0.1:24050/ws')
        .withBackoff(new ConstantBackoff(1000))
        .onOpen(() => {
            console.log('socket open');
        })
        .onClose((_i, ev) => {
            console.log('socket closed', ev);
            gosuSocket.send('client closed');
        })
        .onError((_i, ev) => {
            console.log('socket error', ev);
        })
        .onMessage((_i, ev) => {
            handleData(ev.data);
        })
        .build();

    const defaultSongMetadata = $('#defaultScreenSongMetadata');
    const matchMapTitle = $('#matchScreenMapTitle');
    const matchMapMapperName = $('#matchScreenMapMapperName');
    const matchMapDifficultyName = $('#matchScreenMapDifficultyName');
    const matchMapCsValue = $('#matchScreenMapCsValue');
    const matchMapArValue = $('#matchScreenMapArValue');
    const matchMapOdValue = $('#matchScreenMapOdValue');
    const matchMapSrValue = $('#matchScreenMapSrValue');
    const matchMapLengthValue = $('#matchScreenMapLengthValue');
    const matchMapBpmValue = $('#matchScreenMapBpmValue');
    const matchRedScoreValue = $('#matchScreenRedScoreValue');
    const matchBlueScoreValue = $('#matchScreenBlueScoreValue');
    const matchChatContainer = $('#matchScreenChatContainer');

    let prevBgPath: string | undefined;
    let prevScoreVisible: string | undefined;
    let prevScoreLead: 'red' | 'blue' | 'tie' = 'tie';
    let prevChatMessageNum = 0;
    const score = {
        red: {
            value: 0,
            animation: new CountUp('matchScreenRedScoreValue', 0, {
                // Seconds
                duration: 0.2,
            }),
        },
        blue: {
            value: 0,
            animation: new CountUp('matchScreenBlueScoreValue', 0, {
                // Seconds
                duration: 0.2,
            }),
        },
    };

    function trySetInnerHtml(element: JQuery<HTMLElement>, value: string) {
        if (element.html() !== value) {
            element.html(value);
        }
    }

    function getStatString(stat: number, mantissa: number): string {
        const num = numbro(stat).format({
            optionalMantissa: true,
            trimMantissa: true,
            mantissa,
        });
        return num;
    }

    function removeUnseenMessages(chatContainer: JQuery<HTMLElement>) {
        const sTop = chatContainer.prop('scrollTop');
        if (sTop > 0) {
            let sumHeight = 0;
            chatContainer
                .children()
                .each((_index, element) => {
                    const curE = $(element);
                    const height = curE.height();
                    if (height === undefined) {
                        console.error(`height is undefined: `, element);
                    } else {
                        sumHeight += height;
                        if (sumHeight <= sTop) {
                            curE.remove();
                        }
                    }
                });
        }
    }

    function getUniformMods(clients: GosuIpcClient[]): number {
        if (clients.length === 0) return 0;
        let mods: number | undefined;
        clients.forEach(client => {
            const curMods = client.gameplay.mods.num;
            if (mods === undefined) {
                mods = curMods;
            } else {
                mods &= curMods;
            }
        });
        return mods as number;
    }

    function filterClients(clients: GosuIpcClient[]): GosuIpcClient[] {
        return clients.filter(client => {
            if (client.team !== 'left' && client.team !== 'right') return false;
            return client.spectating.userID !== 0;
        });
    }

    function handleData(dataString: string) {
        if (CONFIG === undefined) return;
        const data = JSON.parse(dataString);
        serverSocket.emit('gosu', data);

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

            let timeDuration: number;
            let bpmAverage = (bm.stats.BPM.min + bm.stats.BPM.max) / 2;
            let csChange = false;
            let arChange = false;
            let odChange = false;

            const clients = tourney.ipcClients ? filterClients(tourney.ipcClients) : undefined;
            const isTourney = typeof tourney !== 'undefined';
            const clientsExists = typeof clients !== 'undefined' && clients.length > 0;

            if (isTourney && clientsExists) {
                // Get any team to check if dt/ht is on
                const modsNum = getUniformMods(clients);
                const isDt = (modsNum & 64) === 64;
                const isHT = (modsNum & 256) === 256;
                const isHr = (modsNum & 16) === 16;
                const isEz = (modsNum & 2) === 2;
                if (isDt) {
                    timeDuration = Math.round(bm.time.mp3 / 1.5);
                    bpmAverage *= 1.5;
                    arChange = odChange = true;
                } else if (isHT) {
                    timeDuration = Math.round(bm.time.mp3 * 1.5);
                    bpmAverage /= 1.5;
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
                const url = `http://localhost:24050/Songs/${img}?a=${Math.random()}`;
                $('#matchScreenMapBg').attr('src', url);
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
                    tryFadeIn('#matchScreenTeamStatsContainer');
                } else {
                    // Hide scores, show chat
                    tryFadeOut('#matchScreenTeamStatsContainer');
                    tryFadeIn('#matchScreenChatContainer');
                    score.red.animation.update(0);
                    score.blue.animation.update(0);
                    score.red.value = 0;
                    score.blue.value = 0;
                }
            }

            const chatExists = !!manager.chat;

            if (manager.bools.scoreVisible) {
                const clients = filterClients(tourney.ipcClients);
                let redScore = Math.floor(clients
                    .filter(client => client.team === 'left')
                    .map(client => client.gameplay.score)
                    .reduce((prev, cur) => prev + cur, 0)
                    * CONFIG.tournament.teams.red.scoreMultiplier);
                let blueScore = Math.floor(clients
                    .filter(client => client.team === 'right')
                    .map(client => client.gameplay.score)
                    .reduce((prev, cur) => prev + cur, 0)
                    * CONFIG.tournament.teams.blue.scoreMultiplier);
                const redMinScore = 2 * CONFIG.tournament.teams.red.scoreMultiplier;
                const blueMinScore = 2 * CONFIG.tournament.teams.blue.scoreMultiplier;

                if (redScore !== score.red.value && redScore > redMinScore) {
                    score.red.animation.update(redScore);
                    score.red.value = redScore;
                } else {
                    redScore = score.red.value;
                }

                if (blueScore !== score.blue.value && blueScore > blueMinScore) {
                    score.blue.animation.update(blueScore);
                    score.blue.value = blueScore;
                } else {
                    blueScore = score.blue.value;
                }

                if (redScore > blueScore) {
                    if (prevScoreLead !== 'red') {
                        matchBlueScoreValue.removeClass('matchScreenScoreLeading');
                        matchRedScoreValue.addClass('matchScreenScoreLeading');
                        prevScoreLead = 'red';
                    }
                } else if (redScore < blueScore) {
                    if (prevScoreLead !== 'blue') {
                        matchRedScoreValue.removeClass('matchScreenScoreLeading');
                        matchBlueScoreValue.addClass('matchScreenScoreLeading');
                        prevScoreLead = 'blue';
                    }
                } else if (prevScoreLead !== 'tie') {
                    matchRedScoreValue.removeClass('matchScreenScoreLeading');
                    matchBlueScoreValue.removeClass('matchScreenScoreLeading');
                    prevScoreLead = 'tie';
                }
            } else if (chatExists && prevChatMessageNum !== manager.chat.length) {
                for (let i = prevChatMessageNum; i < manager.chat.length; i++) {
                    const message = manager.chat[i];

                    const chatMessageDiv = $('<div>');
                    const chatMessageTimeDiv = $('<div>');
                    const chatMessageNameDiv = $('<div>');
                    const chatMessageBodyDiv = $('<div>');

                    const teamClass = `matchScreenChatTeam${message.team}`;
                    chatMessageDiv.attr('class', 'matchScreenChatMessageContainer');
                    chatMessageTimeDiv.attr('class', 'matchScreenChatMessageTime');
                    chatMessageNameDiv.addClass(['matchScreenChatMessageName', teamClass]);
                    chatMessageBodyDiv.attr('class', 'matchScreenChatMessageBody');

                    chatMessageTimeDiv.html(message.time);
                    chatMessageNameDiv.html(`${message.name}:`);
                    chatMessageBodyDiv.html(message.messageBody);

                    chatMessageDiv.append(chatMessageTimeDiv, chatMessageNameDiv, chatMessageBodyDiv);
                    matchChatContainer.append(chatMessageDiv);
                }

                matchChatContainer.animate({
                    scrollTop: matchChatContainer.prop('scrollHeight'),
                }, {
                    complete() {
                        removeUnseenMessages(matchChatContainer);
                    },
                });
                prevChatMessageNum = manager.chat.length;
            }
        }
    }

    return gosuSocket;
}

async function hideScreens() {
    const screens = $('.screen');
    screens.each((_index, screen) => {
        $(screen).fadeOut('fast');
    });
    await wait(1000);
}

function isFadeOut(jQueryString: string): boolean {
    const e = $(jQueryString);
    const style = e.attr('style');
    return typeof style === 'string' && style.includes('display: none;');
}

function tryFadeIn(jQueryString: string) {
    if (isFadeOut(jQueryString)) {
        $(jQueryString).fadeIn('fast');
    }
}

function tryFadeOut(jQueryString: string) {
    if (!isFadeOut(jQueryString)) {
        $(jQueryString).fadeOut('fast');
    }
}

function loadScreenData(screenName: 'defaultScreen' | 'lineUpScreen' | 'mapScreen' | 'matchScreen' | 'winnerScreen') {
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
    initGosuSocket(socket);

    socket.emit('load config');
})();
