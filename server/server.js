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
        }
    }
    room.addPlayer(user, userName);
    rooms.push(room);
    console.log('Создана комната '+ name);
    return room;
}

wsServer.on('connection', function connection(ws){
    ws.on('message', (message) => {
        message = JSON.parse(message);
        console.log(message);
        console.log('WS '+ ws);
        switch (message.event){
            case 'message':
                let roomToBroadcast = rooms[0];
                for(let i = 0; i<rooms.length;i++){
                    if (rooms[i].name === message.roomName)
                    {
                        roomToBroadcast = rooms[i];
                        break;
                    }
                }
                broadcastMessage(message, roomToBroadcast);
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
                }
                ws.send(JSON.stringify(messageToSend));

                messageToSend = {
                    event:'newPlayer',
                    name:message.name,
                }
                let room = rooms[0];
                for(let i = 0; i<rooms.length;i++){
                    if (rooms[i].name === message.roomName)
                    {
                        room = rooms[i];
                        break;
                    }
                }
                broadcastMessage(messageToSend, room);
                break;
        }
    })
})

function broadcastMessage(message, room){
    room.players.forEach(player => {
        player.ws.send(JSON.stringify(message));
    })
    console.log(room);
}