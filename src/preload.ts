import { getIO } from './server';

const sceneRegex = /^(.+)Button/;
let prevScene: string | undefined;

window.addEventListener('DOMContentLoaded', () => {
    const buttons = document.getElementById('screenControlContainer')
        ?.querySelectorAll('button');

    buttons?.forEach(e => {
        e.addEventListener('click', () => {
            const match = e.id.match(sceneRegex);
            if (match) {
                const [, curScene] = match;
                if (curScene === prevScene) return;
                const ret = {
                    curScene,
                    prevScene,
                };
                getIO().emit('scene change', ret);
                prevScene = curScene;
            } else {
                console.error(`did not match scene regex: ${e.id}`);
            }
        });
    });
});
