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

    interface GosuBeatmap {
        time: {
            firstObj: number,
            current: number,
            full: number,
            mp3: number,
        },
        id: number,
        set: number,
        md5: string,
        rankedStatus: number,
        metadata: {
            artist: string,
            artistOriginal: string,
            title: string,
            titleOriginal: string,
            mapper: string,
            difficulty: string,
        },
        stats: {
            AR: number,
            CS: number,
            OD: number,
            HP: number,
            SR: number,
            BPM: {
                min: number,
                max: number,
            },
            maxCombo: number,
            fullSR: number,
            memoryAR: number,
            memoryCS: number,
            memoryOD: number,
            memoryHP: number,
        },
        path: {
            full: string,
            folder: string,
            file: string,
            bg: string,
            audio: string,
        },
    }

    interface GosuMenu {
        mainMenu: {
            bassDensity: number,
        },
        state: number,
        gameMode: number,
        isChatEnabled: number,
        bm: GosuBeatmap,
        mods: {
            num: number,
            str: string,
        },
        pp: {
            100: number,
            99: number,
            98: number,
            97: number,
            96: number,
            95: number,
            strains: number[],
        },
    }

    interface GosuTourney {
        manager: {
            chat: number[],
        },
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
        menu: GosuMenu,
        tourney: GosuTourney,
    }
}

export { };
