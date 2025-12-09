function broadcastMessage(message, room) {
    room.players.forEach((player) => {
        player.ws.send(JSON.stringify(message));
    });
}

function broadcastMessageToRole(message, role, room) {
    room.players.forEach((player) => {
        if (player.role === role) {
            player.ws.send(JSON.stringify(message));
        }
    });
}

function broadcastMessageWithout(message, playerName, room) {
    room.players.forEach((player) => {
        if (player.name !== playerName) {
            player.ws.send(JSON.stringify(message));
        }
    });
}

const serverMessage = (text, room) => {
    const messageToSend = {
        event: 'messageFromServer',
        text,
    };
    room.messages.push(messageToSend);
    broadcastMessage(messageToSend, room);
};

module.exports = {
    broadcastMessage,
    broadcastMessageToRole,
    broadcastMessageWithout,
    serverMessage,
};
