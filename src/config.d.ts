declare global {
    interface Config {
        tournament: {
            title: string,
            subtitle: string,
            bracket: string,
            round: string,
            individualMaxPoints: number,
            teams: {
                red: {
                    points: number,
                    image: string,
                    name: string,
                    players: string[],
                },
                blue: {
                    points: number,
                    image: string,
                    name: string,
                    players: string[],
                },
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
