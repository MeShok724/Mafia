import '../styles/icon.css'
import citizenIcon from '../images/icon2.png'
import mafiaIcon from '../images/mafia.jpg'
export default function Icons({ phase, fPlayerReady, isMafPictures, mafias, players, isVoting, playerVotes, btnVoteClick }){
    const printReady = (name) => {
        if (phase === 'preparing'){
            if (fPlayerReady(name))
                return (<label className='icon-ready'>Готов</label>)
            else
                return (<label className='icon-not-ready'>Не готов</label>)
        } else
            return (<div></div>)
    }
    const printImage = (name) => {
        if (!isMafPictures || mafias.indexOf(name) === -1)
            return (<img  src={citizenIcon} className='icon-img' alt={name}/>)
        else
            return (<img  src={mafiaIcon} className='icon-img' alt={name}/>)
    }
    const printVoteBtn = (index) => {
        if (phase === 'citizenVoting'){
            if (!isVoting)
                return <div className='cont-vote'>{playerVotes[index]}<p className='votes'></p>
                    <button className='btn-vote' onClick={()=>btnVoteClick(index)}>Голосовать</button></div>
            else return <p className='votes'>{playerVotes[index]}</p>
        }
        return(<div></div>)
    }
    const printIcons = () => {
        return players.map((name, index) => (
            <div className='icon' key={index}>
                {printImage(name)}
                <strong className='icon-name'>{name}</strong>
                {printReady(name)}
                {printVoteBtn(index)}
            </div>
        ));
    };
    return (
        <div className='cont-icons'>
            {printIcons()}
        </div>
    )
}