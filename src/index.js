const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const fs = require('fs');

const PORT = 50423;
const configPath = 'config.json';

app.use(express.static('./public'));

server.listen(PORT, () => {
    console.log(`listening at http://localhost:${PORT}/`);
});

io.on('connection', socket => {
    console.log(`${socket.id} connected`);

    // TODO case config doesnt exist
    socket.on('load config', () => {
        console.log('loading config');
        const config = fs.readFileSync(configPath, { encoding: 'utf-8' });
        socket.emit('load config', config);
    });

    socket.on('save config', config => {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4), { encoding: 'utf-8' });
        socket.emit('save config');
    });
});
