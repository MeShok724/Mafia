import {useEffect, useRef, useState} from "react";
import {useParams} from "react-router";
import {useNavigate} from "react-router-dom";
import backgroundImage from "../images/room1.jpg";
import ChatComponent from '../components/chat';
import Icons from '../components/icons'
import RoleInfo from "../components/RoleInfo";
import TimerDisplay from "../components/TimerDisplay";
import ReadyButton from "../components/ReadyButton";
import GameModalWrapper from "../components/GameModalWrapper";
import '../styles/RoomPage.css';
import { usePeer } from "../services/peerJs";
import { GetMyVideoStream } from "../services/video";
import useRoomSocket from "../services/useRoomSocket";

export default function RoomPage(){

    const navigate = useNavigate();

    const roomName = useParams().roomName;
    const query = new URLSearchParams(window.location.search);
    const name = query.get('name');

    const [messages, setMessages] = useState([]);   // сообщения
    const [players, setPlayers] = useState([]); // имена игроков
    const [readyPlayers, setReadyPlayers] = useState([]);   // готовые игроки
    const [mafias, setMafias] = useState([]);   // мафии
    const [phase, setPhase] = useState('playersWaiting'); // текущая фаза игры
    const [role, setRole] = useState('');   // роль
    const [timeToView, setTimeToView] = useState(''); // время на экране
    const [isPlayerVoted, setIsPlayerVoted] = useState(false);   // голосовал ли пользователь
    const [playerVotes, setPlayerVotes] = useState([]); // голоса за игоков
    const [killedPlayers, setKilledPlayers] = useState([]); // мертвые игроки
    const [isKilled, setIsKilled] = useState(false); // игрок мертв
    const [gameResult, setGameResult] = useState(false); // игрок мертв
    const [isActive, setIsActive] = useState(true); // игрок заблокирован
    const [sherifChecks, setSherifChecks] = useState([]); // проверки шерифа
    const [doctorPrev, setDoctorPrev] = useState(''); // пред цель доктора
    const [joinError, setJoinError] = useState(false); // ошибка входа
    const [videoStreams, setVideoStreams] = useState([]); // потоки видео других игроков
    const [myVideoStream, setMyVideoStream] = useState([]); // мое медиа
    const [myPosition, setMyPosition] = useState();
    const chatContainerRef = useRef(null); // для прокручивания чат вниз
    const timerRef = useRef(null);
    const {initPeer, myId, setPeerTable, makeCall, peerTable, setStream} = usePeer() // хук для webrtc
    const socket = useRoomSocket({
        name,
        roomName,
        players,
        isActive,
        onSetJoinError: setJoinError,
        onAddMessages: (msgs) => setMessages((prev) => [...prev, ...msgs]),
        onSetPlayers: (list) => setPlayers(list),
        onSetPhase: setPhase,
        onSetReadyPlayers: setReadyPlayers,
        onSetIsPlayerVoted: setIsPlayerVoted,
        onSetPlayerVotes: setPlayerVotes,
        onSetIsActive: setIsActive,
        onSetRole: setRole,
        onSetMafias: setMafias,
        onStartTimer: startTimer,
        onClearTimer: () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        },
        onSetTimeToView: setTimeToView,
        onSetKilledPlayers: setKilledPlayers,
        onSetIsKilled: setIsKilled,
        onSetGameResult: setGameResult,
        onSetSherifChecks: setSherifChecks,
        onHandlePeerId: handlePeerId,
    });

    // инициализация peer
    useEffect(() => {
        initPeer(sendMyPeerId)
    }, [initPeer])

    useEffect(() => {
        const newVideoStreams = peerTable.map(peer => {
            if (peer && peer.stream) {
                return peer.stream;
            }
            return null;
        });
        setVideoStreams(newVideoStreams);
    }, [peerTable])

    // Рассчет собственной позиции при изменении списка игроков
    useEffect(() => {
        let myNewPosition = players.findIndex(p => p === name)
        setMyPosition(myNewPosition)
    }, [players])

    // Запуск захвата видео при монтировании компонента
    useEffect(() => { 
        const captureMedia = async () => {
            try{
                let videoStream = await GetMyVideoStream()
                if (videoStream){
                    console.log('Медиа получено успешно:', videoStream);
                    setMyVideoStream(videoStream)
                    setStream(videoStream)
                } else {
                    console.log('Не удалось получить медиа');
                    setMyVideoStream(null);
                }
            } catch(err){
                console.log('Ошибка при захвате медиа: ', err)
            }
        }
        captureMedia()
    }, []);

    // сокет-хук берет на себя логику ws

    function handlePeerId(peerName, peerId){
        console.log('Получен peerId :', peerId, ' игрока ', peerName)
        console.log(players)
        let position = players.findIndex(p => p === peerName)
        if (position < 0 || position >= players.length){
            console.log('Неверно вычеслен номер игрока: ', position)
            return
        }
        setPeerTable(prevArray => {
            const newArray = [...prevArray]
            newArray[position] = {
                id: peerId,
                conn: null
            }
            return newArray
        })
        if (myPosition < position)
            makeCall(peerId, position, myPosition)
    }
    

    // отправка peerId
    function sendMyPeerId(peerId){
        let message = {
            event: 'sendPeerId',
            name: name,
            roomName: roomName,
            peerId: peerId
        }
        socket.current.send(JSON.stringify(message));
    }

    // выход из комнаты
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
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }
                setTimeToView('');
            } else {
                const minutes = Math.floor(timeLeft / 60000);
                const seconds = Math.floor((timeLeft % 60000) / 1000).toString().padStart(2, '0'); // Преобразование секунд в двухзначный формат
                setTimeToView(`${minutes}:${seconds}`); // изменение оставшегося времени
            }
        }
        updateTimer();
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        timerRef.current = setInterval(updateTimer, 1000);
    }

    // игрок нажимает "готов"
    function handleBtnReady(){
        let message = {
            event: 'ready',
            name: name,
            roomName: roomName,
            code: 'ready',
        }
        socket.current.send(JSON.stringify(message));
    }

    // игрок нажимает "отмена"
    function handleBtnNotReady(){
        let message = {
            event: 'ready',
            name: name,
            roomName: roomName,
            code: 'notReady',
        }
        socket.current.send(JSON.stringify(message));
    }

    // игрок нажимает "голосовать"
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

    // после окончания игры игок нажал "остаться"
    const handleStay = () => {
        setGameResult(false);
        setMafias([]);
        setRole('');
        setReadyPlayers([]);
        setKilledPlayers([]);
        setIsPlayerVoted(false);
        setPlayerVotes([]);
        socket.current.send(JSON.stringify({event: 'getReadyPlayers', name: name, roomName: roomName}));
        setDoctorPrev('');
        setSherifChecks([]);
        setIsKilled(false);
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
    const btnSherifClick = (index) => { // ход комиссара
        setIsPlayerVoted(true);
        let message = {
            event: 'sherifVote',
            name: name,
            roomName: roomName,
            victim: players[index],
        }
        socket.current.send(JSON.stringify(message));
    }
    const btnDoctorClick = (index) => { // ход доктора
        setIsPlayerVoted(true);
        let message = {
            event: 'doctorVote',
            name: name,
            roomName: roomName,
            victim: players[index],
        }
        socket.current.send(JSON.stringify(message));
        setDoctorPrev(players[index]);
    }

    // вывод модального окна с результатом игры
    const ifModal = () => (
        <GameModalWrapper
            gameResult={gameResult}
            joinError={joinError}
            onStay={handleStay}
            onLeave={leaveRoom}
            onCloseJoinError={() => navigate(`/`)}
        />
    );

    return (
        <div className='top-div' style={{backgroundImage: `url(${backgroundImage})`}}>
            
            {/* окно с результатами игры */}
            {ifModal()}

            {/* Иконки игроков */}
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
                btnSherifClick={btnSherifClick}
                sherifChecks={sherifChecks}
                btnDoctorClick={btnDoctorClick}
                doctorPrev={doctorPrev}
                videoStreams={videoStreams}
                myVideoStream={myVideoStream}
            />

            <div className='cont-interface'>

                {/* Левая информационная панель */}
                <div className='left-panel'>
                    <TimerDisplay phase={phase} timeToView={timeToView} />
                    <RoleInfo role={role} />
                </div>

                {/* Чат */}
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

                {/* Меню */}
                <div className='menu-buttons'>
                    <button onClick={leaveRoom} className='btn-leave'>Выйти из комнаты</button>
                    <ReadyButton
                        phase={phase}
                        readyPlayers={readyPlayers}
                        name={name}
                        onReady={handleBtnReady}
                        onNotReady={handleBtnNotReady}
                    />
                </div>
            </div>
        </div>
    );
}
