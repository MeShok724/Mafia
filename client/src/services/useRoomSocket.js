import { useEffect, useRef } from 'react';

export default function useRoomSocket({
    name,
    roomName,
    players,
    isActive,
    onSetJoinError,
    onAddMessages,
    onSetPlayers,
    onSetPhase,
    onSetReadyPlayers,
    onSetIsPlayerVoted,
    onSetPlayerVotes,
    onSetIsActive,
    onSetRole,
    onSetMafias,
    onStartTimer,
    onClearTimer,
    onSetTimeToView,
    onSetKilledPlayers,
    onSetIsKilled,
    onSetGameResult,
    onSetSherifChecks,
    onHandlePeerId,
}) {
    const socketRef = useRef(null);

    // Создание и закрытие соединения
    useEffect(() => {
        socketRef.current = new WebSocket('ws://localhost:5000');

        socketRef.current.onopen = () => {
            console.log('Подключение установлено');
            const message = {
                event: 'connection',
                name,
                roomName,
            };
            socketRef.current.send(JSON.stringify(message));
        };

        socketRef.current.onclose = () => {
            console.log('Подключение закрыто');
        };

        socketRef.current.onerror = () => {
            console.log('Ошибка');
        };

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
        };
    }, [name, roomName]);

    // Обработка входящих сообщений
    useEffect(() => {
        if (!socketRef.current) return undefined;
        const socket = socketRef.current;

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            switch (message.event) {
                case 'response':
                    if (message.code === 'nameCollision') {
                        onSetJoinError('Name');
                        break;
                    }
                    if (message.code === 'gameStarted') {
                        onSetJoinError('Game');
                        break;
                    }
                    console.log('Вы подключены к комнате');
                    onAddMessages(message.messages || []);
                    onSetPlayers(message.players || []);
                    onSetPhase(message.phase);
                    if (message.phase === 'preparing' && message.readyPlayers) {
                        onSetReadyPlayers(message.readyPlayers);
                    }
                    break;
                case 'newPlayer':
                    if (message.name === name) break;
                    onSetPlayers((prev) => [...prev, message.name]);
                    break;
                case 'message':
                case 'messageFromServer':
                    onAddMessages([message]);
                    break;
                case 'phase':
                    if (message.phase === 'preparing') {
                        onSetReadyPlayers([]);
                    }
                    onSetPhase(message.phase);
                    if (
                        message.phase === 'citizenVoting' ||
                        message.phase === 'mafiaVoting' ||
                        message.phase === 'night'
                    ) {
                        onSetIsPlayerVoted(false);
                        onSetPlayerVotes(new Array(players.length).fill(0));
                    }
                    if (message.phase === 'day' && !isActive) {
                        onSetIsActive(true);
                        console.log('Вы разблокированы');
                    }
                    if (message.phase === 'mafiaVoting' && !isActive) {
                        onAddMessages([
                            { event: 'messageFromServer', text: 'Вас охмурила распутница, вы лишаетесь хода' },
                        ]);
                    }
                    break;
                case 'disconnect':
                    console.log(`Пользователь ${message.name} был отключен от комнаты`);
                    onSetPlayers(message.players || []);
                    break;
                case 'ready':
                    if (message.code === 'ready') {
                        onSetReadyPlayers((prev) => [...prev, message.name]);
                        console.log(`Игрок ${message.name} готов`);
                    } else if (message.code === 'notReady') {
                        onSetReadyPlayers((prev) => prev.filter((playerName) => playerName !== message.name));
                        console.log(`Игрок ${message.name} отменил готовность`);
                    }
                    break;
                case 'role':
                    onSetRole(message.role);
                    if (message.role === 'mafia') {
                        onSetMafias(message.mafias || []);
                    }
                    break;
                case 'startTimer':
                    onStartTimer(message.endTime);
                    break;
                case 'timeEnded':
                    onClearTimer();
                    onSetTimeToView('');
                    break;
                case 'vote': {
                    console.log(`Голос в сторону ${message.victim}`);
                    const index = players.indexOf(message.victim);
                    console.log(`Найденный индекс ${index}`);
                    onSetPlayerVotes((prev) => prev.map((votes, currInd) => (currInd === index ? votes + 1 : votes)));
                    break;
                }
                case 'playerKilled':
                    onSetKilledPlayers((prev) => [...prev, message.name]);
                    if (message.name === name) {
                        onSetIsKilled(true);
                    }
                    break;
                case 'gameEnd':
                    onSetGameResult(message.winner);
                    break;
                case 'wantonBlock':
                    onSetIsActive(false);
                    console.log('Вас заблокировали');
                    break;
                case 'sherifCheck':
                    onSetSherifChecks((prev) => [...prev, { name: message.name, role: message.role }]);
                    console.log(`Проверен игрок ${message.name}, его роль ${message.role}`);
                    break;
                case 'peerId':
                    onHandlePeerId(message.name, message.peerId);
                    break;
                case 'sdp':
                case 'sdpAnswer':
                case 'candidate':
                    break;
                default:
                    break;
            }
        };

        return () => {
            socket.onmessage = null;
        };
    }, [isActive, name, onAddMessages, onClearTimer, onHandlePeerId,
        onSetGameResult, onSetIsActive, onSetIsKilled, onSetJoinError,
        onSetKilledPlayers, onSetMafias, onSetPhase,
        onSetPlayerVotes, onSetPlayers, onSetReadyPlayers, onSetRole,
        onSetSherifChecks, onSetTimeToView, onSetIsPlayerVoted, onStartTimer, players
    ]);

    return socketRef;
}
