declare global {
    interface ConfigTeam {
        scoreMultiplier: number,
        points: number,
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
            teams: {
                red: ConfigTeam,
                blue: ConfigTeam,
            },
            winner: {
                color: 'RED' | 'BLUE',
                image: string,
                name: string,
                players: string[],
            },
        },
        server: {
            port: number,
        },
    }
}

export { };
