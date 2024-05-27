import '../styles/icon.css'
import citizenIcon from '../images/icon2.png'
import mafiaIcon from '../images/mafia.jpg'
export default function Icons(props){
    const printReady = (name) => {
        if (props.isPreparing){
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
    const printIcons = () => {
        return props.players.map((name, index) => (
            <div className='icon' key={index}>
                {printImage(name)}
                <strong className='icon-name'>{name}</strong>
                {printReady(name)}
            </div>
        ));
    };
    return (
        <div className='cont-icons'>
            {printIcons()}
        </div>
    )
}