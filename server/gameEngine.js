const { broadcastMessage, serverMessage } = require('./messaging');
const { giveRoles } = require('./roles');
const { startTimerDay, startTimerNight, timerDay, timerNight, citizenVoting } = require('./gameTimers');

async function startGame(room) {
    giveRoles(room);

    const gameIsEnd = () => {
        let mafiaCount = 0;
        let citizenCount = 0;

        room.players.forEach((player) => {
            if (player.alive) {
                if (player.role === 'mafia') {
                    mafiaCount += 1;
                } else {
                    citizenCount += 1;
                }
            }
        });

        const gameOverHandler = () => {
            room.phase = 'preparing';
            broadcastMessage({ event: 'phase', phase: 'preparing' }, room);
            room.readyPlayers = [];
        };

        if (mafiaCount === 0) {
            serverMessage('Игра окончена! Мирные жители победили.', room);
            broadcastMessage({ event: 'gameEnd', winner: 'citizens' }, room);
            gameOverHandler();
            return true;
        }

        if (mafiaCount >= citizenCount) {
            serverMessage('Игра окончена! Мафия победила.', room);
            broadcastMessage({ event: 'gameEnd', winner: 'mafia' }, room);
            gameOverHandler();
            return true;
        }

        return false;
    };

    await startTimerDay(room);
    await startTimerNight(room);
    while (!gameIsEnd()) {
        await timerDay(room);
        await citizenVoting(room);
        if (gameIsEnd()) {
            break;
        }
        await timerNight(room);
    }
}

module.exports = {
    startGame,
};
