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
    document.getElementById('redPointIncrementButton')
        ?.addEventListener('click', () => {
            if (config.tournament.teams.red.points < config.tournament.individualMaxPoints) {
                config.tournament.teams.red.points++;
            }
            const changeState = {
                teamColor: 'red',
                changeType: 'increment',
            };
            getIO().emit('point change', changeState);
        });

    document.getElementById('redPointDecrementButton')
        ?.addEventListener('click', () => {
            if (config.tournament.teams.red.points > 0) config.tournament.teams.red.points--;
            const changeState = {
                teamColor: 'red',
                changeType: 'decrement',
            };
            getIO().emit('point change', changeState);
        });

    document.getElementById('bluePointIncrementButton')
        ?.addEventListener('click', () => {
            if (config.tournament.teams.blue.points < config.tournament.individualMaxPoints) {
                config.tournament.teams.blue.points++;
            }
            const changeState = {
                teamColor: 'blue',
                changeType: 'increment',
            };
            getIO().emit('point change', changeState);
        });

    document.getElementById('bluePointDecrementButton')
        ?.addEventListener('click', () => {
            if (config.tournament.teams.blue.points > 0) config.tournament.teams.blue.points--;
            const changeState = {
                teamColor: 'blue',
                changeType: 'decrement',
            };
            getIO().emit('point change', changeState);
        });
}

function initAnnotationButtonEvents() {
    document.getElementById('annotationUpdateButton')
        ?.addEventListener('click', () => {
            const e = document.getElementById('annotationInput');
            if (e === null) return;
            const inputAnnotation = (e as HTMLInputElement).value;
            console.log(inputAnnotation);
            if (typeof inputAnnotation === 'string' && inputAnnotation !== config.tournament.annotation) {
                config.tournament.annotation = inputAnnotation;
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

window.addEventListener('DOMContentLoaded', () => {
    initSceneButtonEvents();
    initConfigButtonEvents();
    initPointButtonEvents();
    initAnnotationButtonEvents();
    initDetermineWinnerButtonEvents();
});
