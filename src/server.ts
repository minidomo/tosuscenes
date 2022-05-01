import * as express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { auth, v2 } from 'osu-api-extended';
import { beatmapAttributes } from 'osu-bma';

// Import * as needle from 'needle';
// import { pp_calc_object } from 'osu-api-extended/dist/types/tools';

const configPath = path.join(__dirname, '../config.json');

auth.login(getConfig().api.clientId, getConfig().api.clientSecret)
    .then(res => {
        console.log(`Authorized osu!api version 2. Expires in ${res.expires_in} seconds`);
    })
    .catch(console.error);

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '../html/server')));

// Const gosuPath = path.join(__dirname, '../src/temp-gosujson.txt');
// fs.writeFileSync(gosuPath, '', { encoding: 'utf-8' });

const port = getConfig().server.port;
server.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/\nResolution: 1920x1080`);
});

io.on('connection', socket => {
    io.allSockets()
        .then(set => {
            console.log(`${socket.id} connected | active users: ${set.size}`);
        });

    socket.on('disconnect', reason => {
        io.allSockets()
            .then(set => {
                let info = '';
                if (reason) {
                    info = `- ${reason} `;
                }
                console.log(`${socket.id} disconnected ${info}| active users: ${set.size}`);
            });
    });

    socket.on('load config', () => {
        socket.emit('load config', getConfig());
    });

    socket.on('save config', configData => {
        saveConfig(configData);
        socket.emit('save config');
    });

    socket.on('beatmap base difficulty stats', async (content: BeatmapDifficultyStatsQuery) => {
        try {
            const data = await v2.beatmap.get(content.id);
            const stats: DifficultyStats = {
                id: content.id,
                mods: content.mods,
                ar: data.ar,
                od: data.accuracy,
                cs: data.cs,
                bpm: data.bpm,
                time: data.total_length * 1000,
                sr: data.difficulty_rating,
            };

            socket.emit('beatmap base difficulty stats', stats);
        } catch (err) {
            console.error(err);
        }
    });

    socket.on('beatmap star difficulty stats', (content: BeatmapDifficultyStatsQuery) => {
        fs.readFile(content.path, { encoding: 'utf-8' }, (err, data) => {
            if (err) {
                console.error(err);
                return;
            }

            const attr = beatmapAttributes(data, content.mods);

            const stats: PartialDifficultyStats = {
                id: content.id,
                mods: content.mods,
                sr: attr.starRating,
            };

            socket.emit('beatmap star difficulty stats', stats);
        });
    });

    // Socket.on('gosu', (data: Gosu) => {
    //     if (data.menu && data.menu.pp) {
    //         data.menu.pp.strains = [];
    //     }
    //     if (data.tourney && data.tourney.manager) {
    //         data.tourney.manager.chat = [];
    //     }
    //     const str = `\n${JSON.stringify(data, null, 4)}\n`;
    //     fs.appendFile(gosuPath, str, { encoding: 'utf-8' }, err => {
    //         if (err) {
    //             console.error(err);
    //         }
    //     });
    // });
});

export function getConfigPath() {
    return configPath;
}

export function saveConfig(configData: Config) {
    fs.writeFileSync(configPath, JSON.stringify(configData, null, 4), { encoding: 'utf-8' });
}

export function getConfig(): Config {
    const rawConfig = fs.readFileSync(configPath, { encoding: 'utf-8' });
    return JSON.parse(rawConfig);
}

export function getIO() {
    return io;
}
