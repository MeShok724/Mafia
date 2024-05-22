import {useEffect, useRef, useState} from "react";
import {useParams} from "react-router";
import {useNavigate} from "react-router-dom";
import backgroundImage from "./images/room1.jpg";
import ChatComponent from './components/chat';
import Icons from './components/icons'
import './styles/RoomPage.css';

export default function RoomPage(){

    const navigate = useNavigate();

    const roomName = useParams().roomName;
    const query = new URLSearchParams(window.location.search);
    const name = query.get('name');

    const [messages, setMessages] = useState([]);
    const [players, setPlayers] = useState([]);
    const socket = useRef(null);

    const chatContainerRef = useRef(null);  // прокручивает чат вниз


    useEffect(() => {
        socket.current = new WebSocket('ws://localhost:5000');

        socket.current.onopen = () => {
            // setConnected(true);
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

            switch (message.event) {
                case 'response':
                    console.log('Вы подключены к комнате');
                    setMessages(message.messages);
                    setPlayers(message.players);
                    console.log(`Обновлены игроки: ${players}`);
                    break;
                case 'newPlayer':
                    console.log('Подключен пользователь ', message.name);
                    if(message.name === name)
                        break;
                    setPlayers(prevPlayers => {
                        const newPlayers = [...prevPlayers, message.name];
                        console.log(`Обновлены игроки: ${newPlayers}`);
                        return newPlayers;
                    });
                    break;
                case 'message':
                    console.log('Сообщение от ' + message.name + ' : ', message.text);
                    setMessages(prev => [...prev, message]);
                    break;
                case 'disconnect':
                    console.log(`Пользователь ${message.name} был отключен от комнаты`);
                    setPlayers(message.players);
                    console.log(`Обновлены игроки: ${players}`);
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

    function isPlayerReady(name){
        return true;
    }

    return (
        <div className='top-div' style={{backgroundImage: `url(${backgroundImage})`}}>
            <Icons
                players={players}
                fPlayerReady={isPlayerReady}
            />
            <ChatComponent
                name={name}
                roomName={roomName}
                socket={socket}
                messages={messages}
            />
            <button onClick={leaveRoom} className='btn-leave'>Выйти из комнаты</button>
        </div>
    );
}