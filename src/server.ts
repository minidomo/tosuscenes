import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import fs from 'fs';

const app = express();
const server = createServer(app);
const io = new Server(server);

const PORT = 50423;
const configPath = 'config.json';

app.use(express.static('./public'));

server.listen(PORT, () => {
    console.log(`listening at http://localhost:${PORT}/`);
});

io.on('connection', socket => {
    io.allSockets()
        .then(set => {
            console.log(`${socket.id} connected | active users: ${set.size}`);
        });

    socket.on('load config', () => {
        console.log('loading config');
        const config = fs.readFileSync(configPath, { encoding: 'utf-8' });
        socket.emit('load config', config);
    });

    socket.on('save config', config => {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4), { encoding: 'utf-8' });
        socket.emit('save config');
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
});
