import React, { useRef, useState, useEffect } from "react";
import '../styles/chat.css'


export default function ChatComponent({ name, roomName, socket, messages, setMessages, isMafia, phase, isKilled }) {
    // const [messages, setMessages] = useState([]);
    const [messageToChat, setMessageToChat] = useState('');
    const chatContainerRef = useRef(null);

    useEffect(() => {
        // Прокручиваем контейнер чата к нижней границе при добавлении нового сообщения
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleMessageChange = (event) => {
        setMessageToChat(event.target.value);
    };

    const sendMessage = () => {
        if (socket.current && socket.current.readyState === WebSocket.OPEN) {
            if (isKilled){
                setMessages((prev) => [...prev, {event: 'messageFromServer',text: 'Вы не можете писать, будучи убитым'}])
                return;
            }
            if (isMafia && (phase === 'startNight' || phase === 'night')){
                let message = {
                    event: 'message',
                    forMafia: true,
                    text: messageToChat,
                    name: name,
                    roomName: roomName,
                };
                socket.current.send(JSON.stringify(message));
                setMessageToChat(''); // Очистить состояние
                return;
            }
            if (phase === 'startNight' || phase === 'night'){
                setMessages((prev) => [...prev, {event: 'messageFromServer',text: 'Вы не можете отправлять сообщения ночью'}])
                return;
            }
            let message = {
                event: 'message',
                text: messageToChat,
                name: name,
                roomName: roomName,
            };
            socket.current.send(JSON.stringify(message));
            setMessageToChat(''); // Очистить состояние
            // console.log('Сообщение отправлено');
        } else {
            console.log('WebSocket соединение не установлено');
        }
    };

    const printMessages = () => {
        return messages.map((message, index) => (
            <div key={index} className='message'>
                {message.event === 'message'? <div><strong className='playerMessage'>{message.name}</strong>: {message.text}</div>:
                    <div className='messageFromServer'>{message.text}</div>}
            </div>
        ));
    };
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    };

    return (
        <div className='cont-chat'>
            <div className='chat-messages' ref={chatContainerRef}>
                {printMessages()}
            </div>
            <div className='chat-send'>
                <input
                    type='text'
                    className='inp-chat'
                    value={messageToChat}
                    onChange={handleMessageChange}
                    onKeyDown={handleKeyDown}
                />
                <button onClick={sendMessage} className='btn-chat'>Отправить сообщение</button>
            </div>
        </div>
    );
}
