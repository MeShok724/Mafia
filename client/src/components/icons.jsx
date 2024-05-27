import '../styles/icon.css'
import citizenIcon from '../images/icon2.png'
import mafiaIcon from '../images/mafia.jpg'
export default function Icons(props){
    const printReady = (name) => {
        if (props.phase === 'preparing'){
            if (props.fPlayerReady(name))
                return (<label className='icon-ready'>Готов</label>)
            else
                return (<label className='icon-not-ready'>Не готов</label>)
        } else
            return (<div></div>)
    }
    const printImage = (name) => {
        if (!props.isMafPictures || props.mafias.indexOf(name) === -1)
            return (<img  src={citizenIcon} className='icon-img' alt={name}/>)
        else
            return (<img  src={mafiaIcon} className='icon-img' alt={name}/>)
    }
    const printVoteBtn = (index) => {
        if (props.phase === 'citizenVoting'){
            if (!props.isVoting.value)
                return <div className='cont-vote'>props.playerVotes[index]<p className='votes'></p>
                    <button className='btn-vote' key={index} onClick={()=>props.btnVoteClick(index)}>Голосовать</button></div>
            else return <p className='votes'>props.playerVotes[index]</p>
        }
        return(<div></div>)
    }
    const printIcons = () => {
        return props.players.map((name, index) => (
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