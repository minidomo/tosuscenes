declare global {
    interface ConfigTeam {
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
