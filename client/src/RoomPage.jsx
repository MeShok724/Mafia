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

    const [messages, setMessages] = useState([]);   // сообщения
    const [players, setPlayers] = useState([]); // именя игроков
    const [readyPlayers, setReadyPlayers] = useState([]);   // готовые игроки
    const socket = useRef(null);
    const [phase, setPhase] = useState('playersWaiting'); // текущая фаза игры

    // для прокручивания чат вниз
    const chatContainerRef = useRef(null);


    useEffect(() => {
        socket.current = new WebSocket('ws://localhost:5000');

        socket.current.onopen = () => {
            console.log('Подключение установлено');
            let message = {
                event: 'connection',
                name: name,
                roomName: roomName,
            };
            socket.current.send(JSON.stringify(message));
        };

        socket.current.onmessage = (event) => {
            let message = JSON.parse(event.data);

            switch (message.event) {
                case 'response':
                    if (message.code === 'nameCollision'){
                        alert('Ваш ник уже используется другим игроком в этой комнате, используйте другой ник.');
                        navigate(`/`);
                        break;
                    }
                    console.log('Вы подключены к комнате');
                    setMessages(message.messages);
                    setPlayers(message.players);
                    break;
                case 'newPlayer':
                    console.log('Подключен пользователь ', message.name);
                    if(message.name === name)
                        break;
                    setPlayers(prevPlayers => {
                        return [...prevPlayers, message.name];
                    });
                    break;
                case 'message':
                    setMessages(prev => [...prev, message]);
                    break;
                case 'messageFromServer':
                    setMessages(prev => [...prev, message]);
                    break;
                case 'phase':
                    setPhase(message.phase);
                    console.log(`Фаза игры перешла в ${message.phase}`);
                    break;
                case 'disconnect':
                    console.log(`Пользователь ${message.name} был отключен от комнаты`);
                    setPlayers(message.players);
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
            <div className='cont-interface'>
                <ChatComponent
                    name={name}
                    roomName={roomName}
                    socket={socket}
                    messages={messages}
                />
                <button onClick={leaveRoom} className='btn-leave'>Выйти из комнаты</button>
                {phase === 'preparing'? <button className='btnReady'>Готов</button>:<div></div>}
            </div>
        </div>
    );
}