const ws = require('ws');
const wsServer = new ws.Server({
    port: 5000,
}, ()=>console.log('Server started on port 5000'));

let rooms = [];

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
        addPlayer: function(ws, name) {
            this.players.push({name: name, room:this, ws: ws});
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

wsServer.on('connection', function connection(ws){
    ws.on('message', (message) => {
        message = JSON.parse(message);
        console.log(message);
        switch (message.event){
            case 'message':
                let roomToBroadcast = rooms[0];
                roomToBroadcast = GetRoom(message.roomName);
                roomToBroadcast.messages.push(message);
                broadcastMessage(message, roomToBroadcast);
                console.log(roomToBroadcast.messages);
                console.log('Сообщение '+message);
                break;
            case 'connection':
                console.log('Подключен игрок ' + message.name);
                let currRoom = FindRoom(message.roomName);
                if (currRoom === false)
                    currRoom = CreateRoom(message.roomName, ws, message.name)
                else
                    currRoom.addPlayer(ws, message.name)

                let messageToSend = {
                    event:'response',
                    code: 'OK',
                    messages: currRoom.messages,
                    players: currRoom.players.map(player => player.name),
                }
                console.log(`Игроку ${message.name} отправлены игроки: ${messageToSend.players}`)
                ws.send(JSON.stringify(messageToSend));

                messageToSend = {
                    event:'newPlayer',
                    name:message.name,
                }
                let room = GetRoom(message.roomName);
                broadcastMessage(messageToSend, room);
                break;
            case 'disconnect':
                let diskRoom = GetRoom(message.roomName);
                if (diskRoom.players.length - 1 <= 0){
                    DeleteRoom(message.roomName)
                } else {
                    DeletePlayer(diskRoom, message.name);
                    let messageToSend = {
                        event:'disconnect',
                        name: message.name,
                        players: diskRoom.players.map(player => player.name),
                    }
                    broadcastMessage(messageToSend, diskRoom);
                    console.log('Сообщение об удалении пользователя отправлено')
                }
                ws.close;
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
                    let messageToSend = {
                        event:'disconnect',
                        name: playerToDelete.name,
                        players: room.players.map(player => player.name),
                    }
                    broadcastMessage(messageToSend, room);
                    console.log('Сообщение об удалении пользователя отправлено')
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
    console.log(room);
}