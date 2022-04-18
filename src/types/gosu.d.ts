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

    interface GosuChatMessage {
        time: string,
        name: string,
        messageBody: string,
        team: 'left' | 'right' | 'unknown',
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

    interface GosuManager {
        ipcState: number,
        bestOF: number,
        teamName: {
            left: string,
            right: string,
        },
        stars: {
            left: number,
            right: number,
        },
        bools: {
            scoreVisible: boolean,
            starsVisible: boolean,
        },
        chat: null | GosuChatMessage[],
        gameplay: {
            score: {
                left: number,
                right: number,
            },
        },
    }

    interface GosuTourney {
        manager: GosuManager,
        ipcClients: null | GosuIpcClient[],
    }

    interface GosuSettings {
        showInterface: boolean,
        folders: {
            game: string,
            skin: string,
            songs: string,
        },
    }

    interface GosuResultsScreen {
        name: string,
        score: number,
        maxCombo: number,
        mods: {
            num: number,
            str: string,
        },
        300: number,
        geki: number,
        100: number,
        katu: number,
        50: number,
        0: number,
    }

    interface GosuGameplay {
        gameMode: number,
        name: string,
        score: number,
        accuracy: number,
        combo: {
            current: number,
            max: number,
        },
        hp: {
            normal: number,
            smooth: number
        },
        hits: {
            300: number,
            geki: number,
            100: number,
            katu: number,
            50: number,
            0: number,
            sliderBreaks: number,
            grade: {
                current: string,
                maxThisPlay: string,
            },
            unstableRate: number,
            hitErrorArray: null | number[],
        },
        pp: {
            current: number,
            fc: number,
            maxThisPlay: number
        },
        keyOverlay: {
            k1: {
                isPressed: boolean,
                count: number
            },
            k2: {
                isPressed: boolean,
                count: number
            },
            m1: {
                isPressed: boolean,
                count: number
            },
            m2: {
                isPressed: boolean,
                count: number
            }
        },
        leaderboard: {
            hasLeaderboard: boolean,
            isVisible: boolean,
            ourplayer: {
                name: string,
                score: number,
                combo: number,
                maxCombo: number,
                mods: string,
                h300: number,
                h100: number,
                h50: number,
                h0: number,
                team: number,
                position: number,
                isPassing: number
            },
            slots: null | GosuPlayerSlot[]
        }
    }

    interface GosuPlayerSlot {
        name: string,
        score: number,
        combo: number,
        maxCombo: number,
        mods: string,
        h300: number,
        h100: number,
        h50: number,
        h0: number,
        team: number,
        position: number,
        isPassing: number,
    }

    interface Gosu {
        settings: GosuSettings,
        menu: GosuMenu,
        tourney: GosuTourney,
        resultsScreen: GosuResultsScreen,
    }
}

export { };
