import './styles/Join.css';
import backgroundImage from './images/bacground2.jpg';
import {useState} from "react";
import {useNavigate} from 'react-router-dom';


export default function JoinPage(props){
    const [name, nameChange] = useState('');
    const [room, roomChange] = useState('');
    const navigate = useNavigate();
    const handleNameChange = (event) => {
        nameChange(event.target.value)
    }
    const handleRoomChange = (event) => {
        roomChange(event.target.value)
    }
    function ToRoomPage(){
        navigate(`/room/${room}?name=${name}`);
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