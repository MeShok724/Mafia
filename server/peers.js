const { broadcastMessageWithout } = require('./messaging');

function sendPeerId(room, name, peerId) {
    const message = {
        event: 'peerId',
        name,
        peerId,
    };
    broadcastMessageWithout(message, name, room);
}

module.exports = {
    sendPeerId,
};
