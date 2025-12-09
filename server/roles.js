function giveRoles(room) {
    const playersCount = room.players.length;
    const mafiaCount = Math.floor(playersCount / 4);
    const wanton = playersCount >= 6;
    const doctor = playersCount >= 8;
    const roles = Array(playersCount).fill('citizen');

    roles[playersCount - 1] = 'sherif';
    if (wanton) {
        roles[playersCount - 2] = 'wanton';
    }
    if (doctor) {
        roles[playersCount - 3] = 'doctor';
    }
    for (let i = 0; i < mafiaCount; i += 1) {
        roles[i] = 'mafia';
    }

    const shuffledRoles = roles.sort(() => Math.random() - 0.5);
    room.players.forEach((player, index) => {
        player.role = shuffledRoles[index];
    });
    sendRoles(room);
}

function sendRoles(room) {
    room.players.forEach((player) => {
        if (player.role !== 'mafia') {
            player.ws.send(JSON.stringify({ event: 'role', role: player.role }));
        } else {
            const mafias = room.players.filter((p) => p.role === 'mafia').map((p) => p.name);
            player.ws.send(JSON.stringify({ event: 'role', role: player.role, mafias }));
        }
    });
}

module.exports = {
    giveRoles,
    sendRoles,
};
