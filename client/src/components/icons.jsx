import '../styles/icon.css'
import imageIcon from '../images/icon2.png'
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
    const printIcons = () => {
        return props.players.map((name, index) => (
            <div className='icon' key={index}>
                <img  src={imageIcon} className='icon-img' alt={name}/>
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