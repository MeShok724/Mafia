import '../styles/icon.css'
import citizenIcon from '../images/icon2.png'
import mafiaIcon from '../images/mafia.jpg'
import deadPlayer from '../images/deadPlayer.jpg'
import imgMafia from "../images/mafia.jpg";
import imgCitizen from "../images/sitizen.jpg";
import imgSherif from "../images/sherif.jpg";
import imgWanton from "../images/wanton.jpg";
import imgDoctor from "../images/doctor.jpg";
export default function Icons({ phase, role, fPlayerReady, isMafPictures, mafias, players, isPlayerVoted, playerVotes, btnVoteClick, killedPlayers, isKilled, myName, btnWantonClick, isActive, btnSherifClick, sherifChecks, btnDoctorClick, doctorPrev }){
    const printReady = (name) => {
        if (phase === 'preparing'){
            if (fPlayerReady(name))
                return (<label className='icon-ready'>Готов</label>)
            else
                return (<label className='icon-not-ready'>Не готов</label>)
        } else
            return (<div/>)
    }
    const printImage = (name) => {
        if (playerIsKilled(name))
            return (<img  src={deadPlayer} className='icon-img' alt={name}/>)
        if (!isMafPictures || mafias.indexOf(name) === -1)
            return (<img  src={citizenIcon} className='icon-img' alt={name}/>)
        else
            return (<img  src={mafiaIcon} className='icon-img' alt={name}/>)
    }

    const printVotePanel = (name, index) => {
        if (playerIsKilled(name) || !isActive)
            return;
        switch (phase){
            case 'citizenVoting':
                if (name !== myName){
                    if (!isPlayerVoted && !isKilled)
                        return <div className='cont-vote'>{playerVotes[index]}<p className='votes'></p>
                            <button className='btn-vote' onClick={()=>btnVoteClick(index)}>Голосовать</button></div>
                    else return <div className='cont-vote'><p className='votes'>{playerVotes[index]}</p></div>
                } else return <div className='cont-vote'><p className='votes'>{playerVotes[index]}</p></div>
            case 'mafiaVoting':
                if (role === 'mafia'){
                    if (!isPlayerVoted && !isKilled)
                        return <div className='cont-vote'>{playerVotes[index]}<p className='votes'></p>
                            <button className='btn-vote' onClick={()=>btnVoteClick(index)}>Голосовать</button></div>
                    else return <div className='cont-vote'><p className='votes'>{playerVotes[index]}</p></div>
                }
                if (role === 'sherif' && name !== myName){
                    if (!isPlayerVoted && !isKilled)
                        return (<div className='cont-vote'><button className='btn-sherif' onClick={()=>btnSherifClick(index)}>Проверить</button></div>)
                }
                if (role === 'doctor'){
                    if (!isPlayerVoted && !isKilled && doctorPrev !== name)
                        return (<div className='cont-vote'><button className='btn-doctor' onClick={()=>btnDoctorClick(index)}>Вылечить</button></div>)
                }
                break;
            case 'night':
                if (role === 'wanton' && name !== myName && !isPlayerVoted && !isKilled){
                    return <div className='cont-vote'><button className='btn-wanton' onClick={()=>btnWantonClick(index)}>Охмурить</button></div>
                }
                break;
        }
    }
    const roleToString = (role) => {
        switch (role){
            case '':
                return '';
            case 'mafia':
                return 'Мафия';
            case 'citizen':
                return 'Мирный';
            case 'sherif':
                return 'Шериф'
            case 'wanton':
                return 'Распутница'
            case 'doctor':
                return 'Доктор'
        }
    }
    const printBotPanel = (name) => {
        if (phase === 'preparing')
            return printReady(name);
        if (role === 'mafia' && mafias.indexOf(name) !== -1)
            return (<p className='role-text'>Мафия</p>)
        if (role === 'sherif' && sherifChecks.findIndex(player => player.name === name) !== -1) {
            const playerCheck = sherifChecks.find(curr => curr.name === name);
            return (<p className='role-text'>{roleToString(playerCheck.role)}</p>);
        }
    }
    const playerIsKilled = (name) => {
        return killedPlayers.indexOf(name) !== -1;
    }
    const printIcons = () => {
        return players.map((name, index) => (
            <div className='icon' key={index}>
                <div className='img-and-vote'>
                    {printImage(name)}
                    {printVotePanel(name, index)}
                </div>
                <strong className='icon-name'>{name}</strong>
                {printBotPanel(name)}
            </div>
        ));
    };
    return (
        <div className='cont-icons'>
            {printIcons()}
        </div>
    )
}