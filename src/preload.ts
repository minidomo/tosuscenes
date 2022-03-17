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

window.addEventListener('DOMContentLoaded', () => {
    initSceneButtonEvents();
    initConfigButtonEvents();
    initPointButtonEvents();
});
