import {useEffect, useRef, useState} from "react";
import {useParams} from "react-router";
import {useNavigate} from "react-router-dom";
import backgroundImage from "./images/room1.jpg";
import './styles/RoomPage.css';

export default function RoomPage(){

    const navigate = useNavigate();

    const roomName = useParams().roomName;
    const query = new URLSearchParams(window.location.search);
    const name = query.get('name');

    const [messages, setMessages] = useState([]);
    const [messageToChat, setMessageToChat] = useState('');
    const [connected, setConnected] = useState(false);
    const socket = useRef();

    const chatContainerRef = useRef(null);


    useEffect(() => {
        // Создаем соединение WebSocket при монтировании компонента
        socket.current = new WebSocket('ws://localhost:5000');

        socket.current.onopen = () => {
            setConnected(true);
            console.log('Подключение установлено');
            let message = {
                event: 'connection',
                name: name,
                roomName: roomName,
            };
            console.log('Перед отправкой конекта');
            socket.current.send(JSON.stringify(message));
            console.log('После отправки конекта');
        };

        socket.current.onmessage = (event) => {
            let message = JSON.parse(event.data);
            console.log('Получено сообщение ' + message);

            switch (message.event) {
                case 'response':
                    console.log('Вы подключены к комнате');
                    setMessages(message.messages)
                    break;
                case 'newPlayer':
                    console.log('Подключен пользователь ', message.name);
                    break;
                case 'message':
                    console.log('Сообщение от ' + message.name + ' : ', message.text);
                    setMessages(prev => [...prev, message])
                    break;
                case 'disconnect':
                    console.log(`Пользователь ${message.name} был отключен от комнаты`);
                    break;
            }
        };

        socket.current.onclose = () => {
            console.log('Подключение закрыто');
        };

        socket.current.onerror = () => {
            console.log('Ошибка');
        };

        // Закрываем соединение при размонтировании компонента
        return () => {
            if (socket.current) {
                socket.current.close();
            }
        };
    }, []);


    function sendMessage(){
        console.log('Отправляется сообщение')
        let message = {
            event: 'message',
            text: messageToChat,
            name: name,
            roomName: roomName,
        }
        socket.current.send(JSON.stringify(message));
        setMessageToChat('');
        console.log('Сообщение отправлено');
    }
    function leaveRoom(){
        let message = {
            event: 'disconnect',
            name: name,
            roomName: roomName,
        };
        socket.current.send(JSON.stringify(message));
        socket.current.close();
        socket.current = null; // Обнуляем ссылку на WebSocket объект
        navigate(`/`);
    }

    useEffect(() => {
        // Прокручиваем контейнер чата к нижней границе при добавлении нового сообщения
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleMessageChange = (event) => {
        setMessageToChat(event.target.value)
    }

    return (
        <div className='top-div' style={{backgroundImage: `url(${backgroundImage})`}}>
            <div className='cont-chat'>
                <div className='chat-messages' ref={chatContainerRef}>
                    {printMessages()}
                </div>
                <div className='chat-send'>
                    <input type='text' className='inp-chat' value={messageToChat} onChange={handleMessageChange}/>
                    <button onClick={sendMessage} className='btn-chat'>Отправить сообщение</button>
                </div>
            </div>
            <button onClick={leaveRoom} className='btn-leave'>Выйти из комнаты</button>
        </div>
    );

    function printMessages(){
        return messages.map((message, index) => (
            <div key={index} className='message'>
                <strong className='playerMessage'>{message.name}</strong>: {message.text}
            </div>
        ))
    }
}