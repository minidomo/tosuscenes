declare global {
    interface ConfigTeam {
        scoreMultiplier: number,
        points: number,
        image: string,
        name: string,
        players: string[],
    }

    interface ConfigWinner {
        color: 'RED' | 'BLUE',
        image: string,
        name: string,
        players: string[],
    }

    interface Config {
        tournament: {
            title: string,
            subtitle: string,
            bracket: string,
            round: string,
            individualMaxPoints: number,
            annotation: string,
            showScoreMultiplier: boolean,
            teams: {
                red: ConfigTeam,
                blue: ConfigTeam,
            },
            winner: ConfigWinner,
        },
        server: {
            port: number,
        },
    }
}

export { };
