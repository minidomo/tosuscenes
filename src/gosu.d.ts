declare global {
    interface GosuIpcClient {
        team: 'left' | 'right',
        spectating: {
            name: string,
            country: string,
            userID: number,
            accuracy: number,
            rankedScore: number,
            playCount: number,
            globalRank: number,
            totalPP: number,
        },
        gameplay: {
            gameMode: number,
            score: number,
            name: string,
            accuracy: number,
            hits: {
                300: number,
                geki: number,
                100: number,
                katu: number,
                50: number,
                0: number,
                sliderBreaks: number,
                unstableRate: number,
            },
            combo: {
                current: number,
                max: number,
            },
            mods: {
                num: number,
                str: string,
            },
            hp: {
                normal: number,
                smooth: number,
            }
        }
    }

    interface Gosu {
        settings: {
            showInterface: boolean,
            folders: {
                game: string,
                skin: string,
                songs: string,
            },
        },
    }
}

export { };
