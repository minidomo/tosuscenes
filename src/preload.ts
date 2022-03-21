import { getIO, getConfig, saveConfig } from './server';

const config = getConfig();

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
            getIO().emit('load config', config);
        });
    document.getElementById('saveButton')
        ?.addEventListener('click', () => {
            saveConfig(config);
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
                getIO().emit('annotation change', config.tournament.annotation);
            }
        });
}

function initDetermineWinnerButtonEvents() {
    document.getElementById('determineWinnerButton')
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
                const state = {
                    team: 'red',
                    value: num,
                };
                getIO().emit('score multiplier change', state);
            }
        });

    document.getElementById('blueScoreMultiplierUpdateButton')
        ?.addEventListener('click', () => {
            const match = blueScoreMultiplierInput.value.match(numberFormatRegex);
            if (match) {
                const num = parseFloat(blueScoreMultiplierInput.value);
                const state = {
                    team: 'blue',
                    value: num,
                };
                getIO().emit('score multiplier change', state);
            }
        });
}

window.addEventListener('DOMContentLoaded', () => {
    initSceneButtonEvents();
    initConfigButtonEvents();
    initPointButtonEvents();
    initAnnotationButtonEvents();
    initDetermineWinnerButtonEvents();
    initScoreMultiplierButtonEvents();
});
