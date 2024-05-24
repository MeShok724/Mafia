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
    const [role, setRole] = useState('');   // роль

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
                    setReadyPlayers([]);
                    setPhase(message.phase);
                    console.log(`Фаза игры перешла в ${message.phase}`);
                    break;
                case 'disconnect':
                    console.log(`Пользователь ${message.name} был отключен от комнаты`);
                    setPlayers(message.players);
                    break;
                case 'ready':
                    if (message.code === 'ready'){
                        setReadyPlayers(prev => [...prev, message.name]);
                        console.log(`Игрок ${message.name} готов`)
                    } else if (message.code === 'notReady'){
                        setReadyPlayers(prev => {
                            // Фильтрация массива, чтобы удалить указанное имя
                            return prev.filter(playerName => playerName !== message.name);
                        });
                        console.log(`Игрок ${message.name} отменил готовность`)
                    }
                    break;
                case 'role':
                    setRole(message.role);
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
        if (readyPlayers.indexOf(name) !== -1)
            return true;
        return false;
    }
    function handleBtnReady(){
        let message = {
            event: 'ready',
            name: name,
            roomName: roomName,
            code: 'ready',
        }
        socket.current.send(JSON.stringify(message));
    }
    function handleBtnNotReady(){
        let message = {
            event: 'ready',
            name: name,
            roomName: roomName,
            code: 'notReady',
        }
        socket.current.send(JSON.stringify(message));
    }
    function btnReadyView(){
        if (phase !== 'preparing')
            return (<div></div>)
        if (readyPlayers.indexOf(name) === -1)
            return (<button onClick={handleBtnReady} className='btn-ready'>Готов</button>);
        else
            return (<button onClick={handleBtnNotReady} className='btn-not-ready'>Отмена</button>)

    }
    function roleView(){
        switch (role){
            case '':
                return (<div></div>);
            case 'mafia':
                return (<strong className='role'>Ваша роль: Мафия</strong>);
            case 'citizen':
                return (<strong className='role'>Ваша роль: Мирный житель</strong>);
            case 'sherif':
                return (<strong className='role'>Ваша роль: Шериф</strong>)
            case 'wanton':
                return (<strong className='role'>Ваша роль: Распутница</strong>)
            case 'doctor':
                return (<strong className='role'>Ваша роль: Доктор</strong>)
        }
    }
    return (
        <div className='top-div' style={{backgroundImage: `url(${backgroundImage})`}}>
            <Icons
                players={players}
                fPlayerReady={isPlayerReady}
            />
            <div className='cont-interface'>
                <div className='leftPanel'>
                    {roleView()}
                </div>
                <ChatComponent
                    name={name}
                    roomName={roomName}
                    socket={socket}
                    messages={messages}
                />
                <div className='menu-buttons'>
                    <button onClick={leaveRoom} className='btn-leave'>Выйти из комнаты</button>
                    {btnReadyView()}
                </div>
            </div>
        </div>
    );
}