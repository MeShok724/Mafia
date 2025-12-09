const { broadcastMessage, serverMessage } = require('./messaging');

function startTimerDay(room) {
    return new Promise((resolve) => {
        broadcastMessage({ event: 'phase', phase: 'startDay' }, room);
        serverMessage('Игра началась!', room);
        room.phase = 'startDay';
        const timerDuration = 2 * 60 * 1000;
        const startTime = Date.now();
        const endTime = startTime + timerDuration;
        broadcastMessage({ event: 'startTimer', endTime }, room);
        setTimeout(() => {
            serverMessage('День закончился', room);
            broadcastMessage({ event: 'timeEnded' }, room);
            resolve();
        }, timerDuration);
    });
}

function startTimerNight(room) {
    return new Promise((resolve) => {
        serverMessage('Наступает ночь', room);
        room.phase = 'startNight';
        broadcastMessage({ event: 'phase', phase: 'startNight' }, room);
        const timerDuration = 60 * 1000;
        const startTime = Date.now();
        const endTime = startTime + timerDuration;
        broadcastMessage({ event: 'startTimer', endTime }, room);
        setTimeout(() => {
            serverMessage('Ночь закончилась', room);
            broadcastMessage({ event: 'timeEnded' }, room);
            resolve();
        }, timerDuration);
    });
}

function timerDay(room) {
    return new Promise((resolve) => {
        serverMessage('Наступает день', room);
        room.phase = 'day';
        broadcastMessage({ event: 'phase', phase: 'day' }, room);
        const timerDuration = 2 * 60 * 1000;
        const startTime = Date.now();
        const endTime = startTime + timerDuration;
        broadcastMessage({ event: 'startTimer', endTime }, room);
        setTimeout(() => {
            serverMessage('День подходит к концу', room);
            broadcastMessage({ event: 'timeEnded' }, room);
            resolve();
        }, timerDuration);
    });
}

function killPlayer(room) {
    const maxVotes = Math.max(...room.players.map((player) => player.votes));
    const playersWithMaxVotes = room.players.filter((player) => player.votes === maxVotes);

    if (playersWithMaxVotes.length === 1) {
        const playerToKill = playersWithMaxVotes[0];
        if (room.phase === 'mafiaVoting' && playerToKill.name === room.doctorVote) {
            serverMessage('Никто не был убит', room);
            room.players.forEach((curr) => {
                curr.votes = 0;
            });
            room.doctorVote = false;
            return;
        }
        playerToKill.alive = false;
        serverMessage(`Игрок ${playerToKill.name} убит`, room);
        broadcastMessage({ event: 'playerKilled', name: playerToKill.name }, room);
        room.players.forEach((curr) => {
            curr.votes = 0;
        });
        room.doctorVote = false;
    } else {
        serverMessage('Никто не был убит, голосование не выявило кандидата', room);
        room.players.forEach((curr) => {
            curr.votes = 0;
        });
        room.doctorVote = false;
    }
}

function timerNight(room) {
    return new Promise((resolve) => {
        serverMessage('Наступает ночь', room);
        room.phase = 'night';
        broadcastMessage({ event: 'phase', phase: 'night' }, room);
        const timerDuration = 2 * 60 * 1000;
        const startTime = Date.now();
        const endTime = startTime + timerDuration;
        broadcastMessage({ event: 'startTimer', endTime }, room);
        setTimeout(() => {
            broadcastMessage({ event: 'timeEnded' }, room);

            room.phase = 'mafiaVoting';
            serverMessage('Наступает ночное голосование', room);
            broadcastMessage({ event: 'phase', phase: 'mafiaVoting' }, room);
            const votingDuration = 30 * 1000;
            const votingStartTime = Date.now();
            const votingEndTime = votingStartTime + votingDuration;
            broadcastMessage({ event: 'startTimer', endTime: votingEndTime }, room);
            setTimeout(() => {
                broadcastMessage({ event: 'timeEnded' }, room);
                killPlayer(room);
                resolve();
            }, votingDuration);
        }, timerDuration);
    });
}

function citizenVoting(room) {
    return new Promise((resolve) => {
        serverMessage('Начинается голосование', room);
        room.phase = 'citizenVoting';
        broadcastMessage({ event: 'phase', phase: 'citizenVoting' }, room);
        const timerDuration = 10 * 1000;
        const startTime = Date.now();
        const endTime = startTime + timerDuration;
        broadcastMessage({ event: 'startTimer', endTime }, room);
        setTimeout(() => {
            broadcastMessage({ event: 'timeEnded' }, room);
            killPlayer(room);
            resolve();
        }, timerDuration);
    });
}

module.exports = {
    startTimerDay,
    startTimerNight,
    timerDay,
    timerNight,
    citizenVoting,
    killPlayer,
};
