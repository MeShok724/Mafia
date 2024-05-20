const ws = require('ws');
const wsServer = new ws.Server({
    port: 5000,
}, ()=>console.log('Server started on port 5000'));

wsServer.on('connection', function connection(ws){
    ws.on('message', (message) => {
        message = JSON.parse(message);
        console.log(message);
        switch (message.event){
            case 'message':
                broadcastMessage(message);
                console.log('Сообщение '+message);
                break;
            case 'connection':
                console.log('Подключение '+message);
                break;
        }
        let messageToSend = {
            event:'hello', text: 'helloMisha'
        }
        broadcastMessage(JSON.stringify(messageToSend));
    })
})

function broadcastMessage(message){
    wsServer.clients.forEach(client => {
        client.send(JSON.stringify(message));
    })
}