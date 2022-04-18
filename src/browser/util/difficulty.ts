import numbro = require('numbro');
import { getSocket } from '../serverSocket';

const MODS = {
    EZ: 2,
    HR: 16,
    HT: 256,
    DT: 64,
    FL: 1024,
};

function odToMs(od: number): number {
    return 79.5 - 6 * od;
}

function msToOd(ms: number): number {
    return (ms - 79.5) / -6;
}

function arToMs(ar: number): number {
    if (ar >= 5) {
        return 1200 - 150 * (ar - 5);
    } else {
        return 1800 - 120 * ar;
    }
}

function msToAr(ms: number): number {
    if (ms <= 1200) {
        return (ms - 1200) / -150 + 5;
    } else {
        return (ms - 1800) / -120;
    }
}

function trimMantissa(value: number, mantissa: number): number {
    const str = numbro(value).format({
        trimMantissa: true,
        mantissa,
    });
    return parseFloat(str);
}

export function adjustDifficultyStats(stats: DifficultyStats, curMods: number): DifficultyStats {
    const retStats = Object.assign({}, stats);

    if ((curMods & MODS.EZ) === MODS.EZ) {
        retStats.ar = trimMantissa(retStats.ar / 2, 1);
        retStats.od = trimMantissa(retStats.od / 2, 1);
        retStats.cs = trimMantissa(retStats.cs / 2, 1);
    } else if ((curMods & MODS.HR) === MODS.HR) {
        retStats.ar = trimMantissa(Math.min(10, retStats.ar * 1.4), 1);
        retStats.od = trimMantissa(Math.min(10, retStats.od * 1.4), 1);
        retStats.cs = trimMantissa(Math.min(10, retStats.cs * 1.3), 1);
    }

    if ((curMods & MODS.HT) === MODS.HT) {
        retStats.ar = trimMantissa(msToAr(arToMs(retStats.ar) * 4 / 3), 1);
        retStats.od = trimMantissa(msToOd(odToMs(retStats.od) * 4 / 3 + 0.66), 1);
        retStats.bpm = trimMantissa(retStats.bpm * 3 / 4, 3);
        retStats.time = Math.floor(retStats.time * 3 / 2);
    } else if ((curMods & MODS.DT) === MODS.DT) {
        retStats.ar = trimMantissa(Math.min(11, msToAr(arToMs(retStats.ar) * 2 / 3)), 1);
        retStats.od = trimMantissa(msToOd(odToMs(retStats.od) * 2 / 3 + 0.33), 1);
        retStats.bpm = trimMantissa(retStats.bpm * 3 / 2, 3);
        retStats.time = Math.floor(retStats.time * 2 / 3);
    }

    return retStats;
}

const baseStatsMap: Map<number, DifficultyStats> = new Map();
const srStatMap: Map<string, number> = new Map();

getSocket().on('beatmap base difficulty stats', (stats: DifficultyStats) => {
    baseStatsMap.set(stats.id, stats);
});

getSocket().on('beatmap star difficulty stats', (stats: PartialDifficultyStats) => {
    const key = `${stats.id} ${stats.mods}`;
    srStatMap.set(key, trimMantissa(stats.sr, 2));
});

export function getDifficultyStats(gosu: Gosu, mods: number): DifficultyStats {
    const bm = gosu.menu.bm;
    let stats = baseStatsMap.get(bm.id);

    if (!stats) {
        stats = {
            id: bm.id,
            mods,
            ar: bm.stats.memoryAR,
            od: bm.stats.memoryOD,
            cs: bm.stats.memoryCS,
            sr: bm.stats.SR,
            bpm: Math.floor((bm.stats.BPM.min + bm.stats.BPM.max) / 2),
            time: bm.time.mp3,
        };
        baseStatsMap.set(bm.id, stats);

        const content: BeatmapDifficultyStatsQuery = {
            id: bm.id,
            mods,
            path: `${gosu.settings.folders.songs}\\${bm.path.folder}\\${bm.path.file}`,
        };

        getSocket().emit('beatmap base difficulty stats', content);
    }

    const srChange = Object.values(MODS).some(v => (v & mods) === v);
    if (srChange) {
        const key = `${bm.id} ${mods}`;
        const sr = srStatMap.get(key);

        if (typeof sr === 'number') {
            stats = Object.assign({}, stats);
            stats.sr = sr;
        } else {
            srStatMap.set(key, stats.sr);

            const content: BeatmapDifficultyStatsQuery = {
                id: bm.id,
                mods,
                path: `${gosu.settings.folders.songs}\\${bm.path.folder}\\${bm.path.file}`,
            };

            getSocket().emit('beatmap star difficulty stats', content);
        }
    }

    stats = adjustDifficultyStats(stats, mods);

    return stats;
}
