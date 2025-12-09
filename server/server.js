const ws = require('ws');

const {
    rooms,
    findRoom,
    createRoom,
    getRoom,
    deleteRoom,
    getPlayer,
    getPlayerWithName,
    deletePlayer,
    checkNameCollision,
} = require('./rooms');
const {
    broadcastMessage,
    broadcastMessageToRole,
    broadcastMessageWithout,
    serverMessage,
} = require('./messaging');
const {
    checkPlayersCount,
    checkAllReady,
    playerReadyHandler,
    playerNotReadyHandler,
} = require('./phaseTransitions');
const { startGame } = require('./gameEngine');
const { sendPeerId } = require('./peers');

const wsServer = new ws.Server({
    port: 5000,
}, () => console.log('Server started on port 5000'));

function playerConnectionHandler(message, socket) {
    console.log('Подключен игрок ' + message.name);
    let currRoom = findRoom(message.roomName);
    if (checkNameCollision(message.name, currRoom)) {
        socket.send(JSON.stringify({ event: 'response', code: 'nameCollision' }));
        socket.close;
        return false;
    }
    if (currRoom !== false && currRoom.phase !== 'preparing' && currRoom.phase !== 'playersWaiting') {
        socket.send(JSON.stringify({ event: 'response', code: 'gameStarted' }));
        socket.close;
        return false;
    }
    if (currRoom === false) {
        currRoom = createRoom(message.roomName, socket, message.name);
    } else {
        currRoom.addPlayer(socket, message.name);
    }

    let messageToSend = {
        event: 'messageFromServer',
        text: `Игрок ${message.name} присоединился к игре`,
    };
    currRoom.messages.push(messageToSend);
    broadcastMessageWithout(messageToSend, message.name, currRoom);

    messageToSend = {
        event: 'response',
        code: 'OK',
        phase: currRoom.phase,
        messages: currRoom.messages,
        players: currRoom.players.map((player) => player.name),
    };
    if (currRoom.phase === 'preparing') {
        messageToSend.readyPlayers = currRoom.readyPlayers;
    }
    socket.send(JSON.stringify(messageToSend));

    messageToSend = {
        event: 'newPlayer',
        name: message.name,
    };
    broadcastMessage(messageToSend, getRoom(message.roomName));
    return true;
}

wsServer.on('connection', (socket) => {
    socket.on('message', (rawMessage) => {
        const message = JSON.parse(rawMessage);
        switch (message.event) {
            case 'message': {
                const roomToBroadcast = getRoom(message.roomName) || rooms[0];
                roomToBroadcast.messages.push(message);
                if (message.forMafia) {
                    broadcastMessageToRole(message, 'mafia', roomToBroadcast);
                    break;
                }
                broadcastMessage(message, roomToBroadcast);
                break;
            }
            case 'connection': {
                if (playerConnectionHandler(message, socket) === false) {
                    break;
                }
                const room = getRoom(message.roomName);
                checkPlayersCount(room);
                break;
            }
            case 'disconnect': {
                const diskRoom = getRoom(message.roomName);
                if (diskRoom.players.length - 1 <= 0) {
                    deleteRoom(message.roomName);
                } else {
                    deletePlayer(diskRoom, message.name);

                    serverMessage(`Игрок ${message.name} покинул игру`, diskRoom);
                    const messageToSend = {
                        event: 'disconnect',
                        name: message.name,
                        players: diskRoom.players.map((player) => player.name),
                    };
                    broadcastMessage(messageToSend, diskRoom);
                    checkPlayersCount(diskRoom);
                }
                socket.close;
                break;
            }
            case 'ready': {
                if (message.code === 'ready') {
                    const room = getRoom(message.roomName);
                    playerReadyHandler(room, message.name);
                    if (checkAllReady(room)) {
                        startGame(room);
                    }
                } else if (message.code === 'notReady') {
                    const room = getRoom(message.roomName);
                    playerNotReadyHandler(room, message.name);
                }
                break;
            }
            case 'vote': {
                const room = getRoom(message.roomName);
                if (room.phase === 'citizenVoting') {
                    serverMessage(`Игрок ${message.name} голосует против ${message.victim}`, room);
                    const player = getPlayerWithName(room, message.victim);
                    player.votes += 1;
                    broadcastMessage({ event: 'vote', victim: message.victim }, room);
                } else if (room.phase === 'mafiaVoting') {
                    const player = getPlayerWithName(room, message.name);
                    if (player.role === 'mafia') {
                        broadcastMessageToRole({
                            event: 'messageFromServer',
                            text: `Игрок ${message.name} голосует против ${message.victim}`,
                        }, 'mafia', room);
                        const victim = getPlayerWithName(room, message.victim);
                        victim.votes += 1;
                        broadcastMessageToRole({ event: 'vote', victim: message.victim }, 'mafia', room);
                    }
                }
                break;
            }
            case 'getReadyPlayers': {
                const room = getRoom(message.roomName);
                room.readyPlayers.forEach((player) => {
                    socket.send(JSON.stringify({ event: 'ready', code: 'ready', name: player }));
                });
                break;
            }
            case 'wantonVote': {
                const room = getRoom(message.roomName);
                room.players.find((player) => player.name === message.victim).ws.send(JSON.stringify({ event: 'wantonBlock' }));
                break;
            }
            case 'sherifVote': {
                const room = getRoom(message.roomName);
                const victimRole = room.players.find((player) => player.name === message.victim).role;
                socket.send(JSON.stringify({ event: 'sherifCheck', name: message.victim, role: victimRole }));
                break;
            }
            case 'doctorVote': {
                const room = getRoom(message.roomName);
                room.doctorVote = message.victim;
                break;
            }
            case 'sdp': {
                console.log('Получен SDP пакет от ', message.name);
                const room = getRoom(message.roomName);
                broadcastMessageWithout(message, message.name, room);
                break;
            }
            case 'sdpAnswer': {
                console.log('SDP answer от ', message.sourceName);
                const room = getRoom(message.roomName);
                const player = getPlayerWithName(room, message.destName);
                player.ws.send(JSON.stringify(message));
                break;
            }
            case 'sendPeerId': {
                console.log('Получен peerId: ', message.peerId);
                const room = getRoom(message.roomName);
                const position = room.players.findIndex((p) => p.name === message.name);
                room.peers[position] = message.peerId;
                sendPeerId(room, message.name, message.peerId);
                break;
            }
        }
    });

    socket.on('close', () => {
        for (let i = 0; i < rooms.length; i += 1) {
            const room = rooms[i];
            const playerToDelete = getPlayer(room, socket);
            if (!playerToDelete) {
                continue;
            }
            if (deletePlayer(room, playerToDelete.name)) {
                if (room.players.length === 0) {
                    deleteRoom(room.name);
                } else {
                    serverMessage(`Игрок ${playerToDelete.name} покинул игру`, room);
                    const messageToSend = {
                        event: 'disconnect',
                        name: playerToDelete.name,
                        players: room.players.map((player) => player.name),
                    };
                    broadcastMessage(messageToSend, room);
                    checkPlayersCount(room);
                }
                break;
            }
        }
    });
});
