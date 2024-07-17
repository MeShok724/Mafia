import './styles/Join.css';
import backgroundImage from './images/background1.jpg';
import {useState} from "react";
import {useNavigate} from 'react-router-dom';


export default function JoinPage(props){
    const [name, nameChange] = useState('');
    const [room, roomChange] = useState('');
    const [nameIsValid, setNameIsValid] = useState(false);
    const [roomIsValid, setRoomIsValid] = useState(false);
    const navigate = useNavigate();
    const handleNameChange = (event) => {
        nameChange(event.target.value);
        checkName();
    }
    const handleRoomChange = (event) => {
        roomChange(event.target.value);
        checkRoom();
    }
    function ToRoomPage(){
        if (checkRoom() && checkName())
            navigate(`/room/${room}?name=${name}`);
        else
            alert('Некорректное имя или название комнаты')
    }

    function checkName() {
        setNameIsValid(name.length > 0)
    }
    function checkRoom(){
        setRoomIsValid(room.length > 0)
    }

    return (
        <div className="cont" style={{backgroundImage: `url(${backgroundImage})`}}>
            <h2 className="header">ПОДКЛЮЧЕНИЕ К КОМНАТЕ</h2>
            <div className="form-connect">
                <label className="inp-label">никнейм</label>
                <input type="text" className="inp-name"
                       onChange={handleNameChange}/>
                <label className="inp-label">комната</label>
                <input type="text" className="inp-room"
                       onChange={handleRoomChange}/>
                <button className="form-btn"
                    onClick={ToRoomPage}
                ><b>ВОЙТИ</b></button>
            </div>
        </div>
    );
}