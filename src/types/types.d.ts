declare global {

    interface DifficultyStats {
        id: number,
        mods: number,
        ar: number,
        cs: number,
        od: number,
        sr: number,
        bpm: number,
        time: number,
    }

    interface PartialDifficultyStats {
        id: number,
        mods: number,
        sr: number,
    }

    interface BeatmapDifficultyStatsQuery {
        id: number,
        mods: number,
        path: string,
    }
}

export { };
