declare global {
    namespace Configuration {
        interface Team {
            points: number,
            image: string,
            name: string,
            players: string[],
        }

        interface Standard {
            tournament: {
                title: string,
                subtitle: string,
                bracket: string,
                round: string,
                individualMaxPoints: number,
                teams: {
                    red: Team,
                    blue: Team,
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
}

export { };
