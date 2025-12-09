const { broadcastMessage } = require('./messaging');

const MIN_PLAYERS = 4;
const MAX_PLAYERS = 12;

function checkPlayersCount(room) {
    if (room.phase === 'playersWaiting' && room.players.length >= MIN_PLAYERS && room.players.length <= MAX_PLAYERS) {
        room.phase = 'preparing';
        const message = {
            event: 'phase',
            phase: 'preparing',
        };
        broadcastMessage(message, room);
        return true;
    }

    const outOfRange = room.players.length < MIN_PLAYERS || room.players.length > MAX_PLAYERS;
    if (room.phase === 'preparing' && outOfRange) {
        room.phase = 'playersWaiting';
        const message = {
            event: 'phase',
            phase: 'playersWaiting',
        };
        broadcastMessage(message, room);
        room.readyPlayers = [];
        return true;
    }

    return false;
}

function checkAllReady(room) {
    return room.players.length === room.readyPlayers.length;
}

function playerReadyHandler(room, playerName) {
    room.readyPlayers.push(playerName);
    broadcastMessage({ event: 'ready', code: 'ready', name: playerName }, room);
}

function playerNotReadyHandler(room, playerName) {
    const index = room.readyPlayers.indexOf(playerName);
    if (index !== -1) {
        room.readyPlayers.splice(index, 1);
    }
    broadcastMessage({ event: 'ready', code: 'notReady', name: playerName }, room);
}

module.exports = {
    checkPlayersCount,
    checkAllReady,
    playerReadyHandler,
    playerNotReadyHandler,
};
