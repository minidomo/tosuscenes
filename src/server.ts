import * as express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import * as fs from 'fs';
import * as path from 'path';

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '../html/server')));

const configPath = path.join(__dirname, '../config.json');
// Const gosuPath = path.join(__dirname, '../src/temp-gosujson.json');
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

    // Socket.on('gosu', (data: Gosu) => {
    //     const str = `\n${JSON.stringify(data, null, 4)}\n`;
    //     fs.appendFile(gosuPath, str, { encoding: 'utf-8' }, err => {
    //         if (err) {
    //             console.error(err);
    //         }
    //     });
    // });
});

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
