import '../styles/icon.css'
import citizenIcon from '../images/icon2.png'
import mafiaIcon from '../images/mafia.jpg'
import deadPlayer from '../images/deadPlayer.jpg'
export default function Icons({ phase, role, fPlayerReady, isMafPictures, mafias, players, isPlayerVoted, playerVotes, btnVoteClick, killedPlayers, isKilled, myName }){
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
                break;
        }
    }
    const printBotPanel = (name) => {
        if (phase === 'preparing')
            return printReady(name);
        if (role === 'mafia' && mafias.indexOf(name) !== -1)
            return (<p className='role-text'>Мафия</p>)
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