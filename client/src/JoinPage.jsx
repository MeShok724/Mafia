import './styles/Join.css';
import backgroundImage from './images/bacground2.jpg';
import {useRef, useState} from "react";

export default function JoinPage(props){
    const [name, nameChange] = useState('');
    const [room, roomChange] = useState('');
    const handleNameChange = (event) => {
        nameChange(event.target.value)
    }
    const handleRoomChange = (event) => {
        roomChange(event.target.value)
    }
    const [messages, setMessages] = useState([]);
    const [value, setValue] = useState('');
    const [connected, setConnected] = useState(false);
    const socket = useRef();

    function Connection(){
        socket.current = new WebSocket('ws://localhost:5000')
        socket.current.onopen = () => {
            setConnected(true);
            console.log('Подключение установлено');
            let message = {
                event: 'connection',
                text: 'Hello world',
            }
            socket.current.send(JSON.stringify(message));
        }
        socket.current.onmessage = (event) => {
            console.log('Получено сообщение '+ JSON.parse(event.data));
        }
        socket.current.onclose = () => {
            console.log('Подключение закрыто');
        }
        socket.current.onerror = () => {
            console.log('Ошибка');
        }

    }
    return (
        <div className="cont" style={{backgroundImage: `url(${backgroundImage})`}}>
            <h2 className="header">ПОДКЛЮЧЕНИЕ К КОМНАТЕ</h2>
            <div className="form-connect"
            onSubmit={Connection}>
                <label className="inp-label">никнейм</label>
                <input type="text" className="inp-name"
                       onChange={handleNameChange}/>
                <label className="inp-label">комната</label>
                <input type="text" className="inp-room"
                       onChange={handleRoomChange}/>
                <button className="form-btn"
                    onClick={Connection}
                ><b>ВОЙТИ</b></button>
            </div>
        </div>
    );
}