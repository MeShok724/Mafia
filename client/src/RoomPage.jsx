import {useEffect, useRef, useState} from "react";
import {useParams} from "react-router";
import {useNavigate} from "react-router-dom";
import backgroundImage from "./images/room1.jpg";
import ChatComponent from './components/chat';
import Icons from './components/icons'
import Modal from "./components/modal";
import imgMafia from "./images/mafia.jpg";
import imgCitizen from "./images/sitizen.jpg";
import imgSherif from "./images/sherif.jpg";
import imgWanton from "./images/wanton.jpg";
import imgDoctor from "./images/doctor.jpg";
import './styles/RoomPage.css';

export default function RoomPage(){

    const navigate = useNavigate();

    const roomName = useParams().roomName;
    const query = new URLSearchParams(window.location.search);
    const name = query.get('name');

    const [messages, setMessages] = useState([]);   // сообщения
    const [players, setPlayers] = useState([]); // имена игроков
    const [readyPlayers, setReadyPlayers] = useState([]);   // готовые игроки
    const [mafias, setMafias] = useState([]);   // мафии
    const socket = useRef(null);
    const [phase, setPhase] = useState('playersWaiting'); // текущая фаза игры
    const [role, setRole] = useState('');   // роль
    const [timeToView, setTimeToView] = useState(''); // время на экране
    let timerInterval; // таймер
    const [isPlayerVoted, setIsPlayerVoted] = useState(false);   // голосовал ли пользователь
    const [playerVotes, setPlayerVotes] = useState([]); // голоса за игоков
    const [killedPlayers, setKilledPlayers] = useState([]); // мертвые игроки
    const [isKilled, setIsKilled] = useState(false); // игрок мертв
    const [gameResult, setGameResult] = useState(false); // игрок мертв
    const [isActive, setIsActive] = useState(true); // игрок заблокирован

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
    }, [])

    useEffect(() => {
        socket.current.onmessage = (event) => {
            let message = JSON.parse(event.data);

            switch (message.event) {
                case 'response':
                    if (message.code === 'nameCollision'){
                        alert('Ваш ник уже используется другим игроком в этой комнате, используйте другой ник.');
                        navigate(`/`);
                        break;
                    }
                    if (message.code === 'gameStarted'){
                        alert('В данный момент присоединиться нельзя, В комнате идет игра.');
                        navigate(`/`);
                        break;
                    }
                    console.log('Вы подключены к комнате');
                    message.messages.forEach((msg) => {
                        setMessages(prev => [...prev, msg])
                    })
                    message.players.forEach((player) => {
                        setPlayers(prev => [...prev, player])
                    })
                    setPhase(message.phase);
                    if (message.phase === 'preparing' && message.readyPlayers !== undefined)
                        setReadyPlayers(message.readyPlayers);
                    break;
                case 'newPlayer':
                    console.log('Подключен пользователь ', message.name);
                    if(message.name === name)
                        break;
                    setPlayers(prev => [...prev, message.name]);
                    break;
                case 'message':
                    setMessages(prev => [...prev, message]);
                    break;
                case 'messageFromServer':
                    setMessages(prev => [...prev, message]);
                    break;
                case 'phase':
                    if (phase === 'preparing')
                        setReadyPlayers([]);
                    setPhase(message.phase);
                    console.log(`Фаза игры перешла в ${message.phase}`);
                    if (message.phase === 'citizenVoting' || message.phase === 'mafiaVoting' || message.phase === 'night'){
                        setIsPlayerVoted(false);
                        setPlayerVotes(new Array(players.length).fill(0));
                    }
                    if (message.phase === 'day' && !isActive){ // разблокировка заблокированных распутницей
                        setIsActive(true);
                        console.log('Вы разблокированы');
                    }
                    if (message.phase === 'mafiaVoting' && !isActive)   // если игрок охмурен, сообщение в чат
                        setMessages(prev => [...prev, {event: 'messageFromServer', text: 'Вас охмурила распутница, вы лишаетесь хода'}]);
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
                    if (message.role === 'mafia')
                        setMafias(message.mafias);
                    break;
                case 'startTimer':
                    startTimer(message.endTime);
                    break;
                case 'timeEnded':
                    clearInterval(timerInterval);
                    setTimeToView('');
                    break;
                case 'vote':
                    console.log(`Голос в сторону ${message.victim}`);
                    let index = players.indexOf(message.victim);
                    console.log(`Найденный индекс ${index}`);
                    setPlayerVotes((prev) => prev.map((votes, currInd) => currInd===index?votes+1:votes));
                    console.log(playerVotes);
                    break;
                case 'playerKilled':
                    setKilledPlayers(prev=> [...prev, message.name]);
                    if (message.name === name)
                        setIsKilled(true);
                    break;
                case 'gameEnd':
                    setGameResult(message.winner);
                    break;
                case 'wantonBlock':
                    setIsActive(false);
                    console.log('Вас заблокировали');
                    break;
            }
        };
    }, [players, isActive]);
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
        return readyPlayers.indexOf(name) !== -1;
    }


    // таймер
    function startTimer(endTime){
        const updateTimer = () => {
            const now = Date.now();
            const timeLeft = endTime - now;
            if (timeLeft <= 0){
                // таймер истек
                clearInterval(timerInterval);
                setTimeToView('');
            } else {
                const minutes = Math.floor(timeLeft / 60000);
                const seconds = Math.floor((timeLeft % 60000) / 1000).toString().padStart(2, '0'); // Преобразование секунд в двухзначный формат
                setTimeToView(`${minutes}:${seconds}`); // изменение оставшегося времени
            }
        }
        updateTimer();
        timerInterval = setInterval(updateTimer, 1000);
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
    function rolePicture(){
        switch (role){
            case '':
                return (<div></div>);
            case 'mafia':
                return (<img src={imgMafia} className='role-img' alt='mafia'/>);
            case 'citizen':
                return (<img src={imgCitizen} className='role-img' alt='citizen'/>);
            case 'sherif':
                return ((<img src={imgSherif} className='role-img' alt='sherif'/>))
            case 'wanton':
                return ((<img src={imgWanton} className='role-img' alt='wanton'/>))
            case 'doctor':
                return ((<img src={imgDoctor} className='role-img' alt='doctor'/>))
        }
    }
    const timeView = () => {
        if (timeToView === '')
            return (<div/>)
        else {
            switch (phase){
                case 'startDay':
                case 'day':
                    return (<strong className='time'>День: {timeToView}</strong>);
                case 'startNight':
                case 'night':
                    return (<strong className='time'>Ночь: {timeToView}</strong>);
                case 'citizenVoting':
                    return (<strong className='time'>Голосование: {timeToView}</strong>);
                case 'mafiaVoting':
                    return (<strong className='time'>Голосование мафии: {timeToView}</strong>);
            }
        }
    }
    const btnVoteClick = (key) => {
        setIsPlayerVoted(true);
        let message = {
            event: 'vote',
            name: name,
            roomName: roomName,
            victim: players[key],
        }
        socket.current.send(JSON.stringify(message));
    }
    const handleStay = () => {  // если игрок решил остаться в комнате
        setGameResult(false);
        setMafias([]);
        setRole('');
        setReadyPlayers([]);
        setKilledPlayers([]);
        setIsPlayerVoted(false);
        setPlayerVotes([]);
        socket.current.send(JSON.stringify({event: 'getReadyPlayers', name: name, roomName: roomName}));
    };

    const btnWantonClick = (index) => { // ход распутницы
        setIsPlayerVoted(true);
        let message = {
            event: 'wantonVote',
            name: name,
            roomName: roomName,
            victim: players[index],
        }
        socket.current.send(JSON.stringify(message));
    }

    return (
        <div className='top-div' style={{backgroundImage: `url(${backgroundImage})`}}>
            {gameResult && (
                <Modal
                    onClose={() => setGameResult(null)}
                    onStay={handleStay}
                    onLeave={leaveRoom}
                >
                    {gameResult === 'citizens' ? 'Мирные жители победили!' : 'Мафия победила!'}
                </Modal>
            )}
            <Icons
                players={players}
                fPlayerReady={isPlayerReady}
                phase={phase}
                role={role}
                isMafPictures={((phase!=='preparing' && phase!=='playersWaiting') && role==='mafia')}
                mafias={mafias}
                isPlayerVoted={isPlayerVoted}
                playerVotes={playerVotes}
                btnVoteClick={btnVoteClick}
                killedPlayers={killedPlayers}
                isKilled={isKilled}
                myName={name}
                btnWantonClick={btnWantonClick}
                isActive={isActive}
            />
            <div className='cont-interface'>
                <div className='left-panel'>
                    {timeView()}
                    {roleView()}
                    {rolePicture()}
                </div>
                <ChatComponent
                    name={name}
                    roomName={roomName}
                    socket={socket}
                    messages={messages}
                    setMessages={setMessages}
                    isMafia={role==='mafia'}
                    phase={phase}
                    isKilled={isKilled}
                />
                <div className='menu-buttons'>
                    <button onClick={leaveRoom} className='btn-leave'>Выйти из комнаты</button>
                    {btnReadyView()}
                </div>
            </div>
        </div>
    );
}
