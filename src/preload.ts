import { getIO } from './server';

const sceneRegex = /^(.+)Button/;

window.addEventListener('DOMContentLoaded', () => {
    const buttons = document.getElementById('screenControlContainer')
        ?.querySelectorAll('button');

    buttons?.forEach(e => {
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
});
