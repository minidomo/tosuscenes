import { getIO, getConfig, saveConfig, getConfigPath } from './server';

let config = getConfig();

function initSceneButtonEvents() {
    const sceneRegex = /^(.+)Button/;

    const sceneButtons = document.getElementById('screenControlContainer')
        ?.querySelectorAll('button');

    sceneButtons?.forEach(e => {
        e.addEventListener('click', () => {
            const match = e.id.match(sceneRegex);
            if (match) {
                const [, curScene] = match;
                getIO().emit('scene change', curScene);
            } else {
                console.error(`did not match scene regex: ${e.id}`);
            }
        });
    });
}

function initConfigButtonEvents() {
    document.getElementById('sendButton')
        ?.addEventListener('click', () => {
            config = getConfig();
            getIO().emit('load config', config);
        });
}

function initPointButtonEvents() {
    const redPointElement = document.getElementById('redPointValue') as HTMLDivElement;
    const bluePointElement = document.getElementById('bluePointValue') as HTMLDivElement;

    redPointElement.innerHTML = `${config.tournament.teams.red.points}`;
    bluePointElement.innerHTML = `${config.tournament.teams.blue.points}`;

    document.getElementById('redPointIncrementButton')
        ?.addEventListener('click', () => {
            if (config.tournament.teams.red.points < config.tournament.individualMaxPoints) {
                config.tournament.teams.red.points++;
            }
            const changeState = {
                teamColor: 'red',
                value: config.tournament.teams.red.points,
            };
            redPointElement.innerHTML = `${config.tournament.teams.red.points}`;
            saveConfig(config);
            getIO().emit('point change', changeState);
        });

    document.getElementById('redPointDecrementButton')
        ?.addEventListener('click', () => {
            if (config.tournament.teams.red.points > 0) {
                config.tournament.teams.red.points--;
            }
            const changeState = {
                teamColor: 'red',
                value: config.tournament.teams.red.points,
            };
            redPointElement.innerHTML = `${config.tournament.teams.red.points}`;
            saveConfig(config);
            getIO().emit('point change', changeState);
        });

    document.getElementById('bluePointIncrementButton')
        ?.addEventListener('click', () => {
            if (config.tournament.teams.blue.points < config.tournament.individualMaxPoints) {
                config.tournament.teams.blue.points++;
            }
            const changeState = {
                teamColor: 'blue',
                value: config.tournament.teams.blue.points,
            };
            bluePointElement.innerHTML = `${config.tournament.teams.blue.points}`;
            saveConfig(config);
            getIO().emit('point change', changeState);
        });

    document.getElementById('bluePointDecrementButton')
        ?.addEventListener('click', () => {
            if (config.tournament.teams.blue.points > 0) {
                config.tournament.teams.blue.points--;
            }
            const changeState = {
                teamColor: 'blue',
                value: config.tournament.teams.blue.points,
            };
            bluePointElement.innerHTML = `${config.tournament.teams.blue.points}`;
            saveConfig(config);
            getIO().emit('point change', changeState);
        });
}

function initAnnotationButtonEvents() {
    const annotationInput = document.getElementById('annotationInput') as HTMLInputElement;

    annotationInput.value = `${config.tournament.annotation}`;

    document.getElementById('annotationUpdateButton')
        ?.addEventListener('click', () => {
            if (annotationInput.value !== config.tournament.annotation) {
                config.tournament.annotation = annotationInput.value;
                saveConfig(config);
                getIO().emit('annotation change', config.tournament.annotation);
            }
        });
}

function initUpdateWinnerButtonEvents() {
    document.getElementById('updateWinnerButton')
        ?.addEventListener('click', () => {
            const teams = config.tournament.teams;
            const winner = config.tournament.winner;
            if (teams.red.points > teams.blue.points) {
                winner.color = 'RED';
                winner.image = teams.red.image;
                winner.name = teams.red.name;
                winner.players = teams.red.players;
            } else if (teams.red.points < teams.blue.points) {
                winner.color = 'BLUE';
                winner.image = teams.blue.image;
                winner.name = teams.blue.name;
                winner.players = teams.blue.players;
            }
            saveConfig(config);
            getIO().emit('winner update', winner);
        });
}

function initScoreMultiplierButtonEvents() {
    const numberFormatRegex = /(^\d+(\.\d+)?$)|(^(\d+)?\.\d+$)/;

    const redScoreMultiplierInput = document.getElementById('redScoreMultiplierInput') as HTMLInputElement;
    const blueScoreMultiplierInput = document.getElementById('blueScoreMultiplierInput') as HTMLInputElement;

    redScoreMultiplierInput.value = `${config.tournament.teams.red.scoreMultiplier}`;
    blueScoreMultiplierInput.value = `${config.tournament.teams.blue.scoreMultiplier}`;

    document.getElementById('redScoreMultiplierUpdateButton')
        ?.addEventListener('click', () => {
            const match = redScoreMultiplierInput.value.match(numberFormatRegex);
            if (match) {
                const num = parseFloat(redScoreMultiplierInput.value);
                if (num === config.tournament.teams.red.scoreMultiplier) return;
                config.tournament.teams.red.scoreMultiplier = num;
                const state = {
                    team: 'red',
                    value: num,
                };
                saveConfig(config);
                getIO().emit('score multiplier change', state);
            }
        });

    document.getElementById('blueScoreMultiplierUpdateButton')
        ?.addEventListener('click', () => {
            const match = blueScoreMultiplierInput.value.match(numberFormatRegex);
            if (match) {
                const num = parseFloat(blueScoreMultiplierInput.value);
                if (num === config.tournament.teams.blue.scoreMultiplier) return;
                config.tournament.teams.blue.scoreMultiplier = num;
                const state = {
                    team: 'blue',
                    value: num,
                };
                saveConfig(config);
                getIO().emit('score multiplier change', state);
            }
        });
}

function initToggleScoreMultiplierButtonEvents() {
    const showScoreMultiplierButton = document.getElementById('toggleScoreMultiplierButton') as HTMLButtonElement;

    if (config.tournament.showScoreMultiplier) {
        showScoreMultiplierButton.innerHTML = 'Hide Score Multiplier';
    } else {
        showScoreMultiplierButton.innerHTML = 'Show Score Multiplier';
    }

    showScoreMultiplierButton
        .addEventListener('click', () => {
            config.tournament.showScoreMultiplier = !config.tournament.showScoreMultiplier;
            if (config.tournament.showScoreMultiplier) {
                showScoreMultiplierButton.innerHTML = 'Hide Score Multiplier';
            } else {
                showScoreMultiplierButton.innerHTML = 'Show Score Multiplier';
            }
            saveConfig(config);
            getIO().emit('show score multiplier', config.tournament.showScoreMultiplier);
        });
}

function initTitleButtonEvents() {
    const titleInput = document.getElementById('titleInput') as HTMLInputElement;

    titleInput.value = config.tournament.title;

    document.getElementById('titleUpdateButton')
        ?.addEventListener('click', () => {
            if (titleInput.value !== config.tournament.title) {
                config.tournament.title = titleInput.value;
                saveConfig(config);
                getIO().emit('title change', config.tournament.title);
            }
        });
}

function initSubtitleButtonEvents() {
    const subtitleInput = document.getElementById('subtitleInput') as HTMLInputElement;

    subtitleInput.value = config.tournament.subtitle;

    document.getElementById('subtitleUpdateButton')
        ?.addEventListener('click', () => {
            if (subtitleInput.value !== config.tournament.subtitle) {
                config.tournament.subtitle = subtitleInput.value;
                saveConfig(config);
                getIO().emit('subtitle change', config.tournament.subtitle);
            }
        });
}

function initBracketButtonEvents() {
    const bracketInput = document.getElementById('bracketInput') as HTMLInputElement;

    bracketInput.value = config.tournament.bracket;

    document.getElementById('bracketUpdateButton')
        ?.addEventListener('click', () => {
            if (bracketInput.value !== config.tournament.bracket) {
                config.tournament.bracket = bracketInput.value;
                saveConfig(config);
                getIO().emit('bracket change', config.tournament.bracket);
            }
        });
}

function initRoundButtonEvents() {
    const roundInput = document.getElementById('roundInput') as HTMLInputElement;

    roundInput.value = config.tournament.round;

    document.getElementById('roundUpdateButton')
        ?.addEventListener('click', () => {
            if (roundInput.value !== config.tournament.round) {
                config.tournament.round = roundInput.value;
                saveConfig(config);
                getIO().emit('round change', config.tournament.round);
            }
        });
}

function initBestOfButtonEvents() {
    const bestOfInput = document.getElementById('bestOfInput') as HTMLInputElement;

    bestOfInput.value = `${config.tournament.individualMaxPoints * 2 - 1}`;

    document.getElementById('bestOfUpdateButton')
        ?.addEventListener('click', () => {
            const curBestOf = config.tournament.individualMaxPoints * 2 - 1;
            if (bestOfInput.value !== `${curBestOf}`) {
                config.tournament.individualMaxPoints = (parseInt(bestOfInput.value) + 1) / 2;
                saveConfig(config);
                getIO().emit('individual max points change', config.tournament.individualMaxPoints);
            }
        });
}

function initTeamPlayersButtonEvents() {
    const redPlayersListContainer = document.getElementById('redPlayersListContainer') as HTMLDivElement;
    const redPlayersIncrementButton = document.getElementById('redPlayersIncrementButton') as HTMLButtonElement;
    const redPlayersDecrementButton = document.getElementById('redPlayersDecrementButton') as HTMLButtonElement;
    const redPlayersUpdateButton = document.getElementById('redPlayersUpdateButton') as HTMLButtonElement;

    const bluePlayersListContainer = document.getElementById('bluePlayersListContainer') as HTMLDivElement;
    const bluePlayersIncrementButton = document.getElementById('bluePlayersIncrementButton') as HTMLButtonElement;
    const bluePlayersDecrementButton = document.getElementById('bluePlayersDecrementButton') as HTMLButtonElement;
    const bluePlayersUpdateButton = document.getElementById('bluePlayersUpdateButton') as HTMLButtonElement;

    function createNewPlayerContainer(username = '') {
        const playersInfoContainer = document.createElement('div');
        const playersNameInputContainer = document.createElement('div');
        const playersNameInput = document.createElement('input');
        playersInfoContainer.className = 'playersInfoContainer';
        playersNameInputContainer.className = 'playersNameInputContainer';
        playersNameInput.className = 'playersNameInput';

        playersNameInput.value = username;

        playersNameInputContainer.appendChild(playersNameInput);
        playersInfoContainer.appendChild(playersNameInputContainer);
        return playersInfoContainer;
    }

    redPlayersIncrementButton.addEventListener('click', () => {
        redPlayersListContainer.appendChild(createNewPlayerContainer());
    });

    redPlayersDecrementButton.addEventListener('click', () => {
        if (redPlayersListContainer.lastChild === null) return;
        redPlayersListContainer.removeChild(redPlayersListContainer.lastChild);
    });

    redPlayersUpdateButton.addEventListener('click', () => {
        const inputs = redPlayersListContainer.querySelectorAll('input');
        const newPlayersArr: string[] = [];
        inputs.forEach(e => newPlayersArr.push(e.value));

        config.tournament.teams.red.players = newPlayersArr;
        const state = {
            team: 'red',
            value: newPlayersArr,
        };
        saveConfig(config);
        getIO().emit('team players change', state);
    });

    config.tournament.teams.red.players.forEach(username => {
        redPlayersListContainer.appendChild(createNewPlayerContainer(username));
    });

    bluePlayersIncrementButton.addEventListener('click', () => {
        bluePlayersListContainer.appendChild(createNewPlayerContainer());
    });

    bluePlayersDecrementButton.addEventListener('click', () => {
        if (bluePlayersListContainer.lastChild === null) return;
        bluePlayersListContainer.removeChild(bluePlayersListContainer.lastChild);
    });

    bluePlayersUpdateButton.addEventListener('click', () => {
        const inputs = bluePlayersListContainer.querySelectorAll('input');
        const newPlayersArr: string[] = [];
        inputs.forEach(e => newPlayersArr.push(e.value));

        config.tournament.teams.blue.players = newPlayersArr;
        const state = {
            team: 'blue',
            value: newPlayersArr,
        };
        saveConfig(config);
        getIO().emit('team players change', state);
    });

    config.tournament.teams.blue.players.forEach(username => {
        bluePlayersListContainer.appendChild(createNewPlayerContainer(username));
    });
}

function initTeamNameButtonEvents() {
    const redteamNameInput = document.getElementById('redteamNameInput') as HTMLInputElement;
    const redteamNameUpdateButton = document.getElementById('redteamNameUpdateButton') as HTMLButtonElement;

    const blueteamNameInput = document.getElementById('blueteamNameInput') as HTMLInputElement;
    const blueteamNameUpdateButton = document.getElementById('blueteamNameUpdateButton') as HTMLButtonElement;

    redteamNameInput.value = config.tournament.teams.red.name;
    blueteamNameInput.value = config.tournament.teams.blue.name;

    redteamNameUpdateButton.addEventListener('click', () => {
        if (redteamNameInput.value !== config.tournament.teams.red.name) {
            config.tournament.teams.red.name = redteamNameInput.value;
            const state = {
                team: 'red',
                value: redteamNameInput.value,
            };
            saveConfig(config);
            getIO().emit('team name change', state);
        }
    });

    blueteamNameUpdateButton.addEventListener('click', () => {
        if (blueteamNameInput.value !== config.tournament.teams.blue.name) {
            config.tournament.teams.blue.name = blueteamNameInput.value;
            const state = {
                team: 'blue',
                value: blueteamNameInput.value,
            };
            saveConfig(config);
            getIO().emit('team name change', state);
        }
    });
}

function initTeamImageUrlButtonEvents() {
    const redteamImageUrlInput = document.getElementById('redteamImageUrlInput') as HTMLInputElement;
    const redteamImageUrlUpdateButton = document.getElementById('redteamImageUrlUpdateButton') as HTMLButtonElement;

    const blueteamImageUrlInput = document.getElementById('blueteamImageUrlInput') as HTMLInputElement;
    const blueteamImageUrlUpdateButton = document.getElementById('blueteamImageUrlUpdateButton') as HTMLButtonElement;

    redteamImageUrlInput.value = config.tournament.teams.red.image;
    blueteamImageUrlInput.value = config.tournament.teams.blue.image;

    redteamImageUrlUpdateButton.addEventListener('click', () => {
        if (redteamImageUrlInput.value !== config.tournament.teams.red.image) {
            config.tournament.teams.red.image = redteamImageUrlInput.value;
            const state = {
                team: 'red',
                value: redteamImageUrlInput.value,
            };
            saveConfig(config);
            getIO().emit('team image url change', state);
        }
    });

    blueteamImageUrlUpdateButton.addEventListener('click', () => {
        if (blueteamImageUrlInput.value !== config.tournament.teams.blue.image) {
            config.tournament.teams.blue.image = blueteamImageUrlInput.value;
            const state = {
                team: 'blue',
                value: blueteamImageUrlInput.value,
            };
            saveConfig(config);
            getIO().emit('team image url change', state);
        }
    });
}

window.addEventListener('DOMContentLoaded', () => {
    console.log(getConfigPath());
    initSceneButtonEvents();
    initConfigButtonEvents();
    initPointButtonEvents();
    initAnnotationButtonEvents();
    initUpdateWinnerButtonEvents();
    initScoreMultiplierButtonEvents();
    initToggleScoreMultiplierButtonEvents();
    initBracketButtonEvents();
    initRoundButtonEvents();
    initBestOfButtonEvents();
    initTeamPlayersButtonEvents();
    initTitleButtonEvents();
    initSubtitleButtonEvents();
    initTeamNameButtonEvents();
    initTeamImageUrlButtonEvents();
});
