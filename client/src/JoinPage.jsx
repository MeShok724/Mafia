import './styles/Join.css';
import backgroundImage from './images/background1.jpg';
import {useState} from "react";
import {useNavigate} from 'react-router-dom';


export default function JoinPage(props){
    const [name, nameChange] = useState('');
    const [room, roomChange] = useState('');
    const [nameIsValid, setNameIsValid] = useState(true);
    const [roomIsValid, setRoomIsValid] = useState(true);
    const navigate = useNavigate();
    const handleNameChange = (event) => {
        nameChange(event.target.value);
        setNameIsValid(true);
    }
    const handleRoomChange = (event) => {
        roomChange(event.target.value);
        setRoomIsValid(true);
    }
    function ToRoomPage(){
        if (checkName() && checkRoom())
            navigate(`/room/${room}?name=${name}`);
    }

    function checkName() {
        const res = name.length > 0
        setNameIsValid(res)
        return res
    }
    function checkRoom(){
        const res = room.length > 0
        setRoomIsValid(res)
        return res
    }

    return (
        <div className="cont" style={{backgroundImage: `url(${backgroundImage})`}}>
            <h2 className="header">ПОДКЛЮЧЕНИЕ К КОМНАТЕ</h2>
            <div className="form-connect">
                <label className="inp-label">никнейм</label>
                <div className='cont-inp'>
                    <input type="text" className="inp-name"
                           onChange={handleNameChange}/>
                    {nameIsValid?<div/>:<p className='red'>никнейм некорректен</p>}
                </div>
                <label className="inp-label">комната</label>
                <div className='cont-inp'>
                    <input type="text" className="inp-room"
                            onChange={handleRoomChange}/>
                    {roomIsValid?<div/>:<p className='red'>комната некорректна</p>}
                </div>
                <button className="form-btn"
                    onClick={ToRoomPage}
                ><b>ВОЙТИ</b></button>
            </div>
        </div>
    );
}