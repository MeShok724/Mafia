const rooms = [];

function findRoom(name) {
    return rooms.find((room) => room.name === name) || false;
}

function createRoom(name, user, userName) {
    const room = {
        name,
        players: [],
        messages: [],
        readyPlayers: [],
        peers: [],
        phase: 'playersWaiting',
        addPlayer(ws, playerName) {
            this.players.push({ name: playerName, room: this, ws, ready: false, role: '', votes: 0, alive: true });
        },
    };

    room.addPlayer(user, userName);
    rooms.push(room);
    console.log(`Создана комната ${name}`);
    return room;
}

function getRoom(roomName) {
    return findRoom(roomName);
}

function deleteRoom(roomName) {
    const index = rooms.findIndex((room) => room.name === roomName);
    if (index !== -1) {
        rooms.splice(index, 1);
        console.log(`Комната ${roomName} удалена`);
        return true;
    }
    return false;
}

function getPlayer(room, playerWs) {
    return room.players.find((player) => player.ws === playerWs) || false;
}

function getPlayerWithName(room, playerName) {
    return room.players.find((player) => player.name === playerName) || false;
}

function deletePlayer(room, playerName) {
    const index = room.players.findIndex((player) => player.name === playerName);
    if (index !== -1) {
        room.players.splice(index, 1);
        console.log(`Игрок с ником ${playerName} удален из комнаты ${room.name}`);
        return true;
    }
    return false;
}

function checkNameCollision(playerName, room) {
    if (!room || !room.players) {
        return false;
    }
    return room.players.some((currPlayer) => currPlayer.name === playerName);
}

module.exports = {
    rooms,
    findRoom,
    createRoom,
    getRoom,
    deleteRoom,
    getPlayer,
    getPlayerWithName,
    deletePlayer,
    checkNameCollision,
};
