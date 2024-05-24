const ws = require('ws');
const wsServer = new ws.Server({
    port: 5000,
}, ()=>console.log('Server started on port 5000'));

let rooms = [];
const minPlayers = 4;
const maxPlayers = 20;

function FindRoom(name){
    for(let i = 0; i < rooms.length; i++){
        if (rooms[i].name === name)
            return rooms[i];
    }
    return false;
}
function CreateRoom(name, user, userName){
    let room = {
        name: name,
        players: [],
        messages: [],
        readyPlayers: [],
        phase: 'playersWaiting',
        addPlayer: function(ws, name) {
            this.players.push({name: name, room:this, ws: ws, ready: false, role: ''});
        },
    }
    room.addPlayer(user, userName);
    rooms.push(room);
    console.log(`Создана комната ${name}`);
    return room;
}
function GetRoom(roomName){
    for(let i = 0; i < rooms.length; i++){
        if (rooms[i].name === roomName)
            return rooms[i];
    }
    return false;
}
function GetPlayer (room, playerWs){
    for(let i = 0; i < room.players.length; i++){
        if (room.players[i].ws === playerWs)
            return room.players[i];
    }
    return false;
}
function DeletePlayer (room, playerName){
    for(let i = 0; i < room.players.length; i++){
        if (room.players[i].name === playerName){
            room.players.splice(i,1);
            console.log(`Игрок с ником ${playerName} удален из комнаты ${room.name}`);
            return true;
        }
    }
    return false;
}
function DeleteRoom(roomName){
    for(let i = 0; i < rooms.length; i++){
        if (rooms[i].name === roomName){
            rooms.splice(i,1);
            console.log(`Комната ${roomName} удалена`);
            return true;
        }
    }
    return false;
}
function checkNameCollision(playerName, room){
    if (room.players === undefined)
        return false;
    return room.players.some((currPlayer) => {
        // console.log(`Сравнение ников ${currPlayer.name} и ${playerName}`);
        if (currPlayer.name === playerName) {
            // console.log('Возвращается true');
            return true;
        }
    });
}

// проверка нужного количества участников для перехода в фазу подготовки
// , отправка сообщений о фазе подготовки игрокам
// , изменения текущей фазы в комнате
function checkPlayersCount(room){
    if (room.phase === 'playersWaiting' && room.players.length >= minPlayers && room.players.length<=maxPlayers){
        room.phase = 'preparing';
        let message = {
            event: 'phase',
            phase: 'preparing'
        }
        broadcastMessage(message, room);
        console.log('Отправлена фаза подготовки');
        return true;
    }
    if (room.phase === 'preparing' && (room.players.length < minPlayers || room.players.length > maxPlayers)){
        room.phase = 'playersWaiting';
        let message = {
            event: 'phase',
            phase: 'playersWaiting'
        }
        broadcastMessage(message, room);
        room.readyPlayers = [];
        console.log('Отправлена фаза ожидания игроков');
        return true;
    }
    return false;
}
function checkAllReady(room){
    return room.players.length === room.readyPlayers.length;
}
function startGame(room){
    let messageToSend = {
        event:'phase',
        phase: 'startDay',
    }
    broadcastMessage(messageToSend, room);
    // Оповещение в чат
    messageToSend = {
        event:'messageFromServer',
        text:`Игра началась!`,
    }
    room.messages.push(messageToSend);
    room.phase = 'startDay';
    broadcastMessage(messageToSend, room);
    console.log(`Все готовы, можно начинать`);
}
function playerReadyHandler(room, playerName){
    room.readyPlayers.push(playerName);
    let messageToSend = {
        event:'ready',
        code: 'ready',
        name: playerName,
    }
    broadcastMessage(messageToSend, room);
    console.log(`Игрок ${playerName} готов`)
}
function playerNotReadyHandler(room, playerName){
    let index = room.readyPlayers.indexOf(playerName);
    room.readyPlayers.splice(index, 1);
    let messageToSend = {
        event:'ready',
        code: 'notReady',
        name: playerName,
    }
    broadcastMessage(messageToSend, room);
    console.log(`Игрок ${playerName} отменил готовность`)
}
function playerConnectionHandler(message, ws){
    console.log('Подключен игрок ' + message.name);
    let currRoom = FindRoom(message.roomName);
    if (checkNameCollision(message.name, currRoom)){
        let messageToSend = {
            event:'response',
            code: 'nameCollision',
        }
        ws.send(JSON.stringify(messageToSend));
        ws.close;
        return false;
    }
    if (currRoom === false)
        currRoom = CreateRoom(message.roomName, ws, message.name)
    else
        currRoom.addPlayer(ws, message.name)

    // Оповещение в чат
    let messageToSend = {
        event:'messageFromServer',
        text:`Игрок ${message.name} присоединился к игре`
    }
    currRoom.messages.push(messageToSend);
    broadcastMessage(messageToSend, currRoom);

    // ответ подключившемуся игроку
    messageToSend = {
        event:'response',
        code: 'OK',
        messages: currRoom.messages,
        players: currRoom.players.map(player => player.name),
    }
    ws.send(JSON.stringify(messageToSend));

    // сообщение всем игрокам
    messageToSend = {
        event:'newPlayer',
        name:message.name,
    }
    let room = GetRoom(message.roomName);
    broadcastMessage(messageToSend, room);
}
function giveRoles(room){
    let playersCount = room.players.length;
    let mafiaCount = Math.floor(playersCount / 4); // Округление вниз
    let wanton = playersCount >= 6;
    let doctor = playersCount >= 8;
    console.log(`Количество игроков: ${playersCount}`);
    console.log(`Количество мафии: ${mafiaCount}`);
    let roles = Array(playersCount).fill('citizen');
    roles[playersCount-1] = 'sherif';
    if (wanton)
        roles[playersCount-2] = 'wanton';
    if (doctor)
        roles[playersCount-3] = 'doctor';
    for (let i = 0; i < mafiaCount; i++) {
        roles[i] = 'mafia';
    }

    // Перемешиваем массив ролей
    roles = roles.sort(() => Math.random() - 0.5);
    // Присваиваем роли игрокам
    room.players.forEach((player, index) => {
        player.role = roles[index];
    });
    sendRoles(room);
    console.log('Роли игроков:', room.players.map(player => `${player.name}: ${player.role}`));
}
function sendRoles(room){
    room.players.forEach((player) => {
        let message = {
            event: 'role',
            role: player.role,
        }
        player.ws.send(JSON.stringify(message));
    })
    console.log('Роли отправлены');
}

wsServer.on('connection', function connection(ws){
    ws.on('message', (message) => {
        message = JSON.parse(message);
        // console.log(message);
        switch (message.event){
            case 'message':
                let roomToBroadcast = rooms[0];
                roomToBroadcast = GetRoom(message.roomName);
                roomToBroadcast.messages.push(message);
                broadcastMessage(message, roomToBroadcast);
                console.log(roomToBroadcast.messages);
                // console.log('Сообщение '+message);
                break;
            case 'connection':
                if (playerConnectionHandler(message, ws) === false) // подключение игрока и добавление в комнату
                    break;
                let room = GetRoom(message.roomName)
                // переход в фазу подготовки при нужном кол-ве игроков
                checkPlayersCount(room);
                break;
            case 'disconnect':  // отключение игрока
                let diskRoom = GetRoom(message.roomName);
                if (diskRoom.players.length - 1 <= 0){
                    DeleteRoom(message.roomName)
                } else {
                    DeletePlayer(diskRoom, message.name);

                    // Оповещение в чат
                    let messageToSend = {
                        event:'messageFromServer',
                        text:`Игрок ${message.name} покинул игру`
                    }
                    diskRoom.messages.push(messageToSend);
                    broadcastMessage(messageToSend, diskRoom);
                    messageToSend = {
                        event:'disconnect',
                        name: message.name,
                        players: diskRoom.players.map(player => player.name),
                    }
                    broadcastMessage(messageToSend, diskRoom);
                    checkPlayersCount(diskRoom);
                }
                ws.close;
                break;
            case 'ready':   // игрок прислал сообщение о готовности
                if (message.code === 'ready'){
                    let room = GetRoom(message.roomName);
                    playerReadyHandler(room, message.name); // уведомление о готовности игрока
                    if (checkAllReady(room)){   // если все игроки готовы, начало игры
                        startGame(room);    // начало игры
                        giveRoles(room);
                    }
                } else if (message.code === 'notReady'){
                    let room = GetRoom(message.roomName);
                    playerNotReadyHandler(room, message.name); // уведомление об отмене готовности игрока
                }
                break;
        }
    })
    ws.on('close', (code, reason) => {
        console.log('Соединение закрыто', { code, reason });
        // Удаляем пользователя из комнаты при разрыве соединения
        for (let i = 0; i < rooms.length; i++) {
            let room = rooms[i];
            let playerToDelete = GetPlayer(room, ws);
            if (!playerToDelete)
                continue;
            if (DeletePlayer(room, playerToDelete.name)) {
                // Если комната опустела, удаляем комнату
                if (room.players.length === 0) {
                    DeleteRoom(room.name);
                } else{
                    // Оповещение в чат
                    let messageToSend = {
                        event:'messageFromServer',
                        text:`Игрок ${playerToDelete.name} покинул игру`
                    }
                    room.messages.push(messageToSend);
                    broadcastMessage(messageToSend, room);

                    messageToSend = {
                        event:'disconnect',
                        name: playerToDelete.name,
                        players: room.players.map(player => player.name),
                    }
                    broadcastMessage(messageToSend, room);
                    console.log('Сообщение об удалении пользователя отправлено')
                    checkPlayersCount(room);
                }
                break;
            }
        }
    })
})

function broadcastMessage(message, room){
    room.players.forEach(player => {
        player.ws.send(JSON.stringify(message));
    })
}